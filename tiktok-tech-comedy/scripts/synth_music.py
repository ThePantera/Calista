"""Música original 'playful_tech_loop' (120 BPM, Do mayor, 29.9 s) -> assets/music/playful_tech_loop.wav (estéreo)."""
from pathlib import Path
import numpy as np
from audiolib import *

OUT = Path(__file__).resolve().parent.parent / "assets" / "music"
OUT.mkdir(parents=True, exist_ok=True)
DUR, BPM = 29.9, 120
BEAT = 60 / BPM
mf = lambda m: 440 * 2 ** ((m - 69) / 12)

# acordes por compás: C  Am  F  G
CHORDS = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [57, 60, 65]), (43, [59, 62, 67])]
MELODY = {  # corcheas por compás (8 pasos), None = silencio; notas MIDI
    0: [76, None, 79, None, 76, 74, 72, None],
    1: [72, None, 76, None, 74, None, 72, 69],
    2: [77, None, 76, 74, 72, None, 74, None],
    3: [74, None, 79, None, 78, 79, 83, None],
}


def pluck(f, d, bright=1.0):
    t = np.arange(int(d * SR)) / SR
    x = (np.sin(2 * np.pi * f * t) + 0.35 * bright * np.sin(2 * np.pi * 2 * f * t)
         + 0.15 * bright * np.sin(2 * np.pi * 3 * f * t)) * env_ad(len(t), 0.003, d / 4)
    return x


def marimba(f, d=0.5):
    t = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.18) + 0.4 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.04)) * np.minimum(1, t / 0.002)


def bass(f, d):
    t = np.arange(int(d * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    return x * env_ad(len(t), 0.005, d / 2.2)


def kick():
    t = np.arange(int(0.25 * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.08)


def hat():
    n = RNG.standard_normal(int(0.06 * SR))
    return highpass_fft(n, 7000) * env_ad(len(n), 0.0005, 0.015)


def build():
    n = int(DUR * SR)
    L, R = np.zeros(n + SR), np.zeros(n + SR)

    def put(x, at, pan=0.0, g=1.0):
        i = int(at * SR)
        if i >= n:
            return
        lg, rg = g * np.cos((pan + 1) * np.pi / 4), g * np.sin((pan + 1) * np.pi / 4)
        L[i:i + len(x)] += x * lg
        R[i:i + len(x)] += x * rg

    bars = int(np.ceil(DUR / (4 * BEAT)))
    for bar in range(bars):
        root, tri = CHORDS[bar % 4]
        t0 = bar * 4 * BEAT
        # bajo sincopado
        for off, d in ((0, 0.9), (1.5, 0.4), (2, 0.9), (3.5, 0.4)):
            put(bass(mf(root), d * BEAT * 1.4), t0 + off * BEAT, 0, 0.55)
        # arpegio tecnológico en semicorcheas (ping-pong estéreo)
        pat = [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 2, 1, 2]
        for s, p in enumerate(pat):
            note = tri[p] + (12 if s % 8 == 7 else 0)
            put(pluck(mf(note + 12), 0.25, 0.8), t0 + s * BEAT / 4, -0.5 if s % 2 else 0.5, 0.17)
        # melodía marimba (sólo desde el compás 2, descansa 1 de cada 4 compases para variar)
        if bar >= 1 and bar % 4 != 3 or bar >= 8:
            for s, m in enumerate(MELODY[bar % 4]):
                if m:
                    put(marimba(mf(m)), t0 + s * BEAT / 2, 0.25, 0.30)
        # percusión
        for b in range(4):
            if b in (0, 2) or (b == 3 and bar % 2):
                put(kick(), t0 + b * BEAT, 0, 0.7)
            put(hat(), t0 + b * BEAT + BEAT / 2, 0.3, 0.30)
            put(hat(), t0 + b * BEAT, -0.3, 0.12)
        # "clap" digital en 2 y 4
        for b in (1, 3):
            c = highpass_fft(lowpass_fft(RNG.standard_normal(int(0.1 * SR)), 5000), 1200) * env_ad(int(0.1 * SR), 0.001, 0.03)
            put(c, t0 + b * BEAT, 0, 0.28)
        # pad suave
        td = int(4 * BEAT * SR)
        tt = np.arange(td) / SR
        pad = sum(np.sin(2 * np.pi * mf(m) * tt) for m in tri) * 0.05
        pad *= np.minimum(1, tt / 0.3) * np.minimum(1, (4 * BEAT - tt) / 0.3)
        put(pad, t0, 0, 1.0)

    out = np.stack([L[:n], R[:n]], axis=1)
    k = int(0.4 * SR)
    out[:k] *= np.linspace(0, 1, k)[:, None]
    k = int(2.0 * SR)
    out[-k:] *= np.linspace(1, 0, k)[:, None] ** 1.5
    return out


if __name__ == "__main__":
    m = build()
    write_wav(OUT / "playful_tech_loop.wav", m, peak_db=-3.0)
    print(f"playful_tech_loop.wav {len(m)/SR:.2f}s estéreo")
