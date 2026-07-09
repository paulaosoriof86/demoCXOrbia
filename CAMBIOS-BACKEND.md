# CAMBIOS-BACKEND.md

## 2026-07-09 - Plan runtime DEV switch Phase A TyA

- Se agrego `backend/contracts/phase-a-runtime-dev-switch-plan-v1.json`.
- Se agrego `tools/contracts/tya-phase-a-runtime-dev-switch-plan-validate.mjs`.
- Se agrego `app/docs/PHASE-A-RUNTIME-DEV-SWITCH-PLAN-TYA-20260709.md`.
- Se agrego `app/docs/CAMBIOS-PHASE-A-RUNTIME-DEV-SWITCH-PLAN-TYA-20260709.md`.
- Objetivo: separar solicitud GO de cambio tecnico runtime DEV, dejando un plan futuro que no ejecuta runtime ni writes.
- Decision: este bloque es plan only; no cambia runtime, no escribe base, no importa, no despliega, no activa Make/Gemini, no ejecuta pagos y no toca UI/core.
- Requisitos futuros: GO exacto Paula registrado, readiness acumulado limpio, GO/NO-GO runtime DEV limpio, rollback/smoke listo, punto unico `CX.data` confirmado, adapter DEV apagado por defecto e input source-safe no fixture/no `.tmp` derivado.
- Smoke futuro: login/roles, navegacion sin regresion, interfaz `CX.data` estable, HR source-safe bajo gate, asignaciones sin duplicar, colas de conflictos, certificaciones preservadas, liquidaciones junio como control, cuestionarios configurables, no Make/Gemini/pagos reales y rollback disponible.
- Impacto Phase A: evita mezclar autorizacion con ejecucion tecnica; runtime DEV sera un paso separado con su propio gate/PR/smoke/rollback.
- Impacto backend reusable: patron reusable para separar request gate, switch plan, switch execution, smoke, rollback y produccion.
- Impacto Claude/prototipo: representar como arquitectura futura bajo gate, no como integracion activa; conservar copy honesto.
- Impacto Academia: explicar GO request vs runtime switch, DEV preview vs produccion, smoke, rollback y estabilidad de `CX.data`.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin switch ejecutado, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp reales, sin pagos reales, sin import real y sin datos sensibles.
- Commits: `f31a650c7c58144a7fe083d1dddfac552482c49d`, `891524edf4d7dc33a6c52c6e5375ff2b9247e693`, `fe0cef808aafc5f0fb6e266bab31a7e05468a105`, `8fb1271fb865aa2ebaa9ae8fc2b7806c424d17fe`.

## 2026-07-09 - Gate solicitud GO runtime DEV Phase A TyA

- Se agrego `backend/contracts/phase-a-runtime-dev-go-request-gate-v1.json`.
- Se agrego `tools/contracts/tya-phase-a-runtime-dev-go-request-gate.mjs`.
- Se agrego `app/docs/PHASE-A-RUNTIME-DEV-GO-REQUEST-GATE-TYA-20260709.md`.
- Se agrego `app/docs/CAMBIOS-PHASE-A-RUNTIME-DEV-GO-REQUEST-GATE-TYA-20260709.md`.
- Objetivo: preparar el gate previo para determinar si corresponde pedir GO explicito de Paula para runtime DEV preview, sin activar runtime ni writes.
- Decision: un gate verde no equivale a autorizacion. El GO debe ser explicito y exacto; este gate no cambia runtime, no escribe base, no importa, no despliega, no activa Make/Gemini y no ejecuta pagos.
- Frase requerida: `Autorizo GO runtime DEV preview Phase A TyA`.
- Hard stops: falta readiness acumulado, falta runtime GO/NO-GO validator, reabrir Level 0/1 sin causa, usar fixture o `.tmp` como evidencia real, datos sensibles, cambio UI/core desde backend, runtime/writes ya activos, falta rollback/smoke o GO ambiguo.
- Impacto Phase A: deja una separacion clara entre readiness acumulado, solicitud de autorizacion, runtime switch separado y produccion.
- Impacto backend reusable: patron reusable de request gate por tenant/proyecto.
- Impacto Claude/prototipo: mostrar como estado de preparacion/autorizacion pendiente, no integracion activa.
- Impacto Academia: explicar readiness vs GO vs runtime DEV vs runtime switch vs produccion.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
- Commits: `6b2c36a803586478afbd6dd413b043225ed9f4e7`, `311d364053e01ea9b20b1a0987b691639e8522c2`, `560a214be6ed67dab9d6750f4e17d85868e8269d`, `32e8337cfdc62c7a119c05f53057fd04a9665876`.

## 2026-07-09 - Colas operativas Phase A y documentacion Claude/Academia

- Se agrego `backend/contracts/phase-a-operational-queues-contract-v1.json`.
- Se agrego `tools/contracts/tya-phase-a-operational-queues-validate.mjs`.
- Se agrego `app/docs/PHASE-A-OPERATIONAL-QUEUES-TYA-20260709.md`.
- Se agrego `app/docs/CLAUDE-PROTOTIPO-ADDENDUM-PHASE-A-OPERATIVO-AUDITABLE-TYA-20260709.md`.
- Se agrego `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-PHASE-A-COLAS-AUDITABLES-TYA-20260709.md`.
- Objetivo: formalizar colas operativas para conflictos, HR/plataforma, certificaciones, liquidaciones/pagos junio, cuestionario y correcciones; ademas dejar documentado para Claude/prototipo, backend replicable, pendientes, mejoras locales y Academia.
- Colas cubiertas: `sync_conflicts`, `hr_platform_sync_pending`, `certification_preservation_review`, `june_liquidation_payment_control`, `questionnaire_route_review`, `admin_corrections_review`.
- Priorizacion: blockers primero, conflictos de asignacion antes de pagos, certificaciones preservadas antes de repetir, pagos junio solo tras submitido/candidato valido, y no crear cola sin stable keys.
- Guardrails: colas source-safe, tenant/project scoped, sin datos sensibles, sin auto-resolucion, sin writes, sin fixtures como real, sin `.tmp` derivado como fuente original.
- Impacto Phase A: prepara tablero y flujo operativo para resolver casos reales de forma administrable cuando gates se habiliten, sin tocar UI ahora ni repetir Level 0/1.
- Impacto backend reusable: patron de colas operativas reusable para cualquier tenant/proyecto CXOrbia.
- Impacto Claude/prototipo: queda addendum para tablero de colas, drills, botones preparados/deshabilitados, copy honesto, bitacora y pendientes UI.
- Impacto Academia: queda documentado que debe explicar colas, severidad, sourceRef opaca, stable keys, revision humana, auditoria, pagos como control y preview vs produccion.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
- Commits: `4b10637281c1deafbf42135452ee36579ab7d399`, `7ba44cf765aaad7310e7f78dc714ad6915c694e5`, `3afeeb48e14f3fbbbfcf327c29355f743112fdac`, `4ef07ae028cfd0841c5910712dc8b91a54fdc292`, `57c900a5fc7f58cb577ca6bc3ef7f7fb956a36f8`.

## 2026-07-09 - Acciones administrativas auditables Phase A TyA

- Se agrego `backend/contracts/phase-a-admin-actions-audit-contract-v1.json`.
- Se agrego `tools/contracts/tya-phase-a-admin-actions-audit-validate.mjs`.
- Se agrego `app/docs/PHASE-A-ADMIN-ACTIONS-AUDIT-TYA-20260709.md`.
- Objetivo: formalizar acciones administrativas operables desde plataforma con auditoria, gates y alcance tenant/proyecto, sin activar writes reales, runtime, imports, HR writes, Make/Gemini ni pagos reales.
- Acciones cubiertas: aprobar/rechazar postulacion, reflejar asignaciones plataforma->HR y HR->plataforma, resolver conflictos, solicitar/aprobar reprogramacion, marcar realizada, marcar cuestionario, marcar submitido TyA, preservar certificacion, marcar revision de certificacion, crear liquidacion candidata, mover pago a revision, programar control de pago, confirmar pago externo y anular/corregir estado administrativamente.
- Auditoria obligatoria: `auditId`, `tenantId`, `projectId`, actor, accion, entidad, before/after, razon, source/sourceRef, idempotencyKey, correlationId, createdAt y gateStatus.
- Guardrails: `writesAllowedNow=false`, no hard delete, no deduplicacion visual, no datos sensibles en auditoria, no pagos reales, no Make/Gemini live, no runtime switch sin GO de Paula.
- Impacto Phase A: deja lista la base contractual para que administracion opere casos reales con auditoria cuando se habiliten writes, sin improvisar parches ni tocar UI ahora.
- Impacto backend reusable: contrato reusable de acciones auditables por tenant/proyecto para futuros clientes CXOrbia.
- Impacto Claude/prototipo: Claude debe representar estas acciones como operaciones administrables futuras con estados honestos, cola de conflictos, razon requerida y bitacora/auditoria visible; no debe prometer envio, pago, sync o import real mientras el gate este apagado.
- Impacto Academia: explicar accion administrativa auditable, diferencia entre preparar accion y ejecutar write real, no hard delete, razon obligatoria, pagos como control y datos sensibles fuera de auditoria.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
- Commits: `b7b6eeb31e48fb551b7b9d6f3ebdab51673f7e5f`, `667af06cd2fea69261cace013596d8ef4e54f543`, `86622886ef685b30c5cfde8de046a925d7584bc6`.
