# TikTok Tech Comedy — Video 01: "Patricio y la contraseña que abre todo"

Video vertical de 29,9 s (1080 x 1920, 9:16, 30 FPS) en español latinoamericano sobre un error habitual: reutilizar la misma contraseña. Protagonistas originales: **Bobi** (esponja amarilla geométrica) y **Pato** (estrella de mar rosa).

## Estado

Resumen honesto de lo que existe y de lo que no.

### Qué hay

- Animación 2D vectorial con personajes originales (Bobi y Pato), sobre un entorno submarino.
- Efectos de sonido, ambiente y música sintetizados por código (originales, sin material de terceros).
- Subtítulos en SRT.
- Documentación de preproducción: guion técnico, prompts por escena, hojas de personaje, guía de voces y registro de licencias.

### Qué NO hay

- **No hay voces.** No hay TTS ni API de voz instalados en el entorno. Generar las voces requiere aprobación del usuario para usar ElevenLabs u otro servicio (con posible costo y claves API), o una grabación humana. Hasta entonces el video no tiene diálogo hablado y no es publicable en su forma actual. Ver `scripts/voces.md`.
- **No hay generación de video 3D.** No hay herramientas de generación de video disponibles. Los prompts de `prompts/` están redactados para poder usarlos si se aprueba una herramienta así, pero no se ejecutó ninguna. El resultado actual es animación 2D vectorial, no animación 3D.
- No hay sincronía labial con voces reales, porque no hay voces.
- No se ha hecho una revisión de licencias terminada: `scripts/licencias.md` es un registro por completar.

### Pendiente antes de publicar

1. Aprobar y generar (o grabar) las 7 voces.
2. Mezclar las voces con el audio sintetizado.
3. Verificar la duración, la resolución y el audio del MP4 final.
4. Completar la lista de verificación de `scripts/licencias.md`.

Cualquier archivo que aparezca en `renders/` debe verificarse con `ffprobe` antes de darlo por válido. Esta documentación no sustituye esa comprobación.

## Estructura

```text
tiktok-tech-comedy/
├── README.md                  Este archivo
├── assets/
│   ├── characters/            BOBI.md, PATO.md (hojas de diseño)
│   ├── backgrounds/
│   ├── sound/                 Efectos y ambiente sintetizados
│   └── music/                 Música sintetizada
├── prompts/                   scene_01.md … scene_05.md (prompts visuales por escena)
├── scripts/
│   ├── timeline.json          Fuente de verdad de tiempos, textos, SFX y conceptos
│   ├── video_01.md            Guion técnico con tiempos
│   ├── voces.md               Guía de voces e interpretación por cue
│   └── licencias.md           Registro de licencias y procedencia
├── subtitles/                 video_01.srt
├── renders/                   Salidas de render (no versionar archivos grandes)
└── src/                       Proyecto Remotion (src/index.ts, composición Video01)
```

Algunas carpetas (por ejemplo `assets/sound/`, `src/`, `subtitles/`) las genera o completa el equipo de implementación; verificá su contenido real en tu copia antes de renderizar.

## Requisitos

- Node.js y dependencias del proyecto (`npm install`, con aprobación previa).
- FFmpeg y ffprobe en el PATH.

## Cómo renderizar

Desde `tiktok-tech-comedy/`:

```bash
# Instalar dependencias (una sola vez)
npm install

# Vista previa interactiva (opcional)
npx remotion studio src/index.ts

# Render del video (sin voces) a MP4
npx remotion render src/index.ts Video01 renders/video_01_silent.mp4 \
  --codec=h264 --fps=30
```

Si la composición ya incluye el audio sintetizado, el MP4 resultante lo traerá; si lo exporta por separado, usá la mezcla de la sección siguiente. Ajustá nombres de archivo y flags a lo que realmente exponga tu `src/`.

## Cómo mezclar el audio

Objetivo: voces claras por encima de todo, música baja (ducking de -18 dB bajo el diálogo, según `timeline.json`) y sin clipping.

Convención de archivos sugerida:

```text
assets/voices/cue_01_PATO.wav … cue_07_BOBI.wav   (cuando existan)
assets/sound/ambience.wav, music.wav, sfx_mix.wav
```

Ejemplo con FFmpeg: ubicar cada voz en su tiempo de inicio (ms), combinar capas, aplicar ducking de la música con sidechain y normalizar.

```bash
# 1) Pista de voces: cada cue retrasada a su tiempo de inicio (adelay en ms)
ffmpeg -y \
  -i assets/voices/cue_01_PATO.wav -i assets/voices/cue_02_BOBI.wav \
  -i assets/voices/cue_03_PATO.wav -i assets/voices/cue_04_BOBI.wav \
  -i assets/voices/cue_05_BOBI.wav -i assets/voices/cue_06_PATO.wav \
  -i assets/voices/cue_07_BOBI.wav \
  -filter_complex "\
[0]adelay=200|200[a];[1]adelay=4200|4200[b];[2]adelay=12200|12200[c];\
[3]adelay=15200|15200[d];[4]adelay=18200|18200[e];[5]adelay=27000|27000[f];\
[6]adelay=28600|28600[g];\
[a][b][c][d][e][f][g]amix=inputs=7:normalize=0,apad=whole_dur=29.9[voz]" \
  -map "[voz]" -ar 48000 -ac 1 assets/sound/voices_mix.wav

# 2) Música con ducking bajo las voces + ambiente + SFX, y normalización
ffmpeg -y -i assets/sound/voices_mix.wav -i assets/music/music.wav \
  -i assets/sound/ambience.wav -i assets/sound/sfx_mix.wav \
  -filter_complex "\
[0]asplit=2[v][vsc];\
[1][vsc]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=300[mduck];\
[mduck]volume=-6dB[m];[2]volume=-18dB[amb];\
[v][m][amb][3]amix=inputs=4:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[out]" \
  -map "[out]" -ar 48000 -t 29.9 assets/sound/final_mix.wav
```

Comprobá siempre en auriculares y en altavoz de teléfono. Los valores de ducking son un punto de partida: ajustalos de oído.

## Cómo unir audio y video con FFmpeg

```bash
# Unir el video renderizado (sin audio o con audio provisional) con la mezcla final
ffmpeg -y -i renders/video_01_silent.mp4 -i assets/sound/final_mix.wav \
  -map 0:v:0 -map 1:a:0 \
  -c:v libx264 -pix_fmt yuv420p -preset slow -crf 18 \
  -c:a aac -b:a 192k -ar 48000 \
  -movflags +faststart -t 29.9 renders/video_01_final.mp4
```

Si los subtítulos no están integrados por Remotion y querés incrustarlos con FFmpeg (quemados en el video):

```bash
ffmpeg -y -i renders/video_01_final.mp4 \
  -vf "subtitles=subtitles/video_01.srt:force_style='FontName=Arial Black,FontSize=14,PrimaryColour=&H00FFFFFF&,OutlineColour=&H00000000&,Outline=3,Alignment=2,MarginV=380'" \
  -c:a copy renders/video_01_subs.mp4
```

(Preferible: subtítulos integrados desde Remotion, con resaltado de palabras clave.)

## Verificación

```bash
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate \
  -show_entries format=duration -of default=nw=1 renders/video_01_final.mp4
```

Debe mostrar: H.264, 1080 x 1920, 30 fps, AAC a 48 kHz y duración ≤ 30 s. Luego recorré la lista de control de calidad del brief.

## Cómo modificar el proyecto

- Tiempos, textos, SFX y conceptos: `scripts/timeline.json` (los diálogos no se cambian sin autorización).
- Diseño de personajes: `assets/characters/`. Mantené colores, vestuario y escala constantes.
- Prompts visuales: `prompts/scene_0X.md`.

## Contenido educativo

- Usar la misma contraseña en varias cuentas es riesgoso: si se filtra una, pueden probarla en otros servicios.
- Recomendaciones: una contraseña distinta por cuenta, un gestor de contraseñas y la verificación en dos pasos.
- Estas medidas reducen el riesgo; no garantizan seguridad absoluta.
- `123456` es un ejemplo ficticio.

## Licencias

Ver `scripts/licencias.md`. No se usan personajes, voces, música ni elementos distintivos de series existentes.
