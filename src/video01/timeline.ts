// Copia fiel de tiktok-tech-comedy/scripts/timeline.json (fuente de verdad de tiempos).
export const FPS = 30;
export const DURATION_S = 29.9;
export const TOTAL_FRAMES = 897;

export type Cue = {id: number; speaker: 'PATO' | 'BOBI'; start: number; end: number; text: string; highlight: string[]};

export const SCENES = [
  {id: 1, from: 0, to: 4, name: 'El gancho'},
  {id: 2, from: 4, to: 12, name: 'La explicación'},
  {id: 3, from: 12, to: 18, name: 'El remate cómico'},
  {id: 4, from: 18, to: 27, name: 'La solución'},
  {id: 5, from: 27, to: 29.9, name: 'Cierre'},
];

export const CUES: Cue[] = [
  {id: 1, speaker: 'PATO', start: 0.2, end: 3.6, text: 'Bobi, si uso la misma contraseña para todo… ¿me hackean todo de una?', highlight: ['misma contraseña']},
  {id: 2, speaker: 'BOBI', start: 4.2, end: 10.6, text: '¡Sí, Pato! Si te roban una contraseña, pueden probarla en tu correo, tus redes y otras cuentas.', highlight: ['te roban una']},
  {id: 3, speaker: 'PATO', start: 12.05, end: 15.0, text: 'Entonces… ¿mi contraseña “123456” no es segura?', highlight: ['no es segura']},
  {id: 4, speaker: 'BOBI', start: 15.2, end: 17.8, text: '¡ESO NO ES UNA CONTRASEÑA, ES UNA INVITACIÓN!', highlight: ['INVITACIÓN']},
  {id: 5, speaker: 'BOBI', start: 18.2, end: 25.8, text: 'Usá una contraseña diferente para cada cuenta, un gestor de contraseñas y activá la verificación en dos pasos.', highlight: ['contraseña diferente', 'gestor', 'verificación en dos pasos']},
  {id: 6, speaker: 'PATO', start: 27.0, end: 28.5, text: '¿Y dónde guardo todo eso?', highlight: []},
  {id: 7, speaker: 'BOBI', start: 28.6, end: 29.9, text: '¡En un gestor, Pato!', highlight: ['gestor']},
];

export const CONCEPTS = [
  {at: 19.0, text: 'CONTRASEÑAS ÚNICAS'},
  {at: 21.4, text: 'GESTOR DE CONTRASEÑAS'},
  {at: 23.6, text: 'VERIFICACIÓN EN DOS PASOS'},
];

export const END_CARD = {at: 29.2, text: 'Seguinos para más tecnología'};
export const HIT_AT = 17.9; // sfx comic_hit
export const KEY_TRIES = [6.0, 7.6, 9.2]; // sfx digital_blip

export const cueById = (id: number) => CUES.find((c) => c.id === id)!;
