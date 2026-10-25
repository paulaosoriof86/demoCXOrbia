# Phase A operational state machine TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Formalizar la maquina de estados operacional Phase A para TyA/Cinepolis sin tocar `/app/modules`, sin tocar `/app/core`, sin conectar runtime y sin ejecutar writes. Este bloque evita seguir avanzando con documentos sueltos y deja una base clara para sincronizacion HR/plataforma, certificaciones preservadas, rutas de cuestionario y control de liquidaciones/pagos.

## Archivos agregados

- `backend/contracts/phase-a-operational-state-machine-v1.json`
- `tools/contracts/tya-phase-a-operational-state-machine-validate.mjs`

## Alcance Phase A

Este contrato cubre:

1. Estados de asignacion/postulacion.
2. Sincronizacion HR -> plataforma.
3. Sincronizacion plataforma -> HR.
4. Conflictos con revision humana.
5. Agenda, reprogramacion, realizada, cuestionario y submitido.
6. Liquidacion candidata y control de pago.
7. Certificaciones ya presentadas y nuevas/revisadas.
8. Rutas de cuestionario configurables por proyecto o visita.
9. Acciones administrativas futuras con auditoria y gates.

## Llaves estables obligatorias

El contrato exige:

- `tenantId`
- `projectId`
- `visitId`
- `hrRowId`
- `shopperId`
- `assignmentSource`
- `assignmentSyncStatus`
- `lastSyncedAt`

No se permite deduplicar por coincidencia visual ni por nombre. Si hay conflicto, entra a `sync_conflict_review`.

## Estados principales de asignacion

- `available`: visita disponible.
- `application_pending`: postulacion pendiente.
- `application_rejected`: postulacion rechazada con trazabilidad.
- `assigned_from_platform_pending_hr_sync`: plataforma asigno; HR aun pendiente.
- `assigned_from_hr_pending_platform_sync`: HR asigno; plataforma aun pendiente.
- `assigned_synced`: asignacion reconciliada entre HR y plataforma.
- `sync_conflict_review`: conflicto, revision humana, no sobrescribir.
- `scheduled`: agendada.
- `reschedule_requested`: reprogramacion pendiente.
- `completed`: visita realizada.
- `questionnaire_completed`: cuestionario completado/marcado.
- `submitted_by_tya`: submitido confirmado por TyA/HR.
- `liquidation_candidate`: candidata a liquidacion.
- `payment_review`: control de pago en revision.
- `payment_scheduled`: pago programado/reprogramado como control.
- `payment_confirmed_external`: pago confirmado externamente con auditoria, no ejecutado por CXOrbia.

## Certificaciones

Estados:

- `preserved_already_presented`: ya presentada, no pedir de nuevo.
- `required_new_or_expired`: requiere certificacion por regla nueva o falta evidencia.
- `passed`: aprobada.
- `review_required`: revisar antes de bloquear o pedir repetir.

Regla fuerte: una certificacion ya presentada no se debe pedir de nuevo sin revision.

## Liquidaciones y pagos junio

Reglas:

- Las visitas hasta junio se tratan como ejecutadas cuando corresponda segun HR.
- Lo pendiente de junio es control de pago/liquidacion, no visitas nuevas.
- `liquidation_candidate` no equivale a deuda final ni pago real.
- `payment_review` y `payment_scheduled` son control administrativo.
- `payment_confirmed_external` requiere auditoria y confirmacion externa; CXOrbia no ejecuta pagos.

## Cuestionarios

Modos admitidos:

- `cxorbia`
- `tya_online`
- `external_platform`
- `general_link`
- `hr_visit_link`

La ruta se configura por proyecto o visita; Cinépolis no puede quedar como logica global unica.

## Conflictos

Conflictos tipificados:

- `assignment_source_conflict`
- `shopper_identity_review_required`
- `visit_key_collision`
- `payment_status_conflict`
- `certification_preservation_mismatch`

Todo conflicto se revisa con humano. No se sobrescribe silenciosamente.

## Acciones administrativas futuras

Preparadas como contrato, no activas para writes:

- aprobar postulacion;
- reflejar asignacion HR;
- resolver conflicto;
- preservar certificacion;
- marcar estado de control de pago.

Todas requieren auditoria. En este bloque `writesAllowedNow=false`.

## Validador

Uso tecnico futuro:

```bash
node tools/contracts/tya-phase-a-operational-state-machine-validate.mjs --out .tmp/tya-phase-a-operational-state-machine
```

El validador solo revisa contrato. No llama proveedores, no escribe base, no importa, no despliega y no cambia runtime.

## Interpretacion

### GO_PHASE_A_STATE_MACHINE_CONTRACTED_NO_RUNTIME

La maquina de estados queda lista como contrato backend para seguir Phase A sin repetir Level 0/1 y sin runtime.

### NO_GO_PHASE_A_STATE_MACHINE_BLOCKED

Corregir solo causa raiz contractual. No repetir Level 0/1, no pedir datos ya documentados, no importar, no escribir y no desplegar.

## Impacto Claude/prototipo

Claude debe reflejar esta logica como comportamiento administrable futuro, no como integracion ya activa:

- estados honestos;
- conflictos visibles;
- no duplicar visitas;
- no deduplicar por nombre;
- certificaciones preservadas;
- pagos como control;
- cuestionario configurable;
- Cinépolis como proyecto configurable.

## Impacto Academia

Academia debe explicar:

- flujo de estados;
- asignacion desde HR vs plataforma;
- sincronizacion y conflictos;
- certificaciones preservadas;
- liquidaciones y pagos como control;
- diferencia entre accion preparada, preview, write real y produccion.

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
