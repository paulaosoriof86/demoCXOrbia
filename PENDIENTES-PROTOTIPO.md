# PENDIENTES-PROTOTIPO.md

**Última sincronización:** 2026-08-18 16:53 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-IDENTITYMAP-HOSTING-PASS-STAFF-AUTH-NEXT-12`  
**Estado:** `NO_UI_WORKAROUND__IDENTITYMAP_HOSTING_PASS_CONSUMED__FINAL_STAFF_AUTH_NEXT__GO_LIVE_35`

## Pendiente vivo único antes de cerrar I3

`NEW_AUTH_REQUIRED_I3_11C_STAFF_RUNTIME_CANONICAL_IDENTITY_CLOSE_READONLY_AFTER_HOSTING`.

La corrección source de identityMap ya está materializada en Firebase Hosting DEV y congelada PASS. No corresponde otro deploy ni otra corrección source antes de la observación final.

## Hosting DEV — PASS

- Run `32194641563`.
- Job `95896037812`.
- Artifact `9345432655`.
- Digest `sha256:2ee934cd0dbfbe8120250533aa7cd3b3954dc8ebeaffb5dec4b6917eaefb1af5`.
- Source `3a6d33810719f4b98ea0dd10a4ec7408d043f336`.
- Deploys `1/1`.
- Decisión `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`.
- SHA local/remoto `04a43c3646b37b546788c414c8dfeac8bea7b4eae9a431e0186d6a0a52ff4493`.
- `remoteExactByteParity=true`.
- `exactIdentityMapExport=true`.
- `conflictOverwrite=false`.
- `canonicalPresenceRequired=true`.
- `fuzzyMatching=false`.

Request Hosting quedó disabled/consumed en `c225981c57ba8583456174e39366db8a20f5b35a` y **no se repite**.

El transporte inicial `7ccd1f7c...` quedó clasificado como preflight failure sin claim/Firebase/deploy y con Hosting deploys `0`; no es una segunda materialización.

## Qué debe verificar la próxima observación Staff

Usar únicamente la identidad Staff/Admin existente y DEV materializado. Acceptance:

- `shp-57d2e3769946 -> TYA_GT_0C0BA8856E` presente en `CX.data.__identityMap`;
- agosto canonical `2`;
- residual live `0`;
- duplicateVisitKeys `0`;
- duplicateShopperIds `0`;
- estabilidad reload + nueva pestaña según harness ya endurecido;
- postulación/legal sin regresión;
- Historical Shopper access `0`.

## Límites del siguiente gate

Cero provider/Auth/Firestore/Rules/HR/Storage/Make/Gemini/payment writes; cero Hosting/Cloud Run deploys; cero cambios de contraseña/usuarios; cero Shopper histórico; cero merge; cero producción.

La observación Staff requiere **autorización nueva y separada**. No reutilizar autorización Hosting.

## No pendientes en este slice

- No hay parche UI.
- No hay cambio en `/app/modules` ni `/app/core`.
- No hay provider/user repair.
- No hay Rules redeploy.
- No hay nueva candidata/branch/PR/metodología.
- No hay cambio visible de Academia por documentar todavía.

## Avance

Formal: **35% / 65%** hasta PASS integral de I3. Con I3 integral PASS: **60% / 40%**.
