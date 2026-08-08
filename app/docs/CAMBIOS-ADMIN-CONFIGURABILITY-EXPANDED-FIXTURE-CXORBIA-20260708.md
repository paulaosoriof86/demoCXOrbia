# Cambios - Admin Configurability Expanded Fixture CXOrbia

Fecha: 2026-07-08  
Bloque: fixture ampliado admin configurability + integracion runner/bridge  
Estado: documentado y seguro.

## Archivos creados

1. `tools/contracts/cxorbia-admin-configurability-expanded-fixture.mjs`
   - Tipo: fixture/runner preview-only.
   - Proposito: generar un manifest sintetico ampliado de administrabilidad por tenant/proyecto y validarlo con el contrato existente.
   - Exporta `expandedAdminConfigurabilityManifest()` y `runExpandedAdminConfigurabilityFixture()`.
   - CLI: imprime JSON por consola, sin escribir outputs por defecto.

2. `app/docs/ADMIN-CONFIGURABILITY-EXPANDED-FIXTURE-CXORBIA-20260708.md`
   - Tipo: documento funcional.
   - Proposito: documentar objetivo, dominios, reglas, impacto Phase A, Claude/prototipo, Academia y estado seguro.

3. `app/docs/CAMBIOS-ADMIN-CONFIGURABILITY-EXPANDED-FIXTURE-CXORBIA-20260708.md`
   - Tipo: bitacora puntual.
   - Proposito: registrar archivos y decisiones de este bloque.

## Archivos actualizados

1. `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs`
   - Se agrego `admin-configurability-expanded` como sample embebido.
   - Se agrego coverage `admin_configurability_expanded`.
   - Se actualizo version del runner.

2. `tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs`
   - Se agrego mapping de `admin-configurability-expanded` a `admin_configurability`.
   - Se fuerza como `human_review_required` / `pendiente revision humana`.
   - Se conserva gate `review_required` y sourceRef opaca.

## Dominios cubiertos

- projects;
- rules;
- hr_sources;
- questionnaires;
- documents;
- nda_templates;
- plans;
- evidence;
- certifications;
- academy;
- notifications;
- applications;
- shoppers;
- visits;
- reservations;
- assignments;
- rescheduling;
- cancellations;
- settlements;
- payments;
- integrations;
- make;
- gemini;
- imports;
- reports;
- roles_permissions;
- gates_audit.

## Impacto Claude/prototipo

Claude debe reflejar administrabilidad por dominio, acciones con motivo, versionado, gates, revision humana y estados honestos. Academia debe mostrar acciones administrativas visibles para archivar/borrar controlado, duplicar, versionar, cambiar estado y auditar motivo.

## Impacto Academia

Academia debe explicar administrabilidad por tenant/proyecto, curso/manual/checklist lifecycle, NDA versionado, planes versionados, gates, revision humana y provider preparado vs provider activo.

## Estado seguro

- Sin cambios en `/app/modules`.
- Sin cambios en `/app/core`.
- Sin deploy.
- Sin produccion.
- Sin runtime real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes reales.
- Sin Make/Gemini real.
- Sin correos/WhatsApp reales.
- Sin pagos reales.
- Sin import real.
- Sin datos sensibles.
