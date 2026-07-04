# CAMBIOS-BACKEND.md

## 2026-07-04 - Controlled DEV planning TyA

- Se agrego `tools/migration/tya-controlled-dev-write-plan.mjs`.
- Se agrego `app/docs/CONTROLLED-DEV-WRITE-PLAN-TYA-20260704.md`.
- Se agrego `app/docs/DEV-STAGING-DATA-CONTRACT-TYA-20260704.md`.
- Se agrego `app/docs/DEV-STAGING-GATES-TYA-20260704.md`.
- Se actualizo `RESUMEN-PARA-CLAUDE.md`.
- Se actualizo `PENDIENTES-PROTOTIPO.md`.
- Objetivo: preparar el plan DEV controlado sin runtime y mantener separado el paquete forense V77 de Claude.

## 2026-07-03 - Resultado readiness consolidated V3 TyA

- Se agrego `app/docs/RESULTADO-READINESS-CONSOLIDATED-V3-TYA-20260703.md`.
- Resultado local reportado por Paula: readiness `review_required`, todos los checks OK, SHOPPER_REVIEW paso a nota tecnica provisional.
- Blockers vigentes: COMM_REVIEW y CANDIDATE_REVIEW.
- Estado seguro: Firestore writes 0, imports executed 0, deploy 0, production 0, executeAllowed false.

## 2026-07-03 - Legacy communications DEV policy decision TyA

- Se agrego `tools/migration/tya-legacy-communications-dev-policy-decision.mjs`.
- Se agrego `app/docs/LEGACY-COMMUNICATIONS-DEV-POLICY-DECISION-TYA-20260703.md`.
- Objetivo: decidir si las 216 comunicaciones heredadas pueden quedar como historico inactivo para analisis DEV.
- Salidas locales esperadas bajo `tmp/tya-legacy-communications-dev-policy-decision`.
- Estado seguro: sin deploy, sin produccion, sin escritura Firestore y sin importacion.

## 2026-07-03 - Readiness consolidated V4 TyA

- Se agrego `tools/migration/tya-build-readiness-consolidated-v4.mjs`.
- Se agrego `app/docs/READINESS-CONSOLIDATED-V4-TYA-20260703.md`.
- Objetivo: incorporar la decision COMM_DEV_POLICY para que COMM_REVIEW pase a nota tecnica si aplica.
- Salidas locales esperadas bajo `tmp/tya-readiness-consolidated-v4`.
- Estado seguro: sin deploy, sin produccion, sin escritura Firestore, sin importacion, sin Auth real y sin cambios frontend.

## 2026-07-03 - Resultado shopper reference field audit TyA

- Se agrego `app/docs/RESULTADO-SHOPPER-REFERENCE-FIELD-AUDIT-TYA-20260703.md`.
- Resultado local reportado por Paula: visits con solo banderas de presencia de identidad, postulations con solo llaves genericas de evento/origen y shoppers con 276 filas canonicas.
- Decision tecnica: las 661 referencias no deben tratarse como 661 identidades shopper no reconocidas.
- Lectura tecnica: el bloqueo anterior de SHOPPER_REVIEW es probablemente un falso bloqueo estricto por usar llaves genericas de evento/origen como identidad shopper.
- Estado seguro: sin valores crudos, sin deploy, sin produccion, sin escritura Firestore y sin importacion.

## 2026-07-03 - Shopper review DEV policy decision TyA

- Se agrego `tools/migration/tya-shopper-review-dev-policy-decision.mjs`.
- Se agrego `app/docs/SHOPPER-REVIEW-DEV-POLICY-DECISION-TYA-20260703.md`.
- Objetivo: separar identidad shopper provisional DEV de referencias de visitas/postulaciones no enlazadas por el candidato sanitizado.
- Salidas locales esperadas bajo `tmp/tya-shopper-review-dev-policy-decision`.
- Estado seguro: decision local, sin deploy, sin produccion, sin escritura Firestore y sin importacion.

## 2026-07-03 - Readiness consolidated V3 TyA

- Se agrego `tools/migration/tya-build-readiness-consolidated-v3.mjs`.
- Se agrego `app/docs/READINESS-CONSOLIDATED-V3-TYA-20260703.md`.
- Objetivo: incorporar la decision SHOPPER_REVIEW_DEV_POLICY_DECISION para que SHOPPER_REVIEW pase a nota tecnica provisional si aplica, sin aprobar escritura ni produccion.
- Salidas locales esperadas bajo `tmp/tya-readiness-consolidated-v3`.
- Estado seguro: sin deploy, sin produccion, sin escritura Firestore, sin importacion, sin Auth real y sin cambios frontend.

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
