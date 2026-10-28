import React from 'react';
import {Cue, CUES} from './timeline';
import {backOut, clamp01} from './util';

const ACCENT = '#FFD23F';
const FONT = "'Inter', 'Liberation Sans', Arial, sans-serif";
const MAX_UNITS = 25;

type Tok = {w: string; hl: boolean};
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const units = (s: string) => [...s].reduce((a, c) => a + (c !== c.toLowerCase() ? 1.3 : 1), 0);

const tokenize = (cue: Cue): Tok[] => {
  const toks: Tok[] = cue.text.split(' ').map((w) => ({w, hl: false}));
  const n = toks.map((t) => norm(t.w));
  for (const phrase of cue.highlight) {
    const p = phrase.split(' ').map(norm);
    for (let i = 0; i + p.length <= n.length; i++) {
      if (p.every((x, k) => n[i + k] === x)) {
        for (let k = 0; k < p.length; k++) toks[i + k].hl = true;
        break;
      }
    }
  }
  return toks;
};

/** Reparte el cue en bloques de máx. 2 líneas. */
const buildChunks = (cue: Cue) => {
  const toks = tokenize(cue);
  const lines: Tok[][] = [];
  let cur: Tok[] = [];
  let u = 0;
  for (const t of toks) {
    const tu = units(t.w) + 0.5;
    if (cur.length && u + tu > MAX_UNITS) { lines.push(cur); cur = []; u = 0; }
    cur.push(t); u += tu;
  }
  if (cur.length) lines.push(cur);
  const chunks: Tok[][][] = [];
  for (let i = 0; i < lines.length; i += 2) chunks.push(lines.slice(i, i + 2));
  return chunks;
};

const CHUNKS = new Map(CUES.map((c) => [c.id, buildChunks(c)]));

export const Subtitles: React.FC<{t: number}> = ({t}) => {
  const cue = CUES.find((c) => t >= c.start && t <= c.end + 0.12);
  if (!cue) return null;
  const chunks = CHUNKS.get(cue.id)!;
  const weights = chunks.map((ch) => ch.flat().reduce((a, tk) => a + units(tk.w), 0));
  const total = weights.reduce((a, b) => a + b, 0);
  const prog = clamp01((t - cue.start) / (cue.end - cue.start));
  let acc = 0, idx = chunks.length - 1, chunkStart = 0;
  for (let i = 0; i < chunks.length; i++) {
    if (prog < (acc + weights[i]) / total) { idx = i; chunkStart = acc / total; break; }
    acc += weights[i];
  }
  const tChunk = cue.start + chunkStart * (cue.end - cue.start);
  const pop = backOut((t - tChunk) / 0.14);
  const chip = cue.speaker === 'PATO' ? {bg: '#ff8fb3', fg: '#4a0f26'} : {bg: '#FFD93B', fg: '#4a3600'};
  return (
    <div style={{position: 'absolute', left: 60, top: 1440, width: 880, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: FONT}}>
      <div style={{background: chip.bg, color: chip.fg, fontWeight: 900, fontSize: 30, letterSpacing: 3, padding: '4px 22px', borderRadius: 999, border: '4px solid #12313c', marginBottom: 12}}>
        {cue.speaker}
      </div>
      <div style={{transform: `scale(${0.88 + 0.12 * pop})`, opacity: clamp01(pop * 1.4), textAlign: 'center'}}>
        {chunks[idx].map((line, li) => (
          <div key={li} style={{whiteSpace: 'nowrap', fontWeight: 900, fontSize: 56, lineHeight: 1.18, wordSpacing: 8}}>
            {line.map((tk, wi) => (
              <span key={wi} style={{
                color: tk.hl ? ACCENT : '#fff',
                WebkitTextStroke: '11px #10303b', paintOrder: 'stroke fill',
                textShadow: '0 5px 0 rgba(8,35,45,0.55)',
              }}>{tk.w}{wi < line.length - 1 ? ' ' : ''}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
