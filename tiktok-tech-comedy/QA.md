# Control de calidad — Video 01

Comprobado con ffprobe / ebur128 / inspección de fotogramas:

- [x] Duración 29,9 s (≤ 30 s)
- [x] 1080×1920, 30 fps, H.264 High + AAC 48 kHz estéreo
- [x] 7 diálogos presentes y sin solapamiento (cada voz termina antes del siguiente cue)
- [x] Volumen ≈ -14,1 LUFS, pico -1,4 dBFS, sin clipping
- [x] Subtítulos legibles, ≤ 2 líneas, palabras clave resaltadas, en zona segura (fotogramas 1, 3.5, 8, 14.8, 17.95, 22, 28, 29.5)
- [x] Personajes distintos de series existentes tras el rediseño (valoración visual; conviene confirmación humana)
- [x] Contenido educativo correcto: contraseña única, gestor y verificación en dos pasos; no promete seguridad absoluta
- [x] "123456" es ficticio; sin datos reales ni marcas

No verificado (limitaciones):

- [ ] Escucha humana de voces, efectos y música (balance voz/música en altavoz de móvil y auriculares)
- [ ] Reproducción completa del vídeo en movimiento (solo se vieron fotogramas sueltos; no se miró el sacudón de cámara ni los cortes)
- [ ] Sincronía labial real; hay una aproximación por cue
- [ ] Licencias: voces Kokoro (Apache 2.0), Remotion (revisar licencia comercial según tamaño de empresa), Inter (OFL). Ver `scripts/licencias.md`
