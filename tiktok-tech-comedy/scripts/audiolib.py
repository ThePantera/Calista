"""Utilidades comunes: WAV 16-bit con numpy + wave."""
import wave
import numpy as np

SR = 48000
RNG = np.random.default_rng(1234)


def t_axis(dur):
    return np.arange(int(round(dur * SR))) / SR


def write_wav(path, x, peak_db=None):
    """Escribe mono (N,) o estéreo (N,2) a 16 bit. Si peak_db, normaliza el pico a ese nivel."""
    x = np.asarray(x, dtype=np.float64)
    if peak_db is not None:
        m = np.max(np.abs(x)) or 1.0
        x = x / m * 10 ** (peak_db / 20)
    x = np.clip(x, -1.0, 1.0)
    ch = 1 if x.ndim == 1 else x.shape[1]
    with wave.open(str(path), "wb") as w:
        w.setnchannels(ch)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())


def read_wav(path):
    """Devuelve array float (N,) o (N,2) y la frecuencia de muestreo."""
    with wave.open(str(path), "rb") as w:
        n, ch, sw, sr = w.getnframes(), w.getnchannels(), w.getsampwidth(), w.getframerate()
        raw = w.readframes(n)
    if sw != 2:
        raise ValueError(f"{path}: solo PCM 16 bit soportado")
    x = np.frombuffer(raw, dtype="<i2").astype(np.float64) / 32768
    return (x.reshape(-1, ch) if ch > 1 else x), sr


def env_ad(n, a, d_tau):
    """Ataque lineal de a segundos y decaimiento exponencial con constante d_tau."""
    t = np.arange(n) / SR
    e = np.exp(-t / d_tau)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e


def fade(x, ms=5):
    n = int(ms / 1000 * SR)
    x = x.copy()
    x[:n] *= np.linspace(0, 1, n)
    x[-n:] *= np.linspace(1, 0, n)
    return x


def lowpass(x, fc):
    """Filtro de un polo (suave), vectorizable por bloques simples."""
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def lowpass_fft(x, fc, order=4):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** (2 * order))
    return np.fft.irfft(X, len(x))


def highpass_fft(x, fc, order=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    r = (f / fc) ** (2 * order)
    X *= np.sqrt(r / (1 + r))
    return np.fft.irfft(X, len(x))
