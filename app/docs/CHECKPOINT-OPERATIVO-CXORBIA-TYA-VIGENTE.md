# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Última sincronización:** 2026-08-18 16:39 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-IDENTITYMAP-SOURCE-PASS-HOSTING-AUTH-NEXT-11`  
**Estado:** `I3_11C_STAFF_POST_HARDENING_HOLD_CONSUMED__IDENTITYMAP_SOURCE_FIX_PASS__HOSTING_AUTH_NEXT__GO_LIVE_35`

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

## I3.11C — evidencia vigente

### Rules — PASS / frozen
Run `32163552089`; no redeploy.

### Provider focal — frozen
Run `32171812808`; no repair ni repetición.

### R3-C Hosting anterior — PASS / frozen
Run `32185940998`, job `95869431778`, artifact `9342450216`, digest `sha256:03ccb5a71af356eade7eb498fc766af1fb4f266bb12397d2bff1f865714a09bb`.

Materializó el contrato provider anterior con remote parity. El post-compose identityMap source fue creado después y todavía no está desplegado.

### Staff post-hardening — HOLD / consumido
Run `32192976458`, job `95891132356`, artifact `9344922862`, digest `sha256:2ac557db3318bbcd9013e455aa8bc34d64324ce89edbb4e325801ee08c3cc2dc`.

El hardening eliminó el falso timeout de navegación y permitió observar runtime real:
- role `admin` / namespace `staff` / membership PASS;
- HR authority: 15 períodos, 660 visitas;
- provider target link exacto presente, status `materialized`, authority `tenant_adjudication`, source key exacto `shp-57d2e3769946`;
- precompose aplicado sin conflictos;
- agosto bajo canonical `TYA_GT_0C0BA8856E`: `2`;
- residual live: `0`;
- duplicates visitas/shoppers: `0/0`;
- postulation authority y legal provider receipt estables;
- Historical Shopper access `0`.

Miss exacto: `CX.data.__identityMap['shp-57d2e3769946']` ausente (`targetCanonicalActual=null`).

El request quedó consumed/disabled en `b5effad60d643776c4deeb82a43b4ea114a1ec58`; no retry automático.

Safety: user/password changes `0`; provider/Auth/Firestore/Rules/HR/Storage writes `0`; Make/Gemini/payment `0`; Hosting/Cloud Run deploys `0`; merge/production false.

## Causa raíz

`PROVIDER_EXACT_LINK_APPLIED_BUT_NOT_EXPORTED_TO_CANONICAL_IDENTITY_MAP`.

El cumulative composer construía `identityMap` desde HR shoppers/relaciones exactas reconstruidas, mientras el provider adapter precompose ya había canonicalizado los perfiles. Resultado: las visitas y perfil podían estar canonicalizados pero el alias provider exacto no sobrevivía explícitamente en `identityMap`.

## Source fix aplicado y validado

1. `e8742207db9e81b23f53429d7f487894ae9a9a0d` — `app/adapters/cxorbia-provider-identity-link-runtime-v1.js`: post-compose exact provider-link → identityMap, canonical presence obligatoria, no overwrite, no fuzzy.
2. `0d73d6c3dced2d5c0e826a16fd2f785634af7515` — parity test del export exacto/fail-closed.
3. `a4c85480b10678eca83aae5781d255a27a994446` — parity integrado al P0 source gate.

Source evidence:
- Source Safe Runtime Guard SUCCESS.
- Visual Smoke run `32193643479`: `Run P0 exact identity source gates` SUCCESS; ese gate ejecuta el parity exacto de identityMap.
- Request Staff permanece disabled/consumed, por lo que source commits no ejecutan Staff/provider.

## Frozen / no reprocesar

I1/I2/I3.1→I3.10; Historical Shopper; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C; focal provider; R3-B; R3-C anterior; Staff navigation HOLD; Staff post-hardening HOLD; HR 15/660; Finance V2/historical; legal V0.4.

## Siguiente bloque exacto

`NEW_AUTH_REQUIRED_I3_11C_DEV_HOSTING_MATERIALIZE_IDENTITYMAP_POSTCOMPOSE_SOURCE_NO_STAFF`.

Con autorización expresa: máximo 1 Firebase Hosting DEV deploy del source exacto + remote byte/SHA parity del adapter corregido. Cero Staff; cero provider/data/Auth/Rules/HR/Storage/Make/Gemini/payment writes; cero Historical Shopper; cero Cloud Run; cero merge/production.

Después: nueva autorización separada para una única observación Staff read-only. Acceptance final: mapping exacto, agosto `2`, residual `0`, duplicates `0/0`.

## Después de I3

I4 visible: shopper lifecycle; agenda/visita/evidencias/cuestionario/review; sync HR bidireccional; finanzas/liquidaciones/pagos; multi-proyecto/no-code; roles/notificaciones/integraciones; Academia/manuales/rutas. Luego I5 producción bajo gate explícito.

## Estado seguro

Sin merge ni producción. Sin base legacy conectada. Sin datos sensibles crudos en repo.
