# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN__R17N_FINAL_DEV_MATERIALIZED_1406__READBACK_1406_PASS__POST_COMPARE_SMOKE_PENDING__NO_PRODUCTION`

## 1. Repositorio
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Legacy/Hosting final: `tya-plataforma`.
- Sandbox C4: no destino de materialización.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda de empalme/carril, Academia, patrones y antidesvío;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `ADDENDUM-IDENTIDAD-REAL-SHOPPER-PII-SOURCE-SAFE-VS-PLATAFORMA-20260729.md`;
6. `evidence/CURRENT-HR-THROUGH-JULY-SOURCE-SAFE-LATEST.json`;
7. `evidence/VISIT-IDENTITY-CROSSWALK-READONLY-LATEST.json`;
8. `evidence/CURRENT-UNRESOLVED-SHOPPER-IDENTITY-READONLY-LATEST.json`;
9. `evidence/LEGACY-SHOPPERS-CERTIFICATIONS-REFRESH-LATEST.json`;
10. `evidence/R17N-FINAL-WRITE-PLAN-NO-EXECUTE-LATEST.json`;
11. `evidence/R17N-FINAL-DEV-MATERIALIZATION-LATEST.json`;
12. CAMBIOS/Claude/PENDIENTES/Academia/tracker más recientes;
13. PR #7 y HEAD vivo.

## 3. Baseline no reabrir
Corte 3 permanece `FROZEN_ACTIVE_BASELINE` en `CXORBIA-TYA-CORTE3-V182-20260729`:
- 14 periodos / 616 visitas hasta julio;
- mayo 44 pagadas;
- junio 2 pagadas / 42 pendientes;
- no V183/R33.

## 4. Fuente e identidad vigentes
HR viva actual hasta julio:
- 14 periodos;
- 616 visitas;
- 208 referencias shopper;
- el snapshot previo de 210 refs / 9 pendientes quedó superado;
- Agosto HN sigue HOLD por país/tab inconsistente.

Identidad actual:
- 201 refs reutilizan shopper canónico existente;
- 2 enlazan perfiles legacy create;
- 5 crean perfil desde HR viva;
- 208/208 ready;
- 0 HOLD de identidad actual.

Legacy útil:
- 149 shoppers únicos;
- 120 perfiles create autorizados en este bloque;
- 22 existing updates siguen HOLD;
- 7 perfiles legacy HOLD;
- 78 certificaciones útiles = 77 materializadas + 1 HOLD.

## 5. R17N FINAL — MATERIALIZACIÓN DEV PASS
Autorización `r17n-final-dev-20260730-01` consumida para máximo 1,406 writes exactos.

Resultado:
- preflight: 1,406 absent / 0 same / 0 conflict;
- identidad HR revalidada en memoria: 208/208;
- targets canónicos existentes verificados: 201/201;
- 201/201 ya tienen nombre real visible; enriquecimiento adicional pendiente: 0;
- links financieros R14C exactos preservados: 196;
- Firestore writes ejecutados: **1,406/1,406**;
- readback: **1,406/1,406**;
- mismatch: 0.

Grupos materializados:
- foundation: 16;
- perfiles legacy: 120;
- perfiles HR actuales: 5;
- certificaciones: 77;
- visitas: 616;
- controles de liquidación: 572.

Excluido y no tocado:
- tenant update 1;
- existing-profile updates 22;
- legacy holds 7;
- certification hold 1;
- Agosto HN;
- deletes;
- pagos/lotes;
- Auth/Storage/HR/legacy writes;
- deploy/merge/producción.

Evidencia canónica: `app/docs/evidence/R17N-FINAL-DEV-MATERIALIZATION-LATEST.json`.

## 6. Corrección de causa raíz durante el gate
Los dos primeros preflights posteriores al armado del executor quedaron HOLD con `live_identity_207` y **0 writes**. El problema no era la HR: el executor colapsaba espacios internos antes de calcular el hash de identidad, mientras R20 usa `trim + lowercase` sin alterar espacios internos. Se alineó el cálculo exactamente con R20; el rerun obtuvo 208/208, ejecutó los 1,406 writes autorizados y pasó readback completo.

## 7. Gate vivo único
`POST-COMPARE READ-ONLY DEL BACKEND MATERIALIZADO → SMOKE CX.data CANÓNICO + IDENTIDAD REAL → VALIDACIÓN OPERATIVA → CORTE 6 AUTH/RBAC`.

No repetir materialización, no crear otra base, candidata o Hosting de prueba. Cualquier write adicional requiere gate/autorización propia.

## 8. Claude / Academia
- Claude: no nueva candidata. Intervenir solo si el smoke demuestra P0 frontend reproducible o para backlog P1/P2.
- Academia: documentar fuente viva vs snapshot, identidad real vs source-safe, preflight fail-closed, materialización idempotente/readback y separación liquidación/pago.

## 9. Estado seguro
Firestore writes autorizados ejecutados en este bloque: 1,406. Auth/Storage/HR/legacy writes=0; deletes=0; pagos=0; deploy=0; merge=false; producción=false; Make/Gemini=0.
