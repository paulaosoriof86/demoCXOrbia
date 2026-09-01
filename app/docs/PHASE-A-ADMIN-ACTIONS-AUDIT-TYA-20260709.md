# Phase A admin actions audit TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Formalizar las acciones administrativas que la plataforma debe permitir operar en Phase A con auditoria, gates y alcance tenant/proyecto, sin activar writes reales, runtime, imports, HR writes, Make/Gemini ni pagos reales.

Este bloque responde a la regla operativa: los modulos y opciones deben ser administrables y operables desde plataforma, pero con auditoria, gates y control por tenant/proyecto.

## Archivos agregados

- `backend/contracts/phase-a-admin-actions-audit-contract-v1.json`
- `tools/contracts/tya-phase-a-admin-actions-audit-validate.mjs`

## Principios

- Todas las acciones administrativas requieren auditoria.
- Todas las acciones quedan con `writesAllowedNow=false` hasta gate final.
- No se permiten hard deletes.
- Solo anulacion/correccion logica con razon y before/after.
- Toda accion debe estar limitada por `tenantId` y `projectId`.
- No se permite deduplicacion visual ni por nombre.
- Conflictos requieren revision humana.
- Runtime switch requiere GO explicito de Paula.

## Campos obligatorios de auditoria

- `auditId`
- `tenantId`
- `projectId`
- `actorUid`
- `actorRole`
- `action`
- `entityType`
- `entityId`
- `beforeState`
- `afterState`
- `reasonCode`
- `source`
- `sourceRef`
- `idempotencyKey`
- `correlationId`
- `createdAt`
- `gateStatus`

Campos seguros opcionales:

- `visitId`
- `hrRowId`
- `shopperId`
- `assignmentSource`
- `assignmentSyncStatus`
- `lastSyncedAt`
- `reviewQueueId`
- `notesSafe`
- `metadataSafe`

No se permite guardar datos sensibles en auditoria: DPI, banco, telefono, email, nombre crudo, webhook Make, API key Gemini, token de pago ni evidencias binarias.

## Acciones contratadas

### Postulaciones y asignacion

- `approve_application`: aprueba postulacion y deja asignacion pendiente de sync HR.
- `reject_application`: rechaza postulacion sin borrar trazabilidad.
- `reflect_platform_assignment_to_hr`: prepara reflejo plataforma -> HR, sin write real.
- `reflect_hr_assignment_to_platform`: prepara reflejo HR -> plataforma, sin write real.
- `resolve_sync_conflict`: resuelve conflicto con revision humana y razon obligatoria.

### Agenda y visita

- `request_reschedule`: solicita reprogramacion.
- `approve_reschedule`: aprueba reprogramacion si cumple franja/quincena.
- `mark_completed`: marca visita realizada, sin fecha futura.
- `mark_questionnaire_completed`: marca cuestionario completado segun ruta configurable.
- `mark_submitted_by_tya`: marca submitido TyA/HR y habilita liquidacion candidata.

### Certificaciones

- `preserve_certification`: conserva certificacion ya presentada y evita pedirla de nuevo.
- `mark_certification_review_required`: envia a revision sin descertificar automaticamente.

### Liquidaciones y pagos

- `create_liquidation_candidate`: crea candidata de liquidacion tras submitido.
- `mark_payment_review`: mueve control a revision de pago.
- `schedule_payment_control`: programa/reprograma pago como control administrativo.
- `confirm_external_payment`: registra confirmacion externa con auditoria. CXOrbia no ejecuta pago.

### Correcciones

- `annul_or_correct_admin_state`: anulacion/correccion logica, nunca hard delete.

## Hard stops

- Falta de llave estable.
- Intento de hard delete.
- Intento de write antes de gate.
- Duplicacion de asignacion sin conflicto.
- Deduplicacion por nombre/coincidencia visual.
- Pedido de certificacion ya presentada sin revision.
- Pago marcado como real sin confirmacion externa.
- Token/proveedor de pago activo.
- Webhook Make activo.
- Runtime switch sin GO explicito.

## Validador

Uso tecnico futuro:

```bash
node tools/contracts/tya-phase-a-admin-actions-audit-validate.mjs --out .tmp/tya-phase-a-admin-actions-audit
```

El validador solo revisa contrato. No llama proveedores, no escribe base, no importa, no despliega y no cambia runtime.

## Interpretacion

### GO_ADMIN_ACTIONS_AUDIT_CONTRACTED_NO_WRITES

Las acciones administrativas quedan contratadas como futura operacion auditable, sin writes reales.

### NO_GO_ADMIN_ACTIONS_AUDIT_BLOCKED

Corregir solo causa raiz contractual. No activar writes, runtime, imports ni deploy.

## Impacto Claude/prototipo

Claude debe representar estas acciones como botones/operaciones administrables futuras con estados honestos:

- preparar, revisar, resolver, conservar, programar, confirmar externamente;
- no enviar, no pagar, no sincronizar real, no importar real si el gate no esta activo;
- mostrar cola de conflictos y razon requerida;
- mostrar auditoria/bitacora cuando haya acciones administrativas.

Si el prototipo necesita cambios visuales, deben documentarse para Claude, no parcharse desde backend.

## Impacto Academia

Academia debe explicar:

- que significa accion administrativa auditable;
- diferencia entre preparar accion y ejecutar write real;
- por que no se borra fisicamente;
- por que toda resolucion de conflicto requiere razon;
- por que los pagos son control administrativo y no ejecucion financiera;
- por que datos sensibles no van en auditoria.

## Estado seguro

- Sin cambios en `/app/modules` o `/app/core`.
- Sin runtime conectado.
- Sin deploy.
- Sin produccion.
- Sin Firestore/Auth/Storage.
- Sin HR writes.
- Sin Make/Gemini.
- Sin correos/WhatsApp reales.
- Sin pagos reales.
- Sin import real.
- Sin datos sensibles.
