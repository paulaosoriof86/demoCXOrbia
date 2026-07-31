# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_PROFILE_WRITE_PASS__PROTECTED_HOSTING_PASS__WAITING_HUMAN_VISUAL__31_HOLD`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406;616 visitas;572 liquidaciones;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.

## 2. Corte6 perfil completo — Firestore PASS
120 doc writes exactos;118 field-change +2 marker-only;329 valores; readback120/329; mismatches0. Authorization consumida.

## 3. Protected Hosting DEV — PASS
Un único redeploy existente `cxorbia-backend-dev/cxorbia-dev` ejecutado y verificado remotamente. Protected runtime/Auth bridge/Firestore adapter/profile bridge/history KPI PASS; source-safe default preservado. Authorization consumida.

## 4. P0 visual — gate actual
Falta validación humana Admin+Shopper del carril protegido. No congelar Corte6 antes de esa validación.

Validar perfil completo, username/password legacy real cuando exista, teléfonos, KPI/drill, histórico completo incluido `submitida` y shopperId real.

## 5. 31 identity HOLD
No resueltos por llaves estables ni Auth claims. No usar nombre/teléfono/email. Requieren alta/conciliación explícita posterior.

## 6. Julio/agosto
No materializar agosto hasta cerrar/freeze Corte6. Después: refresh HR → resolver agosto HN si corresponde → materializar solo delta agosto.

## 7. Claude/Academia
- Claude: preservar diseño; si el adapter entrega datos y la UI no los muestra, documentar ajuste por archivo.
- Academia: source-safe vs protected, write/readback, one-shot deploy, validación humana y HOLD explícito.

## 8. Estado seguro
Durante redeploy: Firestore/Auth/Rules/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos writes/deploys0; merge=false; producción=false.
