# CAMBIOS-BACKEND.md

## 2026-07-03 - Shopper review counts TyA

- Se agrego `tools/migration/tya-shopper-review-counts.mjs`.
- Se agrego `app/docs/SHOPPER-REVIEW-COUNTS-TYA-20260703.md`.
- Objetivo: generar conteos locales del bloque SHOPPER_REVIEW sin pegar datos crudos.
- Salidas locales esperadas bajo `tmp/tya-shopper-review-counts`.
- Estado seguro: revision local, sin deploy y sin produccion.

## 2026-07-03 - Resultado readiness V2 TyA

- Se agrego `app/docs/RESULTADO-READINESS-V2-TYA-20260703.md`.
- Resultado local: `review_required`.
- Checks OK: HR multi-tab, plan canonico, candidato sanitizado, identidad shopper, comunicaciones heredadas, candidatos operativos y dry-run package.
- Conteos: 58 HR tabs, 617 visitas sanitizadas, 276 shoppers sanitizados, 276 shopper candidates, 216 legacy communications y 558 operative candidates.
- Pendiente antes de cualquier gate DEV: revisar shoppers, comunicaciones heredadas y candidatos operativos.
- Estado seguro: Firestore writes 0, imports executed 0, deploy 0, production 0, executeAllowed false.

## 2026-07-03 - Comando unico readiness local TyA

- Se agrego `app/docs/COMANDO-UNICO-READINESS-LOCAL-TYA-20260703.md`.
- Objetivo: reducir operacion manual a un solo comando local para generar reportes de readiness.
- Indica que debe pegarse solo `tmp/tya-readiness-consolidated/readinessConsolidated.md`.
- Estado seguro: sin escritura, sin importacion, sin deploy y sin produccion.
