# RESUMEN-PARA-CLAUDE.md

## 2026-07-08 - Addendum readiness dashboard source-safe

- ChatGPT/backend agrego `tools/contracts/cxorbia-readiness-dashboard-source-safe-contract.mjs` y documentos `app/docs/READINESS-DASHBOARD-SOURCE-SAFE-CONTRACT-CXORBIA-20260708.md` / `app/docs/CAMBIOS-READINESS-DASHBOARD-SOURCE-SAFE-CONTRACT-CXORBIA-20260708.md`.
- El contrato no toca `/app/modules` ni `/app/core`, no conecta runtime, no activa Firestore/Auth/Storage/HR/Make/Gemini/correo/WhatsApp/import/pagos y no incluye datos sensibles.
- Claude debe usar este patron si implementa dashboard/panel de readiness: area, estado preview, sourceRef opaca, gate apagado, revision humana y motivo.
- Estados permitidos: preview listo, diagnostico ejecutado, fixture sintetico, input sanitizado, warning, fail, pendiente fuente real, pendiente gate real, pendiente revision humana, produccion no autorizada, proveedor no activo, bloqueado por datos sensibles, bloqueado por conflicto, solo documental.
- Copy honesto obligatorio: readiness dashboard no significa produccion lista, import real, sync real, envio real, pago real, provider activo, Storage activo, Firestore conectado, HR sincronizada ni deploy.
- Academia debe explicar readiness dashboard, preview vs real, fixture sintetico, input sanitizado, source-safe report, gates apagados, errores, warnings, blockers y revision humana.
- No tocar backend, contracts, tools, workflows, Firestore/Auth/Storage, Make, Gemini, imports, pagos reales ni datos reales.

## 2026-07-08 - Addendum synthetic input pack expanded coverage

- ChatGPT/backend actualizo `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs` y agrego `app/docs/SYNTHETIC-INPUT-PACK-EXPANDED-COVERAGE-CXORBIA-20260708.md` / `app/docs/CAMBIOS-SYNTHETIC-INPUT-PACK-EXPANDED-COVERAGE-CXORBIA-20260708.md`.
- La cobertura agregada ejecuta fixtures sinteticos existentes para assignment sync conflict preview, notification outbox preview, project/tenant rule versioning preview, rule change changelog notification preview y release readiness snapshot preview.
- Claude debe mostrar esta cobertura solo como diagnostico preview por area/pass-fail/warnings si se refleja en UI.
- Copy honesto obligatorio: coverage/pass de synthetic runner no significa produccion lista, import real, sync aplicado, envio real, pago real, provider activo, Storage activo ni deploy.
- Readiness visual debe separar: contrato probado, fixture sintetico validado, preview listo, warning, fail, pendiente gate real, pendiente fuente real, pendiente revision humana y produccion no autorizada.
- Academia debe explicar cobertura del runner, fixtures sinteticos, inputs sanitizados, pass/fail/warnings, preflight contractual, gates apagados y revision humana.
- No tocar backend, contracts, tools, workflows, Firestore/Auth/Storage, Make, Gemini, imports, pagos reales ni datos reales.

## 2026-07-08 - Addendum synthetic input pack runner

- ChatGPT/backend agrego el runner preview-only `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs` y documentos `app/docs/SYNTHETIC-INPUT-PACK-RUNNER-CXORBIA-20260708.md` y `app/docs/CAMBIOS-SYNTHETIC-INPUT-PACK-RUNNER-CXORBIA-20260708.md`.
- El runner no toca `/app/modules` ni `/app/core`, no conecta runtime, no activa Firestore/Auth/Storage/HR/Make/Gemini/correo/WhatsApp/import/pagos y no incluye datos sensibles.
- El runner ejecuta fixtures sinteticos/sanitizados para contratos preview-only: admin configurability, conflict review/import readiness, questionnaire routing, visit lifecycle, settlement eligibility, evidence storage e historical import clean.
- Claude debe reflejarlo solo como diagnostico preview/pass-fail/warnings si se muestra en UI. No debe mostrarlo como produccion lista.
- Copy honesto: synthetic input pack ejecutado no significa import real, provider activo, sync aplicado, pago confirmado, correo/WhatsApp enviado, Storage activo ni deploy realizado.
- Academia debe explicar fixtures sinteticos, input sanitizado, prueba de contrato vs operacion real, source-safe report vs import real, limites del runner y revision humana.
- No tocar backend, contracts, tools, workflows, Firestore/Auth/Storage, Make, Gemini, imports, pagos reales ni datos reales.
