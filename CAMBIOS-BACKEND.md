# CAMBIOS-BACKEND.md

## 2026-07-08 - Synthetic input pack expanded coverage preview-only

- Se actualizo `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs`.
- Se agrego `app/docs/SYNTHETIC-INPUT-PACK-EXPANDED-COVERAGE-CXORBIA-20260708.md`.
- Se agrego `app/docs/CAMBIOS-SYNTHETIC-INPUT-PACK-EXPANDED-COVERAGE-CXORBIA-20260708.md`.
- Objetivo: ampliar el runner local para cubrir validadores con fixtures sinteticos existentes de assignment sync, notification outbox, rule versioning, rule change changelog/notifications y release readiness snapshot.
- Decision tecnica: el runner ejecuta validadores `tools/migration` con `--input` sobre fixtures source-safe de `tools/migration/synthetic-fixtures/phase-a/`, desde la raiz del repo, sin fuentes reales ni outputs por defecto.
- Impacto Claude/comercializable: si se refleja en UI, debe mostrarse como diagnostico preview por area/pass-fail/warnings, nunca como produccion lista, import real, sync aplicado, envio real, pago real, provider activo o deploy.
- Impacto Academia: explicar cobertura del runner, fixtures sinteticos, input sanitizado, pass/fail/warnings, preflight contractual, diferencia entre validacion preview y operacion real, gates apagados y revision humana.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.

## 2026-07-08 - Synthetic input pack runner preview-only

- Se agrego `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs`.
- Se agrego `app/docs/SYNTHETIC-INPUT-PACK-RUNNER-CXORBIA-20260708.md`.
- Se agrego `app/docs/CAMBIOS-SYNTHETIC-INPUT-PACK-RUNNER-CXORBIA-20260708.md`.
- Objetivo: ejecutar validadores preview-only con fixtures sinteticos/sanitizados y producir un reporte agregado source-safe sin fuentes reales.
- Contratos cubiertos: admin configurability, conflict review/import readiness, questionnaire routing, visit lifecycle, settlement eligibility, evidence storage e historical import clean.
- Decision tecnica: runner local reusable CXOrbia; imprime JSON por consola y opcionalmente escribe reporte JSON/MD local con `--out`, sin subir datos reales ni generar outputs por defecto en repo.
- Impacto Claude/comercializable: UI futura solo debe mostrarlo como diagnostico preview/pass-fail/warnings, sin decir production-ready, importado, sincronizado, enviado, pagado, conectado o deployado.
- Impacto Academia: explicar fixtures sinteticos, input sanitizado, prueba de contrato vs operacion real, source-safe report vs import real, limites del runner y revision humana.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.

## 2026-07-08 - Conflict review queue + import readiness contract preview-only

- Se agrego `tools/contracts/cxorbia-conflict-review-import-readiness-contract.mjs`.
- Se agrego `app/docs/CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md`.
- Se agrego `app/docs/CAMBIOS-CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md`.
- Objetivo: preparar una cola de revision de conflictos y readiness report de importacion para HR/plataforma/import historico/shoppers/certificaciones/rutas de cuestionario/liquidaciones/pagos, sin import real ni escrituras reales.
- Decision tecnica: contrato preview-only reusable CXOrbia; exige `sourceSafe=true`, input sintetico/sanitizado, sourceRefs opacas, llaves estables, severidad, estado de cola, auditRef y revision humana.
- Bloquea: import real, escrituras Firestore/HR/Storage, base vieja/dump viejo, proveedores activos, Make/Gemini real, pagos reales, notificaciones reales, auto-merge/auto-resolve de conflictos, dedupe visual/por nombre, overwrite sin revision, DPI, banco, NDA firmado, secretos/tokens/webhooks, adjuntos/base64/cuerpos crudos.
- Impacto Claude/comercializable: UI futura debe mostrar bandeja de conflictos, severidad, entidad, source refs opacas, estados abierto/en revision/resuelto/rechazado/archivado, readiness por area y bloqueo de import si hay blockers, sin decir importado/sincronizado/pagado/notificado si solo existe preview.
- Impacto Academia: explicar export limpio vs preview vs import real, cola de conflictos, severidades, blockers, llaves estables, prohibicion de dedupe visual, revision humana, resolved preview vs aplicado real y datos sensibles excluidos.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
