# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-18 16:53 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-IDENTITYMAP-HOSTING-PASS-STAFF-AUTH-NEXT-12`  
**Estado:** `IDENTITYMAP_SOURCE_FIX_PASS__HOSTING_DEV_REMOTE_PARITY_PASS_CONSUMED__FINAL_STAFF_AUTH_NEXT__GO_LIVE_35`

## Carril preservado

Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

No se creó rama, PR, candidata ni metodología nueva. `/app/modules` y `/app/core` no fueron tocados en este bloque.

## I3.11C — evidencia previa congelada

Staff post-hardening: run `32192976458`, job `95891132356`, artifact `9344922862`, digest `sha256:2ac557db3318bbcd9013e455aa8bc34d64324ce89edbb4e325801ee08c3cc2dc`.

Ese run llegó al runtime real y probó HR `15` períodos / `660` visitas; provider exact link `shp-57d2e3769946 -> TYA_GT_0C0BA8856E` presente/aplicado (`materialized`, `tenant_adjudication`); agosto canonical `2`; residual live `0`; duplicateVisitKeys `0`; duplicateShopperIds `0`; postulación y legal sanos; Historical Shopper `0`.

El único blocker era `PROVIDER_EXACT_LINK_APPLIED_BUT_NOT_EXPORTED_TO_CANONICAL_IDENTITY_MAP`: `CX.data.__identityMap['shp-57d2e3769946']` no exportaba todavía el canonical.

## Corrección source-only identityMap — PASS

- Adapter reusable: commit `e8742207db9e81b23f53429d7f487894ae9a9a0d`, `app/adapters/cxorbia-provider-identity-link-runtime-v1.js`.
- Parity source: commit `0d73d6c3dced2d5c0e826a16fd2f785634af7515`.
- Integración P0: commit `a4c85480b10678eca83aae5781d255a27a994446`.
- Blob del adapter corregido preservado hasta el source materializado: `c1c0627f34243e43b52219198ea023b0af387041`.

Contrato: authoritative exact links únicamente; canonical debe existir; export exacto a `identityMap`; no overwrite de conflictos; no creación de identidad; no fuzzy/nombre/email/teléfono; cero writes.

## Materialización Hosting DEV autorizada — PASS / consumida

Autorización de Paula: máximo `1` Hosting DEV deploy, cero Staff y cero demás writes/deploys.

### Transporte inicial detenido antes del provider

Commit request-only `7ccd1f7c1659ebade36d5019ea9b5833061c7372`; run `32194417895`, job `95895391462`.

Preflight detectó como `app_drift` dos archivos puramente documentales bajo `app/docs/`. El flujo se detuvo **antes del claim, antes de credencial Firebase, antes del CLI y antes del deploy**. Hosting deploys `0`; provider/data/Auth/Rules/HR/Storage/Make/Gemini/payment/Staff/Historical Shopper `0`.

Se verificó que el adapter en `a4c85480...` y en el HEAD pre-request `3a6d33810719f4b98ea0dd10a4ec7408d043f336` era exactamente el mismo blob `c1c0627f...`. No se relajó el workflow: el source autorizado se reancló al HEAD pre-request que contiene ese mismo runtime exacto y el transporte fallido quedó registrado como pre-claim.

### Ejecución efectiva única

Request-only commit `d2ff658e7fb1bdac4ae3d4a2df1e6f2a9c8c835a`.

- Run: `32194641563`.
- Job: `95896037812`.
- Artifact: `9345432655`.
- Artifact digest: `sha256:2ee934cd0dbfbe8120250533aa7cd3b3954dc8ebeaffb5dec4b6917eaefb1af5`.
- Source HEAD materializado: `3a6d33810719f4b98ea0dd10a4ec7408d043f336`.
- Hosting deploys: `1/1`.
- Decisión: `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`.
- Source parity: `PASS_PROVIDER_IDENTITY_RUNTIME_CANONICAL_CONTRACT_PARITY`.
- Local adapter SHA256: `04a43c3646b37b546788c414c8dfeac8bea7b4eae9a431e0186d6a0a52ff4493`.
- Remote adapter SHA256: `04a43c3646b37b546788c414c8dfeac8bea7b4eae9a431e0186d6a0a52ff4493`.
- `remoteExactByteParity=true`.
- `exactIdentityMapExport=true`.
- `conflictOverwrite=false`.
- `canonicalPresenceRequired=true`.
- `fuzzyMatching=false`.

Safety del run: providerIdentityWrites `0`; Firestore-data/Auth/Rules/HR/Storage/Make/Gemini/payment `0`; Historical Shopper `0`; Staff runtime `0`; Cloud Run `0`; password changes/resets `0`; user creates/updates `0`; merge/production false.

El request Hosting quedó `enabled=false`, `consumed=true`, `status=pass_consumed` en commit `c225981c57ba8583456174e39366db8a20f5b35a`. No se repite.

## Archivos tocados en este bloque

- `backend/config/i3-11-identity-link-runtime-bridge-rules-hosting-dev.json` — autorización, transporte corregido y consumo PASS.
- `CAMBIOS-BACKEND.md` — este cierre.
- `RESUMEN-PARA-CLAUDE.md` — continuidad sin parche UI.
- `PENDIENTES-PROTOTIPO.md` — siguiente gate exacto.
- `app/docs/SOURCE-LOCK-CXORBIA-TYA.md` — lock vigente.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md` — checkpoint operativo.

No hubo cambio frontend visible ni cambio de Academia. El adapter ya corregido era source previo a esta autorización; este bloque solo lo materializó en Hosting DEV.

## Clasificación

- **Reusable CXOrbia:** export exacto provider-link -> canonical identityMap y materialización con byte/SHA parity.
- **Exclusivo TyA/Cinépolis:** IDs `shp-57d2e3769946` / `TYA_GT_0C0BA8856E` y evidencia agosto.
- **Claude/prototipo:** sin parche UI, sin cambio de módulos.
- **Academia:** sin cambio funcional visible; no requiere contenido nuevo en este bloque.
- **Sin impacto Claude inmediato:** Hosting DEV y validación backend.

## Avance Phase A

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 formal` hasta cierre integral; I4 `0/25`; I5 `0/15` = **35% completado / 65% pendiente**.

I3 integral PASS elevará el avance a **60% / 40%**. No se adjudican los 25 puntos antes de la última observación runtime.

## Siguiente bloque exacto

`NEW_AUTH_REQUIRED_I3_11C_STAFF_RUNTIME_CANONICAL_IDENTITY_CLOSE_READONLY_AFTER_HOSTING`.

Una sola observación Staff/Admin existente en DEV, read-only, sin deploy ni writes, para verificar finalmente:
`shp-57d2e3769946 -> TYA_GT_0C0BA8856E` en `CX.data.__identityMap`; agosto canonical `2`; residual `0`; duplicateVisitKeys `0`; duplicateShopperIds `0`; Historical Shopper `0`; todos los writes/deploys prohibidos `0`; merge/production false.
