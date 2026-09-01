# Phase A readiness gates while Claude fixes V79

Fecha: 2026-07-04

## Proposito

Continuar backend mientras Claude corrige V79, sin empalmar backend operativo sobre una candidata con P0 abiertos.

## Estado de candidata frontend

- V79 es avance util.
- V79 no queda aprobada como candidata final Phase A hasta corregir P0.
- Backend puede seguir con contratos, readiness, gates y rutas.
- Backend no debe tocar modulos.

## Gates Phase A

| Gate | Estado | Accion |
|---|---|---|
| Baseline viva/source lock | pendiente de V79 corregida | Esperar retorno Claude o documentar nuevo source lock |
| Auditoria forense V79 | hecho | Ver `AUDITORIA-FORENSE-V79-PHASE-A-20260704.md` |
| P0 Claude V79 | bloqueante | Corregir enum cuestionario, revision funcional, submitido configurable y wizard Phase A |
| Firestore schema Phase A | listo documental | Ver contratos de schema y route map |
| Adapter route map | listo documental | Mantener sin runtime |
| Shopper reference review | review_required | 661 referencias con blockers; no baja politica a import real |
| COMM_REVIEW | siguiente | Continuar revision de comunicaciones historicas |
| HR completa | usar documentacion previa | No pedir de nuevo salvo falta concreta |
| Shoppers historicos | conservar completos | Usar HR historica y paquetes ya trabajados |
| Certificaciones historicas | conservar | No pedir recertificacion a aprobados |
| Liquidaciones junio | pendiente operativo | Separar pagos pendientes de visitas ejecutadas |
| Make | gate futuro | Pedir acceso solo al llegar a integracion real |
| Gemini | gate futuro | Preparar banco con revision humana |
| Deploy/produccion | bloqueado | No ejecutar hasta autorizacion expresa |

## Impacto del shopper reference review

El reporte recibido indica:

- 661 reference review rows.
- 276 candidate rows.
- 661 con `canonicalShopperId`.
- 661 unmatched canonical.
- 661 strict blockers.
- Decision: `review_required`.

Interpretacion:

- No son shoppers adicionales por si mismos.
- No aprueban import de produccion.
- No aprueban merge final de identidad.
- Para DEV staging solo podria considerarse politica provisional si mapean a canonical conocidos y blockers bajan a cero.

## Trabajo backend permitido mientras Claude corrige

- Refinar contratos.
- Preparar readiness documental.
- Preparar COMM_REVIEW.
- Preparar reglas Firestore sin deploy.
- Preparar Make/Gemini gates sin credenciales.
- Preparar adapter route map sin runtime.

## Trabajo backend no permitido ahora

- Empalmar sobre V79 sin correccion P0.
- Conectar `CX.data` real.
- Ejecutar Firestore writes.
- Ejecutar import real.
- Activar Make/Gemini.
- Desplegar produccion.
- Tocar modulos frontend.

## Estado

- Readiness documental creado.
- Sin cambios frontend.
- Sin runtime conectado.
- Sin deploy ejecutado.
- Sin escritura Firestore en este bloque.
