# SOURCE LOCK CXORBIA TyA — ESTABLE Y VIGENTE

**Última sincronización:** 2026-08-18 16:53 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-IDENTITYMAP-HOSTING-PASS-STAFF-AUTH-NEXT-12`  
**Estado:** `LOCKED__IDENTITYMAP_HOSTING_DEV_REMOTE_PARITY_PASS_CONSUMED__FINAL_STAFF_AUTH_REQUIRED__NO_PRODUCTION`

## Carril vigente

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR: #7 draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- DEV: `cxorbia-backend-dev`.

No crear nueva rama/PR/candidata/metodología. No usar workaround UI. No merge ni producción sin gate explícito.

## Avance formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25` hasta PASS integral; I4 `0/25`; I5 `0/15`.

**35% completado / 65% pendiente.** I3 integral PASS → **60% / 40%**.

## Frozen / no reprocesar

I1/I2; I3.1→I3.10; Historical Shopper; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C run `32163552089`; focal provider read `32171812808`; R3-B `32181137350`; R3-C Hosting anterior `32185940998`; Staff navigation HOLD `32188716203`; Staff post-hardening HOLD `32192976458`; HR `15/660`; Finance V2/historical; legal V0.4.

No crear Admin/Shopper alterno, no reset/recovery Historical Shopper, no Rules redeploy, no provider identity-link repair y no rerun de gates consumidos.

## Staff post-hardening — evidencia congelada

Run `32192976458`, job `95891132356`, artifact `9344922862`.

Probó:
- provider exact link `shp-57d2e3769946 -> TYA_GT_0C0BA8856E` presente/aplicado;
- status `materialized`, authority `tenant_adjudication`;
- agosto canonical `2`;
- residual `0`;
- duplicateVisitKeys `0`;
- duplicateShopperIds `0`;
- HR `15` períodos / `660` visitas;
- postulación/legal sanos;
- Historical Shopper access `0`.

Único blocker de ese run: el exact link no se exportaba a `CX.data.__identityMap`.

## IdentityMap source fix — PASS

Adapter protected/reusable commit `e8742207db9e81b23f53429d7f487894ae9a9a0d`; parity commit `0d73d6c3...`; P0 integration `a4c85480...`.

Contract lock:
- exact/autoritativo únicamente;
- canonical preexistente obligatorio;
- export a identityMap;
- conflicto no se sobreescribe;
- no identity creation;
- fuzzy/name/email/phone matching prohibidos;
- no writes.

## Hosting DEV identityMap — PASS / consumido

Ejecución efectiva única:
- request `d2ff658e7fb1bdac4ae3d4a2df1e6f2a9c8c835a`;
- run `32194641563`;
- job `95896037812`;
- artifact `9345432655`;
- artifact digest `sha256:2ee934cd0dbfbe8120250533aa7cd3b3954dc8ebeaffb5dec4b6917eaefb1af5`;
- source `3a6d33810719f4b98ea0dd10a4ec7408d043f336`;
- Hosting deploys `1/1`;
- decision `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`;
- local/remote SHA256 `04a43c3646b37b546788c414c8dfeac8bea7b4eae9a431e0186d6a0a52ff4493`;
- remoteExactByteParity `true`;
- exactIdentityMapExport `true`;
- conflictOverwrite `false`;
- canonicalPresenceRequired `true`;
- fuzzyMatching `false`.

Safety: Staff runtime/Historical Shopper/providerIdentity/Firestore-data/Auth/Rules/HR/Storage/Make/Gemini/payment/Cloud Run/password/user changes `0`; merge/production false.

Request consumido/disabled en `c225981c57ba8583456174e39366db8a20f5b35a`; no repetir Hosting.

El transporte `7ccd1f7c...` fue un preflight failure antes de claim/Firebase/deploy; deploys `0`. No cuenta como materialización provider.

## Único siguiente gate

`NEW_AUTH_REQUIRED_I3_11C_STAFF_RUNTIME_CANONICAL_IDENTITY_CLOSE_READONLY_AFTER_HOSTING`.

Requiere autorización expresa nueva. Una sola observación Staff/Admin existente en DEV, read-only, cero deploys/writes, para adjudicar finalmente:
- identityMap `shp-57d2e3769946 -> TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- residual `0`;
- duplicates `0/0`;
- estabilidad reload/new tab;
- Historical Shopper `0`;
- seguridad completa `0`;
- merge/production false.

Si PASS, cerrar I3 integral y pasar a I4. Si HOLD, extraer una sola causa reproducible; no reabrir gates frozen.

## Producto / Claude / Academia

TyA primer tenant; Cinépolis proyecto normal configurable, nunca lógica global. Sin parche UI. `/app/modules` y `/app/core` sin cambios en este bloque. Academia sin cambio visible en esta materialización técnica.
