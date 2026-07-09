# RESUMEN-PARA-CLAUDE.md

## 2026-07-09 - Paquete acumulado Phase A TyA para Claude/Pendientes/Academia

- ChatGPT/backend agrego `app/docs/CLAUDE-PACKAGE-ACCUMULATED-PHASE-A-TYA-20260709.md`.
- Objetivo: consolidar el paquete acumulado para Claude/prototipo despues de los checkpoints Phase A, sin reiniciar metodologia, sin pedir HR/reglas/shoppers/certificaciones ya documentadas y sin asumir runtime activo.
- Claude debe tomar como estado base: PR #7 draft/open/no merge; sin deploy; sin produccion; sin runtime; sin import real; sin Firestore/Auth/Storage writes; sin HR writes; sin Make/Gemini live; sin pagos reales; sin output local source-safe commiteado.
- Foco Phase A que debe respetar: HR fuente operacional, datos reales/sanitizados TyA, shoppers historicos, certificaciones ya presentadas, junio como liquidacion/pago, Cinépolis proyecto configurable, multi-proyecto, cuestionario configurable y conflictos a revision humana con llaves estables.
- Pendientes P0 para Claude: copy honesto de gates, Academia profunda/administrable, representacion de Phase A real TyA sin prometer imports/runtime/integraciones reales.
- Pendientes P1 para Claude: readiness dashboard source-safe, proyecto configurable sin hardcode Cinépolis, Mis beneficios/liquidaciones/pagos con honorario-boleto-combo-lote-movimientos, postulaciones/asignaciones con conflictos a revision.
- Academia debe cubrir: Phase A vs produccion, preview/dry-run/gate/runtime/import, HR fuente operacional, shoppers/certificaciones preservadas, asignaciones/conflictos, liquidaciones/pagos, administracion de Academia, Gemini con revision humana, Make/HR preparado y readiness dashboard.
- No tocar: `tools/`, `tools/migration/`, `tools/contracts/`, `backend/contracts/`, `.github/workflows/`, reglas reales, secrets, datos sensibles, `.tmp/` ni integraciones reales.
- Estado seguro: documento puente solamente. No toca `/app/modules` ni `/app/core`, no activa runtime, no ejecuta builder, no importa datos, no escribe Firestore/Auth/Storage/HR, no activa Make/Gemini, no hace deploy, no hace pagos reales y no agrega datos sensibles.

## 2026-07-08 - Addendum readiness dashboard bridge runner

- ChatGPT/backend agrego `tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs` y documentos `app/docs/READINESS-DASHBOARD-BRIDGE-RUNNER-CXORBIA-20260708.md` / `app/docs/CAMBIOS-READINESS-DASHBOARD-BRIDGE-RUNNER-CXORBIA-20260708.md`.
- El bridge convierte reportes del synthetic input pack runner en manifests de readiness dashboard source-safe y los valida; no toca `/app/modules` ni `/app/core`, no conecta runtime y no activa proveedores reales.
- Claude debe usar este patron si implementa dashboard/panel de readiness: fila por area, estado honesto, sourceRef opaca, gate apagado, revision humana y motivo.
- Copy honesto obligatorio: bridge/readiness no significa produccion lista, import real, sync real, envio real, pago real, provider activo, Storage activo, Firestore conectado, HR sincronizada, Make/Gemini activo ni deploy.
- Hallazgo visual Academia: en la captura de Paula no se ve opcion visible de borrar/archivar/duplicar/versionar cursos. Esto queda como pendiente Claude/prototipo; backend no debe tocar `app/modules/academia.js`.
- Academia debe explicar como un reporte de validadores se convierte en dashboard, source-safe, fixture sintetico, input sanitizado, gates apagados, warnings/fails/blockers y revision humana.
- No tocar backend, contracts, tools, workflows, Firestore/Auth/Storage, Make, Gemini, imports, pagos reales ni datos reales.

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
