# Guía de voces e interpretación — Video 01

Estado: **no hay voces generadas**. Este documento es la guía para grabarlas o generarlas una vez aprobada una herramienta (ver `README.md`, sección Estado). Los textos no se modifican respecto de `scripts/timeline.json`.

## Reglas generales

- Español latinoamericano natural, con voseo ("Usá", "activá", "Seguinos").
- Una toma independiente por cue, para controlar pausas, ritmo y sincronía. Nombrar los archivos `cue_01_PATO.wav` … `cue_07_BOBI.wav`.
- Pistas separadas por personaje (PATO y BOBI). Sin solapamiento entre cues.
- Priorizar la inteligibilidad: no acelerar la voz hasta volverla difícil de entender. Si una toma excede su ventana, recortar pausas internas o respiraciones, no acelerar.
- No imitar a ningún actor ni personaje existente.
- No clonar voces sin autorización expresa y documentada de la persona.
- Formato de entrega: WAV mono, 48 kHz, 24 bits, sin compresión, pico máximo -3 dBFS antes de la mezcla.

## Perfil de voz — PATO

- Voz masculina joven, caricaturesca.
- Tono inocente, curioso y ligeramente desconcertado.
- Entonación ascendente en las preguntas.
- Pausas naturales; habla como si su pregunta fuera completamente razonable.

## Perfil de voz — BOBI

- Voz masculina joven-adulta.
- Tono enérgico, seguro y didáctico; ritmo ligeramente acelerado.
- Empieza con preocupación genuina y pasa a exasperación cómica.
- Énfasis cómico en "¡ESO NO ES UNA CONTRASEÑA, ES UNA INVITACIÓN!".

## Guía por cue

Duración disponible = end − start según `timeline.json`.

| Cue | Quién | Ventana | Duración | Texto | Interpretación |
|---|---|---|---|---|---|
| 1 | PATO | 0,2–3,6 | 3,4 s | Bobi, si uso la misma contraseña para todo… ¿me hackean todo de una? | Seriedad total, tono llano. Pausa leve en los puntos suspensivos (~0,2 s). Subida de tono en "¿me hackean todo de una?". Énfasis suave en "misma contraseña". |
| 2 | BOBI | 4,2–10,6 | 6,4 s | ¡Sí, Pato! Si te roban una contraseña, pueden probarla en tu correo, tus redes y otras cuentas. | Preocupación sincera. "¡Sí, Pato!" firme y breve. Enumeración "tu correo, tus redes y otras cuentas" con ritmo creciente, apoyando los tres blips visuales (6,0 / 7,6 / 9,2 s). Énfasis en "te roban una". |
| 3 | PATO | 12,2–15,0 | 2,8 s | Entonces… ¿mi contraseña “123456” no es segura? | Confusión inocente. Pausa corta tras "Entonces…". "123456" dicho dígito por dígito o en bloques ("uno, dos, tres, cuatro, cinco, seis"), de forma natural. Subida de tono en "no es segura". |
| 4 | BOBI | 15,2–17,8 | 2,6 s | ¡ESO NO ES UNA CONTRASEÑA, ES UNA INVITACIÓN! | Exasperación cómica. Crescendo hacia "INVITACIÓN", sin gritar hasta distorsionar. Micro pausa tras "CONTRASEÑA,". El `comic_hit` cae a 17,9 s, justo tras la última sílaba. |
| 5 | BOBI | 18,2–25,8 | 7,6 s | Usá una contraseña diferente para cada cuenta, un gestor de contraseñas y activá la verificación en dos pasos. | Cambio a calma, confianza y mirada a cámara. Tres bloques claros, con una pausa de ~0,3 s entre ellos para que entren los conceptos visuales (19,0 / 21,4 / 23,6 s). Énfasis en "diferente", "gestor" y "dos pasos". |
| 6 | PATO | 27,0–28,5 | 1,5 s | ¿Y dónde guardo todo eso? | Curiosidad real, tono ascendente. |
| 7 | BOBI | 28,6–29,9 | 1,3 s | ¡En un gestor, Pato! | Respuesta rápida, alegre, con cierre firme. Es la ventana más ajustada: la grabación debe terminar antes de 29,9 s. |

## Notas de sincronía

- El hueco entre cue 6 y cue 7 es de solo 0,1 s: grabar ambas tomas con arranque inmediato y sin respiración audible al inicio.
- Dejar 0,1 s de silencio al inicio y al final de cada toma para poder recortar sin cortes bruscos.
- Si alguna toma supera su ventana por más de 0,3 s, recortar pausas internas y, como último recurso, acelerar como máximo un 5 %.

## Si se usa TTS

- Generar cada cue por separado y comprobar duración contra la ventana.
- Elegir una voz con licencia comercial clara y sin parecido con voces de personajes existentes.
- Pedir aprobación del usuario antes de usar cualquier API de pago (por ejemplo, ElevenLabs u otro). No guardar claves en el repositorio: usar variables de entorno.
- Revisar manualmente pronunciación de "123456", "gestor" y "verificación".

## Mezcla de referencia

| Capa | Nivel orientativo |
|---|---|
| Voces | objetivo de -16 LUFS integrado en el master final |
| Música | -18 dB bajo el diálogo (ducking), según `timeline.json` |
| Ambiente | discreto, por debajo de la música |
| SFX | `comic_hit` moderado; chimes y blips suaves |

Comprobar en auriculares y en altavoz de teléfono. Evitar clipping.
