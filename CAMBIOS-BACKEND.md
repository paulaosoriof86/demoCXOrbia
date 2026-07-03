# CAMBIOS-BACKEND.md

## 2026-07-03 - Resultado shopper reference review summary TyA

- Se agrego `app/docs/RESULTADO-SHOPPER-REFERENCE-REVIEW-SUMMARY-TYA-20260703.md`.
- Resultado local reportado por Paula: 661 reference review rows, 661 con `canonicalShopperId`, 0 coincidencias contra canonico conocido, 661 canonical no reconocidos y 661 bloqueos tecnicos.
- Decision actual: `review_required`.
- Lectura tecnica: no son 661 shoppers adicionales; el resultado apunta a referencias de visitas/postulaciones que necesitan auditoria de relacion con shopper canonico.
- Estado seguro: Firestore writes 0, imports executed 0, deploy 0, production 0, executeAllowed false.

## 2026-07-03 - Shopper reference field audit TyA

- Se agrego `tools/migration/tya-shopper-reference-field-audit.mjs`.
- Se agrego `app/docs/SHOPPER-REFERENCE-FIELD-AUDIT-TYA-20260703.md`.
- Objetivo: diagnosticar disponibilidad de campos para relacion shopper-evento sin imprimir valores.
- Salidas locales esperadas bajo `tmp/tya-shopper-reference-field-audit`.
- Estado seguro: solo nombres de campos y conteos, sin deploy, sin produccion, sin escritura Firestore y sin importacion.

## 2026-07-03 - Shopper reference review summary TyA

- Se agrego `tools/migration/tya-shopper-reference-review-summary.mjs`.
- Se agrego `app/docs/SHOPPER-REFERENCE-REVIEW-SUMMARY-TYA-20260703.md`.
- Objetivo: entender las filas de `shopperReferenceReview` sin pegar datos crudos y decidir si SHOPPER_REVIEW puede bajar a politica provisional solo para DEV staging.
- Salidas locales esperadas bajo `tmp/tya-shopper-reference-review-summary`.
- Estado seguro: Firestore writes 0, imports executed 0, deploy 0, production 0, executeAllowed false.
- Pendiente: Paula debe ejecutar el comando local y pegar solo `tmp/tya-shopper-reference-review-summary/shopperReferenceReviewSummary.md`.

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
