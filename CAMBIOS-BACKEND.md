# CAMBIOS-BACKEND.md

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

## 2026-07-08 - Paquete Claude completo acumulado post synthetic coverage

- Se agrego `app/docs/PAQUETE-CLAUDE-COMPLETO-ACUMULADO-POST-SYNTHETIC-COVERAGE-CXORBIA-20260708.md`.
- Se agrego `app/docs/CAMBIOS-PAQUETE-CLAUDE-COMPLETO-ACUMULADO-POST-SYNTHETIC-COVERAGE-20260708.md`.
- Objetivo: entregar a Claude un paquete acumulado completo que incluya contexto, pendientes, modificaciones backend recientes, patrones reutilizables, Academia profunda, Phase A, restricciones, validaciones y prompt pegable.
- Alcance: copy honesto P0, UX diagnostica preview/readiness/gates, administrabilidad por tenant/proyecto, NDA y planes editables/versionados, conflict review/import readiness, Phase A operativo, HR/plataforma sync, liquidaciones/pagos, cuestionarios/certificaciones, evidencias/Storage, datos sensibles, Academia profunda y patrones reutilizables CXOrbia.
- Decision tecnica: solo documentacion para handoff Claude; no toca runtime, modules, core, tools, contracts ni workflows.
- Impacto Claude/comercializable: Claude debe trabajar sobre prototipo/UX/Academia con el paquete completo, no con prompt corto, y documentar archivos modificados, textos corregidos, cambios de Academia, pendientes, riesgos y validaciones.
- Impacto Academia: incluye backfill profundo acumulado por rol, cursos/manuales/checklists/glosario y explicacion de synthetic runner, expanded coverage, source-safe, gates, conflict queue, import readiness, admin configurability, liquidaciones/pagos, cuestionarios, evidencias y datos sensibles.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin cambios en `tools/`, `app/contracts/` o workflows, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
