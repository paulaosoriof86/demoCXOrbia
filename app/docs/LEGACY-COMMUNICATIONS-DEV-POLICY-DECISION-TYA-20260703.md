# Legacy communications DEV policy decision TyA

Fecha: 2026-07-03

## Archivo creado

- `tools/migration/tya-legacy-communications-dev-policy-decision.mjs`

## Proposito

Generar una decision local y sanitizada para COMM_REVIEW.

El objetivo es confirmar si las 216 comunicaciones heredadas pueden quedar como historico inactivo para analisis DEV, sin convertirlas en flujos activos y sin usar destinatarios como identidad final.

## Entrada local esperada

- `tmp/tya-legacy-communications-review/legacyCommunicationReviewManifest.json`

## Salidas locales

En `tmp/tya-legacy-communications-dev-policy-decision`:

- `legacyCommunicationsDevPolicyDecision.json`
- `legacyCommunicationsDevPolicyDecision.md`

## Decision esperada

- `history_only_allowed_for_dev_staging_no_active_flows`

Eso significa:

- las comunicaciones heredadas se tratan como historico inactivo;
- no se activan flujos desde migracion;
- no se usan destinatarios como identidad final;
- no se aprueba escritura;
- no se aprueba produccion.

## Estado

- Revision local.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
- Sin importacion.
- Sin valores crudos.
