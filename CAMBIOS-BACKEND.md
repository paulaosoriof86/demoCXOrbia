# CAMBIOS-BACKEND.md

## 2026-07-03 - Safe local readiness sequence TyA

- Se agrego `tools/migration/tya-run-safe-local-readiness-sequence.mjs`.
- Se agrego `app/docs/SAFE-LOCAL-READINESS-SEQUENCE-TYA-20260703.md`.
- Objetivo: ejecutar en local la secuencia de reportes seguros sin correr cada script manualmente.
- Salidas locales esperadas bajo `tmp/tya-safe-local-readiness-sequence`.
- Estado seguro: sin escritura, sin importacion, sin deploy y sin produccion.

## 2026-07-03 - Readiness TyA

- Se agrego `tools/migration/tya-build-readiness-consolidated.mjs`.
- Se agrego `app/docs/READINESS-TYA-20260703.md`.
- Objetivo: generar reporte unico de avance y faltantes antes de una revision DEV controlada.
- Salidas locales esperadas bajo `tmp/tya-readiness-consolidated`.
- Estado seguro: sin escritura, sin importacion, sin deploy y sin produccion.

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
