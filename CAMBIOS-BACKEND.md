# CAMBIOS-BACKEND.md

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
