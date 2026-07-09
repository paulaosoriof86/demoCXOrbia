# CAMBIOS-BACKEND.md

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

## 2026-07-09 - State machine operacional Phase A TyA

- Se agrego `backend/contracts/phase-a-operational-state-machine-v1.json`.
- Se agrego `tools/contracts/tya-phase-a-operational-state-machine-validate.mjs`.
- Se agrego `app/docs/PHASE-A-OPERATIONAL-STATE-MACHINE-TYA-20260709.md`.
- Objetivo: formalizar la maquina de estados operacional Phase A para asignaciones, sincronizacion HR/plataforma, certificaciones preservadas, cuestionario configurable y liquidaciones/pagos como control, sin tocar UI ni runtime.
- Estados cubiertos: disponible, postulacion pendiente/rechazada, asignacion desde plataforma pendiente HR, asignacion desde HR pendiente plataforma, asignacion sincronizada, conflicto en revision, agendada, reprogramacion, realizada, cuestionario completado, submitido TyA, liquidacion candidata, pago en revision, pago programado y pago confirmado externamente.
- Llaves obligatorias: `tenantId`, `projectId`, `visitId`, `hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`.
- Guardrail: no deduplicar por coincidencia visual/nombre; conflicto siempre va a revision humana; no sobrescribir silenciosamente.
- Certificaciones: `preserved_already_presented` no debe pedirse nuevamente sin revision.
- Pagos: junio queda como control de liquidacion/pago, no pago real ejecutado por CXOrbia.
- Cuestionario: ruta configurable por proyecto/visita con modos `cxorbia`, `tya_online`, `external_platform`, `general_link`, `hr_visit_link`.
- Impacto Phase A: permite avanzar operacion real controlada con un contrato claro de estados sin repetir Level 0/1.
- Impacto backend reusable: state machine reusable por tenant/proyecto para futuros clientes CXOrbia.
- Impacto Claude/prototipo: Claude debe representar estados honestos, conflictos visibles, certificaciones preservadas, pagos como control y Cinépolis como proyecto configurable, no como logica unica.
- Impacto Academia: explicar flujo de estados, sync HR/plataforma, conflictos, certificaciones preservadas, pagos como control y diferencia entre accion preparada, preview, write real y produccion.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
- Commits: `47da58c7219ec7aa6f0aa409f42e6aac6e421354`, `77b0a7e1f127947fe9beb15c308c5f51dc742e54`, `f68b082e9cd06c7ae89dc0f3dbe4aba71489c97f`.

## 2026-07-09 - Gate continuidad operacional Phase A TyA

- Se agrego `backend/contracts/phase-a-operational-continuity-gate-v1.json`.
- Se agrego `tools/contracts/tya-phase-a-operational-continuity-gate.mjs`.
- Se agrego `app/docs/PHASE-A-OPERATIONAL-CONTINUITY-GATE-TYA-20260709.md`.
- Objetivo: avanzar en Phase A real controlada con un gate source-safe que consolida no-reversion Level 0/1, HR source-safe/full-flow, sync HR/plataforma, certificaciones preservadas, liquidaciones/pagos de junio, cuestionario configurable, proyecto configurable y bloqueo de runtime/import/deploy.
- Decision: el gate no ejecuta proveedores, no escribe base, no importa, no despliega y no cambia runtime; solo valida presencia documental/contractual y hard-stops para continuar sin repetir procesos.
- Guardrail: no permite interpretar fixtures sinteticos ni outputs derivados de `.tmp` como evidencia real TyA. Level 2 solo puede usarse para siguiente gate si proviene de fuente original real/sanitizada.
- Impacto Phase A: permite continuar bloque largo de produccion real controlada sin volver a pedir datos ya documentados ni reiniciar Level 0/1.
- Impacto backend reusable: patron de continuidad operacional por tenant/proyecto reusable para futuros clientes CXOrbia.
- Impacto Claude/prototipo: mantener copy honesto, no mostrar demo/fixture/preview tecnico como real, y preservar configurabilidad multi-proyecto.
- Impacto Academia: explicar no-reversion, fixture vs fuente original, outputs derivados, HR source-safe, sync con conflictos, certificaciones preservadas y pagos como control.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
- Commits: `de10aa67a3ad1ed369f16005185025047f297ce9`, `4718163a05b0c0136f751e1a9aaacd70fab17464`, `bdccc61640015703c48205d448a97adf0457afa3`.

## 2026-07-09 - Checkpoint real-data preview alineado con no-reproceso

- Se actualizo `app/docs/CHECKPOINT-OPERATIVO-REALDATA-PREVIEW-TYA-20260709.md`.
- Objetivo: alinear el checkpoint operativo con la decision no-reversion/no-reproceso para que no vuelva a interpretarse Level 0/1 como trabajo pendiente por repetir.
- Cambio documental: se agrego seccion no-reproceso/no-reversion, se ajustaron bloqueos actuales y se aclaro que ejecucion local solo aplica para validacion puntual de fuentes que existen unicamente en la computadora de Paula.
- Decision: Level 0 queda superado para readiness de proyecto/periodos. Level 1 ya fue trabajado previamente y solo debe validarse puntualmente contra fuente original segura, sin reiniciar metodologia.
- Guardrail: Level 2 solo habilita siguiente gate si proviene de fuente original real/sanitizada, no de fixture ni output derivado de `.tmp`.
- Impacto Phase A: mantiene avance hacia produccion real controlada sin repetir procesos y sin desbloquear runtime/produccion.
- Impacto backend reusable: consolida patron no-reversion aplicado a checkpoints operativos.
- Impacto Claude/prototipo: refuerza copy honesto y evita presentar demo/fixture/preview tecnico como TyA real.
- Impacto Academia: agregar criterio de no-reversion y diferencia entre fuente original, fixture y output derivado.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
- Commit: `146396495d02e469947d6c977c0b8078d423451d`.

## 2026-07-09 - Checkpoint no reversion Level 0 / Level 1 Phase A TyA

- Se agrego `app/docs/CHECKPOINT-NO-REVERSION-LEVEL0-LEVEL1-PHASE-A-TYA-20260709.md`.
- Objetivo: registrar que no se deben revertir ni repetir procesos ya superados de Level 0 / Level 1, y que el plan debe continuar encaminado a Phase A real controlada sin reiniciar metodologia.
- Decision: Level 0 manifesto/source-safe queda reconocido como superado para readiness de proyecto/periodos. Level 1 ya habia sido trabajado previamente dentro del pipeline y no debe repetirse desde cero salvo validacion puntual de no regresion.
- Aclaracion: las correcciones recientes no fueron una reversion funcional de Level 0/1; fueron hardening de gates para impedir falsos positivos con fixtures sinteticos u outputs derivados de `.tmp`.
- Guardrail: no usar `tools/migration/synthetic-fixtures/phase-a/*` ni `.tmp` generado por preflights/recoveries anteriores como evidencia real-data original.
- Siguiente linea: continuar desde HR source-safe/full-flow y outputs originales seguros, sin volver a pedir HR/reglas/shoppers/certificaciones/liquidaciones ya documentadas salvo que falte una fuente local concreta y segura.
- Impacto Phase A: continuidad de produccion real controlada, sin repetir Level 0/1 ni avanzar a runtime DEV con evidencia no original.
- Impacto backend reusable: patron no-reversion de gates y separacion formal entre fixture, output derivado y fuente real sanitizada.
- Impacto Claude/prototipo: mantener copy honesto; no presentar fixtures, demo ni preview tecnico como TyA real.
- Impacto Academia: explicar diferencia entre Level 0, Level 1, Level 2, fixtures, outputs derivados y fuente real sanitizada.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
- Commit: `47121f64c64798f4a8c41c768c0e9cfe478f926d`.

## 2026-07-09 - Fix recovery Level 1 excluye fixtures sinteticos por defecto

- Se modifico `tools/contracts/tya-local-level1-recovery-preflight.mjs`.
- Motivo: el recovery local encontro archivos bajo `tools/migration/synthetic-fixtures/phase-a/` y los valido como candidatos Level 1/Level 2. Eso sirve para pruebas de contrato, pero no puede contarse como real-data preview de TyA.
- Cambio aplicado: el recovery ahora excluye fixtures sinteticos por defecto y solo los considera si se ejecuta explicitamente con `--allow-synthetic`, reservado para contract testing, no para evidencia real-data.
- Impacto Phase A: evita falso avance a DEV runtime preview usando datos sinteticos. El estado correcto queda: Level 0 real/source-safe GO; Level 1/Level 2 reales siguen bloqueados hasta recuperar/generar output HR source-safe local no sintetico.
- Impacto backend reusable: diferencia formal entre `realdata_only_default` y `allow_synthetic_contract_test`.
- Impacto Claude/prototipo: el prototipo no debe mostrar datos sinteticos como TyA real; copy debe distinguir fixture/preview/demo vs fuente real/sanitizada.
- Impacto Academia: agregar explicacion de fixture sintetico vs output sanitizado real, y por que un gate tecnico verde no autoriza produccion si la fuente es sintetica.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
- Commit: `f25d6d5edb6052e9d6e13d74aa4198fba07fdbab`.
