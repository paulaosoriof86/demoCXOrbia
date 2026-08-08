# Shopper reference review summary TyA

Fecha: 2026-07-03

## Archivo creado

- `tools/migration/tya-shopper-reference-review-summary.mjs`

## Proposito

Generar un resumen local y sanitizado para entender las `shopperReferenceReview` rows, especialmente las 661 filas reportadas en el ultimo conteo local, sin pegar datos crudos.

## Entradas locales esperadas

En `tmp/tya-shopper-identity-review`:

- `shopperReferenceReview.jsonl`
- `shopperIdentityCandidates.jsonl`
- `canonicalShopperMap.jsonl`
- `shopperDuplicateReview.jsonl`
- `shopperIdentityReviewManifest.json`

## Salidas locales

En `tmp/tya-shopper-reference-review-summary`:

- `shopperReferenceReviewSummary.json`
- `shopperReferenceReviewSummary.md`

## Comando local

```powershell
node .\tools\migration\tya-shopper-reference-review-summary.mjs
```

## Que valida

- Conteo total de referencias en revision.
- Distribucion por `sourceType`.
- Distribucion por `identityKind`.
- Distribucion por `confidence`.
- Cuantas referencias tienen `canonicalShopperId`.
- Cuantas referencias matchean contra el universo canonico conocido.
- Cuantas referencias quedan sin identidad o con canonical no reconocido.

## Decision tecnica esperada

El script devuelve una decision tecnica:

- `provisional_identity_allowed_for_dev_staging`: se puede bajar el bloqueo de SHOPPER_REVIEW solo para DEV staging, siempre provisional, sin merge final de identidades y sin produccion.
- `review_required`: SHOPPER_REVIEW sigue bloqueado.
- `missing_local_input`: falta correr primero la revision de identidad shopper.
- `clear`: no hay referencias ni grupos pendientes.

## Politica de seguridad

Aunque el resultado permita politica provisional DEV staging:

- No autoriza produccion.
- No autoriza escritura Firestore.
- No autoriza importacion real.
- No activa Auth real.
- No fusiona personas definitivamente.
- No usa DPI, bancos ni NDA.
- Mantiene revision manual antes de produccion.

## Estado

- Revision local.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
- Sin importacion.
