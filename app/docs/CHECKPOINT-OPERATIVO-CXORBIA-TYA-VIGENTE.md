# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Última sincronización:** 2026-08-18 14:20 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-R3B-HOLD-DEV-HOSTING-PARITY-05`  
**Estado:** `R3B_HOLD_CONSUMED__SOURCE_PARITY_PASS__REMOTE_DEV_IDENTITY_STILL_PRECORRECTION_BEHAVIOR__HOSTING_AUTH_NEXT__GO_LIVE_35`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Avance

- I1 `15/15 PASS`.
- I2 `20/20 PASS`.
- I3 `0/25 formal` hasta PASS integral.
- I4 `0/25`.
- I5 `0/15`.
- **Formal 35% / 65% pendiente.**
- I3 integral PASS → **60%**.

## Iteración R3-B ejecutada

Run `32181137350`, job `95854174365`, artifact `9340865585`, digest `sha256:4485e03cb17d4dcb82915049fe8d2895ba099baff62d08b5fc2ac89cf1dd1ab3`.

Preflight:
- request exacto/single-use: PASS;
- parity source: `PASS_PROVIDER_IDENTITY_RUNTIME_CANONICAL_CONTRACT_PARITY`;
- Rules I3.11C previas: reutilizadas y verificadas;
- Rules deploys actuales: `0`;
- credential scope: Staff/Admin solamente;
- Historical Shopper: no acceso.

Runtime Staff/Admin DEV:
- ejecutado una sola vez;
- `FAIL_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`;
- stable failure `AUTH_RUNTIME_TIMEOUT`;
- autenticación/membership/tenant/proyecto/datos/rail/view montados;
- 15 períodos / 660 visitas;
- authorityApplied `true`;
- duplicate visits/shoppers `0/0`;
- provider identity runtime: `1` link global / `0` target;
- target canonical actual `null`;
- agosto canonical `0` / residual `2`.

El lastState conserva postulación y legal correctos: authority ready, 8 platform posts, 15 HR assignments, HR assignments no tratados como postulaciones, legal provider authority presente y receipt `accepted` por `human_ui`. Por ello los FAIL I3.4/I3.7 emitidos por el resumen después del timeout base no se clasifican como regresiones nuevas.

## Diagnóstico reducido

`I3_11C_CORRECTED_SOURCE_NOT_EFFECTIVE_IN_REMOTE_DEV__HOSTING_MATERIALIZATION_REQUIRED`.

El source corregido sí pasa su parity gate, pero R3-A y R3-B tuvieron `hostingDeploys=0`. R3-B validó el sitio remoto y este sigue mostrando el conjunto de identidad propio del comportamiento pre-corrección. No corresponde volver a cambiar el provider link ni el contrato.

## Siguiente bloque exacto

`NEW_AUTH_REQUIRED_I3_11C_DEV_HOSTING_MATERIALIZE_CORRECTED_IDENTITY_RUNTIME_NO_PROVIDER_DATA_WRITES`.

Nuevo gate requerido porque el R3-B autorizado era explícitamente `deploy=false`.

Debe hacer exclusivamente:
1. un máximo de 1 deploy Hosting DEV del source corregido;
2. verificar el asset remoto contra el contrato canónico corregido mediante fingerprint/hash o prueba semántica inequívoca;
3. cero provider identity writes, Firestore data writes, Auth/Rules/HR/Storage/Make/Gemini/payment writes, Cloud Run, merge o producción;
4. cero Historical Shopper;
5. no repetir Staff automáticamente.

Después de ese PASS se pedirá un nuevo gate Staff read-only para cerrar I3.

## Frozen / no reprocesar

Historical Shopper, TARGET_B Admin, I3.9/I3.10, Rules I3.11C, focal provider read, R3-B actual, HR 15/660, Finance V2/historical y legal V0.4.

## Camino restante

Hosting parity DEV → Staff final read-only → I3 integral/60% → I4 visible (shopper lifecycle, visita, HR bidireccional, finanzas, multi-proyecto/no-code, roles/notificaciones/integraciones/Academia) → I5 producción.
