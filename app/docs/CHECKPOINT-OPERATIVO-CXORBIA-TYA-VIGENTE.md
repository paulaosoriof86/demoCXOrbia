# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__R17N_FINAL_DEV_MATERIALIZED_1406__READBACK_1406_PASS__POST_COMPARE_SMOKE_PENDING__NO_PRODUCTION`

## 1. Repositorio y arquitectura
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Legacy a retirar / Hosting público final: `tya-plataforma`.
- Sandbox C4: no destino.
- No nueva base Firebase.

## 2. Corte 3 — FROZEN
`CXORBIA-TYA-CORTE3-V182-20260729`: 14 periodos / 616 visitas hasta julio; mayo 44 pagadas; junio 2 pagadas / 42 pendientes. No V183/R33.

## 3. Fuente operativa actual
HR viva hasta julio:
- 14 periodos;
- 616 visitas;
- 208 refs shopper;
- snapshot anterior 210 refs queda histórico;
- Agosto HN sigue HOLD.

Crosswalk final:
- 201 reuse existing;
- 2 link a legacy create;
- 5 HR-current create;
- 208/208 ready;
- 0 conflictos/HOLD de identidad actual.

Legacy:
- 149 shoppers únicos;
- 120 profile creates dentro de la autorización ejecutada;
- 22 existing updates HOLD;
- 7 legacy HOLD;
- 77 certificaciones materializables +1 HOLD.

## 4. R17N FINAL — MATERIALIZACIÓN DEV EJECUTADA
Autorización: `r17n-final-dev-20260730-01`.

Preflight final:
- intended 1,406;
- absent 1,406;
- already same 0;
- conflict 0;
- identidad HR revalidada 208/208;
- existing canonical targets 201/201;
- existing canonical targets con nombre real visible 201/201;
- potencial enriquecimiento adicional 0;
- R14C exact visit links 196.

Ejecución/readback:
- Firestore writes: **1,406**;
- readback verificado: **1,406/1,406**;
- mismatch: **0**.

Grupos:
- foundation 16;
- perfiles legacy 120;
- perfiles HR actuales 5;
- certificaciones 77;
- visitas 616;
- controles liquidación 572.

Evidencia: `app/docs/evidence/R17N-FINAL-DEV-MATERIALIZATION-LATEST.json`.

## 5. Exclusiones preservadas
No se tocó:
- tenant update 1;
- 22 updates de perfiles existentes;
- 7 legacy holds;
- 1 certification hold;
- Agosto HN;
- deletes;
- pagos/lotes;
- Auth;
- Storage;
- HR;
- legacy RTDB;
- Hosting/deploy;
- merge/producción.

## 6. Incidencia metodológica corregida
Intentos iniciales de preflight: HOLD `live_identity_207`, writes=0. Causa raíz: el executor normalizaba espacios internos antes del hash, distinto a la semántica R20 (`trim + lowercase`). Se corrigió el hash del gate, no los datos. Después del fix: 208/208 y materialización/readback PASS.

## 7. Próximo bloque exacto
`POST-COMPARE READ-ONLY EN cxorbia-backend-dev → SMOKE CX.data CANÓNICO + IDENTIDAD REAL → VALIDACIÓN OPERATIVA → CORTE 6 AUTH/RBAC`.

No repetir el write R17N. No nueva candidata/base. Cualquier modificación adicional requiere su gate y, si escribe, autorización específica.

## 8. Claude / Academia
- Claude: sin nueva candidata. Solo P0 reproducible post-smoke o backlog P1/P2.
- Academia: registrar fuente viva, identidad real, preflight fail-closed, materialización, readback, y que controles de liquidación no equivalen a pagos.

## 9. Estado seguro
Firestore writes ejecutados y autorizados: 1,406. Auth/Storage/HR/legacy writes=0; deletes=0; pagos=0; deploy=0; merge=false; producción=false; Make/Gemini=0.
