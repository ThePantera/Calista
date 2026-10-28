# Licencias y procedencia — Video 01

Este registro debe completarse y revisarse antes de publicar. Nota: no es asesoría legal.

## Principios

- Todos los personajes (BOBI, PATO), diseños, textos, gráficos, efectos y música son originales de este proyecto, o deben tener licencia explícita para el uso previsto.
- No se usan personajes, modelos, fotogramas, voces, música, logotipos ni elementos distintivos protegidos de series existentes. El concepto inicial mencionaba personajes protegidos de una serie conocida; esos personajes no se utilizan. No se descargan recursos protegidos.
- No se incluyen marcas de agua ni logotipos de terceros.

## Inventario de recursos

| Recurso | Origen | Licencia / titular | Estado |
|---|---|---|---|
| Personaje BOBI (diseño) | Original, proyecto | Titular del proyecto | Definido en `assets/characters/BOBI.md` |
| Personaje PATO (diseño) | Original, proyecto | Titular del proyecto | Definido en `assets/characters/PATO.md` |
| Guion y diálogos | Original, proyecto (brief) | Titular del proyecto | Fijo en `timeline.json` |
| Animación vectorial 2D | Código del proyecto | Titular del proyecto | A verificar contra el repositorio |
| Efectos de sonido (`bubble_pop`, `zoom_whoosh`, `digital_blip`, `comic_hit`, `soft_chime`, `confirm`) | Sintetizados por código | Titular del proyecto | A verificar contra el repositorio |
| Ambiente submarino | Sintetizado por código | Titular del proyecto | A verificar contra el repositorio |
| Música (`playful_tech_loop`) | Sintetizada por código | Titular del proyecto | A verificar contra el repositorio |
| Subtítulos SRT | Texto del guion | Titular del proyecto | A verificar contra el repositorio |
| Voces | NO existen | Pendiente | Requiere aprobación del usuario (ver abajo) |
| Tipografía de subtítulos | Por definir | Debe ser libre o con licencia comercial (por ejemplo, SIL OFL) | Pendiente de verificar |

## Software y dependencias

- Remotion: su licencia tiene condiciones propias para uso comercial por empresas. Revisar el texto vigente de la licencia de Remotion antes de uso comercial en una organización.
- FFmpeg: la licencia depende de cómo esté compilado (LGPL o GPL). Para generar un MP4 H.264 propio, no suele ser un problema, pero hay que verificar la compilación instalada y las patentes del códec H.264 según el caso de uso.
- Dependencias de Node: revisar con `npm ls` y las licencias de cada paquete (`npx license-checker` u herramienta equivalente, con aprobación para instalar).

## Voces (pendiente)

- No se generó ninguna voz. Si se decide usar TTS o una API (por ejemplo, ElevenLabs), registrar: proveedor, plan contratado, nombre de la voz, términos de uso comercial y fecha.
- Prohibido clonar la voz de una persona sin su autorización escrita, y prohibido imitar a actores o personajes identificables.
- Si se graba a una persona, obtener autorización por escrito para el uso, la edición y la publicación.

## Música y efectos

- Si se reemplaza la música sintetizada por pistas de terceros, usar solo material con licencia que cubra el uso en TikTok y monetización, y anotar la fuente, el autor y el enlace a la licencia aquí.
- Evitar bibliotecas de TikTok si el uso no es dentro de la plataforma; las licencias comerciales varían.

## Marcas y nombres

- "Bobi" y "Pato" son nombres de trabajo comunes. Antes de registrar una marca o un canal, buscar conflictos de marca en las jurisdicciones relevantes.
- No usar los nombres de personajes de series existentes en título, descripción, hashtags ni metadatos.

## Contenido de seguridad

- El contenido educativo reduce riesgos, no los elimina. No debe describirse como protección absoluta.
- `123456` es un ejemplo ficticio; no corresponde a ninguna cuenta real.

## Lista de verificación previa a publicar

- [ ] Inventario anterior verificado archivo por archivo.
- [ ] Licencia de tipografía confirmada.
- [ ] Origen y licencia de las voces documentados.
- [ ] Música y efectos confirmados como originales o con licencia apropiada.
- [ ] Sin marcas de agua ni logotipos de terceros.
- [ ] Revisión de licencias de Remotion y FFmpeg según el uso comercial.
