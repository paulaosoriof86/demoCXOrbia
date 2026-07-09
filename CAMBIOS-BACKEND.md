# CAMBIOS-BACKEND.md

## 2026-07-09 - CX.data DEV adapter contract Phase A TyA

- Se agrego `backend/contracts/phase-a-cxdata-dev-adapter-contract-v1.json`.
- Se agrego `tools/contracts/tya-phase-a-cxdata-dev-adapter-contract-validate.mjs`.
- Se agrego `app/docs/PHASE-A-CXDATA-DEV-ADAPTER-CONTRACT-TYA-20260709.md`.
- Se agrego `app/docs/CLAUDE-PROTOTIPO-ADDENDUM-CXDATA-DEV-ADAPTER-TYA-20260709.md`.
- Se agrego `app/docs/CAMBIOS-PHASE-A-CXDATA-DEV-ADAPTER-CONTRACT-TYA-20260709.md`.
- Objetivo: definir el contrato del futuro adapter DEV de `CX.data` para Phase A TyA/Cinepolis con foco directo en datos reales/sanitizados de TyA, sin activar runtime ni writes.
- Fuente real/sanitizada requerida: HR source-safe/full-flow u output sanitizado original TyA. Bloquea demo como fuente final, fixture sintetico como evidencia real y `.tmp` derivado como fuente original.
- Dominios Phase A cubiertos: configuracion tenant/proyecto, HR status, visitas, shoppers, postulaciones/asignaciones, certificaciones, liquidaciones/pagos junio, cuestionarios, colas operativas y auditoria.
- Guardrail interfaz: `CX.data` debe conservar exactamente la interfaz actual, con un solo switch futuro, fallback localStorage, adapter apagado por defecto y writes bloqueados hasta gate.
- Trabajo previo recuperado: lectura HR, mapeo columnas, shoppers historicos, certificaciones preservadas, junio pagos/liquidaciones, sync HR/plataforma, colas y no-reversion Level 0/1.
- Descartado: arquitectura/base vieja, parches UI desde backend, demo/fixture/`.tmp` como fuente real y tratar junio como visitas pendientes de ejecutar.
- Impacto Phase A: alinea el futuro switch de `CX.data` con operacion real/sanitizada TyA y evita desviarse hacia infraestructura abstracta.
- Impacto backend reusable: patron de adapter DEV por tenant/proyecto con fuente source-safe, interfaz estable, fallback y writes bloqueados.
- Impacto Claude/prototipo: se agrego addendum para estados honestos: adapter apagado, source-safe pendiente, no write, no sync real, no pago real y no demo/fixture como dato real.
- Impacto Academia: explicar `CX.data`, adapter, fallback localStorage, lectura source-safe, writes bloqueados, gates, datos reales/sanitizados vs demo y preservacion de certificaciones.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, adapter no habilitado, sin runtime, sin switch ejecutado, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp reales, sin pagos reales, sin import real y sin datos sensibles.
- Commits: `d4518d90d45a87bc7bfee4e3469784729344d718`, `7bfa6dd34f9eea1c7225de22e58bffbb0d5fd1c3`, `d690a9a44bfc6a046ae9b7683d623a5f95f05480`, `d39a5647549aaadf703c71f5212fe185ffeb8428`, `14382dc2d880aa1cd1b591a9602b034375bb020a`.

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
