# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__CORTE5_R17N_DEV_MATERIALIZED_1406_READBACK_PASS__POST_COMPARE_SMOKE_PENDING`

## 1. Estado general
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Baseline frontend: `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Legacy/Hosting final: `tya-plataforma`.
- No nueva candidata/base.

## 2. Bloques cerrados
### M1 / Corte 1 / Corte 2A
FROZEN/APROBADO.

### Corte 3
FROZEN_ACTIVE_BASELINE:
- 14 periodos /616 visitas;
- mayo 44 pagadas;
- junio 2 pagadas /42 pendientes;
- no V183/R33.

### Corte 4 — preparación backend/identidad/write plan
CERRADO para entrada a materialización:
- HR vigente hasta julio: 14 periodos /616 visitas /208 refs;
- identidad: 208/208 ready;
- legacy: 120 profile creates +77 certification creates listos;
- R17N FINAL: 1,406 exact ready writes;
- idempotencia offline PASS.

## 3. Corte 5 — materialización DEV
### Completado
Autorización `r17n-final-dev-20260730-01` ejecutada.

Preflight final:
- intended 1,406;
- absent 1,406;
- conflicts 0;
- HR identity 208/208;
- canonical existing targets 201/201;
- nombres reales visibles 201/201;
- financial exact visit links 196.

Materialización:
- foundation 16;
- legacy profiles 120;
- current-HR profiles 5;
- certifications 77;
- visits 616;
- liquidation controls 572;
- Firestore writes 1,406;
- readback 1,406/1,406;
- mismatch 0.

### Corrección intermedia agregada
Dos preflights quedaron HOLD `live_identity_207` con writes=0. Se identificó desalineación de hashing: executor colapsaba espacios internos y R20 no. Se corrigió a semántica exacta R20 (`trim + lowercase`), sin tocar la HR ni inventar identidad.

### Preservado fuera del write
- tenant update 1;
- existing profile updates 22;
- legacy holds 7;
- cert hold 1;
- Agosto HN;
- deletes;
- pagos/lotes;
- Auth/Storage/HR/legacy writes;
- deploy/merge/producción.

## 4. Bloque en progreso / siguiente exacto
`POST-COMPARE READ-ONLY DEL MATERIALIZADO → SMOKE CX.data CANÓNICO + IDENTIDAD REAL → VALIDACIÓN OPERATIVA`.

Criterios mínimos:
- 14 periodos /616 visitas;
- 208 refs correctamente enlazadas;
- 77 certs materializadas y carryover correcto;
- 572 controles de liquidación;
- 196 links financieros exactos;
- pagos no inferidos;
- sin fallback demo/local;
- identidad real visible según rol;
- sin P0 frontend.

## 5. Cortes posteriores
- Corte 6: Auth/RBAC, con autorización específica para cambios.
- Corte 7: sync HR↔plataforma, evidencias, Make/Gemini con gates.
- Corte 8: preproducción/cutover a Hosting `tya-plataforma`, con autorización específica.

## 6. Claude/prototipo
No nueva candidata. Claude solo entra ante P0 reproducible post-smoke o backlog P1/P2.

## 7. Academia
Actualizar: fuente viva, identidad real/source-safe, stable-key, preflight fail-closed, materialización/readback, certificación carryover y liquidación ≠ pago.

## 8. Estado seguro
Firestore writes autorizados ejecutados: 1,406. Auth/Storage/HR/legacy writes=0; deletes=0; pagos/lotes=0; deploy=0; merge=false; producción=false; Make/Gemini=0.
