import React from 'react';

export type Expr = 'neutral' | 'worry' | 'surprise' | 'confident' | 'confusion';
export type Look = {x: number; y: number};

const INK = '#2a1a2e';

const browCfg = (expr: Expr, side: -1 | 1): [number, number] => {
  // [dy, tilt]  tilt>0 => extremo interior arriba
  switch (expr) {
    case 'worry': return [-6, 20];
    case 'surprise': return [-14, 0];
    case 'confident': return side < 0 ? [-3, -9] : [-12, -3];
    case 'confusion': return side < 0 ? [-16, -10] : [5, 14];
    default: return [0, 0];
  }
};

const Eye: React.FC<{cx: number; cy: number; r: number; look: Look; scale: number; blink: number; side: -1 | 1; expr: Expr}> = ({cx, cy, r, look, scale, blink, side, expr}) => {
  const R = r * scale;
  const ir = R * 0.45;
  const [dy, tilt] = browCfg(expr, side);
  return (
    <g>
      <g transform={`translate(${cx} ${cy}) scale(1 ${1 - blink * 0.92})`}>
        <circle r={R} fill="#fff" stroke={INK} strokeWidth={4} />
        <circle cx={look.x * R * 0.42} cy={look.y * R * 0.42} r={ir} fill="#3b8fd9" />
        <circle cx={look.x * R * 0.42} cy={look.y * R * 0.42} r={ir * 0.55} fill={INK} />
        <circle cx={look.x * R * 0.42 - ir * 0.3} cy={look.y * R * 0.42 - ir * 0.3} r={ir * 0.2} fill="#fff" />
      </g>
      <g transform={`translate(${cx} ${cy - R - 8 + dy}) rotate(${side * tilt})`}>
        <line x1={-r * 0.8} y1={0} x2={r * 0.8} y2={0} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      </g>
    </g>
  );
};

const Mouth: React.FC<{cx: number; cy: number; w: number; open: number; expr: Expr}> = ({cx, cy, w, open, expr}) => {
  if (open > 0.06) {
    const rx = (w / 2) * (expr === 'surprise' ? 0.75 + open * 0.25 : 0.85 + open * 0.15);
    const ry = (w / 2) * 0.12 + open * w * 0.32;
    return (
      <g transform={`translate(${cx} ${cy})`}>
        <ellipse rx={rx} ry={ry} fill="#5a1426" stroke={INK} strokeWidth={5} />
        <ellipse cx={0} cy={ry * 0.45} rx={rx * 0.55} ry={ry * 0.45} fill="#e6566e" />
        <path d={`M ${-rx * 0.8} ${-ry * 0.55} Q 0 ${-ry * 1.05} ${rx * 0.8} ${-ry * 0.55}`} stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.95} />
      </g>
    );
  }
  const h = w / 2;
  let d: string;
  switch (expr) {
    case 'worry': d = `M ${-h * 0.7} 8 Q ${-h * 0.3} -8 0 4 Q ${h * 0.3} -8 ${h * 0.7} 8`; break;
    case 'surprise': return <ellipse cx={cx} cy={cy} rx={w * 0.14} ry={w * 0.2} fill="#5a1426" stroke={INK} strokeWidth={5} />;
    case 'confident': d = `M ${-h} -2 Q 0 ${h * 0.9} ${h} -12`; break;
    case 'confusion': d = `M ${-h * 0.7} 2 Q ${-h * 0.3} -10 0 2 T ${h * 0.7} 2`; break;
    default: d = `M ${-h * 0.6} 0 Q 0 ${h * 0.3} ${h * 0.6} 0`;
  }
  return <path transform={`translate(${cx} ${cy})`} d={d} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
};

const Arm: React.FC<{side: -1 | 1; a: number}> = ({side, a}) => (
  <g transform={`translate(${side * 158} -222) rotate(${-side * a})`}>
    <line x1={0} y1={0} x2={0} y2={96} stroke="#c99a10" strokeWidth={28} strokeLinecap="round" />
    <line x1={0} y1={0} x2={0} y2={96} stroke="#FFD93B" strokeWidth={21} strokeLinecap="round" />
    <rect x={-17} y={-6} width={34} height={30} rx={10} fill="#fff" stroke="#d9d9d9" strokeWidth={2} />
    <circle cx={0} cy={106} r={23} fill="#FFD93B" stroke="#c99a10" strokeWidth={5} />
  </g>
);

const blinkAmt = (frame: number, seed: number) => {
  const p = (frame + seed) % 118;
  return p < 6 ? Math.sin((p / 6) * Math.PI) : 0;
};

type CharProps = {
  x: number; y: number; scale: number; expr: Expr; open: number; frame: number;
  look?: Look; eyeScale?: number; tilt?: number; sx?: number; sy?: number;
};

export const Bobi: React.FC<CharProps & {armL?: number; armR?: number}> = ({
  x, y, scale, expr, open, frame, look = {x: 0, y: 0}, eyeScale = 1, tilt = 0, sx = 1, sy = 1, armL = 8, armR = 8,
}) => {
  const bl = blinkAmt(frame, 7);
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale * sx} ${scale * sy})`}>
      {/* piernas y zapatos */}
      <rect x={-62} y={-112} width={26} height={84} fill="#e8c43a" />
      <rect x={36} y={-112} width={26} height={84} fill="#e8c43a" />
      <rect x={-62} y={-60} width={26} height={22} fill="#fff" />
      <rect x={36} y={-60} width={26} height={22} fill="#fff" />
      <ellipse cx={-56} cy={-22} rx={44} ry={17} fill="#1d1d28" />
      <ellipse cx={56} cy={-22} rx={44} ry={17} fill="#1d1d28" />
      <Arm side={-1} a={armL} />
      <Arm side={1} a={armR} />
      {/* cuerpo esponja */}
      <defs>
        <clipPath id="bobiBody"><rect x={-160} y={-480} width={320} height={370} rx={34} /></clipPath>
      </defs>
      <rect x={-160} y={-480} width={320} height={370} rx={34} fill="#FFD93B" stroke="#c99a10" strokeWidth={6} />
      <g clipPath="url(#bobiBody)">
        <rect x={-160} y={-232} width={320} height={70} fill="#fff" />
        <rect x={-160} y={-165} width={320} height={60} fill="#7a4a24" />
        <rect x={-160} y={-172} width={320} height={10} fill="#4d2d14" />
        <rect x={-14} y={-172} width={28} height={10} fill="#d4b22a" />
      </g>
      {/* poros */}
      {[[-128, -440, 11], [120, -432, 13], [-138, -330, 9], [136, -300, 10], [-82, -462, 7], [78, -460, 8], [-120, -255, 0], [100, -262, 0]].map(([px, py, pr], i) =>
        pr > 0 ? <ellipse key={i} cx={px} cy={py} rx={pr} ry={pr * 0.8} fill="#e5b61f" /> : null)}
      {/* camisa: cuello y corbata */}
      <path d="M -34 -232 L 0 -196 L -2 -232 Z" fill="#f0f0f0" stroke="#cfcfcf" strokeWidth={2} />
      <path d="M 34 -232 L 0 -196 L 2 -232 Z" fill="#f0f0f0" stroke="#cfcfcf" strokeWidth={2} />
      <path d="M -11 -226 L 11 -226 L 7 -206 L 0 -206 Z" fill="#c8202f" />
      <path d="M -9 -208 L 9 -208 L 18 -168 L 0 -150 L -18 -168 Z" fill="#e0303f" stroke="#9b1420" strokeWidth={2} />
      {/* mechón */}
      <path d="M -14 -480 q -6 -26 -26 -34 M 0 -480 q 0 -32 6 -44 M 14 -480 q 8 -24 28 -30" stroke="#7a4a24" strokeWidth={8} strokeLinecap="round" fill="none" />
      {/* cara */}
      <circle cx={-108} cy={-326} r={20} fill="#ff9a6b" opacity={0.55} />
      <circle cx={108} cy={-326} r={20} fill="#ff9a6b" opacity={0.55} />
      <Eye cx={-58} cy={-392} r={42} look={look} scale={eyeScale} blink={bl} side={-1} expr={expr} />
      <Eye cx={58} cy={-392} r={42} look={look} scale={eyeScale} blink={bl} side={1} expr={expr} />
      <g fill="none" stroke="#2a1a2e" strokeWidth={7}>
        <circle cx={-58} cy={-392} r={54} /><circle cx={58} cy={-392} r={54} />
        <path d="M -5 -396 Q 0 -404 5 -396" />
        <line x1={-112} y1={-396} x2={-150} y2={-402} /><line x1={112} y1={-396} x2={150} y2={-402} />
      </g>
      <Mouth cx={0} cy={-296} w={130} open={open} expr={expr} />
    </g>
  );
};

const starPoints = (cx: number, cy: number, R: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const ang = (-90 + i * 36) * (Math.PI / 180);
    const rad = i % 2 === 0 ? R : r;
    pts.push(`${(cx + Math.cos(ang) * rad).toFixed(1)},${(cy + Math.sin(ang) * rad).toFixed(1)}`);
  }
  return pts.join(' ');
};

export const Pato: React.FC<CharProps> = ({
  x, y, scale, expr, open, frame, look = {x: 0, y: 0}, eyeScale = 1, tilt = 0, sx = 1, sy = 1,
}) => {
  const bl = blinkAmt(frame, 41);
  const poly = starPoints(0, -235, 215, 122);
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale * sx} ${scale * sy})`}>
      <defs>
        <clipPath id="patoBand"><rect x={-300} y={-195} width={600} height={110} /></clipPath>
        <clipPath id="patoHat"><rect x={-300} y={-560} width={600} height={140} /></clipPath>
        <clipPath id="patoBrim"><rect x={-300} y={-440} width={600} height={14} /></clipPath>
        <clipPath id="patoWaist"><rect x={-300} y={-195} width={600} height={18} /></clipPath>
      </defs>
      <polygon points={poly} fill="#ff8fb3" stroke="#ff8fb3" strokeWidth={40} strokeLinejoin="round" />
      <polygon points={poly} fill="#ff8fb3" />
      {[[-120, -300, 9], [130, -310, 10], [-20, -440, 8], [30, -420, 6], [-180, -150, 8], [190, -140, 8], [-60, -80, 7], [70, -70, 7]].map(([px, py, pr], i) =>
        <circle key={i} cx={px} cy={py} r={pr} fill="#f06c98" />)}
      <g clipPath="url(#patoBand)">
        <polygon points={poly} fill="#38b36a" stroke="#38b36a" strokeWidth={40} strokeLinejoin="round" />
      </g>
      <g clipPath="url(#patoWaist)">
        <polygon points={poly} fill="#1f7f4a" stroke="#1f7f4a" strokeWidth={40} strokeLinejoin="round" />
      </g>
      <g clipPath="url(#patoHat)">
        <polygon points={poly} fill="#3b6fd9" stroke="#3b6fd9" strokeWidth={40} strokeLinejoin="round" />
      </g>
      <g clipPath="url(#patoBrim)">
        <polygon points={poly} fill="#ffd23f" stroke="#ffd23f" strokeWidth={40} strokeLinejoin="round" />
      </g>
      <circle cx={0} cy={-470} r={22} fill="#fff" stroke="#d8e4f5" strokeWidth={3} />
      <line x1={0} y1={-177} x2={0} y2={-90} stroke="#1f7f4a" strokeWidth={5} />
      <circle cx={-90} cy={-262} r={17} fill="#ff6d9a" opacity={0.5} />
      <circle cx={90} cy={-262} r={17} fill="#ff6d9a" opacity={0.5} />
      <Eye cx={-40} cy={-310} r={32} look={look} scale={eyeScale} blink={bl} side={-1} expr={expr} />
      <Eye cx={40} cy={-310} r={32} look={look} scale={eyeScale} blink={bl} side={1} expr={expr} />
      <Mouth cx={0} cy={-246} w={84} open={open} expr={expr} />
    </g>
  );
};
