# Auditoria integral candidata V83 Claude - CXOrbia TyA

Fecha: 2026-07-04
Candidata auditada: `Prototype development request CXOrbia V83.zip`
Baseline comparado: `Prototype development request CXOrbia V82.zip`

## Decision

V83 no queda aceptada como source lock final. Es una candidata parcial y util, enfocada casi exclusivamente en Academia y estilos. Puede usarse como base inmediata para que Claude genere una V84 corregida, siempre que no pierda sus mejoras de Academia/CSS, pero quedan pendientes P0 importantes.

## Resultado tecnico

- Archivos app V82: 96.
- Archivos app V83: 96.
- Archivos agregados: 0.
- Archivos eliminados: 0.
- Archivos modificados: 2.
- JS revisados con `node --check`: 61.
- Fallas JS: 0.
- Scripts cargados por `index.html`: 61.
- Scripts locales faltantes: 0.
- Scripts duplicados: 0.

## Archivos modificados

- `modules/academia.js`
- `styles/layout.css`

## Que si atendio V83

- `modules/academia.js`: agrego curso admin de Finanzas: liquidaciones, movimientos y beneficios.
- `modules/academia.js`: agrego explicacion de datos sensibles y `sourcePaymentRef`.
- `modules/academia.js`: agrego conceptos configurables Boleto/Combo y reembolsos por proyecto.
- `modules/academia.js`: agrego glosario con `sourceSafe`, `sourceVisitRef`, `sourcePaymentRef`, `manual_review_required`, `held_for_conflict`, `batchId/paymentItemId/movementId`.
- `modules/academia.js`: agrego checklist operativo de publicacion/cierre de ronda.
- `styles/layout.css`: agrego estilos de marca para Academia/manuales: h2 numerado, cards, flow, checklist y hero.

## Que no atendio o quedo mal

- `modules/cuestionario-shopper.js`: sigue el texto `marca la visita como cuestionario enviado`.
- `modules/revision-admin.js`: sigue mostrando `Cuestionario: enviado/pendiente`; no usa realizado/completado.
- `modules/revision-admin.js`: no agrega alias `status=estado` en el registro.
- `modules/revision-admin.js`: `R.set(...)` no recibe `projectId:p.id` ni `hrRowId` estable.
- `modules/misvisitas.js`: comentario sigue prometiendo sincronizacion de estado y liquidacion.
- `modules/misvisitas.js`: aiBox sigue diciendo que sincroniza hoja de ruta y mueve liquidacion.
- `modules/postulaciones.js`: toast sigue diciendo `HR sincronizada` al autorizar fecha.
- `modules/postulaciones.js`: toast sigue diciendo `HR sincronizada` al editar asignacion.
- `modules/academia.js`: nuevo texto dice que cada visita realizada genera liquidacion candidata; debe exigir cuestionario/revision/submitido segun proyecto.
- `modules/academia.js`: nuevo paso dice que cuestionario realizado genera liquidacion candidata; debe ser pendiente revision/submitido.
- `modules/academia.js`: sigue diciendo sincronía automatica y HR externa.
- `modules/academia.js`: sigue usando `cuestionario enviado`.
- `modules/academia.js`: sigue prometiendo WhatsApp/push y escritura HR externa si activa.
- `modules/academia.js`: sigue diciendo que editar sincroniza con HR externa.

## Conteos de senales relevantes

| Senal | V82 | V83 | Lectura |
|---|---:|---:|---|
| `cuestionario enviado` | 15 | 15 | No mejoro; siguen textos pendientes. |
| HR/sincronizacion real | 35 | 35 | No mejoro; siguen textos no honestos. |
| Terminos backend/Phase A | 94 | 109 | Mejoro parcialmente en Academia. |
| Visit lifecycle/reservas | 151 | 153 | Mejora superficial; falta bloque nuevo completo. |
| Assignment sync/conflicts | 52 | 55 | No cubre el bloque nuevo completo. |
| Datos sensibles/source-safe | 117 | 124 | Mejora parcial en glosario, falta UI/roles. |

## Evaluacion Academia

V83 si es un avance visible de Academia porque agrega curso, glosario, checklist y estilos de plataforma. Pero no cumple todavia todo el addendum de Academia profunda porque:

1. El checklist es mayormente estatico, no interactivo/persistente.
2. El contenido nuevo queda concentrado en Admin; falta segmentacion profunda por Shopper, Ops, Cliente, Superadmin/aliado.
3. No incorpora los dos bloques backend nuevos posteriores: assignment sync/conflicts y visit lifecycle/reservas.
4. Todavia conserva textos antiguos de sincronizacion real, WhatsApp/push y HR externa.
5. Todavia conserva textos `cuestionario enviado`.
6. Incluye un error semantico nuevo: sugiere que visita realizada o cuestionario realizado genera liquidacion candidata, cuando Phase A exige revision/submitido segun proyecto antes de liquidacion.

## Decision para Claude

Pedir a Claude una V84 correctiva sobre V83, no un rediseño libre. Debe conservar las mejoras de Academia/CSS de V83, corregir los P0 acumulados, limpiar Academia y agregar lo nuevo de backend: datos sensibles, assignment sync/conflicts y visit lifecycle/reservas.

## Estado seguro de esta auditoria

- No se modifico frontend desde backend.
- No se hizo deploy.
- No se hizo merge.
- No se activo runtime.
- No se leyo ni importo fuente real.
- No se escribio Firestore, HR, Storage, Make, Gemini, correo ni pagos.
