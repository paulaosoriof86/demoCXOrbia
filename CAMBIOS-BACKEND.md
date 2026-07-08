# CAMBIOS-BACKEND.md

## 2026-07-08 - Conflict review/import readiness expanded fixture preview-only

- Se agrego `tools/contracts/cxorbia-conflict-review-import-readiness-expanded-fixture.mjs`.
- Se agrego `app/docs/CONFLICT-REVIEW-IMPORT-READINESS-EXPANDED-FIXTURE-CXORBIA-20260708.md`.
- Se agrego `app/docs/CAMBIOS-CONFLICT-REVIEW-IMPORT-READINESS-EXPANDED-FIXTURE-CXORBIA-20260708.md`.
- Se agrego `app/docs/NEXT-CANDIDATE-AUDIT-ACADEMIA-ADMIN-ACTIONS-20260708.md` para auditar la proxima candidata Claude con foco en acciones administrativas de Academia.
- Objetivo: preparar un input sintetico/sanitizado ampliado para validar conflict review/import readiness con conflictos de asignacion, identidad shopper y pago, sin fuentes reales ni datos sensibles.
- Decision tecnica: fixture/runner preview-only que exporta `expandedConflictReviewImportReadinessManifest()` y `runExpandedConflictReviewImportReadinessFixture()`; imprime JSON por consola y no escribe outputs por defecto.
- Impacto Claude/comercializable: UI futura debe mostrar severidad, estado de cola, sourceRefs opacas, stable keys no sensibles, razon de revision y bloqueo de import si hay blocker; no debe deduplicar visualmente ni resolver automaticamente.
- Impacto Academia: explicar cola de conflictos, blocker vs warning, sourceRefs opacas, stable keys, revision humana, pago en revision vs pago real y administracion completa de Academia.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.

## 2026-07-08 - Readiness dashboard bridge runner preview-only

- Se agrego `tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs`.
- Se agrego `app/docs/READINESS-DASHBOARD-BRIDGE-RUNNER-CXORBIA-20260708.md`.
- Se agrego `app/docs/CAMBIOS-READINESS-DASHBOARD-BRIDGE-RUNNER-CXORBIA-20260708.md`.
- Objetivo: preparar un puente source-safe entre el synthetic input pack runner y el manifest de readiness dashboard, sin runtime real ni outputs por defecto.
- Decision tecnica: el bridge usa `runSyntheticInputPack()` por defecto o lee un reporte JSON con `--input`, mapea cada resultado a un item de readiness y valida el manifest con `validateReadinessDashboardSourceSafe()`.
- Outputs: imprime JSON por consola; solo escribe reportes locales si se usa `--out`, sin subir reportes generados al repo.
- Impacto Claude/comercializable: dashboard futuro puede consumir el patron para mostrar area, estado honesto, sourceRef opaca, gate apagado, revision humana y motivo; nunca production ready, import real, sync real, envio real, pago real, provider activo, Firestore conectado, HR sincronizada o deploy realizado.
- Impacto Academia: explicar como un reporte de validadores se convierte en dashboard, source-safe, fixture sintetico, input sanitizado, gates apagados, warnings/fails/blockers y revision humana.
- Hallazgo Claude/prototipo: captura de Academia muestra que no existe accion visible de borrar/archivar/duplicar/versionar cursos; queda documentado como pendiente UI, no backend.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.

## 2026-07-08 - Readiness dashboard source-safe contract preview-only

- Se agrego `tools/contracts/cxorbia-readiness-dashboard-source-safe-contract.mjs`.
- Se agrego `app/docs/READINESS-DASHBOARD-SOURCE-SAFE-CONTRACT-CXORBIA-20260708.md`.
- Se agrego `app/docs/CAMBIOS-READINESS-DASHBOARD-SOURCE-SAFE-CONTRACT-CXORBIA-20260708.md`.
- Objetivo: preparar un contrato reusable para representar resultados de contratos/runners/readiness como estados honestos de dashboard sin activar runtime real.
- Decision tecnica: contrato preview-only con `sampleManifest()` y `validateReadinessDashboardSourceSafe()`; valida `mode=preview_only`, source-safe, input sintetico/sanitizado, sourceRefs opacas, gates reales apagados y ausencia de claims prohibidos.
- Bloquea: production ready, import real, sync real, envio real, pago real, provider activo, deploy realizado, Firestore conectado, HR sincronizada, Make/Gemini/Storage activo y campos sensibles/raw.
- Impacto Claude/comercializable: UI futura de readiness debe mostrar area, estado preview, sourceRef opaca, gate apagado, revision humana y motivo; no debe prometer produccion ni integraciones reales.
- Impacto Academia: explicar readiness dashboard, preview vs real, fixture sintetico, input sanitizado, source-safe report, gates apagados, errores, warnings, blockers y revision humana.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
