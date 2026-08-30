# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-30  
**STATE_SYNC_EPOCH:** `CXORBIA-20260830-F10-LIVE-ROW-CONTENT-PASS-MECHANISM-SYNC-14`  
**MASTER_PLAN:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1` / `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F10_PERMANENT_OPERATING_MODEL`  
**currentMasterStep:** `F10_LIVE_ROW_CONTENT_EQUIVALENCE_PASS_MECHANISM_SYNCHRONIZED`  
**F8.5:** `CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`  
**F9:** `POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY`  
**F10:** `TECHNICAL_PASS_PENDING_OWNER_VISUAL_ACCEPTANCE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `100/100`  
**NEXT:** `F10_OWNER_VISUAL_ACCEPTANCE_THEN_CLOSE_INCIDENT_OR_OPEN_FOCAL_VISUAL_DEFECT`

## Autoridad viva — orden obligatorio

1. Este índice.
2. `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md` como plan congelado.
3. `backend/config/cxorbia-phase-a-continuity-lock.json` como historia + `backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json` como cursor efectivo.
4. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
5. `app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`.
6. `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`.
7. `app/docs/evidence/RC15-F10-LIVE-CONTENT-EQUIVALENCE-MECHANISM-SYNC-LATEST.json`.
8. `backend/config/cxorbia-f10-approved-module-authority-live-overlay-v1.json` como estado live efectivo de la matriz.
9. `backend/config/cxorbia-f10-approved-module-authority-matrix-v1.json` como autoridad inmutable de blobs aprobados capturada antes del deploy F10.
10. `backend/contracts/cxorbia-f10-live-content-certification-policy-v1.json`.
11. Evidencias F10 previas de causa, source y predeploy como historia técnica; sus booleanos predeploy no pueden competir con la evidencia live posterior.
12. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md`, `app/docs/PENDIENTES-PROTOTIPO.md` y mirrors raíz si coinciden con este epoch.
13. PR #7 es mirror histórico no autoritativo, cerrado/draft/no mergeado.
14. Única rama viva: `docs-tya-v6-v71-audit`.

## Estado live verificado

El release congelado Phase A permanece como baseline histórica `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`, functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. Sobre esa composición se publicó únicamente el sucesor F10 autorizado del adapter `app/adapters/tya-canonical-state-semantics-v2.js`, blob `941051c96a26017363acfc72f7e88edbe70c68ba`.

Deploy focal: run `33289344796`, artefacto `9725498210`, Hosting release `sites/cxorbia-backend-dev/releases/1788058988151000`, version `sites/cxorbia-backend-dev/versions/958ed37dde65d592`. El readback remoto verificó 41 módulos/soportes/post-Phase-A cargados con `0` mismatches, entrypoint y `app.js` exactos. No se redeployó Cloud Run ni se tocaron Auth/Firestore/HR/Storage/Rules/pagos.

La validación transversal reforzada terminó PASS en run `33297814889`, artefacto `9727971958`: 660 visitas, 15 periodos, 44 filas de agosto, 0 duplicados, 0 mismatches canónicos y digest operacional exacto proveedor↔navegador `a5a6d0bc1ed109e1c4088d09553e49c860f6d390d187859175c1fd2d19741bb0`. KPIs esperados y Admin live coincidieron: total 44, realizadas 30, pendientes 14, sin agendar 4, cuestionario pendiente 4, sin submitir 1, candidatas a liquidación 30 y liquidadas 0.

`sourceRevision` queda definido como token de trazabilidad de cada refresh. Dos lecturas `fresh=1` independientes pueden tener revisiones distintas; la identidad de contenido se certifica por identidad estable de filas + digest operacional + resumen/KPIs equivalentes.

## Pendiente real

Solo la **aceptación visual de Paula** cierra este incidente F10. Si la visualización muestra un defecto reproducible, se abre un patch focal; no se reabre el linaje completo. `Cliente/Cliente 360` conserva su HOLD separado y no fue adjudicado por esta prueba HR/KPI.

**NEXT:** `F10_OWNER_VISUAL_ACCEPTANCE_THEN_CLOSE_INCIDENT_OR_OPEN_FOCAL_VISUAL_DEFECT`.
