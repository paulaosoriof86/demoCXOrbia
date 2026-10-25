# Indice maestro de documentos Phase A - CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Agrupar los documentos creados en esta etapa para facilitar continuidad, auditoria, trabajo con Claude, backend preview, runbook local, readiness, decision y Academia.

## Estado general

- Source lock: bloqueado.
- Produccion: bloqueada.
- Deploy: bloqueado.
- Merge: bloqueado.
- P0 frontend: pendiente.
- Backend preview: avanzado en modo documental y herramientas.
- Ejecucion local: pendiente.

## 1. Auditoria y source lock

- `app/docs/AUDITORIA-FORENSE-V87-CXORBIA-20260705.md`
- `app/docs/PENDIENTES-CLAUDE-ADDENDUM-V87-AUDITORIA-20260705.md`
- `app/docs/FRONTEND-HANDOFF-V87-AUDITORIA-20260705.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-V87-AUDITORIA-20260705.md`
- `app/docs/PENDIENTES-FRONTEND-ADDENDUM-V87-AUDITORIA-20260705.md`

Uso: recordar que V87 no tuvo delta real contra V86, no es source lock y mantiene P0 frontend.

## 2. Claude P0

- `app/docs/PAQUETE-CLAUDE-P0-POST-V87-CXORBIA-TYA-20260705.md`
- `app/docs/PROMPT-CORTO-CLAUDE-P0-POST-V87-20260705.md`
- `app/docs/AUDITORIA-PROXIMA-CANDIDATA-CLAUDE-CRITERIOS-20260705.md`
- `app/docs/HANDOFF-CLAUDE-CONTEXTO-BACKEND-POST-V87-20260705.md`
- `app/docs/CLAUDE-ACUMULADO-ADDENDUM-CHECKLIST-DECISION-CANDIDATA-20260705.md`

Uso: cuando Claude vuelva, entregar prompt P0 y pedir candidata correctiva minima con delta real.

## 3. Backend preview

- `tools/migration/synthetic-fixtures/phase-a/synthetic-input-pack-manifest.phase-a.preview.json`
- `app/contracts/synthetic-input-pack-readiness-map-phase-a.tya.contract.json`
- `tools/migration/tya-synthetic-input-pack-readiness-map-preview.mjs`
- `app/contracts/readiness-map-to-release-snapshot-bridge-phase-a.tya.contract.json`
- `tools/migration/tya-readiness-map-to-release-snapshot-preview-bridge.mjs`
- `tools/migration/tya-release-readiness-snapshot-preview-validator.mjs`
- `app/contracts/release-readiness-sanitized-report-phase-a.tya.contract.json`
- `tools/migration/tya-release-readiness-sanitized-report.mjs`
- `app/contracts/controlled-production-matrix-phase-a.tya.contract.json`
- `tools/migration/tya-controlled-production-matrix-preview.mjs`

Uso: herramientas backend preview sin produccion ni escrituras reales.

## 4. Runbook local

- `app/contracts/phase-a-local-readiness-runbook.tya.contract.json`
- `tools/migration/tya-phase-a-local-readiness-runbook.mjs`
- `app/docs/RUNBOOK-LOCAL-READINESS-PHASE-A-TYA-20260705.md`
- `app/contracts/local-readiness-preflight-phase-a.tya.contract.json`
- `tools/migration/tya-local-readiness-preflight.mjs`
- `app/docs/PREFLIGHT-LOCAL-READINESS-PHASE-A-TYA-20260705.md`
- `app/contracts/local-readiness-consistency-phase-a.tya.contract.json`
- `tools/migration/tya-local-readiness-consistency-check.mjs`
- `app/docs/VALIDACION-DOCUMENTAL-PREFLIGHT-RUNBOOK-PHASE-A-TYA-20260705.md`

Uso: secuencia local segura: consistency check, preflight, runbook, revision de salidas.

## 5. Readiness y matriz

- `app/docs/RELEASE-READINESS-BRIDGE-SYNTHETIC-PACK-TYA-20260705.md`
- `app/docs/RELEASE-READINESS-SANITIZED-REPORT-TYA-20260705.md`
- `app/docs/MATRIZ-PRODUCCION-CONTROLADA-PHASE-A-TYA-20260705.md`
- `app/docs/REPORTE-READINESS-DOCUMENTAL-ACUMULADO-PHASE-A-TYA-20260705.md`

Uso: lectura ejecutiva de readiness. No autoriza produccion.

## 6. Decision de candidata

- `app/contracts/claude-candidate-decision-checklist-phase-a.tya.contract.json`
- `app/docs/CHECKLIST-DECISION-NUEVA-CANDIDATA-CLAUDE-PHASE-A-TYA-20260705.md`
- `app/docs/TEMPLATE-REPORTE-DECISION-CANDIDATA-CLAUDE-20260705.md`

Uso: cuando llegue ZIP nuevo, auditar antes de empalmar. Solo empalmar si queda `candidate_for_empalme`.

## 7. Academia

- `app/docs/ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md` si esta en repo/fuentes.
- `app/docs/ACADEMIA-IMPACT-RELEASE-READINESS-BRIDGE-TYA-20260705.md`
- `app/docs/ACADEMIA-IMPACT-RELEASE-READINESS-SANITIZED-REPORT-TYA-20260705.md`
- `app/docs/ACADEMIA-IMPACT-CONTROLLED-PRODUCTION-MATRIX-TYA-20260705.md`
- `app/docs/ACADEMIA-IMPACT-CLAUDE-P0-PACKAGE-TYA-20260705.md`
- `app/docs/ACADEMIA-IMPACT-LOCAL-READINESS-RUNBOOK-TYA-20260705.md`
- `app/docs/ACADEMIA-IMPACT-VALIDACION-DOCUMENTAL-RUNBOOK-TYA-20260705.md`
- `app/docs/ACADEMIA-IMPACT-READINESS-DOCUMENTAL-ACUMULADO-TYA-20260705.md`
- `app/docs/ACADEMIA-IMPACT-CANDIDATE-CHECKLIST-TYA-20260705.md`

Uso: Academia queda diferida hasta cerrar P0 frontend.

## 8. Continuidad

- `app/docs/CONTINUIDAD-CONVERSACION-CXORBIA-TYA-20260705.md`
- `app/docs/PROMPT-NUEVA-CONVERSACION-CXORBIA-TYA-20260705.md`
- `app/docs/CONTINUIDAD-FINAL-POST-CHECKLIST-CANDIDATA-CXORBIA-TYA-20260705.md`
- `app/docs/PROMPT-NUEVA-CONVERSACION-FINAL-CXORBIA-TYA-20260705.md`

Uso: abrir nueva conversacion sin perder contexto.

## 9. Tracking y cambios

- `app/docs/PHASE-A-TRACKER-ADDENDUM-RELEASE-READINESS-BRIDGE-20260705.md`
- `app/docs/PHASE-A-TRACKER-ADDENDUM-RELEASE-READINESS-SANITIZED-REPORT-20260705.md`
- `app/docs/PHASE-A-TRACKER-ADDENDUM-CONTROLLED-PRODUCTION-MATRIX-20260705.md`
- `app/docs/PHASE-A-TRACKER-ADDENDUM-CLAUDE-P0-PACKAGE-20260705.md`
- `app/docs/PHASE-A-TRACKER-ADDENDUM-LOCAL-READINESS-RUNBOOK-20260705.md`
- `app/docs/PHASE-A-TRACKER-ADDENDUM-CONTINUIDAD-PREFLIGHT-20260705.md`
- `app/docs/PHASE-A-TRACKER-ADDENDUM-VALIDACION-DOCUMENTAL-RUNBOOK-20260705.md`
- `app/docs/PHASE-A-TRACKER-ADDENDUM-READINESS-DOCUMENTAL-ACUMULADO-20260705.md`
- `app/docs/PHASE-A-TRACKER-ADDENDUM-CHECKLIST-DECISION-CANDIDATA-CLAUDE-20260705.md`
- `app/docs/PHASE-A-TRACKER-ADDENDUM-CONTINUIDAD-FINAL-20260705.md`

Uso: trazabilidad por bloque.

## Orden recomendado de lectura

1. `CONTINUIDAD-FINAL-POST-CHECKLIST-CANDIDATA-CXORBIA-TYA-20260705.md`
2. `REPORTE-READINESS-DOCUMENTAL-ACUMULADO-PHASE-A-TYA-20260705.md`
3. `CHECKLIST-DECISION-NUEVA-CANDIDATA-CLAUDE-PHASE-A-TYA-20260705.md`
4. `PROMPT-CORTO-CLAUDE-P0-POST-V87-20260705.md`
5. `RUNBOOK-LOCAL-READINESS-PHASE-A-TYA-20260705.md`

## Decision actual

No source lock. No produccion. No deploy. No merge. P0 frontend sigue bloqueando salida controlada.

## Siguiente bloque recomendado

Preparar un cierre operativo de espera: que hacer durante la espera de Claude, que puede avanzar backend sin riesgo, que no debe tocarse y cuando pedir accion de Paula.
