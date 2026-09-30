# Shopper review DEV policy decision TyA

Fecha: 2026-07-03

## Archivo creado

- `tools/migration/tya-shopper-review-dev-policy-decision.mjs`

## Proposito

Generar una decision local y sanitizada a partir del `SHOPPER_REFERENCE_FIELD_AUDIT`.

El objetivo es separar dos cosas:

1. Identidad shopper canonica provisional para DEV staging sobre las 276 filas shopper.
2. Referencias de visitas/postulaciones que no traen identidad directa en el candidato sanitizado.

## Entradas locales esperadas

- `tmp/tya-shopper-reference-field-audit/shopperReferenceFieldAudit.json`
- `tmp/tya-shopper-review-counts/shopperReviewCounts.json`
- `tmp/tya-shopper-identity-review/shopperIdentityReviewManifest.json`

## Salidas locales

En `tmp/tya-shopper-review-dev-policy-decision`:

- `shopperReviewDevPolicyDecision.json`
- `shopperReviewDevPolicyDecision.md`

## Decision esperada

Si el audit confirma que las referencias solo contienen banderas o llaves genericas, la decision puede ser:

- `provisional_identity_allowed_for_dev_staging_with_unlinked_event_references`

Eso significa:

- se puede retirar el falso bloqueo SHOPPER_REVIEW solo para analisis DEV;
- los shoppers siguen siendo candidatos provisionales;
- visitas/postulaciones quedan sin enlace definitivo a shopper hasta tener mapa seguro;
- no se aprueba escritura;
- no se aprueba produccion.

## Estado

- Revision local.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
- Sin importacion.
- Sin valores crudos.
