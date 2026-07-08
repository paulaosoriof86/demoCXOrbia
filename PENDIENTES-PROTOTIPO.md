# PENDIENTES-PROTOTIPO.md

Pendientes reales del prototipo/frontend para Claude. No incluir tareas de backend, reglas Firestore, Auth DEV, loaders, seeds, helpers locales, smoke tests, Hosting, Make real, correo real, WhatsApp real, Gemini backend ni Storage real.

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

## Addendum conflict review queue + import readiness - 2026-07-08

- Backend agrego `tools/contracts/cxorbia-conflict-review-import-readiness-contract.mjs` y documentos `app/docs/CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md` / `app/docs/CAMBIOS-CONFLICT-REVIEW-IMPORT-READINESS-CONTRACT-CXORBIA-20260708.md`.
- Claude debe convertir esto en UX visible, sin tocar backend: bandeja de conflictos y readiness de importacion por area.
- Bandeja de conflictos: mostrar conflicto, entidad afectada, severidad `info/warning/blocker`, sourceRefs opacas, estado `abierto/en revision/resuelto/rechazado/archivado`, auditRef y razon obligatoria para resolver/rechazar.
- Readiness por area: proyectos, visitas, shoppers, asignaciones, certificaciones, liquidaciones, pagos y rutas de cuestionario.
- Si hay `blocker`, la UI debe bloquear import/activacion y mostrar revision humana requerida.
- Copy honesto: `ready_preview` no significa importado; `resolved` preview no significa aplicado real; sourceRef opaca no significa que la fuente real este conectada.
- No deduplicar por nombre, sucursal o coincidencia visual. Si falta llave estable suficiente, mostrar revision humana.
- No mostrar datos sensibles crudos: DPI, banco, NDA firmado, tokens, webhooks, adjuntos, cuerpos crudos, telefonos/correos crudos.
- Academia debe tener manuales/cursos por rol sobre export limpio, preview, import real, cola de conflictos, blockers, llaves estables, dedupe prohibido y revision humana.
