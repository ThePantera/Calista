"""Sintetiza los efectos y el ambiente submarino -> assets/sound/*.wav (mono 48 kHz, pico -3 dBFS)."""
from pathlib import Path
import numpy as np
from audiolib import *

OUT = Path(__file__).resolve().parent.parent / "assets" / "sound"
OUT.mkdir(parents=True, exist_ok=True)


def bubble_pop():
    t = t_axis(0.45)
    # burbuja: tono que sube rápido (resonancia de burbuja) + pop final
    f = 380 + 900 * (1 - np.exp(-t / 0.05))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * env_ad(len(t), 0.004, 0.07) * 0.8
    pop = RNG.standard_normal(len(t))
    pop = highpass_fft(lowpass_fft(pop, 3500), 600) * env_ad(len(t), 0.0005, 0.012) * 0.5
    return fade(x + pop)


def zoom_whoosh():
    d = 0.75
    t = t_axis(d)
    n = RNG.standard_normal(len(t))
    # barrido de ruido: sumamos bandas filtradas con centro creciente
    out = np.zeros(len(t))
    for fc in (400, 900, 1800, 3500):
        band = highpass_fft(lowpass_fft(n, fc * 1.4), fc * 0.7)
        c = 0.15 + 0.6 * (fc / 3500) * 0 + 0.0
        center = 0.15 + 0.6 * np.log(fc / 400) / np.log(3500 / 400)  # momento pico
        out += band * np.exp(-((t - center) / 0.13) ** 2)
    sweep = np.sin(2 * np.pi * np.cumsum(200 + 1800 * (t / d) ** 2) / SR) * 0.15 * np.sin(np.pi * t / d) ** 2
    return fade(out / np.max(np.abs(out)) * 0.9 + sweep, 10)


def digital_blip():
    t = t_axis(0.16)
    f = np.where(t < 0.07, 1320.0, 1760.0)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.7
    x = lowpass_fft(x, 5000) * env_ad(len(t), 0.002, 0.07)
    return fade(x, 3)


def comic_hit():
    t = t_axis(0.6)
    # golpe de "boing/bonk": caída de tono + transitorio de ruido + segundo tono cómico
    f = 90 + 400 * np.exp(-t / 0.05)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(t), 0.001, 0.14)
    f2 = 700 * np.exp(-t / 0.35) + 250
    boing = np.sin(2 * np.pi * np.cumsum(f2 * (1 + 0.03 * np.sin(2 * np.pi * 14 * t))) / SR) * env_ad(len(t), 0.002, 0.18) * 0.45
    click = lowpass_fft(RNG.standard_normal(len(t)), 5000) * env_ad(len(t), 0.0003, 0.01) * 0.6
    return fade(body + boing + click, 3)


def soft_chime():
    t = t_axis(1.3)
    x = np.zeros(len(t))
    for k, (m, a) in enumerate([(1, 1.0), (2.76, 0.35), (5.4, 0.15)]):
        x += a * np.sin(2 * np.pi * 1318.5 * m * t) * np.exp(-t / (0.5 / (1 + 0.8 * k)))
    x2 = 0.6 * np.sin(2 * np.pi * 1975.5 * (t - 0.09).clip(0)) * np.exp(-(t - 0.09).clip(0) / 0.4) * (t > 0.09)
    x = (x + x2) * np.minimum(1, t / 0.004)
    return fade(x, 8)


def confirm():
    # dos notas ascendentes tipo "check" (C6 -> G6) con cola brillante
    t = t_axis(0.8)
    x = np.zeros(len(t))
    for start, f in ((0.0, 1046.5), (0.11, 1568.0)):
        tt = (t - start).clip(0)
        n = (t >= start)
        x += n * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt / 0.22) * np.minimum(1, tt / 0.003)
    return fade(x, 8)


def underwater_bed(dur=29.9):
    n = int(dur * SR)
    t = np.arange(n) / SR
    # ruido marrón/rosa muy filtrado con oleaje lento
    w = RNG.standard_normal(n)
    low = lowpass_fft(w, 380, 2)
    mid = lowpass_fft(w, 1100, 2) - lowpass_fft(w, 500, 2)
    swell = 0.65 + 0.35 * np.sin(2 * np.pi * 0.11 * t + 1.0)
    swell2 = 0.7 + 0.3 * np.sin(2 * np.pi * 0.23 * t)
    bed = low * swell + 0.35 * mid * swell2
    # burbujitas sutiles aleatorias
    for _ in range(26):
        at = RNG.uniform(0.3, dur - 0.4)
        d = 0.12
        tt = np.arange(int(d * SR)) / SR
        f0 = RNG.uniform(500, 1100)
        b = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 2.5 * tt)) / SR) * env_ad(len(tt), 0.004, 0.03) * RNG.uniform(0.04, 0.12)
        i = int(at * SR)
        bed[i:i + len(b)] += b * np.max(np.abs(bed)) * 0.6
    # bucle suave: fundido de entrada y salida
    k = int(0.8 * SR)
    bed[:k] *= np.linspace(0, 1, k)
    bed[-k:] *= np.linspace(1, 0, k)
    return bed


if __name__ == "__main__":
    for name, fn in [("bubble_pop", bubble_pop), ("zoom_whoosh", zoom_whoosh), ("digital_blip", digital_blip),
                     ("comic_hit", comic_hit), ("soft_chime", soft_chime), ("confirm", confirm),
                     ("underwater_bed", underwater_bed)]:
        x = fn()
        write_wav(OUT / f"{name}.wav", x, peak_db=-3.0)
        print(f"{name}.wav  {len(x)/SR:.2f}s")
