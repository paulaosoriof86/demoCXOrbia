# Prompt nueva conversacion final - CXOrbia TyA

Fecha: 2026-07-05

Usar este prompt si se abre una nueva conversacion:

```text
Continua CXOrbia TyA Phase A sin reiniciar metodologia.

Primero lee y usa como fuente principal el documento maestro del proyecto y los docs recientes en `app/docs`, especialmente:

- `CONTINUIDAD-FINAL-POST-CHECKLIST-CANDIDATA-CXORBIA-TYA-20260705.md`
- `REPORTE-READINESS-DOCUMENTAL-ACUMULADO-PHASE-A-TYA-20260705.md`
- `CHECKLIST-DECISION-NUEVA-CANDIDATA-CLAUDE-PHASE-A-TYA-20260705.md`
- `TEMPLATE-REPORTE-DECISION-CANDIDATA-CLAUDE-20260705.md`
- `PROMPT-CORTO-CLAUDE-P0-POST-V87-20260705.md`
- `RUNBOOK-LOCAL-READINESS-PHASE-A-TYA-20260705.md`
- `PREFLIGHT-LOCAL-READINESS-PHASE-A-TYA-20260705.md`
- `VALIDACION-DOCUMENTAL-PREFLIGHT-RUNBOOK-PHASE-A-TYA-20260705.md`

Repo: `paulaosoriof86/demoCXOrbia`.
Rama activa: `docs-tya-v6-v71-audit`.
PR: #7, draft, abierto, sin merge.
Base: `release/cxorbia-tya-rc-20260630`.

Reglas:
- El prototipo manda.
- No reescribir `/app/modules` ni `/app/core` desde backend.
- No mezclar backend en UI.
- No activar produccion, deploy, merge, import real, providers ni escrituras reales.
- No subir datos sensibles.
- Todo cambio se documenta.
- Nueva candidata Claude se audita antes de empalmar.

Estado actual:
- V87 no tuvo delta real contra V86.
- No hay source lock.
- No hay produccion lista.
- P0 frontend sigue pendiente.
- Backend preview esta avanzado pero no autoriza produccion.

Si Claude vuelve:
- darle `PROMPT-CORTO-CLAUDE-P0-POST-V87-20260705.md`;
- pedir candidata correctiva minima con delta real;
- no pedir P1 ni Academia profunda antes del P0.

Si llega un ZIP nuevo:
- aplicar `CHECKLIST-DECISION-NUEVA-CANDIDATA-CLAUDE-PHASE-A-TYA-20260705.md`;
- llenar `TEMPLATE-REPORTE-DECISION-CANDIDATA-CLAUDE-20260705.md`;
- clasificar como `critical_blocker`, `no_real_delta`, `manual_review_required` o `candidate_for_empalme`;
- empalmar solo si queda `candidate_for_empalme`.

Si se trabaja local backend:
1. `node tools/migration/tya-local-readiness-consistency-check.mjs`
2. `node tools/migration/tya-local-readiness-preflight.mjs`
3. `node tools/migration/tya-phase-a-local-readiness-runbook.mjs`
4. revisar salidas antes de compartir/subir.

Siguiente bloque recomendado: preparar indice maestro de documentos creados en esta etapa, agrupado por auditoria, Claude, backend preview, runbook local, readiness, decision y Academia.
```
