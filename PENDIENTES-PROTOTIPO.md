# PENDIENTES-PROTOTIPO.md

Pendientes reales del prototipo/frontend para Claude. No incluir tareas de backend, reglas Firestore, Auth DEV, loaders, seeds, helpers locales, smoke tests, Hosting, Make real, correo real, WhatsApp real, Gemini backend ni Storage real.

## Addendum readiness dashboard source-safe - 2026-07-08

- Backend agrego `tools/contracts/cxorbia-readiness-dashboard-source-safe-contract.mjs` y documentos `app/docs/READINESS-DASHBOARD-SOURCE-SAFE-CONTRACT-CXORBIA-20260708.md` / `app/docs/CAMBIOS-READINESS-DASHBOARD-SOURCE-SAFE-CONTRACT-CXORBIA-20260708.md`.
- Claude debe usar este patron si agrega dashboard/panel de readiness: area, estado preview, sourceRef opaca, gate apagado, revision humana, motivo y blocker/warning si aplica.
- Estados permitidos: preview listo, diagnostico ejecutado, fixture sintetico, input sanitizado, warning, fail, pendiente fuente real, pendiente gate real, pendiente revision humana, produccion no autorizada, proveedor no activo, bloqueado por datos sensibles, bloqueado por conflicto, solo documental.
- No mostrar readiness como produccion lista, import real, sync real, envio real, pago real, provider activo, Storage activo, Firestore conectado, HR sincronizada, Make/Gemini activo o deploy realizado.
- Academia debe tener manuales/cursos sobre readiness dashboard, preview vs real, fixture sintetico, input sanitizado, source-safe report, gates apagados, errores, warnings, blockers y revision humana.

## Addendum synthetic input pack expanded coverage - 2026-07-08

- Backend actualizo `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs` y agrego `app/docs/SYNTHETIC-INPUT-PACK-EXPANDED-COVERAGE-CXORBIA-20260708.md` / `app/docs/CAMBIOS-SYNTHETIC-INPUT-PACK-EXPANDED-COVERAGE-CXORBIA-20260708.md`.
- Claude debe mostrar la cobertura expandida solo como diagnostico preview si se refleja en UI: area, validator, fixture sintetico/sanitizado, pass/fail/warning y gate real apagado.
- Areas agregadas al diagnostico: assignment sync conflict, notification outbox, project/tenant rule versioning, rule change changelog notification y release readiness snapshot.
- No mostrar esto como produccion lista ni como import real, sync real, envio real, pago real, provider activo, Storage activo o deploy.
- Readiness/dashboard debe separar: contrato probado, fixture sintetico validado, preview listo, warning, fail, pendiente gate real, pendiente fuente real, pendiente revision humana y produccion no autorizada.
- Academia debe tener manuales/cursos sobre coverage del runner, fixtures sinteticos, inputs sanitizados, preflight contractual, pass/fail/warnings, gates apagados y revision humana.

## Addendum synthetic input pack runner - 2026-07-08

- Backend agrego `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs` y documentos `app/docs/SYNTHETIC-INPUT-PACK-RUNNER-CXORBIA-20260708.md` / `app/docs/CAMBIOS-SYNTHETIC-INPUT-PACK-RUNNER-CXORBIA-20260708.md`.
- Claude debe mostrarlo solo como diagnostico preview si se decide reflejarlo en UI: runner sintetico, contratos cubiertos, pass/fail, warnings y estado source-safe.
- No mostrar esto como produccion lista ni como import real.
- Copy honesto: synthetic input pack ejecutado no significa importado, sincronizado, conectado, enviado, pagado, deployado ni provider activo.
- Readiness/dashboard debe separar: contrato probado, preview listo, pendiente gate, pendiente fuente real, pendiente revision humana y produccion no autorizada.
- Academia debe tener manuales/cursos sobre fixture sintetico, input sanitizado, prueba de contrato, source-safe report, limites del runner y revision humana.
