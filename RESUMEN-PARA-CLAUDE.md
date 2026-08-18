# RESUMEN-PARA-CLAUDE.md

**Última sincronización:** 2026-08-18 16:53 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-IDENTITYMAP-HOSTING-PASS-STAFF-AUTH-NEXT-12`  
**Estado:** `NO_FRONTEND_PATCH__IDENTITYMAP_HOSTING_DEV_PASS__FINAL_STAFF_AUTH_NEXT__GO_LIVE_35`

## Estado Phase A

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 formal` hasta cierre integral; I4 `0/25`; I5 `0/15` = **35% / 65%**. I3 integral PASS → **60% / 40%**.

## Preservado / no reprocesar

- I1/I2 e I3.1→I3.10.
- Historical Shopper e I3.9/I3.10 frozen.
- TARGET_B Admin existente; no crear otro usuario.
- Rules I3.11C ya verificadas; no redeploy.
- HR authority ya observada: `15` períodos / `660` visitas.
- Provider exact target link ya observado: `shp-57d2e3769946 -> TYA_GT_0C0BA8856E`, `materialized`, `tenant_adjudication`.
- Staff post-hardening run `32192976458`: agosto canonical `2`, residual `0`, duplicates `0/0`; único faltante era export a `CX.data.__identityMap`.

## IdentityMap source fix

Adapter reusable `app/adapters/cxorbia-provider-identity-link-runtime-v1.js`, commit `e8742207db9e81b23f53429d7f487894ae9a9a0d`.

El fix propaga únicamente links exactos/autoritativos al `identityMap`, exige canonical ya existente, no sobreescribe conflictos, no crea identidades y mantiene fuzzy/nombre/email/teléfono desactivados.

P0/parity source PASS en commits `0d73d6c3...` y `a4c85480...`.

## Hosting DEV — PASS / congelado

Ejecución efectiva única:
- request commit `d2ff658e7fb1bdac4ae3d4a2df1e6f2a9c8c835a`;
- run `32194641563`;
- job `95896037812`;
- artifact `9345432655`;
- digest `sha256:2ee934cd0dbfbe8120250533aa7cd3b3954dc8ebeaffb5dec4b6917eaefb1af5`;
- source materializado `3a6d33810719f4b98ea0dd10a4ec7408d043f336`;
- Hosting deploy `1/1`;
- `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`;
- SHA local/remoto `04a43c3646b37b546788c414c8dfeac8bea7b4eae9a431e0186d6a0a52ff4493`;
- `remoteExactByteParity=true`;
- `exactIdentityMapExport=true`;
- `conflictOverwrite=false`;
- `canonicalPresenceRequired=true`;
- `fuzzyMatching=false`.

El primer transporte `7ccd1f7c...` se detuvo en preflight por documentación `app/docs/` antes del claim/Firebase/deploy; tuvo Hosting deploys `0` y no consumió la operación provider. El source se reancló al HEAD pre-request `3a6d338...`, cuyo adapter era el mismo blob exacto `c1c0627f...`; no se relajó el guard.

Request Hosting consumido/disabled en `c225981c57ba8583456174e39366db8a20f5b35a`. No repetir.

## Safety

En el Hosting PASS: Staff runtime `0`; Historical Shopper `0`; provider identity/Firestore-data/Auth/Rules/HR/Storage/Make/Gemini/payment writes `0`; Cloud Run `0`; password/user changes `0`; merge/production false.

## Claude / prototipo

**No hay ajuste frontend que aplicar.** `/app/modules` y `/app/core` no se tocaron. No introducir workaround UI para este hallazgo.

La corrección está en adapter protegido/backend runtime y mantiene la interfaz pública de `CX.data`; solo corrige la composición de `__identityMap`.

## Academia

Sin cambio visible de rutas, manuales, cursos o certificaciones en este bloque. No requiere contenido nuevo hasta que la observación Staff final confirme cierre runtime.

## Siguiente frontera exacta

`NEW_AUTH_REQUIRED_I3_11C_STAFF_RUNTIME_CANONICAL_IDENTITY_CLOSE_READONLY_AFTER_HOSTING`.

Requiere autorización nueva y separada para **una única** observación Staff/Admin existente en DEV, read-only, sin deploys ni writes. Debe comprobar:
- `CX.data.__identityMap['shp-57d2e3769946'] === 'TYA_GT_0C0BA8856E'`;
- agosto canonical `2`;
- residual `0`;
- duplicateVisitKeys `0`;
- duplicateShopperIds `0`;
- Historical Shopper `0`;
- todos los writes/deploys prohibidos `0`;
- merge/production false.

No reabrir R3-A/B/C anteriores, provider repair, usuarios, HR ni Historical Shopper.
