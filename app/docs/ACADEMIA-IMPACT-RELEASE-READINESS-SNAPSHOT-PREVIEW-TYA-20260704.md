# Academia impact - Release readiness snapshot preview TyA

Fecha: 2026-07-04

## Bloque relacionado

- `app/contracts/release-readiness-snapshot-preview-phase-a.tya.contract.json`
- `tools/migration/tya-release-readiness-snapshot-preview-validator.mjs`
- `app/docs/RELEASE-READINESS-SNAPSHOT-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`

## Objetivo Academia

Convertir release readiness en aprendizaje operativo por rol, para que preview-ready no se confunda con produccion-ready y para que cada bloqueo tenga explicacion, responsable y siguiente accion.

## Rutas por rol

### Superadmin

Debe aprender:

- como leer snapshot de readiness;
- como distinguir preview-ready de production-ready;
- como validar gates;
- como bloquear activacion real;
- como preparar aprobacion futura sin saltarse controles.

### Admin

Debe aprender:

- como interpretar areas listas, pendientes y bloqueadas;
- como diferenciar prototype pending, backend pending y source/data pending;
- como priorizar pendientes Claude o backend;
- como confirmar que un feature no esta conectado aun.

### Ops

Debe aprender:

- como readiness afecta agenda, postulaciones, visitas, cuestionario y revision;
- que significa missing input;
- que hacer cuando un flujo esta pending backend.

### Finanzas

Debe aprender:

- como leer readiness de liquidaciones, pagos, reembolsos, movimientos y datos sensibles;
- por que pagos reales y bancos siguen bloqueados hasta gate.

### Shopper

Debe aprender:

- que estados preview/pending no son errores personales;
- que features futuras no significan comunicacion enviada ni pago confirmado.

### Cliente

Debe aprender:

- que solo se le muestra resumen permitido;
- que readiness interno no debe exponer datos privados ni detalles tecnicos sensibles.

## Manuales a crear o actualizar

1. Manual release readiness.
2. Manual gate statuses.
3. Manual preview vs production.
4. Manual blockers y missing input.
5. Manual manual review.
6. Manual release governance.

## Lecciones requeridas

### Leccion 1 - Preview-ready no es production-ready

Debe explicar que un validador preview puede estar listo aunque Firestore/Make/Gemini/Storage/email/WhatsApp sigan apagados.

### Leccion 2 - Como leer blockers

Debe explicar missing input, sensitive data, real gate off, prototype pending, conflict y manual review.

### Leccion 3 - Readiness por area

Debe explicar areas: HR, assignment, lifecycle, postulacion, notification, email, CRM, shopper history, ranking, rules, changelog, payments, Academia y release governance.

### Leccion 4 - Gates

Debe explicar por que deploy, merge, import, writes, providers y pagos reales no se activan desde preview.

### Leccion 5 - Cierre de bloque

Debe explicar que cada cierre debe declarar bloque, archivos, estado seguro, pendientes, impacto Academia y siguiente bloque.

## Checklists interactivos

### Antes de marcar area ready

- Validator existe.
- Gate verificado.
- Input seguro si aplica.
- Sin datos sensibles.
- Sin promesa de produccion.
- Academia actualizada o marcada pendiente.

### Antes de pedir activacion real futura

- Source lock formal.
- Plan de produccion.
- Rollback.
- Reglas Firestore/Storage.
- Credenciales fuera del repo.
- Aprobacion humana.

### Antes de cerrar blocker

- Causa documentada.
- Responsable definido.
- Evidencia segura.
- Tracker actualizado.

## Glosario requerido

- snapshotId
- readinessArea
- readinessStatus
- gateStatus
- blockingReason
- preview_ready
- blocked_missing_input
- blocked_real_gate_off
- blocked_prototype_pending
- manual_review_required
- approved_preview_only

## Estado seguro

Documento academico. No activa runtime, no despliega, no hace merge, no escribe Firestore/Storage, no llama Make/Gemini, no envia comunicaciones y no cambia frontend.
