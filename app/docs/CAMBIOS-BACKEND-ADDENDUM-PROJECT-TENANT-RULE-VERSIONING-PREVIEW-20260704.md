# Cambios backend addendum - Project/tenant rule versioning preview

Fecha: 2026-07-04

## Bloque completado

Contrato y preview validator transversal de versionamiento de reglas/configuraciones por tenant y proyecto, trabajando sobre la ultima baseline auditada de continuidad backend.

## Archivos creados

1. `app/contracts/project-tenant-rule-versioning-preview-phase-a.tya.contract.json`
   - Tipo: nuevo.
   - Que cambia: define contrato source-safe para versionar reglas operativas por tenant/proyecto sin hard-codear, sin sobrescribir reglas activas y sin activar produccion.
   - Por que: tras completar ranking/scoring, el tracker recomendaba avanzar con contrato transversal de versionamiento si no habia input source-safe para ejecutar validators previos.

2. `tools/migration/tya-project-tenant-rule-versioning-preview-validator.mjs`
   - Tipo: nuevo.
   - Que cambia: agrega validador Node que revisa contratos y opcionalmente un JSON local sintetico/sanitizado con ruleSets.
   - Por que: permite clasificar rule version preview ready, human review required, breaking change, payload sensible, activacion real bloqueada, migration/rollback required y conflicto.

3. `app/docs/PROJECT-TENANT-RULE-VERSIONING-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta objetivo, entrada segura, ruleSet types, outcomes, reglas, pendientes backend, pendientes Claude, impacto Academia y estado seguro.

4. `app/docs/ACADEMIA-IMPACT-PROJECT-TENANT-RULE-VERSIONING-PREVIEW-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta rutas por rol, manuales, lecciones, checklists y glosario para Academia.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin import real.
- Sin Firestore writes.
- Sin Make real.
- Sin Gemini real.
- Sin activacion de proveedor.
- Sin cambio historico real.
- Sin datos sensibles.

## Phase A que avanza

- Las reglas de proyecto quedan versionables y auditables.
- No se sobreescriben reglas activas silenciosamente.
- Cambios breaking requieren migrationPlanId y rollbackPlanId.
- Cambios de pais/moneda/pago, integracion, HR mapping y cuestionario requieren revision humana.
- Una version de regla no activa proveedores reales.
- Se evita convertir una regla de proyecto en default global SaaS sin revision.

## Pendientes backend derivados

1. Preparar input local sintetico/sanitizado de ruleSets.
2. Integrar este validator en una secuencia local segura.
3. Definir mapa de ruleSetType a modulo afectado.
4. Preparar payload futuro para UI de configuracion por proyecto sin activar runtime.
5. Relacionar versionamiento de reglas con Academia, notificaciones y changelog.

## Pendientes prototipo/Claude derivados

1. UI de configuracion debe mostrar draft/review/future active/deprecated, no sobrescritura silenciosa.
2. Mostrar impacto de cambios en visitas, HR, cuestionario, pagos, notificaciones, CRM, ranking y Academia.
3. No decir proveedor activo si solo existe version de regla.
4. Mostrar migration/rollback required para breaking changes.
5. Academia debe explicar versionamiento de reglas y revision de impacto.

## Impacto Academia

Se creo documento especifico para Academia sobre versionamiento de reglas, cambios breaking/no breaking, revision de impacto, rollback, provider gates, cambios de pago/pais/moneda, HR mapping y cuestionario.

## Siguiente bloque recomendado

Preparar input sintetico/sanitizado para ejecutar validators previos o crear contrato/payload preview de changelog/notificaciones de cambios de reglas sin activar runtime.
