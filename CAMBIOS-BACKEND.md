# CAMBIOS-BACKEND.md

## 2026-07-09 - Fix Level 0 preflight real-data preview sin marcador prohibido

- Se modifico `tools/contracts/tya-minimal-sanitized-input-from-manifest.mjs`.
- Motivo: el preflight local de Paula genero Level 0, pero marco `NO_GO_LOCAL_REALDATA_PREFLIGHT` porque el payload/documentacion interna incluia texto seguro que contenia un marcador prohibido de datos sensibles. No era dato real ni PII cruda; era una palabra dentro del mensaje de issue seguro.
- Cambio aplicado: se reemplazo el mensaje seguro del issue `sensitive_shopper_data_policy` para evitar el marcador prohibido literal y mantener el bloqueo conceptual de datos restringidos de shopper/pago.
- Impacto Phase A: debe permitir que Level 0 valide correctamente proyecto/periodos/readiness sin desbloquear produccion ni runtime. Level 1/Level 2 siguen dependiendo de recuperar output local sanitizado.
- Impacto backend reusable: refuerza la regla de que los validadores no deben fallar por copy interno seguro que contenga marcadores prohibidos, sin relajar la politica de datos sensibles.
- Impacto Claude/prototipo: ninguno visual directo; mantener copy honesto sobre preview, datos restringidos, no import, no pago real y no runtime.
- Impacto Academia: explicar que los gates pueden bloquear por marcadores sensibles incluso cuando no hay dato real; la solucion correcta es conservar la politica y ajustar mensajes seguros, no relajar protecciones.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
- Commit: `72e00496e5e6197528259970a3fb0b35daec3501`.

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
