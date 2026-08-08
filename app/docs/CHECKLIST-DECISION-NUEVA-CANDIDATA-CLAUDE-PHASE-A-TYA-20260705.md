# Checklist decision nueva candidata Claude Phase A - CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Definir el proceso exacto para decidir que hacer cuando Claude entregue una nueva candidata correctiva: recibir ZIP, auditar delta real, validar P0, validar scripts, clasificar resultado y decidir si empalma o vuelve a Claude.

## Estado de partida

- V87 no tuvo delta real contra V86.
- V87 no es source lock.
- V87 no es produccion lista.
- P0 frontend sigue bloqueando salida controlada.
- Backend preview esta avanzado, pero no autoriza produccion.

## 1. Intake de candidata

Registrar:

- nombre del ZIP;
- fecha/hora de recepcion;
- hash local si se calcula;
- baseline contra la que se compara;
- objetivo declarado por Claude;
- lista declarada de archivos modificados.

Si Claude no entrega lista de archivos modificados, la auditoria debe extraerla.

## 2. Comparacion estructural

Comparar candidata contra baseline inmediata:

- total archivos `/app`;
- archivos agregados;
- archivos eliminados;
- archivos modificados;
- archivos renombrados si aplica;
- cambios fuera de `/app` si existen.

Decision inmediata:

- Si no hay delta real: clasificar `no_real_delta`.
- Si hay cambios masivos no justificados: clasificar `manual_review_required` o `critical_blocker`.

## 3. Validacion index.html

Revisar:

- scripts locales cargados;
- existencia de cada script local;
- duplicados;
- orden de scripts si el cambio lo afecta;
- rutas huerfanas;
- externos esperados.

Decision inmediata:

- Script local faltante: `critical_blocker`.
- Script duplicado que pueda alterar runtime: `critical_blocker`.
- Ruta huerfana no critica: `manual_review_required`.

## 4. Validacion JS

Ejecutar `node --check` en JS modificados.

Si hay duda, ejecutar en todos los JS.

Decision inmediata:

- Cualquier falla JS: `critical_blocker`.

## 5. Validacion P0

Buscar apariciones operativas de:

- `WhatsApp enviado`;
- `Correo enviado`;
- `HR sincronizada`;
- `Sincronía automática`;
- `sincroniza la HR externa`;
- `mueve la liquidación`;
- `Cuestionario enviado`.

Clasificar cada aparicion residual:

- corregida;
- documental/no operativa;
- P0 vivo;
- requiere revision manual.

Decision inmediata:

- P0 vivo: `critical_blocker`.
- Residual ambiguo: `manual_review_required`.
- 0 apariciones operativas: continuar.

## 6. Proteccion backend

Confirmar que Claude no modifico:

- `app/contracts/**`;
- `tools/migration/**`;
- `tools/hr-source/**`;
- gates;
- providers;
- Firebase config;
- documentos backend salvo autorizacion expresa.

Decision inmediata:

- Cambio backend no autorizado: `critical_blocker` o `manual_review_required` segun impacto.

## 7. Gates e integraciones

Confirmar que la candidata no declara ni activa:

- produccion;
- deploy;
- merge;
- import real;
- Firestore writes;
- Storage writes;
- HR writes;
- Make real;
- Gemini real;
- correo real;
- WhatsApp real;
- pagos reales.

Decision inmediata:

- Activacion real sin autorizacion: `critical_blocker`.
- Texto que sugiera activacion real sin gate: `critical_blocker`.

## 8. Codificacion

Validar:

- UTF-8 sin BOM;
- no mojibake nuevo;
- conservar `<meta charset="UTF-8">` si aplica.

Decision inmediata:

- Mojibake visible nuevo en UI: `critical_blocker` si afecta operacion o confianza.
- Encoding dudoso no visible: `manual_review_required`.

## 9. Academia

Si Claude toca Academia:

- verificar que no haya desplazado el P0;
- validar que no prometa produccion ni integraciones reales;
- confirmar que el contenido sea coherente con preview/gates/blockers.

Decision inmediata:

- Academia ampliada sin cerrar P0: `manual_review_required` o `critical_blocker` si introduce promesas falsas.

## 10. Clasificacion final

Usar solo una decision principal:

### `critical_blocker`

Cuando hay P0 vivo, falla JS, script faltante/duplicado critico, activacion real, cambio backend no autorizado o regresion fuerte.

Accion: volver a Claude con hallazgos concretos. No empalmar.

### `no_real_delta`

Cuando la candidata no cambia lo necesario o repite el ZIP anterior.

Accion: pedir a Claude delta real quirurgico. No empalmar.

### `manual_review_required`

Cuando hay delta pero con ambiguedad, cambios no explicados o residuales que requieren criterio humano.

Accion: revisar antes de empalmar.

### `candidate_for_empalme`

Solo si:

- hay delta real;
- P0 queda corregido;
- JS OK;
- scripts OK;
- sin cambios backend no autorizados;
- sin gates reales;
- sin regresiones visibles;
- sin promesas falsas.

Accion: empalmar sobre baseline auditada y documentar.

## 11. Reporte esperado despues de auditar

El reporte debe incluir:

- decision final;
- ZIP auditado;
- baseline usada;
- archivos agregados/eliminados/modificados;
- resultado P0;
- resultado JS;
- resultado index/scripts;
- resultado backend protected paths;
- resultado gates/providers;
- pendientes para Claude;
- decision de empalme o rechazo.

## Regla final

Nunca declarar source lock, produccion lista, deploy o merge por el solo hecho de recibir una candidata. Primero auditoria, luego decision.
