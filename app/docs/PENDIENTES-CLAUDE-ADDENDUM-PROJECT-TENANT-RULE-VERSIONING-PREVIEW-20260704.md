# Pendientes Claude addendum - Project/tenant rule versioning preview

Fecha: 2026-07-04

## Origen

Backend agrego contrato y validador preview para versionamiento transversal de reglas/configuraciones por tenant y proyecto. Este documento lista pendientes frontend/prototipo para Claude.

## Pendientes configuracion UI

1. Mostrar versionado de reglas por proyecto.
2. Mostrar `ruleSetId`, `ruleSetVersion`, `ruleSetType` y estado.
3. Mostrar draft/review/approved preview/future active/deprecated/blocked.
4. Mostrar historial de versiones.
5. No sobrescribir configuraciones activas silenciosamente.
6. Mostrar impacto por modulo.
7. Mostrar migration/rollback required cuando aplica.

## Pendientes estados honestos

1. No decir integracion activa si solo hay version de regla.
2. No decir Make/Gemini/email/WhatsApp/Storage/HR conectado si el gate esta apagado.
3. No decir regla activa si solo es preview.
4. Mostrar provider pending o gate apagado.
5. Mostrar revision humana requerida para cambios de alto impacto.

## Pendientes impacto operacional

1. HR mapping.
2. Questionnaire routing.
3. Postulation form.
4. Certification rules.
5. Visit lifecycle.
6. Assignment sync.
7. Notification templates.
8. Email mailbox policy.
9. CRM folder refs policy.
10. Shopper communication policy.
11. Liquidation/payment/reimbursement rules.
12. Ranking/scoring rules.
13. Academia content policy.

## Pendientes Academia

1. Curso Admin: project configuration y rule impact review.
2. Curso Ops: cambios que afectan visitas, agenda y cuestionario.
3. Curso Finanzas: cambios de moneda/pago/reembolso.
4. Curso Superadmin: versionamiento, migracion y rollback.
5. Manual project rule versioning.
6. Manual migration and rollback.
7. Manual provider gate changes.
8. Checklist antes de cambiar regla.
9. Checklist antes de activar regla futura.
10. Glosario de rule versioning.

## No corresponde a Claude

- Implementar validator backend.
- Activar providers reales.
- Escribir Firestore.
- Ejecutar Make/Gemini.
- Procesar datos reales.
- Modificar `tools/migration` o `app/contracts`.

## Prioridad

P0: evitar sobrescritura silenciosa y promesas de integraciones activas.

P1: mostrar versionado, impacto y rollback/migracion.

P2: Academia profunda con manuales, checklists y glosario.
