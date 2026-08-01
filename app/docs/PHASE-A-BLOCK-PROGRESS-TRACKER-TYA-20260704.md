# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_HUMAN_P0__DOMAIN_FINANCE_SHOPPER_FIX_PASS__LIVE_HR_AUDIT_PASS__PENDING_HOSTING_DEV`

## 1. Protegido
- Corte3 FROZEN; R17N1,406/1,406;616 visitas;572 liquidaciones;77 certificaciones.
- Corte5 14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil protegido120 docs/329 campos PASS.
- Finanzas/pagos canónicos preservados.

## 2. Human visual C6 — FAIL P0
KPIs/fases contradictorios, comparativo vacío, refresh con saltos, shoppers210/219, perfiles/histórico/certificación divididos, portal Shopper incompleto, periodo financiero divergente y33 submitidas omitidas de Liquidaciones.

## 3. Diagnóstico raíz
Máquinas de estado múltiples; perfiles sin crosswalk anexados; watcher con DOM/scroll no canónicos; completitud por flag; portal reducido por estado; liquidación sin `submitida`.

## 4. Root fix — CODE PASS
Composer, semántica, watcher, bridge transversal, finance/liquidation read model, Shopper portal canónico y wiring DEV. Módulos/core intactos.

## 5. Gates — PASS
- `PASS_C6_CANONICAL_DOMAIN_CONSISTENCY`;
- `PASS_C6_CANONICAL_FINANCE_LIQUIDATION_COMPLETENESS`;
- `PASS_C6_CANONICAL_SHOPPER_PORTAL_CONTRACT`;
- `PASS_C6_LIVE_HR_ROW_LEVEL_CANONICAL_STATE`.

HR:14 periodos/616 visitas/208 shoppers; JUL44 GT34/HN10; realizadas40; cuestionario38; submitidas33; liquidationCandidates33; fuera de rango accionable1; evidencia7; duplicados0.

## 6. Gate pendiente
Código no desplegado; autorización anterior consumida.

`AUTORIZACIÓN FRESCA 1x HOSTING DEV → REMOTE SMOKE SEMÁNTICO INTEGRAL → HUMAN VISUAL PASS → FREEZE C6 → AGOSTO`.

Smoke obligatorio: Dashboard, Visitas, Shoppers, Reportes, Reservas, Finanzas, Liquidaciones y portal Shopper.

## 7. Seguridad
Hosting0; Cloud Run0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos0; merge=false; producción=false.
