# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Última sincronización:** 2026-08-18 13:20 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-RUNTIME-SOURCE-CORRECTION-04`  
**Estado:** `I3_11C_SOURCE_CORRECTED__STAFF_CANONICAL_IDENTITY_READONLY_CLOSE_AUTH_REQUIRED__GO_LIVE_35__NO_PRODUCTION`

## Carril
Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; DEV `cxorbia-backend-dev`.

## Avance
I1 `15/15`; I2 `20/20`; I3 `0/25` formal; I4 `0/25`; I5 `0/15`. **35% completado / 65% pendiente.** I3 PASS → **60%**.

## Qué quedó corregido
Causa raíz R2B: runtime legacy rechazaba links `materialized` aunque el contrato canónico los acepta.

R3-A corrige únicamente `app/adapters/cxorbia-provider-identity-link-runtime-v1.js`:
- paridad de estados y authorities con `cxorbia-identity-roll-forward-v1`;
- authorityRef + sourceSafe + period-independent;
- tenant/project isolation;
- aliases técnicos exactos ampliados;
- cero fuzzy/name/email/phone matching;
- API/runtime bridge preservado.

QA reusable agregado: `tools/qa/cxorbia-provider-identity-runtime-contract-parity-gate.mjs`.

No se tocó `/app/modules` ni `/app/core`; provider reads/writes `0/0`; Auth/Firestore-data/Rules/Hosting/CloudRun/HR/Storage/Make/Gemini/pagos/Historical Shopper `0`; merge/production false.

## Siguiente bloque exacto
`NEW_AUTH_REQUIRED_I3_11C_STAFF_RUNTIME_CANONICAL_IDENTITY_CLOSE_READONLY_NO_WRITES`.

Requiere autorización exacta nueva. Debe:
1. ejecutar parity gate source;
2. autenticar Staff/Admin canónico existente en DEV sin cambiar credenciales;
3. comprobar runtime corregido;
4. exigir `shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
5. agosto canonical `2`, residual live `0`, duplicate visits/shoppers `0`;
6. cero writes/deploy/producción.

Si PASS integral, I3 = `25/25` y formal **60% / 40% pendiente**, entrando inmediatamente a I4 visible.

## Frozen
Historical Shopper, TARGET_B Admin, I3.9/I3.10, Rules, focal provider read, HR 15/660, Finance V2/historical, legal V0.4. No provider repair ni reproceso.

## Camino restante
I4 visible → I5 producción. TyA/Cinépolis siguen configurables, no lógica global.
