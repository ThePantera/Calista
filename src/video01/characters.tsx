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

const Eye: React.FC<{cx: number; cy: number; r: number; look: Look; scale: number; blink: number; side: -1 | 1; expr: Expr; variant: 'digital' | 'bead'}> = ({cx, cy, r, look, scale, blink, side, expr, variant}) => {
  const R = r * scale;
  const [dy, tilt] = browCfg(expr, side);
  const browColor = variant === 'digital' ? '#8ef6ff' : '#b2412c';
  return (
    <g>
      <g transform={`translate(${cx} ${cy}) scale(1 ${1 - blink * 0.92})`}>
        {variant === 'digital' ? (
          <g>
            <rect x={-R} y={-R * 0.85} width={R * 2} height={R * 1.7} rx={R * 0.5} fill="#8ef6ff" />
            <rect x={-R * 0.38 + look.x * R * 0.35} y={-R * 0.5 + look.y * R * 0.3} width={R * 0.76} height={R} rx={R * 0.25} fill="#0b2a40" />
            <rect x={-R * 0.62} y={-R * 0.62} width={R * 0.3} height={R * 0.3} rx={3} fill="#fff" />
          </g>
        ) : (
          <g>
            <ellipse rx={R * 0.8} ry={R} fill="#2a1a2e" />
            <circle cx={-R * 0.22 + look.x * R * 0.18} cy={-R * 0.38 + look.y * R * 0.18} r={R * 0.3} fill="#fff" />
            <circle cx={R * 0.25 + look.x * R * 0.18} cy={R * 0.3 + look.y * R * 0.18} r={R * 0.14} fill="#fff" />
          </g>
        )}
      </g>
      <g transform={`translate(${cx} ${cy - R - 8 + dy}) rotate(${side * tilt})`}>
        <line x1={-r * 0.8} y1={0} x2={r * 0.8} y2={0} stroke={browColor} strokeWidth={variant === 'digital' ? 7 : 9} strokeLinecap="round" />
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


const blinkAmt = (frame: number, seed: number) => {
  const p = (frame + seed) % 118;
  return p < 6 ? Math.sin((p / 6) * Math.PI) : 0;
};

type CharProps = {
  x: number; y: number; scale: number; expr: Expr; open: number; frame: number;
  look?: Look; eyeScale?: number; tilt?: number; sx?: number; sy?: number;
  armL?: number; armR?: number;
};

/* ---------------- BOBI: robot-esponja? No: mascota digital lima, cuerpo alto con visor ---------------- */
const BobiArm: React.FC<{side: -1 | 1; a: number}> = ({side, a}) => (
  <g transform={`translate(${side * 120} -228) rotate(${-side * a})`}>
    <line x1={0} y1={0} x2={0} y2={92} stroke="#6f9a14" strokeWidth={30} strokeLinecap="round" />
    <line x1={0} y1={0} x2={0} y2={92} stroke="#c6e64b" strokeWidth={23} strokeLinecap="round" />
    <rect x={-20} y={-8} width={40} height={34} rx={14} fill="#fff" stroke="#c9d3da" strokeWidth={3} />
    <rect x={-18} y={92} width={36} height={30} rx={13} fill="#c6e64b" stroke="#6f9a14" strokeWidth={5} />
    <rect x={-18} y={88} width={36} height={8} fill="#2d3b8c" />
  </g>
);

export const Bobi: React.FC<CharProps> = ({
  x, y, scale, expr, open, frame, look = {x: 0, y: 0}, eyeScale = 1, tilt = 0, sx = 1, sy = 1, armL = 8, armR = 8,
}) => {
  const bl = blinkAmt(frame, 7);
  const glow = 0.6 + 0.4 * Math.sin(frame * 0.2);
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale * sx} ${scale * sy})`}>
      <defs>
        <clipPath id="bobiBody"><rect x={-125} y={-450} width={250} height={330} rx={74} /></clipPath>
        <pattern id="bobiPix" width={24} height={24} patternUnits="userSpaceOnUse">
          <rect width={12} height={12} fill="#b6d63a" /><rect x={12} y={12} width={12} height={12} fill="#b6d63a" />
        </pattern>
      </defs>
      {/* piernas cortas y gruesas + zapatillas */}
      <rect x={-66} y={-120} width={48} height={84} rx={14} fill="#a9cd3a" />
      <rect x={18} y={-120} width={48} height={84} rx={14} fill="#a9cd3a" />
      <rect x={-80} y={-58} width={76} height={34} rx={16} fill="#2d3b8c" stroke="#1a2460" strokeWidth={4} />
      <rect x={4} y={-58} width={76} height={34} rx={16} fill="#2d3b8c" stroke="#1a2460" strokeWidth={4} />
      <rect x={-72} y={-34} width={60} height={9} rx={4} fill="#fff" />
      <rect x={12} y={-34} width={60} height={9} rx={4} fill="#fff" />
      <BobiArm side={-1} a={armL} />
      <BobiArm side={1} a={armR} />
      {/* auriculares y antena */}
      <rect x={-148} y={-440} width={34} height={86} rx={16} fill="#2d3b8c" stroke="#1a2460" strokeWidth={4} />
      <rect x={114} y={-440} width={34} height={86} rx={16} fill="#2d3b8c" stroke="#1a2460" strokeWidth={4} />
      <line x1={22} y1={-448} x2={44} y2={-510} stroke="#4a5a68" strokeWidth={7} strokeLinecap="round" />
      <circle cx={46} cy={-516} r={14} fill="#ff5a7a" stroke="#fff" strokeWidth={4} opacity={0.7 + 0.3 * glow} />
      {/* cuerpo */}
      <rect x={-125} y={-450} width={250} height={330} rx={74} fill="#c6e64b" stroke="#6f9a14" strokeWidth={6} />
      <g clipPath="url(#bobiBody)">
        <rect x={-125} y={-450} width={250} height={330} fill="url(#bobiPix)" opacity={0.5} />
        {/* circuitos */}
        <g stroke="#6f9a14" strokeWidth={4} fill="none" opacity={0.8}>
          <polyline points="-125,-330 -100,-330 -88,-310 -88,-285" /><polyline points="125,-340 102,-340 92,-320 92,-290" />
        </g>
        <circle cx={-88} cy={-283} r={6} fill="#6f9a14" /><circle cx={92} cy={-288} r={6} fill="#6f9a14" />
        {/* bata corta blanca */}
        <rect x={-125} y={-268} width={250} height={110} fill="#fff" />
        <line x1={0} y1={-268} x2={0} y2={-158} stroke="#c9d3da" strokeWidth={4} />
        <rect x={-100} y={-215} width={44} height={34} rx={6} fill="none" stroke="#c9d3da" strokeWidth={4} />
        <rect x={56} y={-215} width={44} height={34} rx={6} fill="none" stroke="#c9d3da" strokeWidth={4} />
        {/* pantalones */}
        <rect x={-125} y={-160} width={250} height={50} fill="#7a4a24" />
      </g>
      <path d="M -40 -268 L 0 -228 L -4 -268 Z" fill="#eef2f5" stroke="#c9d3da" strokeWidth={3} />
      <path d="M 40 -268 L 0 -228 L 4 -268 Z" fill="#eef2f5" stroke="#c9d3da" strokeWidth={3} />
      {/* moño rojo */}
      <path d="M 0 -250 L -28 -266 L -28 -234 Z" fill="#e0303f" stroke="#9b1420" strokeWidth={3} />
      <path d="M 0 -250 L 28 -266 L 28 -234 Z" fill="#e0303f" stroke="#9b1420" strokeWidth={3} />
      <rect x={-8} y={-258} width={16} height={16} rx={5} fill="#b81d2c" />
      {/* visor con ojos digitales */}
      <rect x={-104} y={-452} width={208} height={108} rx={40} fill="#16264a" stroke="#8ef6ff" strokeWidth={5} />
      <rect x={-92} y={-442} width={80} height={10} rx={5} fill="#fff" opacity={0.18} />
      <Eye cx={-46} cy={-398} r={27} look={look} scale={eyeScale} blink={bl} side={-1} expr={expr} variant="digital" />
      <Eye cx={46} cy={-398} r={27} look={look} scale={eyeScale} blink={bl} side={1} expr={expr} variant="digital" />
      <Mouth cx={0} cy={-304} w={100} open={open} expr={expr} />
    </g>
  );
};

/* ---------------- PATO: estrella de mar coral de brazos finos y articulados ---------------- */
const CORAL = '#ff8a75';
const CORAL_D = '#e2634d';

const limb = (cx: number, cy: number, angDeg: number, len: number, base: number, tip: number) => {
  const a = (angDeg * Math.PI) / 180;
  const ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
  const p = (l: number, w: number) => `${(cx + ux * l + nx * w).toFixed(1)},${(cy + uy * l + ny * w).toFixed(1)}`;
  return `${p(0, -base)} ${p(len, -tip)} ${p(len, tip)} ${p(0, base)}`;
};

const PatoArm: React.FC<{side: -1 | 1; a: number}> = ({side, a}) => (
  <g transform={`translate(${side * 58} -292) rotate(${-side * a})`}>
    <line x1={0} y1={0} x2={0} y2={92} stroke={CORAL} strokeWidth={34} strokeLinecap="round" />
    <g transform={`translate(0 92) rotate(${-side * Math.min(60, a * 0.45)})`}>
      <line x1={0} y1={0} x2={0} y2={92} stroke={CORAL} strokeWidth={26} strokeLinecap="round" />
      <circle cx={0} cy={96} r={20} fill={CORAL} />
      {[18, 44, 70].map((d) => <circle key={d} cx={0} cy={d} r={4.5} fill={CORAL_D} />)}
    </g>
    <circle cx={0} cy={92} r={19} fill={CORAL} />
    {[16, 44, 70].map((d) => <circle key={d} cx={0} cy={d} r={5} fill={CORAL_D} />)}
  </g>
);

export const Pato: React.FC<CharProps> = ({
  x, y, scale, expr, open, frame, look = {x: 0, y: 0}, eyeScale = 1, tilt = 0, sx = 1, sy = 1, armL = 52, armR = 52,
}) => {
  const bl = blinkAmt(frame, 41);
  const C = {x: 0, y: -255};
  const legTip = (s: number) => ({x: s * 118, y: C.y + 162});
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale * sx} ${scale * sy})`}>
      <PatoArm side={-1} a={armL} />
      <PatoArm side={1} a={armR} />
      {/* brazo superior y patas: cinco brazos largos y finos */}
      {[limb(C.x, C.y, -90, 215, 40, 13), limb(C.x, C.y, 54, 205, 40, 13), limb(C.x, C.y, 126, 205, 40, 13)].map((pts, i) => (
        <polygon key={i} points={pts} fill={CORAL} stroke={CORAL} strokeWidth={22} strokeLinejoin="round" />
      ))}
      <circle cx={C.x} cy={C.y} r={84} fill={CORAL} />
      {/* textura de puntos en filas */}
      {[40, 80, 120, 160].map((d) => <circle key={`t${d}`} cx={((d % 80 === 0) ? 7 : -7)} cy={C.y - 70 - d * 0.78} r={5.5} fill={CORAL_D} opacity={0.85} />)}
      {[52, 92, 132, 170].map((d) => <circle key={`l${d}`} cx={-d * 0.58 + 8} cy={C.y + d * 0.8 - 20} r={5} fill={CORAL_D} opacity={0.85} />)}
      {[52, 92, 132, 170].map((d) => <circle key={`r${d}`} cx={d * 0.58 - 8} cy={C.y + d * 0.8 - 20} r={5} fill={CORAL_D} opacity={0.85} />)}
      {/* shorts verdes con tirantes */}
      <g stroke="#2f9a5a" strokeWidth={66} strokeLinecap="butt">
        <line x1={24} y1={-223} x2={84} y2={-140} /><line x1={-24} y1={-223} x2={-84} y2={-140} />
      </g>
      <g stroke="#43c274" strokeWidth={58} strokeLinecap="butt">
        <line x1={24} y1={-223} x2={84} y2={-140} /><line x1={-24} y1={-223} x2={-84} y2={-140} />
      </g>
      <rect x={-62} y={-218} width={124} height={48} rx={10} fill="#43c274" stroke="#2f9a5a" strokeWidth={5} />
      <line x1={0} y1={-218} x2={0} y2={-170} stroke="#2f9a5a" strokeWidth={4} />
      <g stroke="#f4c430" strokeWidth={13} strokeLinecap="round">
        <line x1={-48} y1={-214} x2={-60} y2={-240} /><line x1={48} y1={-214} x2={60} y2={-240} />
      </g>
      <circle cx={-38} cy={-208} r={8} fill="#fff" stroke="#c99a10" strokeWidth={3} />
      <circle cx={38} cy={-208} r={8} fill="#fff" stroke="#c99a10" strokeWidth={3} />
      {/* cara */}
      <circle cx={-60} cy={-252} r={14} fill="#ff6f5a" opacity={0.5} />
      <circle cx={60} cy={-252} r={14} fill="#ff6f5a" opacity={0.5} />
      <Eye cx={-32} cy={-282} r={25} look={look} scale={eyeScale} blink={bl} side={-1} expr={expr} variant="bead" />
      <Eye cx={32} cy={-282} r={25} look={look} scale={eyeScale} blink={bl} side={1} expr={expr} variant="bead" />
      <Mouth cx={0} cy={-232} w={64} open={open} expr={expr} />
    </g>
  );
};
