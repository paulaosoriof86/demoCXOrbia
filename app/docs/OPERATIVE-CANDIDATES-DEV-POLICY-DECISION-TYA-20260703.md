# Operative candidates DEV policy decision TyA

Fecha: 2026-07-03

## Archivo creado

- `tools/migration/tya-operative-candidates-dev-policy-decision.mjs`

## Proposito

Generar una decision local y sanitizada para CANDIDATE_REVIEW.

El objetivo es confirmar si los candidatos operativos pueden quedar como candidatos no finales para analisis DEV, sin crear registros finales ni estados financieros definitivos.

## Entrada local esperada

- `tmp/tya-liq-candidate-review/liqCandidateReviewManifest.json`

## Salidas locales

En `tmp/tya-operative-candidates-dev-policy-decision`:

- `operativeCandidatesDevPolicyDecision.json`
- `operativeCandidatesDevPolicyDecision.md`

## Decision esperada

- `candidate_only_allowed_for_dev_staging_no_final_records`

Eso significa:

- los registros quedan como candidatos para analisis DEV;
- no se crean pagos finales;
- no se crean deudas finales;
- no se cierra estado financiero;
- no se aprueba escritura;
- no se aprueba produccion.

## Estado

- Revision local.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
- Sin importacion.
- Sin valores crudos.
