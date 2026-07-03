# CAMBIOS-BACKEND.md

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
- Aplica politicas: no importar `questionnaire_marks` como fuente independiente, sanitizar shoppers, dejar notificaciones como historial y liquidaciones como candidatas.
- Salidas locales esperadas bajo `tmp/tya-sanitized-dev-candidate`.
- Estado seguro: sin escritura, sin importacion, sin deploy y sin produccion.

## 2026-07-03 - DEV import dry-run package TyA

- Se agrego `tools/migration/tya-build-dev-import-dry-run-package.mjs`.
- Se agrego `app/docs/DEV-IMPORT-DRY-RUN-PACKAGE-TYA-20260703.md`.
- Objetivo: consolidar readiness, conteos, gates, bloqueantes y autorizacion requerida antes de cualquier escritura DEV.
- Entradas esperadas: plan canonico, write plan manifest e import gate.
- Salidas locales: `tmp/tya-dev-import-dry-run-package/tyaDevImportDryRunPackage.json` y `.md`.
- Estado seguro: sin escritura, sin importacion, sin deploy y sin produccion.

## 2026-07-03 - Plan staging canonico TyA

- Se agrego `tools/migration/tya-build-canonical-staging-plan.mjs`.
- Se agrego `app/docs/PLAN-STAGING-CANONICO-TYA-20260703.md`.
- Objetivo: convertir el resultado exitoso HR multi-tab en clasificacion canonica de tabs, periodos, paises, filas, columnas y estados.
- Salidas locales esperadas: `tmp/tya-canonical-staging/tyaCanonicalStagingPlan.json` y `.md`.
- El script no escribe Firestore, no importa datos, no hace deploy y mantiene `canImport=false`.

## 2026-07-03 - Resultado HR Source private full flow TyA

- Se agrego `app/docs/RESULTADO-HR-SOURCE-PRIVATE-FULL-FLOW-20260703.md`.
- Resultado: la HR viva fue leida en modo XLSX multi-tab (`live_xlsx_tab`), no como fallback CSV de un solo `gid`.
- El reporte visible detecto tabs desde `SEPTIEMBRE 25` hasta `JULIO 26`, incluyendo HN y tabs `DASHBOARD`/`DASHBOARD HN`.
- `Errors`: none.
- Issues vigentes: `questionnaire_marks` duplicado, DPI en shoppers, liquidaciones pendientes de cruce financiero y destinatarios de notificaciones no canonicales.
- Dictamen: lectura HR/historico desbloqueada en preview multi-tab; siguiente paso es staging canonico, no importacion.
- Seguridad: Firestore writes 0, imports executed 0, deploy 0, produccion 0, `canImport=false`.

## 2026-07-03 - HR Source private full flow TyA

- Se agrego `tools/hr-source/tya-hr-source-private-full-flow.mjs`.
- Se agrego `tools/hr-source/run-tya-hr-source-private-full-flow.ps1`.
- Se agrego `app/docs/HR-SOURCE-PRIVATE-FULL-FLOW-20260703.md`.
- Objetivo: validar lectura HR privada multi-tab/historico con `sourceRef` opaco, sin pegar URL en ChatGPT y sin subir crudos al repo.
- El flujo registra URL solo localmente, ejecuta `test`, `preview` y `sync-request`, reporta tabs/periodos, filas por pais/periodo e issues.
- Seguridad: Firestore writes 0, imports executed 0, deploy 0, produccion 0, `canImport=false`.

## 2026-07-03 - Estado de uso de fuentes reales TyA

- Se agrego `app/docs/ESTADO-USO-FUENTES-BASE-REAL-TYA-20260703.md`.
- El documento aclara que HR/RTDB y logicas utiles ya fueron analizadas, mapeadas y convertidas en plan/preview/contrato seguro.
- La base real todavia NO fue importada a Firestore ni convertida en datos operativos finales.
- Siguen pendientes de calidad, privacidad, deduplicacion, destinatarios, cruce financiero, reglas, runner, rollback y autorizacion.
- Estado operativo: Firestore writes 0, imports executed 0, deploy 0, produccion 0.

## 2026-07-03 - Auditoria y preparacion empalme RC V75 Cloud frontend

- Se agrego `app/docs/AUDITORIA-RC-V75-CLOUD-FRONTEND-20260703.md`.
- Se agrego `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-RC-V75-20260703.md`.
- Se agrego `app/docs/EMPALME-RC-V75-BACKEND-20260703.md`.
- Se agrego `app/docs/RESUMEN-PARA-CLAUDE-ACUMULADO-RC-V75-20260703.md`.
- La auditoria confirma que V75 cambia 3 archivos frente a V74: `app/modules/automatizaciones.js`, `app/modules/finanzas.js` y `app/modules/hr-source.js`.
- Avances V75: estados honestos para Make/IA, Finanzas sin `En vivo` en movimientos/liquidaciones y flujo visible de `sourceRef` opaco en HR Source.
- Pendientes vigentes: versionado V72 residual, SaaS profundo, propuestas comerciales tipo wizard, CRM Reuniones y limpieza de rutas duplicadas.
- Estado operativo: sin importacion, sin despliegue y sin cambios productivos.
