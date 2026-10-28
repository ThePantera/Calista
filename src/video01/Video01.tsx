import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Background} from './Background';
import {Bobi, Expr, Pato} from './characters';
import {Burst, ConceptCards, EndCard, KeyScene, keyState} from './props';
import {Subtitles} from './Subtitles';
import {CONCEPTS, FPS, HIT_AT, cueById} from './timeline';
import {backOut, clamp01, ease, lerp, speakOpen} from './util';

const open = (id: number, t: number) => {
  const c = cueById(id);
  return speakOpen(t, c.start, c.end);
};

type Cam = {s: number; fx: number; fy: number; sx: number; sy: number; rot: number};

const camera = (t: number): Cam => {
  let s = 1, fx = 540, fy = 960;
  if (t < 4) {
    // Gancho: deriva suave y zoom rápido al final de la pregunta (3.6s), pausa hasta 4.0
    s = 1 + 0.03 * (t / 4) + 0.5 * ease((t - 3.15) / 0.5);
    fy = lerp(1000, 940, ease((t - 3.15) / 0.5));
  } else if (t < 12) {
    s = 1 + 0.03 * ((t - 4) / 8);
  } else if (t < 15.2) {
    fy = 960;
    s = 1 + 0.18 * ease((t - 12.2) / 2.0) + 0.55 * ease((t - 14.1) / 0.8);
    fy = lerp(1000, 930, ease((t - 14.1) / 0.8));
  } else if (t < 18) {
    s = 1 + 0.1 * ((t - 15.2) / 2.8);
  } else if (t < 27) {
    s = 1.0;
  }
  // Sacudón moderado en el golpe (17.9s)
  const dt = t - HIT_AT;
  let sx = 0, sy = 0, rot = 0;
  if (dt >= 0 && dt < 0.8) {
    const amp = 24 * Math.exp(-5.5 * dt);
    sx = amp * Math.sin(dt * 62);
    sy = amp * 0.7 * Math.cos(dt * 51);
    rot = 0.5 * amp / 24 * Math.sin(dt * 44);
    s *= 1 + 0.07 * Math.exp(-9 * dt);
  }
  return {s, fx, fy, sx, sy, rot};
};

const xform = (c: Cam, k: number) => {
  const s = 1 + (c.s - 1) * k;
  return `translate(${540 + c.sx * k} ${960 + c.sy * k}) rotate(${c.rot * k}) scale(${s}) translate(${-(540 + (c.fx - 540) * k)} ${-(960 + (c.fy - 960) * k)})`;
};

const bump = (t: number, at: number, up = 0.3, down = 1.0) => (t < at ? 0 : t < at + up ? ease((t - at) / up) : 1 - ease((t - at - up) / down));

export const Video01: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = camera(t);
  const bob = Math.sin(frame * 0.12) * 5;
  const breathe = 1 + Math.sin(frame * 0.1) * 0.012;

  let scene: React.ReactNode = null;

  if (t < 4) {
    const worry: Expr = 'worry';
    scene = (
      <Pato x={540} y={1400 + bob} scale={1.6} expr={worry} open={open(1, t)} frame={frame}
        look={{x: 0.1, y: -0.1}} tilt={Math.sin(frame * 0.07) * 2} sy={breathe} />
    );
  } else if (t < 12) {
    const k = keyState(t);
    scene = (
      <g>
        <KeyScene t={t} layer="icons" />
        <Bobi x={540} y={1380 + bob * 0.6} scale={1.7} expr="worry" open={open(2, t)} frame={frame}
          look={{x: Math.max(-1, Math.min(1, (k.x - 540) / 300)), y: -0.9}} sy={breathe}
          armL={18 + Math.sin(frame * 0.2) * 10} armR={26 + Math.sin(frame * 0.17 + 1) * 8} />
        <KeyScene t={t} layer="key" />
      </g>
    );
  } else if (t < 15.2) {
    const expr: Expr = t < 13.4 ? 'confusion' : t < 14.3 ? 'worry' : 'surprise';
    const ex = ease((t - 13.8) / 1.0);
    const wow = clamp01((t - 14.3) / 0.3);
    const jit = t > 14.6 ? Math.sin(frame * 2.3) : 0;
    const sweat = t > 14.0;
    scene = (
      <g>
        <Pato x={540} y={1400 + bob - wow * 20} scale={1.6} expr={expr}
          open={t < 15.0 ? open(3, t) : 0.95} frame={frame}
          look={{x: 0, y: lerp(-0.1, 0.05, wow)}} eyeScale={1 + 0.55 * ex} tilt={jit * 3.5 + Math.sin(frame * 0.07)}
          sx={1 + 0.06 * wow} sy={breathe + 0.05 * wow} />
        {sweat && [0, 1, 2].map((i) => {
          const p = ((t - 14.0) * 1.4 + i / 3) % 1;
          return <path key={i} d="M 0 -18 C 14 2 14 16 0 16 C -14 16 -14 2 0 -18 Z" fill="#8fe3ff" stroke="#fff" strokeWidth={3}
            transform={`translate(${[300, 790, 560][i]} ${[790, 830, 700][i] + p * 150}) scale(${1.6 - p * 0.4})`} opacity={1 - p} />;
        })}
      </g>
    );
  } else if (t < 18) {
    const hit = t >= HIT_AT;
    const dt = Math.max(0, t - HIT_AT);
    const shout = t < 17.8 ? 0.85 + 0.15 * Math.sin(frame * 3) : 0;
    const flail = t < HIT_AT ? 150 + Math.sin(frame * 0.9) * 12 : lerp(150, 14, ease(dt / 0.06));
    const squash = hit ? 1 - 0.07 * Math.exp(-dt * 10) : 1;
    scene = (
      <Bobi x={540 + (hit ? 0 : Math.sin(frame * 1.7) * 4)} y={1425} scale={2.6} expr="surprise"
        open={shout} frame={frame} look={{x: 0, y: 0}} eyeScale={1.12} sy={squash} sx={1 + (1 - squash) * 0.8}
        tilt={hit ? 0 : Math.sin(frame * 1.3) * 1.2} armL={flail} armR={flail} />
    );
  } else if (t < 27) {
    const pulse = Math.max(...CONCEPTS.map((c) => bump(t, c.at, 0.3, 1.1)));
    scene = (
      <Bobi x={540} y={1420 + bob * 0.5} scale={1.45} expr="confident" open={open(5, t)} frame={frame}
        look={{x: 0, y: 0.05}} sy={breathe} armL={10 + Math.sin(frame * 0.1) * 4} armR={14 + 120 * pulse} />
    );
  } else {
    const ap = bump(t, 28.9, 0.3, 0.9);
    const q = backOut((t - 27.0) / 0.4);
    scene = (
      <g>
        <Pato x={290} y={1350 + bob} scale={1.0} expr="confusion" open={open(6, t)} frame={frame}
          look={{x: 0.5, y: -0.1}} tilt={Math.sin(frame * 0.09) * 3} sy={breathe} />
        {t < 28.6 && (
          <text x={290} y={1350 - 520} textAnchor="middle" fontSize={120} fontWeight={900} fontFamily="Inter, Arial, sans-serif" fill="#fff" stroke="#10303b" strokeWidth={14} paintOrder="stroke"
            transform={`rotate(${Math.sin(frame * 0.12) * 8} 290 ${1350 - 560}) scale(${q})`} style={{transformOrigin: '290px 800px'}}>?</text>
        )}
        <Bobi x={705} y={1350 + bob * 0.5} scale={1.1} expr="confident" open={open(7, t)} frame={frame}
          look={{x: -0.4, y: 0}} sy={breathe} armL={10} armR={20 + 120 * ap} />
      </g>
    );
  }

  const hitDt = t - HIT_AT;
  const flash = hitDt >= 0 && hitDt < 0.12 ? 0.55 * (1 - hitDt / 0.12) : 0;

  return (
    <AbsoluteFill style={{background: '#14b8b0', overflow: 'hidden'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={xform(cam, 0.3)}><Background frame={frame} /></g>
        <g transform={xform(cam, 1)}>{scene}</g>
      </svg>
      <ConceptCards t={t >= 18 && t < 27.2 ? t : 0} />
      <Burst dt={hitDt} />
      <EndCard t={t} />
      <Subtitles t={t} />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
