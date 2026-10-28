"""Mezcla final -> renders/audio_mix.wav (estéreo 48 kHz, 29.9 s, ~-14 LUFS).

Uso: python3 mix.py [--target -14] [--no-voices]
Voces opcionales: assets/sound/voices/cue_<id>.wav (se colocan en el start del cue).
"""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np
from audiolib import *

ROOT = Path(__file__).resolve().parent.parent
SND, MUS, REN = ROOT / "assets/sound", ROOT / "assets/music", ROOT / "renders"
TL = json.loads((ROOT / "scripts/timeline.json").read_text())
DUR = TL["durationSeconds"]
N = int(round(DUR * SR))
TARGET = float(sys.argv[sys.argv.index("--target") + 1]) if "--target" in sys.argv else -14.0
USE_VOICES = "--no-voices" not in sys.argv

# niveles (dB) antes de normalizar
G_MUSIC, G_AMB, G_SFX, G_VOICE = -4.0, -12.0, -1.0, 0.0
SFX_GAIN = {"bubble_pop": 0, "zoom_whoosh": -3, "digital_blip": -4, "comic_hit": 0, "soft_chime": -3, "confirm": -2}
db = lambda d: 10 ** (d / 20)


def fit(x, n=N):
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    out = np.zeros((n, 2))
    m = min(n, len(x))
    out[:m] = x[:m]
    return out


def place(buf, x, at, g=1.0):
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    i = int(round(at * SR))
    j = min(N, i + len(x))
    if j > i:
        buf[i:j] += x[:j - i] * g


def duck_envelope():
    """Ganancia lineal de la música: -18 dB (según timeline) dentro de cada cue, con ataque/release suaves."""
    depth = TL["music"].get("duckUnderDialogueDb", -18)
    target = np.ones(N)
    for c in TL["cues"]:
        target[int(c["start"] * SR):int(c["end"] * SR)] = db(depth)
    # suavizado asimétrico: ataque 60 ms (baja), release 350 ms (sube), en dominio dB
    tdb = 20 * np.log10(target)
    a_att, a_rel = np.exp(-1 / (0.06 * SR)), np.exp(-1 / (0.35 * SR))
    out, y = np.empty(N), 0.0
    for i in range(N):
        a = a_att if tdb[i] < y else a_rel
        y = a * y + (1 - a) * tdb[i]
        out[i] = y
    # adelanta el ataque 40 ms para que la música ya haya bajado cuando entra la voz
    lead = int(0.04 * SR)
    out = np.concatenate([out[lead:], np.full(lead, out[-1])])
    return 10 ** (out / 20)


def measure(path):
    r = subprocess.run(["ffmpeg", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])


def main():
    REN.mkdir(exist_ok=True)
    mix = np.zeros((N, 2))
    # música con ducking
    music, _ = read_wav(MUS / f'{TL["music"]["name"]}.wav')
    mix += fit(music) * duck_envelope()[:, None] * db(G_MUSIC)
    # ambiente
    amb, _ = read_wav(SND / f'{TL["ambience"]["name"]}.wav')
    a0 = TL["ambience"]["from"]
    place(mix, amb, a0, db(G_AMB))
    # efectos
    cache = {}
    for e in TL["sfx"]:
        nm = e["name"]
        if nm not in cache:
            cache[nm] = read_wav(SND / f"{nm}.wav")[0]
        place(mix, cache[nm], e["at"], db(G_SFX + SFX_GAIN.get(nm, 0)))
    # voces opcionales
    nv = 0
    if USE_VOICES:
        for c in TL["cues"]:
            p = SND / "voices" / f'cue_{c["id"]}.wav'
            if p.exists():
                v, sr = read_wav(p)
                if sr != SR:
                    print(f"AVISO: {p.name} está a {sr} Hz, se espera {SR}; omitida")
                    continue
                place(mix, v, c["start"], db(G_VOICE))
                nv += 1
    print(f"voces incorporadas: {nv}/{len(TL['cues'])}")

    # normalización a LUFS objetivo (ganancia medida con ffmpeg ebur128) + limitador de pico
    tmp = REN / "_premix.wav"
    write_wav(tmp, mix * 0.25)  # headroom para la medición
    lufs = measure(tmp)
    tmp.unlink()
    gain = db(TARGET - lufs) * 0.25
    out = mix * gain
    ceil = db(-1.5)
    pk = np.max(np.abs(out))
    if pk > ceil:  # limitador suave (tanh sobre lo que pase del umbral)
        thr = db(-4.0)
        over = np.abs(out) > thr
        s = np.sign(out)
        out = np.where(over, s * (thr + (ceil - thr) * np.tanh((np.abs(out) - thr) / (ceil - thr))), out)
    write_wav(REN / "audio_mix.wav", out)
    print(f"medido previo {lufs:.2f} LUFS -> ganancia {20*np.log10(gain/0.25):+.2f} dB; salida {len(out)} muestras ({len(out)/SR:.2f}s)")


if __name__ == "__main__":
    main()
