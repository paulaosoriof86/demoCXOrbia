# Resumen para Claude addendum - Auditoria V83

Fecha: 2026-07-04

## Decision

V83 no se acepta como source lock final. Es una candidata parcial y util porque mejora Academia/CSS, pero no corrige los P0 de flujo operativo. Claude debe generar V84 correctiva sobre V83, conservando lo bueno y corrigiendo lo pendiente.

## Que resolvio V83

- Agrego curso Admin de Finanzas/liquidaciones/movimientos/beneficios.
- Agrego conceptos Boleto/Combo como configurables por proyecto.
- Agrego glosario con `sourceSafe`, `sourceVisitRef`, `sourcePaymentRef`, `manual_review_required`, `held_for_conflict`, `batchId/paymentItemId/movementId`.
- Agrego checklist visual.
- Agrego estilos de Academia/manuales en `styles/layout.css`.

## Que sigue pendiente P0

1. `modules/cuestionario-shopper.js`: cambiar `marca la visita como cuestionario enviado` por `marca el cuestionario como realizado/completado`.
2. `modules/revision-admin.js`: cambiar `Cuestionario: enviado/pendiente` por realizado/completado/pendiente; agregar `status=estado`; pasar `projectId:p.id`; guardar `hrRowId:v.hrRowId||v.rowId||v.extId||''`.
3. `modules/misvisitas.js`: quitar promesas de sincronizacion HR/liquidacion; usar preparado, preview, pendiente backend.
4. `modules/postulaciones.js`: quitar toasts `HR sincronizada`; usar pendiente HR sync o pendiente backend.
5. `modules/academia.js`: corregir que visita realizada o cuestionario realizado no genera liquidacion candidata automaticamente; debe pasar por revision/submitido segun proyecto.
6. `modules/academia.js`: corregir textos de sincronizacion automatica, WhatsApp/push real, HR write real y `cuestionario enviado`.
7. Academia debe incorporar bloques backend recientes: datos sensibles, assignment sync/conflicts y visit lifecycle/reservas.

## Instruccion para Claude

Generar V84 correctiva sobre V83. No rediseñar libre. No tocar backend protegido, contracts, tools, Firestore/Auth/Storage/Make/Gemini reales ni datos reales. Mantener estados honestos: preparado, preview, pendiente backend, requiere autorizacion, revision manual y conflicto.

## Validacion esperada V84

- 0 textos `HR sincronizada` en toasts de flujo si gate esta apagado.
- 0 textos `cuestionario enviado` en flujo visible actual.
- `revision-admin.js` con `status`, `projectId` y `hrRowId`.
- Academia conserva mejoras V83, corrige semantica y cubre los bloques nuevos.
- Sintaxis JS OK.
- `index.html` sin scripts faltantes o duplicados.
