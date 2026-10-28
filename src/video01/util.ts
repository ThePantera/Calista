import {Easing} from 'remotion';
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = (x: number) => Easing.inOut(Easing.cubic)(clamp01(x));
export const easeOut = (x: number) => Easing.out(Easing.cubic)(clamp01(x));
export const backOut = (x: number) => Easing.out(Easing.back(2.2))(clamp01(x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const hash = (i: number, s: number) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
/** Apertura de boca (0..1) mientras el cue está activo; 0 fuera. */
export const speakOpen = (t: number, start: number, end: number) => {
  if (t < start || t > end) return 0;
  const w = Math.abs(Math.sin(t * 19)) * 0.6 + Math.abs(Math.sin(t * 7.3 + 1)) * 0.4;
  const tail = Math.min(1, (end - t) * 8);
  return Math.max(0.12, w) * tail;
};
