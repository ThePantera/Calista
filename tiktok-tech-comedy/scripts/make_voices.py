"""Genera assets/sound/voices/cue_<id>.wav con Kokoro (español) desde timeline.json.

Usa el motor Kokoro del repo https://github.com/emin201089/tts (Apache 2.0), pero con
lang_code="e" (español) y voces em_*, que ese repo no expone.

Requiere un entorno con torch + kokoro:  /home/user/tts_env/bin/python make_voices.py
"""
import json, pathlib, subprocess, tempfile
import numpy as np
import soundfile as sf
from kokoro import KPipeline

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "sound" / "voices"
TL = json.loads((ROOT / "scripts" / "timeline.json").read_text(encoding="utf-8"))

# voz Kokoro, velocidad base y desplazamiento de tono (semitonos) por personaje
VOICES = {
    "PATO": {"voice": "em_santa", "speed": 1.2, "semitones": +2.0},
    "BOBI": {"voice": "em_alex", "speed": 1.08, "semitones": 0.0},
}
# lecturas para el TTS (el subtítulo conserva el texto original)
TTS_TEXT = {3: "Entonces… ¿mi contraseña uno dos tres cuatro cinco seis, no es segura?"}
MAX_STRETCH = 1.25  # no acelerar más de esto para no perder inteligibilidad


def ffmpeg_filter(src, dst, semitones, tempo):
    chain = []
    if semitones:
        r = 2 ** (semitones / 12)
        chain += [f"asetrate={int(24000 * r)}", "aresample=48000", f"atempo={1 / r:.5f}"]
    else:
        chain += ["aresample=48000"]
    if abs(tempo - 1) > 1e-3:
        chain += [f"atempo={tempo:.5f}"]
    chain += ["loudnorm=I=-18:TP=-3:LRA=7"]
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", ",".join(chain),
                    "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", str(dst)], check=True)


def dur(path):
    i = sf.info(str(path))
    return i.frames / i.samplerate


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    pipe = KPipeline(lang_code="e", repo_id="hexgrad/Kokoro-82M")
    report = []
    cues = TL["cues"]
    for k, cue in enumerate(cues):
        cfg = VOICES[cue["speaker"]]
        text = TTS_TEXT.get(cue["id"], cue["text"])
        audio = np.concatenate([a for _, _, a in pipe(text, voice=cfg["voice"], speed=cfg["speed"])])
        with tempfile.TemporaryDirectory() as td:
            raw = pathlib.Path(td) / "raw.wav"
            sf.write(raw, audio, 24000)
            dst = OUT / f"cue_{cue['id']}.wav"
            ffmpeg_filter(raw, dst, cfg["semitones"], 1.0)
            # hueco máximo: hasta 50 ms antes del siguiente cue (o del fin del vídeo)
            nxt = cues[k + 1]["start"] if k + 1 < len(cues) else TL["durationSeconds"]
            window = nxt - 0.05 - cue["start"]
            d = dur(dst)
            if d > window:  # acelera lo mínimo para caber en la ventana
                tempo = min(d / (window - 0.04), MAX_STRETCH)
                ffmpeg_filter(raw, dst, cfg["semitones"], tempo)
                d = dur(dst)
        report.append((cue["id"], cue["speaker"], window, d, d <= window + 1e-3))
    print("cue speaker hueco(s) duración(s) cabe")
    for r in report:
        print(f"{r[0]:>3} {r[1]:<5} {r[2]:>8.2f} {r[3]:>12.2f} {'sí' if r[4] else 'NO'}")


if __name__ == "__main__":
    main()
