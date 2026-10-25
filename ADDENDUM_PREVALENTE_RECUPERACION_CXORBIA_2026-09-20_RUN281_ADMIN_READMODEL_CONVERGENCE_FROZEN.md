# ADDENDUM PREVALENTE — I3 RUN 281 ADMIN READ-MODEL CONVERGENCE LOCK

**Fecha:** 2026-09-20  
**ID:** `CXORBIA-I3-RUN281-ADMIN-READMODEL-CONVERGENCE-20260920`  
**Estado:** `FROZEN_PREVALENT_UNTIL_I3_GO_OR_NEWER_EXPLICIT_SUPERSESSION`  
**Iteración:** `I3 — FUNCTIONAL CLOSURE`

## Evidencia física
Run 281 (`35495187331`) certificó PASS hasta Step23, Gate20 y artifact único sobre product source `16d1bc8649f358f72d9576d6e4c20bfa6b833272`.

La suite viva terminó `7/10`, con:
- `cleanup=true`
- `build=0`
- `deploy=0`
- `production=false`
- shoppers GT/HN + credenciales + login = PASS
- cross-project command bloqueado = PASS
- perfiles creados y persistidos = PASS

Primer causal físico:
`FUNCTIONAL_DEFECT:ADMIN_FIXTURE_REQUIRES_EXPLICIT_BACKEND_REFRESH`.

El diagnóstico de Run 281 demostró que los cuatro perfiles aparecen correctamente en el read-model Admin después de `CX.backend.refresh()` y sobreviven la recomposición HR. Por tanto, no existe pérdida HR ni exclusión Firestore: el defecto es de convergencia automática del read-model.

## Causa raíz
En `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js`, un evento `backend-ready` Firestore podía llegar mientras una reconciliación HR ya estaba activa. El intento forzado podía consumirse como `reconcile_in_progress`, y el estado Firestore recién leído podía no quedar preservado como `lastProtectedState`.

## Corrección
1. `backend-ready` captura inmediatamente el estado Firestore recién cargado y lo conserva antes de programar recomposición.
2. Si `reconcile()` está ocupado, mantiene `bootForce=true` y fuerza un retry real después de finalizar la reconciliación activa.
3. Gate estático impide regresión de ambas garantías.

Nueva product source:
- `23a2b3b076a585cad7da3a4c50dfe9d4e3192995`
- tree `f02852474cd5dd2c7b9f77f8495918bc622c7a7f`

Producción: `DO_NOT_TOUCH`.

Siguiente acción: una sola recertificación canónica. Cierre requerido: Step21/23 misma HR revision → Gate20 PASS → artifact único → live fixtures 10/10 con cleanup=true/build=0/deploy=0/production=false → Gate21 PASS mismo artifact/manifest/revisión.