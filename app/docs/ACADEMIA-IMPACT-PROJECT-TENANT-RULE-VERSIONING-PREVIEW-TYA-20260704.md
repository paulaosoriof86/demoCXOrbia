# Academia impact - Project/tenant rule versioning preview TyA

Fecha: 2026-07-04

## Bloque relacionado

- `app/contracts/project-tenant-rule-versioning-preview-phase-a.tya.contract.json`
- `tools/migration/tya-project-tenant-rule-versioning-preview-validator.mjs`
- `app/docs/PROJECT-TENANT-RULE-VERSIONING-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`

## Objetivo Academia

Convertir el versionamiento de reglas por tenant/proyecto en aprendizaje operativo por rol, explicando por que una regla no debe sobrescribirse, como se revisa impacto, que requiere rollback y como se evitan activaciones reales por error.

## Rutas por rol

### Admin

Debe aprender:

- como revisar reglas por proyecto;
- como distinguir draft, review, approved preview y future active;
- como revisar impacto antes de aprobar;
- como pedir rollback/migracion;
- como evitar activar proveedor por error.

### Ops

Debe aprender:

- como un cambio de regla afecta visitas, agenda, franja, quincena, cuestionario y postulaciones;
- como reportar conflicto operativo;
- como validar que una regla nueva no rompa lo historico.

### Finanzas

Debe aprender:

- como revisar cambios de pais, moneda, reembolso, honorario, liquidacion y pago;
- por que cambios financieros requieren revision humana;
- como evitar que un cambio nuevo altere pagos historicos.

### Shopper

Debe aprender:

- que reglas nuevas pueden cambiar flujos futuros;
- que historial y pagos anteriores no deben modificarse silenciosamente;
- que cambios relevantes deben comunicarse con estados claros.

### Cliente

Debe aprender:

- que puede ver configuracion/resumen permitidos;
- que no controla reglas internas salvo permisos;
- como interpretar cambios de reglas visibles en reportes.

### Superadmin / consultora / aliado

Debe aprender:

- como versionar reglas por tenant/proyecto;
- como aprobar cambios breaking;
- como preparar migracion y rollback;
- como auditar gates de integracion;
- como evitar defaults globales no revisados.

## Manuales a crear o actualizar

1. Manual project rule versioning.
2. Manual rule impact review.
3. Manual migration and rollback.
4. Manual provider gate changes.
5. Manual payment and country rule changes.
6. Manual HR mapping and questionnaire routing changes.

## Lecciones requeridas

### Leccion 1 - Por que versionar reglas

Debe explicar que una regla afecta operaciones futuras y no debe cambiar historicos silenciosamente.

### Leccion 2 - Cambios breaking y no breaking

Debe explicar como diferenciar una adicion segura de un cambio que requiere migracion/rollback.

### Leccion 3 - Impacto operativo

Debe explicar impacto en visitas, HR, cuestionario, postulaciones, pagos, notificaciones, CRM, ranking y Academia.

### Leccion 4 - Provider gates

Debe explicar que una regla de integracion no activa Make, Gemini, correo, WhatsApp, Storage, HR ni Firestore real.

### Leccion 5 - Rollback

Debe explicar como preparar plan de reversa antes de activar cambios futuros.

## Checklists interactivos

### Antes de cambiar regla de proyecto

- Tenant/proyecto correcto.
- RuleSetType correcto.
- Version nueva.
- Estado draft/review.
- Impacto documentado.
- Sin datos sensibles.
- Sin activacion real.

### Antes de cambiar HR mapping o cuestionario

- Campo origen identificado.
- Preview validado.
- Sin romper historicos.
- Rollback preparado si es breaking.

### Antes de cambiar pago/pais/moneda

- Revision finanzas.
- Moneda/pais por proyecto.
- No altera pagos historicos.
- Liquidaciones futuras claras.

## Glosario requerido

- ruleSetId
- ruleSetVersion
- ruleSetType
- effectiveFrom
- effectiveTo
- migrationPlanId
- rollbackPlanId
- breaking_change_review_required
- blocked_real_activation
- active_future_only
- deprecated_preview

## Estado seguro

Documento academico. No activa runtime, no modifica reglas reales, no escribe Firestore/Storage, no llama Make/Gemini, no activa proveedores y no cambia frontend.
