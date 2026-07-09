# CAMBIOS-BACKEND.md

## 2026-07-09 - Source-safe input builder contract Phase A TyA

- Se agrego `backend/contracts/phase-a-source-safe-input-builder-contract-v1.json`.
- Se agrego `tools/contracts/tya-phase-a-source-safe-input-builder-contract-validate.mjs`.
- Se agrego `app/docs/PHASE-A-SOURCE-SAFE-INPUT-BUILDER-CONTRACT-TYA-20260709.md`.
- Se agrego `app/docs/CAMBIOS-PHASE-A-SOURCE-SAFE-INPUT-BUILDER-CONTRACT-TYA-20260709.md`.
- Objetivo: definir como construir localmente el JSON source-safe que alimenta el real-data domain readiness pack desde HR/export original sanitizado TyA, sin subir datos privados al repo y sin activar runtime, imports ni writes.
- Inputs permitidos: HR source-safe/full-flow report, export original TyA sanitizado y project config source-safe.
- Output futuro: `tya-phase-a-domains.source-safe.local.json`, solo local, no commiteado, con flags de seguridad en false y dominios Phase A completos.
- Reglas de derivacion: ids estables opacos, no deduplicacion por nombre, `paymentControlOnly=true`, certificaciones preservadas, rutas configuradas o bloqueo honesto.
- Guardrails: no subir output local al repo, no copiar filas HR crudas, no copiar datos sensibles, no usar fixture/`.tmp` derivado/base vieja, no pago real, no pedir certificacion preservada sin revision y no inventar links.
- Impacto Phase A: prepara el siguiente paso para evaluar datos reales/sanitizados TyA sin pedirlos en chat, manteniendo HR fuente operacional, junio como pagos/liquidaciones, certificaciones preservadas, shoppers historicos y cuestionarios configurables.
- Impacto backend reusable: patron reusable de builder local source-safe para generar inputs de readiness antes de adapter/runtime.
- Impacto Claude/prototipo: Claude debe mostrar estados honestos si fuente/build/dry-run no esta listo; no debe presentar runtime ni datos reales si solo existe contrato.
- Impacto Academia: explicar builder local, output no commiteado, derivacion de ids estables, no deduplicar por nombre, junio como pago/liquidacion y que builder no importa ni escribe.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, builder no ejecutado, output local no commiteado, adapter no habilitado, sin runtime, sin import de dominios, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp reales, sin pagos reales, sin import real y sin datos sensibles.
- Commits: `26856f268f0d374531dbc20e435ddd57b0c191a0`, `6b25777198e16c6d97fe0e2b822070224b3a278c`, `85096345227a0e96a8f916ef05c3141084244448`, `d36e0b6822be7533b7505268968260cbdc837c71`.

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
