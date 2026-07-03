# CAMBIOS-BACKEND.md

## 2026-07-03 - Candidatos operativos TyA

- Se agrego `tools/migration/tya-build-liq-candidate-review.mjs`.
- Se agrego `app/docs/CANDIDATOS-OPERATIVOS-TYA-20260703.md`.
- Objetivo: preparar revision local de candidatos operativos.
- Estado seguro: sin escritura, sin importacion, sin deploy y sin produccion.

## 2026-07-03 - Legacy communications review TyA

- Se agrego `tools/migration/tya-build-legacy-communications-review.mjs`.
- Se agrego `app/docs/LEGACY-COMMUNICATIONS-REVIEW-TYA-20260703.md`.
- Objetivo: revisar comunicaciones heredadas solo como historial y trazabilidad.
- El script cruza historial con identidad shopper canonica candidata usando fingerprints hash, sin PII plana.
- Salidas locales esperadas bajo `tmp/tya-legacy-communications-review`.
- Estado seguro: sin escritura, sin importacion, sin deploy, sin produccion y sin flujos activos.

## 2026-07-03 - Shopper identity review TyA

- Se agrego `tools/migration/tya-build-shopper-identity-review.mjs`.
- Se agrego `app/docs/SHOPPER-IDENTITY-REVIEW-TYA-20260703.md`.
- Objetivo: preparar politica de identidad y deduplicacion de shoppers antes de escritura DEV.
- El script genera `canonicalShopperId` candidato, mapa canonico, duplicados/revision e inconsistencias de referencia.
- Reportes sin PII plana: usa fingerprints hash para email/telefono/nombre/sourceId.
- Estado seguro: sin escritura, sin importacion, sin deploy y sin produccion.

## 2026-07-03 - Sanitized DEV candidate TyA

- Se agrego `tools/migration/tya-build-sanitized-dev-candidate.mjs`.
- Se agrego `app/docs/SANITIZED-DEV-CANDIDATE-TYA-20260703.md`.
- Objetivo: preparar candidato DEV sanitizado sin escribir datos.
- Salidas locales esperadas bajo `tmp/tya-sanitized-dev-candidate`.
- Estado seguro: sin escritura, sin importacion, sin deploy y sin produccion.
