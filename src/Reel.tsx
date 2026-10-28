import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const FPS = 30;
export const TOTAL_SECONDS = 28;

type Scene = {
  from: number; // seconds
  to: number;
  tag: string;
  title: string;
  subtitle: string;
  accent: string;
};

const SCENES: Scene[] = [
  {from: 0, to: 4, tag: 'GANCHO', title: 'Tu IA ya no solo responde', subtitle: 'Ahora trabaja por ti.', accent: '#22d3ee'},
  {from: 4, to: 10, tag: 'QUÉ ES', title: 'Agentes de IA', subtitle: 'Reciben un objetivo y deciden los pasos para lograrlo.', accent: '#a78bfa'},
  {from: 10, to: 16, tag: 'IDEA 1', title: 'Usan herramientas', subtitle: 'Buscan en internet, leen archivos y escriben código.', accent: '#34d399'},
  {from: 16, to: 22, tag: 'IDEA 2', title: 'Se corrigen solos', subtitle: 'Si algo falla, lo revisan e intentan otro camino.', accent: '#fbbf24'},
  {from: 22, to: 28, tag: 'CIERRE', title: 'Tú pones la meta', subtitle: 'La IA hace el trabajo. Sígueme para más.', accent: '#f472b6'},
];

const Subtitle: React.FC<{text: string; accent: string; duration: number}> = ({text, accent, duration}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');
  const perWord = (duration * 0.8) / words.length;
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 18px'}}>
      {words.map((w, i) => {
        const active = frame >= i * perWord;
        return (
          <span
            key={i}
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: active ? '#fff' : 'rgba(255,255,255,0.25)',
              textShadow: active ? `0 0 24px ${accent}88` : 'none',
              lineHeight: 1.25,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

const SceneView: React.FC<{scene: Scene; duration: number}> = ({scene, duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 12}});
  const fadeOut = interpolate(frame, [duration - 6, duration], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: 80, opacity: fadeOut}}>
      <div
        style={{
          fontSize: 38,
          letterSpacing: 8,
          fontWeight: 700,
          color: scene.accent,
          marginBottom: 40,
          transform: `scale(${pop})`,
        }}
      >
        {scene.tag}
      </div>
      <div
        style={{
          fontSize: 118,
          fontWeight: 900,
          color: '#fff',
          textAlign: 'center',
          lineHeight: 1.05,
          transform: `translateY(${(1 - pop) * 80}px)`,
          opacity: pop,
          marginBottom: 120,
        }}
      >
        {scene.title}
      </div>
      <Subtitle text={scene.subtitle} accent={scene.accent} duration={duration} />
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = FPS * TOTAL_SECONDS;
  const progress = frame / totalFrames;
  const current = SCENES.find((s) => frame >= s.from * FPS && frame < s.to * FPS) ?? SCENES[0];
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% ${30 + 20 * Math.sin(frame / 40)}%, ${current.accent}33, #0b0f1a 60%)`,
        fontFamily: 'Inter, Helvetica, Arial, sans-serif',
      }}
    >
      {SCENES.map((s) => (
        <Sequence key={s.tag} from={s.from * FPS} durationInFrames={(s.to - s.from) * FPS}>
          <SceneView scene={s} duration={(s.to - s.from) * FPS} />
        </Sequence>
      ))}
      <div style={{position: 'absolute', bottom: 0, left: 0, height: 10, width: `${progress * 100}%`, background: current.accent}} />
    </AbsoluteFill>
  );
};
