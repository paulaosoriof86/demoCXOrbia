# Cambios - Reusable Backend to Claude Coverage Contract CXOrbia

Fecha: 2026-07-08  
Bloque: garantizar handoff de patrones backend reutilizables a Claude/prototipo y Academia  
Estado: documentado y seguro.

## Archivos creados

1. `tools/contracts/cxorbia-reusable-backend-to-claude-coverage-contract.mjs`
   - Tipo: contrato preview-only.
   - Proposito: validar que cada patron backend reusable tenga instrucciones explicitas para Claude/prototipo, Academia, nuevos clientes y GO/NO GO.
   - Exporta `sampleManifest()` y `validateReusableBackendToClaudeCoverage()`.
   - CLI: imprime JSON por consola, sin escribir outputs por defecto.

2. `app/docs/REUSABLE-BACKEND-TO-CLAUDE-COVERAGE-CONTRACT-CXORBIA-20260708.md`
   - Tipo: documento funcional.
   - Proposito: documentar objetivo, patrones, validaciones, impacto Claude, Academia y nuevo cliente.

3. `app/docs/CAMBIOS-REUSABLE-BACKEND-TO-CLAUDE-COVERAGE-CONTRACT-CXORBIA-20260708.md`
   - Tipo: bitacora puntual.
   - Proposito: registrar archivos y decisiones de este bloque.

## Archivos actualizados

1. `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs`
   - Se agrego `reusable-backend-to-claude-coverage` como sample embebido.
   - Se agrego coverage `backend_to_claude_reusable_coverage`.
   - Se actualizo version del runner.

2. `tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs`
   - Se agrego mapping de `reusable-backend-to-claude-coverage` a `academy`.
   - Se fuerza como `human_review_required` / `pendiente revision humana`.
   - Se conserva gate `review_required` y sourceRef opaca.

## Patrones cubiertos

- multi tenant project config;
- admin configurability;
- academy admin actions;
- conflict review/import readiness;
- readiness dashboard source-safe;
- synthetic input pack runner;
- questionnaire routing;
- visit lifecycle;
- settlement/payment eligibility;
- evidence storage gate;
- historical import clean;
- assignment sync HR/plataforma;
- notification outbox gates;
- rule versioning/changelog;
- sensitive data policy;
- provider agnostic integrations.

## Decision tecnica

El contrato garantiza que cada patron reusable tenga backendArtifacts, prototypeInstructions, academyInstructions, tenantProjectApplicability, claudeDeliveryExpectation, goNoGoCriteria y safeState. Si falta alguno, el resultado es NO_GO.

## Impacto Claude/prototipo

Claude debe recibir estos patrones como requisitos operativos de UI/copy/estado/GO-NO GO, no solo como notas tecnicas. Esto aplica tambien a futuras candidatas y a configuracion de nuevos clientes.

## Impacto Academia

Academia debe convertir cada patron reusable en curso/manual/checklist/ruta por rol cuando aplique.

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
