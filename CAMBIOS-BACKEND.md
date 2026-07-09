# CAMBIOS-BACKEND.md

## 2026-07-09 - Real-data domain readiness pack Phase A TyA

- Se agrego `backend/contracts/phase-a-realdata-domain-readiness-pack-v1.json`.
- Se agrego `tools/contracts/tya-phase-a-realdata-domain-readiness-pack-validate.mjs`.
- Se agrego `app/docs/PHASE-A-REALDATA-DOMAIN-READINESS-PACK-TYA-20260709.md`.
- Se agrego `app/docs/CAMBIOS-PHASE-A-REALDATA-DOMAIN-READINESS-PACK-TYA-20260709.md`.
- Objetivo: preparar el paquete de readiness dry-run para evaluar si una fuente TyA real/sanitizada original cumple el mapping source-safe de dominios antes de habilitar cualquier lectura DEV por `CX.data` adapter.
- Validacion futura: contrato solamente si no hay input; con `--input` local valida top-level shape, sourceSafety, dominios minimos, campos requeridos, stable keys, ausencia de marcadores sensibles, `canImport=false`, `canWrite=false` y reglas Phase A.
- Dominios evaluables: tenant/project config, HR source status, visits, shoppers, applications/assignments, certifications, liquidations/payments june, questionnaire routes, operational queues y audit preview.
- Reglas Phase A: junio pendiente es pago/liquidacion, certificaciones preservadas antes de repetir, asignaciones HR/plataforma sin duplicar, cuestionario configurable o bloqueo honesto y Cinépolis como proyecto configurable.
- Guardrails: no input privado en chat, no import, no writes, no runtime, no fixture como real, no `.tmp` derivado como fuente original, no base vieja, pagos como control y no ejecucion.
- Impacto Phase A: permite evaluar fuente real/sanitizada original TyA antes de adapter DEV sin activar runtime ni repetir Level 0/1.
- Impacto backend reusable: patron reusable de dry-run de dominios reales/sanitizados antes de adapter/runtime por tenant/proyecto.
- Impacto Claude/prototipo: mostrar bloqueo honesto si falta dominio, campo, ruta o fuente; no inventar datos ni prometer runtime.
- Impacto Academia: explicar dry-run, dominios, fuente source-safe, GO dry-run vs runtime, datos sensibles prohibidos y diferencia entre fixture y fuente real/sanitizada.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, adapter no habilitado, sin runtime, sin import de dominios, dry-run only, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp reales, sin pagos reales, sin import real y sin datos sensibles.
- Commits: `3bb358172365a1ee6db9cbb65dd7ab2db0b8bf95`, `cb96a486f8043381729ecba82f4fd35938883881`, `0a136f7d02813eeda6509080ff0e601acf4409fa`, `7dbd24fee48b54caf3e66d0bd9f34a7a87bd21fb`.

## 2026-07-09 - Source-safe domain mapping Phase A TyA

- Se agrego `backend/contracts/phase-a-source-safe-domain-mapping-v1.json`.
- Se agrego `tools/contracts/tya-phase-a-source-safe-domain-mapping-validate.mjs`.
- Se agrego `app/docs/PHASE-A-SOURCE-SAFE-DOMAIN-MAPPING-TYA-20260709.md`.
- Se agrego `app/docs/CAMBIOS-PHASE-A-SOURCE-SAFE-DOMAIN-MAPPING-TYA-20260709.md`.
- Objetivo: definir el mapeo minimo source-safe de dominios reales/sanitizados TyA antes de que el adapter `CX.data` DEV pueda leer datos Phase A, sin import ni writes.
- Dominios cubiertos: configuracion tenant/proyecto, HR source status, visitas, shoppers, postulaciones/asignaciones, certificaciones, liquidaciones/pagos junio, rutas de cuestionario, colas operativas y auditoria preview.
- Trabajo previo recuperado: HR source-safe/full-flow, reglas de Cinépolis, shoppers historicos, certificaciones ya presentadas, liquidaciones/pagos junio, sync HR/plataforma, colas operativas, auditoria y no-reversion Level 0/1.
- Guardrails: no datos sensibles, no raw HR rows, no raw URLs/secretos, no fixtures como reales, no `.tmp` derivado como fuente original, no base vieja, no deduplicacion visual, no pagos reales, no repetir certificacion preservada sin revision y no tratar junio como visitas pendientes si lo pendiente es pago.
- Impacto Phase A: aterriza el adapter `CX.data` a dominios operativos reales/sanitizados TyA antes de cualquier lectura DEV y mantiene foco en produccion real controlada.
- Impacto backend reusable: patron reusable de mapping source-safe por tenant/proyecto antes de activar adapter/runtime.
- Impacto Claude/prototipo: Claude debe diseñar pantallas usando dominios y campos seguros, con copy honesto y bloqueos visibles cuando falte fuente/ruta/gate.
- Impacto Academia: explicar dominios, stable keys, sourceRef opaca, datos sensibles prohibidos, junio como control de pago y certificaciones preservadas.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, adapter no habilitado, sin runtime, sin import de dominios, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp reales, sin pagos reales, sin import real y sin datos sensibles.
- Commits: `67c4f827e5cce4e54c1c693be69e7e15f0e04e68`, `526020f228b6ee7de21cc3843b3f9d49c1da8b85`, `aabe5e2a1d23a20eac3b9830f619d3060c3d89fc`, `f4604571e61d49386d4f8d5367e8b10f8b6b847d`.

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
