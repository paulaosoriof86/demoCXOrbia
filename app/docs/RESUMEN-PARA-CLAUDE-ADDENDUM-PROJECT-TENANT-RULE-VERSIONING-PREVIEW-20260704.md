# Resumen para Claude addendum - Project/tenant rule versioning preview

Fecha: 2026-07-04

## Que hizo backend

Backend preparo contrato y validator preview para versionamiento transversal de reglas/configuraciones por tenant y proyecto.

Archivos agregados:

- `app/contracts/project-tenant-rule-versioning-preview-phase-a.tya.contract.json`
- `tools/migration/tya-project-tenant-rule-versioning-preview-validator.mjs`
- `app/docs/PROJECT-TENANT-RULE-VERSIONING-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-PROJECT-TENANT-RULE-VERSIONING-PREVIEW-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-PROJECT-TENANT-RULE-VERSIONING-PREVIEW-20260704.md`

No se activo runtime, Firestore, Make, Gemini ni reglas reales.

## Reglas que debe reflejar el prototipo

1. La configuracion por proyecto debe ser versionada.
2. No se deben sobrescribir reglas activas silenciosamente.
3. Debe mostrarse draft, review, approved preview, future active, deprecated, blocked y rollback required.
4. Una regla de integracion no significa proveedor activo.
5. Cambios de HR mapping/cuestionario/pago/pais/moneda requieren revision humana.
6. Cambios breaking requieren migration plan y rollback plan.
7. No se debe usar una regla de proyecto como default global SaaS sin revision.
8. Academia debe explicar impactos y no solo listar configuraciones.

## Pendientes frontend concretos

### Configuracion por proyecto

- Mostrar `ruleSetId`, `ruleSetVersion`, `ruleSetType`, estado y vigencia.
- Mostrar historial de versiones.
- Mostrar impacto del cambio por modulo.
- Mostrar si requiere revision humana.
- Mostrar si requiere migracion/rollback.
- No permitir lenguaje de activo/conectado si el gate esta apagado.

### Impacto operacional

- Visitas/lifecycle.
- HR mapping.
- Cuestionario routing.
- Ficha postulacion.
- Certificacion.
- Notificaciones/templates.
- Email/mailbox.
- CRM folder refs.
- Shopper communication history.
- Liquidaciones/pagos/reembolsos.
- Ranking/scoring.
- Academia.

## Academia que Claude debe actualizar

- Curso Admin: project configuration y rule impact review.
- Curso Ops: cambios que afectan visitas, agenda y cuestionarios.
- Curso Finanzas: cambios de moneda, pais, pago, honorario y reembolso.
- Curso Superadmin: versionamiento, migration y rollback.
- Manual project rule versioning.
- Manual migration and rollback.
- Manual provider gate changes.
- Checklist antes de cambiar regla.
- Checklist antes de activar regla futura.
- Glosario: ruleSetId, ruleSetVersion, ruleSetType, migrationPlanId, rollbackPlanId.

## No tocar

- `tools/migration`.
- `app/contracts`.
- Gates backend.
- Firestore/Make/Gemini reales.
- Configuracion real de proveedores.
- Datos reales o sensibles.

## Estado seguro

Documento/validator backend. No autoriza produccion, deploy, import real, escrituras reales, IA real, providers reales ni cambios historicos reales.
