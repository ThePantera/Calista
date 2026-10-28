# TikTok Tech Comedy — Video 01: "Pato y la contraseña que abre todo"

Reel vertical de 29,9 s sobre no reutilizar contraseñas. Personajes originales: **Bobi** (mascota robot lima con visor) y **Pato** (estrella de mar coral).
Animación **2D vectorial** en Remotion, voces TTS en español, efectos y música sintetizados por código.

Salida final: `renders/video_01_final.mp4` (H.264 + AAC, 1080×1920, 30 fps, 29,9 s, ≈ -14 LUFS).

## Estructura

```
scripts/timeline.json     Fuente de verdad de tiempos (cues, conceptos, sfx). src/video01/timeline.ts es una copia.
scripts/video_01.md       Guion técnico            prompts/scene_0X.md   Prompts por escena
scripts/voces.md          Guía de voces            scripts/licencias.md  Licencias y riesgos
assets/characters/        Hojas de diseño (BOBI.md, PATO.md)
assets/sound/ , music/    Efectos, ambiente y música generados (WAV)
assets/sound/voices/      cue_<id>.wav, una voz por cue
subtitles/video_01.srt    Subtítulos revisables
renders/                  Salidas
../src/video01/           Composición Remotion `Video01`
```

## Reproducir (desde la raíz del repo salvo indicación)

```bash
npm install

# 1) Subtítulos SRT desde timeline.json
python3 tiktok-tech-comedy/scripts/make_srt.py

# 2) Voces (Kokoro, español). Requiere un entorno con torch + kokoro:
#    python3.12 -m venv ~/tts_env && . ~/tts_env/bin/activate
#    pip install torch --index-url https://download.pytorch.org/whl/cpu && pip install "kokoro>=0.9.4" soundfile librosa
~/tts_env/bin/python tiktok-tech-comedy/scripts/make_voices.py

# 3) Efectos, ambiente, música y mezcla (-14 LUFS)
cd tiktok-tech-comedy/scripts && python3 synth_sfx.py && python3 synth_music.py && python3 mix.py && cd ../..

# 4) Vídeo sin audio
npx remotion render src/index.ts Video01 tiktok-tech-comedy/renders/video01_silent.mp4

# 5) Unir
ffmpeg -y -i tiktok-tech-comedy/renders/video01_silent.mp4 -i tiktok-tech-comedy/renders/audio_mix.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -t 29.9 -movflags +faststart \
  tiktok-tech-comedy/renders/video_01_final.mp4
```

Si cambias `timeline.json`, copia los mismos datos a `src/video01/timeline.ts`.
Las voces vienen del motor Kokoro (Apache 2.0) del repo https://github.com/emin201089/tts, usado con `lang_code="e"` y las voces `em_santa` (Pato, +2 semitonos) y `em_alex` (Bobi).

## Estado

| Etapa | Estado |
|---|---|
| Guion, prompts, fichas, guía de voces | Hecho (documentos) |
| Animación | Hecha, **2D vectorial** (no 3D). Fotogramas clave revisados a ojo |
| Subtítulos | Quemados en el vídeo + SRT aparte |
| Voces | TTS Kokoro, 7/7 caben en su hueco. **No escuchadas por quien las generó**; suenan a TTS, no a actor |
| Efectos y música | Sintetizados, originales. **No escuchados**, solo medidos |
| Mezcla | -14,1 LUFS, pico -1,4 dBFS |
| Sincronía labial | Aproximada: la boca se mueve durante el cue, no fonema a fonema |
| Animación 3D / voces de actor | No disponible con las herramientas actuales |

Ver `QA.md` para el control de calidad completo.
