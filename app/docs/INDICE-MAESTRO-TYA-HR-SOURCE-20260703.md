# Indice maestro TyA / HR Source

Fecha: 2026-07-03

## Estado

Rama: docs-tya-v6-v71-audit.
PR: #7 draft.
Base: release/cxorbia-tya-rc-20260630.
Sin merge, sin deploy, sin escrituras y sin importacion.

## Documentos principales

- RESUMEN-EJECUTIVO-PIPELINE-SEGURO-TYA-20260703.md
- INSTRUCCION-LOCAL-PIPELINE-SEGURO-TYA-20260703.md
- CHECKLIST-REVISION-VISUAL-POST-PIPELINE-TYA-20260703.md
- FRONTEND-VNEXT-TYA-20260703.md
- HANDOFF-FRONTEND-RUNNER-TYA-20260703.md
- CHECKLIST-AUDITORIA-NUEVO-ZIP-FRONTEND-TYA-20260703.md
- AUDITORIA-RC-V74-CLOUD-FRONTEND-20260703.md
- PENDIENTES-PROTOTIPO-ADDENDUM-RC-V74-20260703.md
- RESUMEN-PARA-CLAUDE-RC-V74-20260703.md
- PAQUETE-CLAUDE-PENDIENTES-RC-V74-20260703.md
- AUDITORIA-RC-V75-CLOUD-FRONTEND-20260703.md
- PENDIENTES-PROTOTIPO-ADDENDUM-RC-V75-20260703.md
- EMPALME-RC-V75-BACKEND-20260703.md
- RESUMEN-PARA-CLAUDE-ACUMULADO-RC-V75-20260703.md
- GATE-EJECUCION-LOCAL-PIPELINE-TYA-20260703.md
- TYA-PRODUCTION-GATES-MATRIX-20260703.md
- TYA-LOCAL-SAFE-PIPELINE-20260703.md
- TYA-DEV-IMPORT-CONTRACT-20260703.md
- POLITICA-DATOS-SENSIBLES-SHOPPERS-TYA-20260703.md
- REGLA-UNIFICACION-FUENTES-TYA-20260703.md
- PLAN-ROLLBACK-DEV-SIN-ESCRITURA-TYA-20260703.md
- CHECKLIST-REGLAS-MULTITENANT-TYA-20260703.md
- PLANTILLA-DECISION-AUTORIZACION-DEV-TYA-20260703.md

## Documentos vivos

- CAMBIOS-BACKEND.md
- RESUMEN-PARA-CLAUDE.md
- PENDIENTES-PROTOTIPO.md

## Scripts principales

- run-tya-local-safe-pipeline.ps1
- run-tya-dev-import-contract-check.ps1
- tya-dev-import-contract.mjs
- tya-dev-import-contract-validator.mjs
- tya-production-gates-matrix.mjs
- tya-dev-readiness-report.mjs
- build-tya-frontend-handoff.mjs
- run-tya-frontend-handoff.ps1

## Siguiente uso

Usar este indice para ubicar documentos y scripts del tramo TyA / HR Source antes de preparar paquete visual o auditar un nuevo ZIP.

## Nota RC V75

La auditoria V75 confirma que el ZIP corrige tres puntos sobre V74: Automatizaciones/IA server-side, Finanzas con estados honestos y HR Source con flujo `sourceRef` opaco. El empalme debe conservar backend y docs del PR #7.
