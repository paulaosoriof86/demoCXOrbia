# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Última sincronización:** 2026-08-18 16:53 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-IDENTITYMAP-HOSTING-PASS-STAFF-AUTH-NEXT-12`  
**Estado:** `I3_11C_IDENTITYMAP_HOSTING_DEV_PASS_CONSUMED__FINAL_STAFF_AUTH_NEXT__GO_LIVE_35`

## Carril vivo

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- DEV: `cxorbia-backend-dev`.

## Avance

- I1 `15/15 PASS`.
- I2 `20/20 PASS`.
- I3 `0/25 formal` hasta PASS integral.
- I4 `0/25`.
- I5 `0/15`.
- **35% completado / 65% pendiente.**
- I3 integral PASS → **60% / 40%**.

## Estado I3.11C

### Evidencia Staff previa congelada

Run `32192976458`, job `95891132356`, artifact `9344922862` alcanzó runtime real y dejó probado:
- HR `15` períodos / `660` visitas;
- provider exact link `shp-57d2e3769946 -> TYA_GT_0C0BA8856E` presente/aplicado;
- `materialized + tenant_adjudication`;
- agosto canonical `2`;
- residual live `0`;
- duplicateVisitKeys `0`;
- duplicateShopperIds `0`;
- postulación/legal sanos;
- Historical Shopper `0`.

Único HOLD: `targetCanonicalActual=null` porque el link aplicado no sobrevivía al `CX.data.__identityMap` final.

### Source fix

Fix reusable en `app/adapters/cxorbia-provider-identity-link-runtime-v1.js`, commit `e8742207db9e81b23f53429d7f487894ae9a9a0d`; parity/P0 source PASS en `0d73d6c3...` y `a4c85480...`.

### Hosting DEV final — PASS

- Request efectivo: `d2ff658e7fb1bdac4ae3d4a2df1e6f2a9c8c835a`.
- Run: `32194641563`.
- Job: `95896037812`.
- Artifact: `9345432655`.
- Digest: `sha256:2ee934cd0dbfbe8120250533aa7cd3b3954dc8ebeaffb5dec4b6917eaefb1af5`.
- Source materializado: `3a6d33810719f4b98ea0dd10a4ec7408d043f336`.
- Hosting deploys: `1/1`.
- Decisión: `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`.
- Source parity: `PASS_PROVIDER_IDENTITY_RUNTIME_CANONICAL_CONTRACT_PARITY`.
- SHA local/remoto: `04a43c3646b37b546788c414c8dfeac8bea7b4eae9a431e0186d6a0a52ff4493`.
- remoteExactByteParity `true`.
- exactIdentityMapExport `true`.
- conflictOverwrite `false`.
- canonicalPresenceRequired `true`.
- fuzzyMatching `false`.

Safety del run: Staff runtime `0`; Historical Shopper `0`; provider identity/Firestore-data/Auth/Rules/HR/Storage/Make/Gemini/payment writes `0`; Cloud Run `0`; password/user changes `0`; merge/production false.

Request Hosting quedó `enabled=false / consumed=true` en `c225981c57ba8583456174e39366db8a20f5b35a`. **No repetir.**

Transporte inicial `7ccd1f7c...`: preflight failure por `app/docs/`, antes de claim/Firebase/deploy; Hosting deploys `0`. El adapter en el source original y el source reanclado era el mismo blob exacto `c1c0627f...`; no se relajó el guard.

## Frozen

No reabrir I1/I2, I3.1→I3.10, Historical Shopper, TARGET_B Admin, Rules I3.11C, focal provider read, Hosting PASS, HR 15/660, Finance/histórico ni legal V0.4.

No crear usuarios alternos, no resets, no provider repair, no Rules deploy, no otro Hosting deploy.

## Siguiente acción exacta

Esperar **autorización nueva y separada** para:

`I3.11C Staff/Admin existing identity — one read-only canonical close after Hosting PASS`.

Acceptance:
1. `CX.data.__identityMap['shp-57d2e3769946'] === 'TYA_GT_0C0BA8856E'`.
2. Agosto canonical `2`.
3. Residual live `0`.
4. duplicateVisitKeys `0`.
5. duplicateShopperIds `0`.
6. Reload + nueva pestaña estables.
7. Historical Shopper access `0`.
8. Provider/Auth/Firestore/Rules/HR/Storage/Make/Gemini/payment writes `0`.
9. Hosting/Cloud Run deploys `0`.
10. Password/user changes `0`; merge/production false.

Si PASS: cerrar I3 y avanzar formalmente a 60%. Si HOLD: una sola causa reproducible y nuevo gate exacto; no reauditoría amplia.

## Claude / Academia

Sin parche frontend y sin cambio visible de Academia en este bloque. La corrección es adapter/runtime reusable y ya está servida en DEV.
