# Resultado shopper reference field audit TyA

Fecha: 2026-07-03

## Resultado local reportado

Paula ejecuto `tools/migration/tya-shopper-reference-field-audit.mjs` y pego el reporte sanitizado.

## Seguridad reportada

- Firestore writes: 0
- Imports executed: 0
- Deploy: 0
- Production: 0
- executeAllowed: false
- No values printed; field names and counts only

## Conteos reportados

- Visits: 617
- Postulations: 44
- Shoppers: 276
- Reference review rows: 661
- Canonical rows: 276
- Candidate rows: 276

## Clasificacion de senales

- Visits: `only_identity_presence_flags_available`
- Postulations: `only_generic_event_or_source_keys_available`
- Shoppers: `only_identity_presence_flags_available`
- Likely cause: `shopper_reference_review_probably_uses_generic_event_keys_instead_of_shopper_identity`

## Hallazgos clave

### Visits

- No hay campo directo de shopper ID, shopper email, shopper phone o shopper name.
- Existen banderas de presencia: `hasEmail`, `hasPhone`, `hasShopperName`.
- Todas las visitas tienen `docId` y `sourceRef.sourceKey`, que son identificadores de fila/evento, no identidad canonica de shopper.

### Postulations

- No hay campo directo de shopper ID, shopper email, shopper phone o shopper name.
- Todas tienen `docId` y `sourceRef.sourceKey`.
- El reporte confirma que las postulaciones solo tienen llaves genericas de evento/origen en el candidato sanitizado.

### Shoppers

- Hay 276 filas shopper.
- Todas tienen `sourceId`, `docId`, `sourceNode` y `sourceRef.sourceKey`.
- Las filas shopper tambien conservan banderas de presencia, pero no valores directos en el reporte sanitizado.

## Decision tecnica

La lectura tecnica cambia:

- Las 661 referencias no deben tratarse como 661 identidades shopper no reconocidas.
- Las 661 referencias son eventos/visitas/postulaciones que no cargan identidad directa del shopper en el candidato sanitizado.
- El bloqueo anterior de SHOPPER_REVIEW es probablemente un falso bloqueo estricto generado por usar llaves genericas de evento/origen como si fueran identidad shopper.

## Politica DEV propuesta

Se puede preparar una decision tecnica separada para DEV staging:

- permitir identidad shopper provisional solo sobre las 276 filas shopper canonicas;
- mantener visitas/postulaciones sin enlace shopper definitivo si no existe mapa seguro;
- no fusionar personas;
- no activar Auth real;
- no escribir base de datos;
- no aprobar produccion.

## Siguiente bloque

Crear decision local sanitizada `SHOPPER_REVIEW_DEV_POLICY_DECISION` y readiness V3, para retirar el falso bloqueo de SHOPPER_REVIEW solo del analisis DEV, sin aprobar escritura ni produccion.

## Estado

- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
- Sin importacion.
- Sin Auth real.
- Sin datos crudos en repo.
