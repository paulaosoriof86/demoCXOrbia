# CAMBIOS-BACKEND.md

## 2026-07-09 - Accumulated continuity checkpoint Phase A TyA

- Se agrego `backend/contracts/phase-a-accumulated-continuity-checkpoint-v1.json`.
- Se agrego `app/docs/PHASE-A-ACCUMULATED-CONTINUITY-CHECKPOINT-TYA-20260709.md`.
- Se agrego `app/docs/CAMBIOS-PHASE-A-ACCUMULATED-CONTINUITY-CHECKPOINT-TYA-20260709.md`.
- Objetivo: conservar continuidad completa de Phase A backend TyA para evitar perdida de contexto, metodologia, estado, fuente viva, guardrails, avances, pendientes y siguiente bloque exacto.
- Estado repo/PR: `paulaosoriof86/demoCXOrbia`, rama `docs-tya-v6-v71-audit`, base `release/cxorbia-tya-rc-20260630`, PR #7 draft abierto, sin merge, sin deploy, sin produccion, sin runtime.
- Foco Phase A: datos reales/sanitizados TyA, HR fuente operacional, junio como pagos/liquidaciones, shoppers historicos, certificaciones preservadas, Cinépolis configurable y multi-proyecto.
- Bloques protegidos: no-reversion Level 0/1, real-data preview, continuidad operacional, state machine, acciones auditables, colas, readiness, GO request, runtime switch plan, `CX.data` adapter, domain mapping, readiness pack, builder, ejecucion local y comando unico futuro.
- Guardrails: no tocar `/app/modules` ni `/app/core`, no pedir datos privados por chat, no conectar base vieja, no usar fixture/`.tmp` como real, no repetir Level 0/1 y no activar runtime/write/import/deploy sin GO explicito.
- Impacto Claude/prototipo: Claude debe usar este checkpoint para no reiniciar pendientes ni asumir runtime activo. Todo cambio UI futuro requiere source lock/candidata vigente y copy honesto.
- Impacto Academia: explicar continuidad, no-reversion, gates, source-safe, dry-run, builder local, comando unico futuro y diferencia entre preparado/ejecutado/runtime/import/produccion.
- Siguiente bloque exacto: preparar `PHASE-A-CONTINUITY-PROMPT-AND-PR-SUMMARY-TYA-20260709.md`.
- Estado seguro: checkpoint documentado solamente. Sin cambios UI/core, sin runtime, sin imports, sin writes, sin deploy, sin produccion y sin datos sensibles.
- Commits: `a91f172bf0587dc18255ff9a01b47da38645f71a`, `afecf7c5051d1ba434fd79e6f7850809b53aa9a9`, `581c30002ebe16d8269bae9fd3faf5ce5012d547`.

## 2026-07-09 - Future single-command pack Phase A TyA

- Se agrego `backend/contracts/phase-a-future-single-command-pack-v1.json`.
- Se agrego `tools/contracts/tya-phase-a-future-single-command-pack-validate.mjs`.
- Se agrego `app/docs/PHASE-A-FUTURE-SINGLE-COMMAND-PACK-TYA-20260709.md`.
- Se agrego `app/docs/POWERSHELL-NO-EJECUTAR-PHASE-A-BUILDER-READINESS-TYA-20260709.md`.
- Se agrego `app/docs/CAMBIOS-PHASE-A-FUTURE-SINGLE-COMMAND-PACK-TYA-20260709.md`.
- Objetivo: dejar preparado el paquete de comando unico futuro para Paula, marcado como NO EJECUTAR TODAVIA, para reducir pasos manuales cuando se necesite computador y fuente local source-safe.
- Flujo futuro: confirmar repo/rama, validar contratos, crear salidas `.tmp`, validar readiness pack contract-only y, si existe input local source-safe, validarlo con `--input`.
- Guardrails: no ejecutar ahora, no pedir datos privados en chat, no HR cruda, no fixture como real, no `.tmp` como fuente original, no `git add .tmp`, no commit de reportes locales, no adapter/runtime/import/write/deploy, no Make/Gemini y no pagos.
- Impacto Phase A: mantiene preparado el flujo local futuro para validar fuente real/sanitizada TyA sin activar runtime/imports/writes ni repetir Level 0/1.
- Impacto backend reusable: patron reusable de paquete de comando unico futuro para validaciones locales source-safe por tenant/proyecto.
- Impacto Claude/prototipo: Claude debe mostrar esto, si aplica, como estado tecnico pendiente: `comando local preparado · no ejecutado`.
- Impacto Academia: explicar por que se prepara un comando unico, por que no se ejecuta hasta necesidad real, por que no se comparten datos privados y por que `.tmp` no se commitea.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, no se envio comando a Paula, comando no ejecutado, builder no ejecutado, output local no commiteado, adapter no habilitado, sin runtime, sin import de dominios, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp reales, sin pagos reales, sin import real y sin datos sensibles.
- Commits: `86e554ae4d201f7fa1864d230acb1fefb845b116`, `a32067fc6375c55cee601a2007cfc5b8c1a7b4f3`, `1da72b5ea6ac92e85c98130b113b5a14e5d0063f`, `e1bb012257a7539099d9c0e2d148c5f265c01d1c`, `2b9c85be49031a0345b6b0c7d653f7153566e961`.

## 2026-07-09 - Local builder execution control Phase A TyA

- Se agrego `backend/contracts/phase-a-local-builder-execution-control-v1.json`.
- Se agrego `tools/contracts/tya-phase-a-local-builder-execution-control-validate.mjs`.
- Se agrego `app/docs/PHASE-A-LOCAL-BUILDER-EXECUTION-CONTROL-TYA-20260709.md`.
- Se agrego `app/docs/CAMBIOS-PHASE-A-LOCAL-BUILDER-EXECUTION-CONTROL-TYA-20260709.md`.
- Objetivo: definir el control de ejecucion local futura del builder source-safe Phase A para que, cuando se necesite computador, exista un solo flujo seguro y sin reprocesos.
- Flujo futuro: un solo bloque/comando debe confirmar repo/rama, validar contratos, ejecutar builder solo con inputs source-safe, validar readiness pack con `--input`, escribir reportes solo bajo `.tmp` e imprimir verdict.
- Inputs locales: HR source-safe/full-flow report, export TyA original sanitizado si aplica y project config source-safe.
- Outputs locales: `.tmp/source-safe/tya-phase-a-domains.source-safe.local.json` y reportes `.tmp/tya-phase-a-realdata-domain-readiness-pack/*`, no commiteados.
- Guardrails: no pedir datos privados en chat, no commitear `.tmp`, no raw HR, no datos sensibles, no fixture como real, no `.tmp` como original, no base vieja, no runtime, no writes, no imports, no deploy, no Make/Gemini, no pagos y no reproceso Level 0/1.
- Impacto Phase A: prepara una corrida local segura para evaluar fuente real/sanitizada TyA sin pedir datos privados por chat, sin subir output al repo y sin activar runtime/imports/writes.
- Impacto backend reusable: patron reusable para ejecucion local controlada de builders source-safe por tenant/proyecto.
- Impacto Claude/prototipo: Claude debe mostrar estados honestos si el flujo local aun no se ejecuto o si el dry-run no paso. No debe representar datos como cargados.
- Impacto Academia: explicar flujo local source-safe, no compartir datos privados, `.tmp` no commiteado, dry-run vs import/runtime/produccion.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, no se pidio comando a Paula, builder no ejecutado, output local no commiteado, adapter no habilitado, sin runtime, sin import de dominios, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp reales, sin pagos reales, sin import real y sin datos sensibles.
- Commits: `79d95c6d850dc0e48f8bcba6f6ac6d47ef62643e`, `63509895c99045739ed1f7c1328040a0597bdbec`, `db0cd24495be3b5bc01104a3e23e7a1874b2a79f`, `a9661875e8c09cf2ba6f8870cbb6ab9a6af45eb8`.

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
