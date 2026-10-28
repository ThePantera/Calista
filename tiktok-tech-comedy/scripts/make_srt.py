"""Genera subtitles/video_01.srt desde scripts/timeline.json (máx. 2 líneas por cue)."""
import json, textwrap, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
tl = json.loads((root / "scripts" / "timeline.json").read_text(encoding="utf-8"))

def ts(t):
    ms = round(t * 1000)
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

def balanced(words):
    """Parte una lista de palabras en 1-2 líneas de largo similar."""
    if len(" ".join(words)) <= 26:
        return " ".join(words)
    best = min(range(1, len(words)),
               key=lambda i: abs(len(" ".join(words[:i])) - len(" ".join(words[i:]))))
    return " ".join(words[:best]) + "\n" + " ".join(words[best:])

def chunks(text, max_chars=56):
    """Fragmentos equilibrados de máx. 2 líneas, sin palabras huérfanas."""
    words = text.split()
    k = max(1, -(-len(text) // max_chars))
    size = -(-len(words) // k)
    return [balanced(words[i:i + size]) for i in range(0, len(words), size)]

out, n = [], 1
for cue in tl["cues"]:
    parts = chunks(cue["text"])
    total = sum(len(p) for p in parts)
    t = cue["start"]
    for p in parts:
        dur = (cue["end"] - cue["start"]) * len(p) / total
        out.append(f"{n}\n{ts(t)} --> {ts(t + dur)}\n{p}\n")
        n += 1
        t += dur

(root / "subtitles" / "video_01.srt").write_text("\n".join(out), encoding="utf-8")
print(f"{n - 1} subtítulos escritos")
