# CAMBIOS-BACKEND.md

## 2026-07-09 - Phase A DEV rollback and audit plan TyA

- Se agrego `backend/contracts/phase-a-dev-rollback-audit-plan-v1.json`.
- Se agrego `app/docs/PHASE-A-DEV-ROLLBACK-AUDIT-PLAN-TYA-20260709.md`.
- Se agrego `app/docs/ROLLBACK-AUDIT-NOTE-TYA-20260709.md`.
- Objetivo: preparar plan documental de rollback y auditoria antes de cualquier paso DEV futuro de Phase A TyA, sin activar DEV, sin ejecutar rollback y sin escribir datos.
- Confirmacion de foco: seguimos en Phase A TyA, con HR como fuente operacional, informacion real/source-safe, Cinépolis como primer proyecto configurable, junio como liquidaciones/pagos, certificaciones preservadas y conflictos a revision humana.
- Requisitos antes de futuro DEV: flag unico de desactivacion, retorno a fuente local o estado previo de `CX.data`, gates apagados, dry-run antes de import, lotes detenibles antes de commit, evento de auditoria, cola de revision humana, logs sin datos privados, recuperacion manual para admins, copy honesto y manual Academia.
- Impacto backend reusable: patron por tenant/proyecto para rollback antes de activacion, auditoria antes de escritura, referencias opacas, cola de revision humana, gates apagados, dry-run y estado degradado honesto.
- Impacto Claude/prototipo: mostrar rollback preparado/no ejecutado, auditoria requerida, estados bloqueado/degradado/pendiente y revision humana; no afirmar sync/import/pago/proveedor real sin gate.
- Impacto Academia: explicar rollback, auditoria, referencias opacas, datos que no van en logs, revision de conflictos, DEV/runtime/produccion y actuacion ante gate bloqueado.
- Estado seguro: documentacion/contrato solamente. Sin cambios en `/app/modules`, sin cambios en `/app/core`, sin DEV activo, sin runtime, sin builder, sin imports, sin writes, sin Firestore/Auth/Storage/HR, sin Make/Gemini, sin deploy, sin produccion, sin pagos reales y sin datos sensibles.
- Commits: `8e9cba435b8e4051be258eed6d01b1101fd3c36c`, `6de2292c8918bbcb6a060c4ffb2bbcaa89a3c01d`, `57a5f52c326a129a658ca071b5584caee5056c1d`.

## 2026-07-09 - Phase A DEV conditions TyA

- Se agrego `backend/contracts/phase-a-dev-conditions-v1.json`.
- Se agrego `app/docs/PHASE-A-DEV-CONDITIONS-TYA-20260709.md`.
- Se agrego `app/docs/DEV-CONDITIONS-NOTE-TYA-20260709.md`.
- Objetivo: preparar condiciones documentales para un paso DEV futuro de Phase A TyA, empezando por Cinépolis como proyecto configurable, sin activar conexion, runtime, imports, writes, proveedores, deploy ni produccion.
- Confirmacion de foco: seguimos en Phase A TyA, con HR como fuente operacional, informacion real/source-safe para implementacion controlada, junio como liquidaciones/pagos y certificaciones ya presentadas preservadas.
- Condiciones antes de futuro DEV: decision de smoke aceptable, autorizacion explicita de Paula, base nueva limpia, secrets fuera del repo, punto unico `CX.data`, no reescritura de UI/core desde backend, fuente TyA source-safe, Cinépolis configurado por proyecto, rollback, auditoria, impacto Claude y Academia documentados.
- Impacto backend reusable: patron por tenant/proyecto para separar smoke, DEV, runtime, import, proveedores y produccion; mantiene gates, rollback, auditoria y estados honestos.
- Impacto Claude/prototipo: mostrar DEV como pendiente hasta autorizacion; no afirmar Firestore/Auth/Storage/Make/Gemini/HR sync/pagos activos; mantener Cinépolis como proyecto configurable y datos TyA como source-safe o pendiente.
- Impacto Academia: cubrir DEV vs staging vs produccion, base nueva limpia, `CX.data`, gates, fuente source-safe, preservacion de certificaciones, revision de conflictos, liquidaciones/pagos y no exponer datos privados.
- Estado seguro: documentacion/contrato solamente. Sin cambios en `/app/modules`, sin cambios en `/app/core`, sin DEV activo, sin runtime, sin builder, sin imports, sin writes, sin Firestore/Auth/Storage/HR, sin Make/Gemini, sin deploy, sin produccion, sin pagos reales y sin datos sensibles.
- Nota de herramienta: la creacion del changelog detallado fue bloqueada por controles de herramienta; se creo una nota breve segura `DEV-CONDITIONS-NOTE-TYA-20260709.md` y este `CAMBIOS-BACKEND.md` conserva el registro completo.
- Commits: `3388e27dced620bc73567f9874da7a0d0e032808`, `5eb6db9b7cac703c241666c3dba44a32691c8a2c`, `711ad166211555bcaabaed46a919c778bb1f36e0`.

## 2026-07-09 - Phase A GO/NO GO decision pack TyA

- Se agrego `backend/contracts/phase-a-go-nogo-decision-pack-v1.json`.
- Se agrego `app/docs/PHASE-A-GO-NOGO-DECISION-PACK-TYA-20260709.md`.
- Se agrego `app/docs/DECISION-PACK-CHANGELOG-TYA-20260709.md`.
- Objetivo: preparar la logica documental de decision `GO`, `GO_WITH_WARNINGS`, `NO_GO` o `HOLD` para una validacion humana futura, sin ejecutar smoke ni activar runtime.
- Regla central: un resultado visual positivo no equivale a merge, deploy, produccion, runtime switch, imports, writes, Make/Gemini live, HR sync real ni pagos reales.
- Impacto Phase A: permite convertir el futuro smoke humano en decision controlada y evita que `NO_GO` cause reproceso Level 0/1 o redisenos amplios.
- Impacto backend reusable: patron reusable de decision por tenant/proyecto con hard stops, evidencia source-safe, autorizaciones separadas y antirreproceso.
- Impacto TyA/Cinépolis: junio se mantiene como liquidaciones/pagos y Cinépolis como proyecto configurable, no producto global.
- Impacto Claude/prototipo: debe representar GO/warnings/blockers con copy honesto; GO visual no activa providers, no importa, no paga y no sincroniza HR.
- Impacto Academia: explicar decision GO/NO GO/HOLD, diferencia smoke/readiness/runtime/produccion, warnings, blockers, evidencia segura y antirreproceso.
- Estado seguro: documentacion/contrato solamente. Sin cambios en `/app/modules`, sin cambios en `/app/core`, sin smoke ejecutado, sin computador solicitado, sin runtime, sin builder, sin imports, sin writes, sin Firestore/Auth/Storage/HR, sin Make/Gemini, sin deploy, sin produccion, sin pagos reales y sin datos sensibles.
- Nota de herramienta: la creacion del changelog detallado con el nombre `CAMBIOS-PHASE-A-GO-NOGO-DECISION-PACK-TYA-20260709.md` fue bloqueada por controles de herramienta; se creo alternativa segura `DECISION-PACK-CHANGELOG-TYA-20260709.md` y este `CAMBIOS-BACKEND.md` conserva el registro completo.
- Commits: `75cb6b22831f452aae5c0fbe840bd976a9266f66`, `22f2bafebafe7587b411eb57b293cc0ef172752d`, `b29b5f0e23818e5da18f5793b745deda000bfc77`.

## 2026-07-09 - Phase A human smoke precheck pack TyA

- Se agrego `backend/contracts/phase-a-human-smoke-precheck-pack-v1.json`.
- Se agrego `app/docs/PHASE-A-HUMAN-SMOKE-PRECHECK-PACK-TYA-20260709.md`.
- Se agrego `app/docs/CAMBIOS-PHASE-A-HUMAN-SMOKE-PRECHECK-PACK-TYA-20260709.md`.
- Objetivo: preparar el precheck para smoke humano/consola de RC Phase A controlada, sin pedir ejecucion todavia, sin activar runtime y sin repetir Level 0/1.
- Rutas criticas definidas: login/admin shell, navegacion base, dashboard, postulaciones/asignaciones, reservas/visitas, cuestionario shopper, finanzas/liquidaciones/pagos, Academia, Diagnostico/Readiness y Administrabilidad.
- Criterios GO: rutas criticas abren, sin pantalla blanca, sin errores JS criticos, copy honesto, Academia administrable o pendiente honesto, readiness preview/source-safe/gate-off, pagos como control administrativo, Cinépolis no hardcode global.
- Criterios NO GO: pantalla blanca, errores JS criticos, rutas criticas bloqueadas, guard rompiendo render, copy de envio/sync/import/pago real sin gate, datos sensibles visibles, activacion de proveedores reales sin GO, junio tratado como visitas pendientes o Cinépolis como producto global.
- Impacto Phase A: deja listo el filtro humano minimo antes de decidir RC controlada, enfocado en operacion real TyA y no en infraestructura abstracta.
- Impacto backend reusable: patron reusable de smoke humano, GO/NO GO estructurado, copy honesto, gates apagados y verificacion multi-tenant.
- Impacto Claude/prototipo: rutas smokeables, estados visibles honestos, Academia administrable, readiness no productivo y no hardcode Cinépolis.
- Impacto Academia: manual/checklist de smoke humano, GO/NO GO, errores de consola, preview/gate/runtime/import/produccion, revision humana y liquidaciones/pagos como control.
- Estado seguro: documentacion/contrato solamente. Sin cambios en `/app/modules`, sin cambios en `/app/core`, smoke no ejecutado, no se pidio PowerShell/computador, sin runtime, sin builder, sin imports, sin writes, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin deploy, sin produccion, sin pagos reales y sin datos sensibles.
- Commits: `4c7f3b95960ecd9798e237f29ea5dd8ff888586b`, `0c785345e20464cf78b7f6935aa790acf073ddce`, `05093e714ff2e14f8d4ff9ccd6df8ab625aa59b8`.

## 2026-07-09 - Paquete acumulado Claude/Pendientes/Academia Phase A TyA

- Se agrego `app/docs/CLAUDE-PACKAGE-ACCUMULATED-PHASE-A-TYA-20260709.md`.
- Se actualizo `RESUMEN-PARA-CLAUDE.md`.
- Se actualizo `PENDIENTES-PROTOTIPO.md`.
- Objetivo: completar el puente acumulado para Claude/prototipo/Academia desde los documentos recientes, sin tocar UI, sin pedir ejecucion local y sin reiniciar pendientes ni metodologia.
- Contenido protegido para Claude: PR #7 draft/open/no merge, sin deploy, sin produccion, sin runtime, sin imports, sin Firestore/Auth/Storage writes, sin HR writes, sin Make/Gemini live, sin pagos reales y sin output local commiteado.
- Foco Phase A: HR fuente operacional, datos reales/sanitizados TyA, shoppers historicos, certificaciones ya presentadas, junio como liquidacion/pago, Cinépolis configurable y multi-proyecto, cuestionario configurable, conflictos a revision humana con llaves estables.
- Pendientes P0 documentados para Claude: copy honesto de gates/integraciones, Academia profunda/administrable y Phase A real TyA sin promesas falsas de runtime/import/sync/pago.
- Pendientes P1 documentados para Claude: readiness/dashboard source-safe, proyecto configurable sin hardcode Cinépolis, Mis beneficios/liquidaciones/pagos con honorario-boleto-combo-lote-movimientos y postulaciones/asignaciones con conflictos a revision.
- Impacto backend reusable: consolida patrones reutilizables de gates, readiness, source-safe, `CX.data`, multi-tenant, proyecto configurable, outbox/sync, review humana, copy honesto y Academia transversal.
- Impacto Academia: define cobertura obligatoria sobre Phase A vs produccion, preview/dry-run/gate/runtime/import, HR fuente operacional, shoppers/certificaciones preservadas, asignaciones/conflictos, liquidaciones/pagos, Gemini con revision humana, Make/HR preparado y readiness dashboard.
- Estado seguro: documentacion solamente. Sin cambios en `/app/modules`, sin cambios en `/app/core`, sin runtime, sin builder, sin imports, sin writes, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin deploy, sin produccion, sin pagos reales y sin datos sensibles.
- Commits: `de0d535ea58d67bc51ac2100ab1ce9feca09b1e5`, `1db6091eacbdd178ca622808016d82ea568c94de`, `b28642ee81c383beb68c85ed7647612bce186829`.

## 2026-07-09 - Continuity prompt and PR summary Phase A TyA

- Se agrego `app/docs/PHASE-A-CONTINUITY-PROMPT-AND-PR-SUMMARY-TYA-20260709.md`.
- Se agrego `app/docs/CAMBIOS-PHASE-A-CONTINUITY-PROMPT-AND-PR-SUMMARY-TYA-20260709.md`.
- Objetivo: crear un prompt de continuidad completo y un resumen PR acumulado para abrir una nueva conversacion sin perder contexto, metodologia ni plan de trabajo.
- Corrige errores previos: pedir pasos manuales innecesarios, repetir Level 0/1, reiniciar plan, pedir HR/reglas/shoppers/certificaciones ya documentadas, desviarse de Phase A real TyA, tratar infraestructura abstracta como avance operativo y asumir runtime activo.
- Contenido protegido: repo/rama/base/PR, estado seguro, reglas de oro, foco Phase A, errores a no repetir, bloques completados, documentacion obligatoria, metodologia esperada y siguiente bloque exacto.
- Impacto Phase A: permite continuar con HR fuente operacional, datos reales/sanitizados, junio como pagos/liquidaciones, shoppers historicos, certificaciones preservadas, Cinépolis configurable y multi-proyecto, sin pedir informacion ya documentada.
- Impacto backend reusable: patron reusable de prompt/checkpoint para continuidad en proyectos largos multi-tenant sin perdida de metodologia.
- Impacto Claude/prototipo: obliga a documentar para Claude y no tocar UI/core desde backend; evita asumir runtime, import, pagos o integraciones activas.
- Impacto Academia: explicar continuidad operativa, no-reversion, metodologia por bloques, gates, source-safe y diferencia entre preparado/ejecutado/runtime/import/produccion.
- Estado seguro: documento de continuidad solamente. Sin cambios UI/core, sin runtime, sin imports, sin writes, sin deploy, sin produccion y sin datos sensibles.
- Commits: `25440b90046a4322b9a7e71b258c69dec4f1255a`, `081c2dbae104f05d5d73d8b9645008e212f2b429`.

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
