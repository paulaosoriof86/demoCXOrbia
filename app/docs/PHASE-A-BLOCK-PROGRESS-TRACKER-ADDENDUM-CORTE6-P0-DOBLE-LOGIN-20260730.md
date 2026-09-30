# Phase A tracker — addendum Corte 6 P0 doble login

**Fecha:** 2026-07-30  
**Estado:** `C6_P0_SINGLE_LOGIN_FIX_APPLIED_STATIC_PASS__PENDING_SINGLE_DEV_REDEPLOY_AUTH`

## Bloque previo preservado
- Auth import legacy:91/91 readback PASS.
- Claims/Rules: PASS.
- Corte3/R17N/Corte5: no reabrir.
- Hosting DEV previo: técnico PASS pero visual humana NO APROBADA por doble login.

## P0 y corrección
Causa raíz localizada en `backend-browser-auth.js` + `interactive-session`: Firebase Auth se convirtió en una pantalla adicional.

Fix aplicado en rama:
- eliminado gate backend paralelo;
- login normal del producto como único acceso visible;
- credenciales reales dentro de la misma tarjeta;
- sesión Firebase restaurable silenciosamente;
- logout real;
- `product-login-session`;
- gates anti-regresión predeploy/remotos.

## Gate
Revalidación estática sin provider writes:
- commit `790d4d514b8e7b4630063ebf2aebba5997e3ec26`;
- status `success`;
- contexto `PREPARED_C6_SINGLE_LOGIN_HOSTING_NO_EXECUTE`.

No hubo redeploy. La autorización anterior está consumida.

## Clasificación
- Bloque completado: migración Auth/readback.
- Bloque reabierto: **no**.
- P0 focal: **corregido en código / static PASS**.
- Pendiente bloqueante: un único redeploy DEV autorizado + smoke remoto + visual.
- P1/P2 preservados: reportes/exportación/copy.

## Siguiente bloque exacto
`AUTORIZACIÓN REDEPLOY MISMO HOSTING DEV → PRECHECK → DEPLOY1 → SMOKE REMOTO → VISUAL → FREEZE C6 → AGOSTO DELTA`.

## Estado seguro
Corrección P0: Auth/Firestore/Rules/Hosting/Storage/HR/legacy/payments/functions/Make/Gemini writes/deploys0; merge=false; producción=false.
