import React from 'react';
import {CONCEPTS, END_CARD, KEY_TRIES} from './timeline';
import {backOut, clamp01, ease, easeOut} from './util';

const FONT = "'Inter', 'Liberation Sans', Arial, sans-serif";

/* ---------- Llave + iconos genéricos (escena 2) ---------- */
export const ICON_X = [250, 540, 830];
const ICON_Y = 330;
const TILE = [
  {c: '#3d8bff', name: 'mail'},
  {c: '#ff5c9d', name: 'social'},
  {c: '#ffab1f', name: 'shop'},
];

const Glyph: React.FC<{name: string; c: string}> = ({name, c}) => {
  if (name === 'mail') return (
    <g>
      <rect x={-62} y={-42} width={124} height={84} rx={12} fill="#fff" />
      <polyline points="-60,-38 0,12 60,-38" stroke={c} strokeWidth={9} fill="none" strokeLinejoin="round" />
    </g>
  );
  if (name === 'social') return (
    <g>
      <rect x={-64} y={-56} width={128} height={90} rx={34} fill="#fff" />
      <path d="M -28 30 L -40 62 L 6 34 Z" fill="#fff" />
      <path d="M 0 16 C -42 -12 -24 -44 0 -22 C 24 -44 42 -12 0 16 Z" fill={c} />
    </g>
  );
  return (
    <g>
      <path d="M -68 -52 L -42 -52 L -26 22 L 46 22 L 62 -28 L -36 -28" stroke="#fff" strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={-14} cy={50} r={10} fill="#fff" />
      <circle cx={36} cy={50} r={10} fill="#fff" />
    </g>
  );
};

const Padlock: React.FC<{open: number; bad: number}> = ({open, bad}) => (
  <g transform="translate(0 100)">
    <g transform={`rotate(${-open * 38} 16 -2) translate(0 ${-open * 8})`}>
      <path d="M -16 -2 V -24 a16 16 0 0 1 32 0 V -2" stroke="#9fb3c4" strokeWidth={9} fill="none" strokeLinecap="round" />
    </g>
    <rect x={-30} y={-4} width={60} height={46} rx={11} fill={bad > 0.5 ? '#ff4d4d' : '#8aa0b4'} stroke="#2a3a48" strokeWidth={4} />
    <circle cx={0} cy={14} r={6} fill="#2a3a48" />
    <rect x={-2.5} y={16} width={5} height={14} fill="#2a3a48" />
  </g>
);

const Key: React.FC = () => (
  <g>
    <rect x={-6} y={0} width={12} height={72} fill="#ffc83a" stroke="#a87800" strokeWidth={3} />
    <rect x={6} y={8} width={14} height={9} fill="#ffc83a" stroke="#a87800" strokeWidth={3} />
    <rect x={6} y={26} width={10} height={9} fill="#ffc83a" stroke="#a87800" strokeWidth={3} />
    <circle cx={0} cy={96} r={26} fill="#ffc83a" stroke="#a87800" strokeWidth={4} />
    <circle cx={0} cy={96} r={11} fill="#0b8a96" />
  </g>
);

export const keyState = (t: number) => {
  const kx: number[] = [], ky: number[] = [], kt: number[] = [];
  const push = (tt: number, x: number, y: number) => { kt.push(tt); kx.push(x); ky.push(y); };
  push(4.2, 540, 540);
  KEY_TRIES.forEach((T, i) => {
    push(T - 0.75, ICON_X[i], 508);
    push(T - 0.28, ICON_X[i], 466);
    push(T + 0.25, ICON_X[i], 466);
    push(T + 0.5, ICON_X[i], 508);
  });
  push(10.5, 760, 600);
  const seg = (arr: number[]) => {
    if (t <= kt[0]) return arr[0];
    for (let i = 1; i < kt.length; i++) if (t <= kt[i]) return arr[i - 1] + (arr[i] - arr[i - 1]) * ease((t - kt[i - 1]) / (kt[i] - kt[i - 1]));
    return arr[arr.length - 1];
  };
  let rot = 0;
  KEY_TRIES.forEach((T) => { if (t > T - 0.28 && t < T) rot += Math.sin(t * 90) * 11; });
  return {x: seg(kx), y: seg(ky), rot};
};

export const KeyScene: React.FC<{t: number; layer: 'icons' | 'key'}> = ({t, layer}) => {
  const k = keyState(t);
  const alpha = clamp01((t - 4.2) / 0.4) * (1 - clamp01((t - 10.2) / 0.4));
  return (
    <g>
      {layer === 'icons' && TILE.map((tl, i) => {
        const T = KEY_TRIES[i];
        const open = ease((t - T) / 0.18);
        const pop = t > T ? 1 + 0.12 * Math.exp(-(t - T) * 9) * Math.cos((t - T) * 30) : 1;
        const shake = t > T - 0.28 && t < T ? Math.sin(t * 100) * 3 : 0;
        const appear = backOut((t - 4.0 - i * 0.12) / 0.4);
        return (
          <g key={i} transform={`translate(${ICON_X[i] + shake} ${ICON_Y}) scale(${pop * appear})`}>
            {open > 0.5 && <rect x={-116} y={-116} width={232} height={232} rx={48} fill="#ff4d4d" opacity={0.35 * (0.6 + 0.4 * Math.sin(t * 14))} />}
            <rect x={-100} y={-100} width={200} height={200} rx={42} fill={tl.c} stroke="#12313c" strokeWidth={6} />
            <Glyph name={tl.name} c={tl.c} />
            <Padlock open={open} bad={open} />
            {open > 0.5 && (
              <g transform="translate(78 -82)">
                <circle r={26} fill="#ff4d4d" stroke="#fff" strokeWidth={5} />
                <rect x={-4} y={-14} width={8} height={18} rx={3} fill="#fff" />
                <circle cy={11} r={4.5} fill="#fff" />
              </g>
            )}
          </g>
        );
      })}
      {layer === 'key' && (
        <g opacity={alpha} transform={`translate(${k.x} ${k.y}) rotate(${k.rot})`}>
          <Key />
        </g>
      )}
    </g>
  );
};

/* ---------- Tarjetas de conceptos (escena 4) ---------- */
const ConceptIcon: React.FC<{i: number}> = ({i}) => (
  <svg width={110} height={110} viewBox="-55 -55 110 110">
    {i === 0 && (
      <g>
        <circle cx={-18} cy={-8} r={20} fill="#ffc83a" /><circle cx={-18} cy={-8} r={8} fill="#13394a" />
        <rect x={-6} y={-12} width={50} height={9} fill="#ffc83a" /><rect x={28} y={-12} width={8} height={20} fill="#ffc83a" /><rect x={14} y={-12} width={8} height={15} fill="#ffc83a" />
        <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill="#fff">x1 = 1</text>
      </g>
    )}
    {i === 1 && (
      <g>
        <rect x={-38} y={-34} width={76} height={66} rx={12} fill="#9fe7ff" stroke="#fff" strokeWidth={4} />
        <circle cx={0} cy={-6} r={16} fill="#13394a" /><circle cx={0} cy={-6} r={6} fill="#9fe7ff" />
        <rect x={-3} y={-6} width={6} height={22} fill="#13394a" />
        <rect x={-30} y={34} width={10} height={8} fill="#fff" /><rect x={20} y={34} width={10} height={8} fill="#fff" />
      </g>
    )}
    {i === 2 && (
      <g>
        <path d="M 0 -42 L 36 -28 V 4 C 36 28 16 40 0 46 C -16 40 -36 28 -36 4 V -28 Z" fill="#5ee38f" stroke="#fff" strokeWidth={4} />
        <polyline points="-16,2 -4,16 18,-12" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    )}
  </svg>
);

export const ConceptCards: React.FC<{t: number}> = ({t}) => (
  <>
    {CONCEPTS.map((c, i) => {
      if (t < c.at) return null;
      const k = backOut((t - c.at) / 0.4);
      const ring = clamp01((t - c.at) / 0.6);
      const active = i === CONCEPTS.filter((x) => t >= x.at).length - 1;
      return (
        <div key={i} style={{
          position: 'absolute', left: 60, top: 150 + i * 170, width: 860, height: 150,
          transform: `translateX(${(1 - easeOut((t - c.at) / 0.35)) * -420}px) scale(${0.7 + 0.3 * k})`, opacity: clamp01((t - c.at) / 0.12),
          borderRadius: 40, background: 'linear-gradient(135deg,#0f3a52,#13607a)', border: `6px solid ${active ? '#FFD23F' : '#8fe9ff'}`,
          boxShadow: active ? '0 0 40px rgba(255,210,63,0.55), 0 10px 0 rgba(6,30,40,0.5)' : '0 10px 0 rgba(6,30,40,0.5)',
          display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px', fontFamily: FONT,
        }}>
          <div style={{width: 100, height: 100, flex: 'none', borderRadius: 26, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><ConceptIcon i={i} /></div>
          <div style={{color: '#fff', fontWeight: 900, fontSize: 46, lineHeight: 1.1, textShadow: '0 4px 0 rgba(0,0,0,0.35)'}}>
            <span style={{color: '#FFD23F', fontSize: 30, display: 'block', letterSpacing: 4}}>{i + 1}</span>{c.text}
          </div>
          <div style={{position: 'absolute', inset: -6, borderRadius: 40, border: '6px solid #FFD23F', opacity: 0.8 * (1 - ring), transform: `scale(${1 + ring * 0.12})`, pointerEvents: 'none'}} />
        </div>
      );
    })}
  </>
);

/* ---------- Placa de cierre ---------- */
export const EndCard: React.FC<{t: number}> = ({t}) => {
  if (t < END_CARD.at) return null;
  const k = backOut((t - END_CARD.at) / 0.45);
  const pulse = 1 + 0.025 * Math.sin((t - END_CARD.at) * 9);
  return (
    <div style={{
      position: 'absolute', left: 60, top: 190, width: 860, height: 300, borderRadius: 56, fontFamily: FONT,
      background: 'linear-gradient(135deg,#ff5c9d,#ff9a3c)', border: '8px solid #fff', boxShadow: '0 14px 0 rgba(8,35,45,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, padding: '0 36px',
      transform: `scale(${(0.5 + 0.5 * k) * pulse})`, opacity: clamp01((t - END_CARD.at) / 0.1),
    }}>
      <svg width={120} height={120} viewBox="-60 -60 120 120" style={{flex: 'none'}}>
        <path d="M 0 -44 C 26 -44 38 -24 38 4 L 38 18 L 52 34 L -52 34 L -38 18 L -38 4 C -38 -24 -26 -44 0 -44 Z" fill="#fff" />
        <circle cx={0} cy={46} r={11} fill="#fff" />
        <g transform={`rotate(${Math.sin((t - END_CARD.at) * 12) * 12} 0 -44)`}><circle cx={34} cy={-36} r={14} fill="#FFD23F" stroke="#ff5c9d" strokeWidth={4} /></g>
      </svg>
      <div style={{color: '#fff', fontWeight: 900, fontSize: 70, lineHeight: 1.08, textShadow: '0 5px 0 rgba(120,20,60,0.55)'}}>{END_CARD.text}</div>
    </div>
  );
};

/* ---------- Estallido del golpe ---------- */
export const Burst: React.FC<{dt: number}> = ({dt}) => {
  if (dt < 0 || dt > 0.55) return null;
  const k = backOut(dt / 0.15) * (1 + dt * 0.5);
  const op = 1 - clamp01((dt - 0.18) / 0.37);
  const pts: string[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 ? 250 : 420;
    pts.push(`${Math.cos(a) * r},${Math.sin(a) * r}`);
  }
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity: op}} viewBox="0 0 1080 1920">
      <g transform={`translate(540 830) scale(${k})`}>
        <polygon points={pts.join(' ')} fill="#FFD23F" stroke="#ff4d4d" strokeWidth={14} strokeLinejoin="round" />
        <text textAnchor="middle" y={34} fontFamily={FONT} fontWeight={900} fontSize={120} fill="#fff" stroke="#c8202f" strokeWidth={14} paintOrder="stroke">¡PAM!</text>
      </g>
    </svg>
  );
};
