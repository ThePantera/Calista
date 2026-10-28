import React from 'react';
import {hash} from './util';

const wavePath = (y: number, amp: number, len: number, phase: number) => {
  let d = `M -200 ${y}`;
  for (let x = -200; x <= 1300; x += 40) d += ` L ${x} ${(y + Math.sin((x / len) * Math.PI * 2 + phase) * amp).toFixed(1)}`;
  return d;
};

export const Background: React.FC<{frame: number}> = ({frame}) => {
  const ph = frame * 0.035;
  return (
    <g>
      <defs>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#58eadb" />
          <stop offset="0.45" stopColor="#1fc2bb" />
          <stop offset="1" stopColor="#0b8a96" />
        </linearGradient>
        <radialGradient id="sun" cx="0.3" cy="0" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2aa6a0" />
          <stop offset="1" stopColor="#0a5f6e" />
        </linearGradient>
        <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={-400} y={-500} width={1880} height={3000} fill="url(#sea)" />
      <rect x={-400} y={-500} width={1880} height={1800} fill="url(#sun)" />
      {/* rayos de luz */}
      {[0, 1, 2, 3, 4].map((i) => {
        const x0 = -60 + i * 260 + Math.sin(frame * 0.012 + i * 1.7) * 40;
        const op = 0.1 + 0.06 * Math.sin(frame * 0.02 + i * 2.1);
        return <polygon key={i} points={`${x0},-100 ${x0 + 110},-100 ${x0 + 330},1500 ${x0 + 60},1500`} fill="url(#ray)" opacity={op} />;
      })}
      {/* ondulación de agua */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={wavePath(260 + i * 230, 14 + (i % 3) * 5, 380 + i * 40, ph * (i % 2 ? -1 : 1) + i)} stroke="#fff" strokeOpacity={0.1} strokeWidth={5} fill="none" />
      ))}
      {/* cáusticas */}
      {Array.from({length: 9}).map((_, i) => (
        <ellipse key={i} cx={hash(i, 3) * 1080 + Math.sin(frame * 0.02 + i) * 30} cy={200 + hash(i, 5) * 1100 + Math.cos(frame * 0.017 + i) * 20}
          rx={60 + hash(i, 7) * 60} ry={14 + hash(i, 9) * 10} fill="#fff" opacity={0.05 + 0.03 * Math.sin(frame * 0.05 + i)} />
      ))}
      {/* fondo marino */}
      <path d={wavePath(1420, 10, 520, ph * 0.6) + ' L 1300 2100 L -200 2100 Z'} fill="url(#floor)" />
      {[[40, 1430, 1], [150, 1440, 0.7], [960, 1432, 1.1], [1050, 1445, 0.8]].map(([sx, sy, sc], i) => {
        const sw = Math.sin(frame * 0.05 + i * 1.3) * 18;
        return (
          <g key={i} transform={`translate(${sx} ${sy}) scale(${sc})`}>
            <path d={`M -10 0 Q ${-30 + sw} -90 ${-4 + sw * 1.5} -200 Q ${20 + sw} -90 12 0 Z`} fill="#2bbf86" opacity={0.9} />
            <path d={`M 18 0 Q ${40 + sw} -70 ${30 + sw * 1.4} -150 Q ${50 + sw} -60 38 0 Z`} fill="#4ed89f" opacity={0.9} />
          </g>
        );
      })}
      {/* burbujas */}
      {Array.from({length: 30}).map((_, i) => {
        const r = 6 + hash(i, 1) * 24;
        const sp = 1.0 + hash(i, 2) * 2.4;
        const y = 2100 - ((frame * sp + hash(i, 3) * 2400) % 2300);
        const x = 20 + hash(i, 4) * 1040 + Math.sin(frame * 0.045 + i) * 14;
        return (
          <g key={i} opacity={0.75}>
            <circle cx={x} cy={y} r={r} fill="#fff" fillOpacity={0.12} stroke="#fff" strokeOpacity={0.6} strokeWidth={2.5} />
            <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.22} fill="#fff" fillOpacity={0.8} />
          </g>
        );
      })}
    </g>
  );
};
