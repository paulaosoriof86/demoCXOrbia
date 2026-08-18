# SOURCE LOCK CXORBIA TyA — ESTABLE Y VIGENTE

**Última sincronización:** 2026-08-18 16:39 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-IDENTITYMAP-SOURCE-PASS-HOSTING-AUTH-NEXT-11`  
**Estado:** `LOCKED__R3C_OLD_HOSTING_PASS__STAFF_POST_HARDENING_HOLD_CONSUMED__IDENTITYMAP_SOURCE_FIX_PASS__NEW_HOSTING_AUTH_REQUIRED__NO_PRODUCTION`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Avance formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25` hasta PASS integral; I4 `0/25`; I5 `0/15`. **35% completado / 65% pendiente.** I3 integral PASS → **60% / 40%**.

## Frozen / no reprocesar

I1/I2; I3.1→I3.10; Historical Shopper; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C run `32163552089`; focal provider read `32171812808`; R3-B `32181137350`; R3-C Hosting anterior `32185940998`; Staff navigation HOLD `32188716203`; Staff post-hardening HOLD `32192976458`; HR 15/660; Finance V2/historical; legal V0.4.

No crear Admin/Shopper alterno, no reset/recovery Historical Shopper, no Rules redeploy, no provider identity-link repair, no rerun de one-shots consumidos.

## R3-C Hosting anterior — PASS / frozen

Run `32185940998`, job `95869431778`, artifact `9342450216`, digest `sha256:03ccb5a71af356eade7eb498fc766af1fb4f266bb12397d2bff1f865714a09bb`.

Ese deploy materializó el contrato anterior `materialized + tenant_adjudication` con paridad remota exacta. No se repite. El nuevo post-compose identityMap source es posterior y todavía no ha sido materializado.

## Staff post-hardening — HOLD / consumido

Run `32192976458`, job `95891132356`, artifact `9344922862`, digest `sha256:2ac557db3318bbcd9013e455aa8bc34d64324ce89edbb4e325801ee08c3cc2dc`.

El harness corregido llegó al runtime real. Observado:
- Admin/Staff + membership PASS;
- HR authority `15` períodos / `660` visitas;
- target provider link exacto presente/aplicado;
- canonical target `TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- residual `0`;
- duplicates `0/0`;
- postulación y legal sin regresión;
- Historical Shopper `0`.

Único blocker: `targetCanonicalActual=null` porque el exact provider link no fue exportado a `CX.data.__identityMap`.

Safety: provider/Auth/Firestore/Rules/HR/Storage/Make/Gemini/payment writes `0`; deploys `0`; password/user changes `0`; merge/production false.

Request consumido/disabled en `b5effad60d643776c4deeb82a43b4ea114a1ec58`. No auto-retry.

## Causa raíz vigente

`PROVIDER_EXACT_LINK_APPLIED_BUT_NOT_EXPORTED_TO_CANONICAL_IDENTITY_MAP`.

No es provider data, Auth, user, HR ni UI. El link exacto ya se aplica y las visitas ya están canonicalizadas; faltaba propagar esa autoridad exacta a la salida `identityMap` del read model.

## Corrección source-only — PASS

- Adapter post-compose: `e8742207db9e81b23f53429d7f487894ae9a9a0d`.
- Exact parity tests: `0d73d6c3dced2d5c0e826a16fd2f785634af7515`.
- Parity integrado al P0 source gate: `a4c85480b10678eca83aae5781d255a27a994446`.

Contrato del fix:
- solo provider links authoritative/exact;
- canonical ya presente en output;
- no overwrite de conflictos;
- no creación de identidad;
- no fuzzy/name/email/phone matching;
- no writes.

Evidencia source: Source Safe Runtime Guard SUCCESS y P0 exact identity source gate SUCCESS en Visual Smoke run `32193643479`. Ese P0 ejecuta ahora el parity exacto del identityMap.

## Siguiente frontera exacta

`NEW_AUTH_REQUIRED_I3_11C_DEV_HOSTING_MATERIALIZE_IDENTITYMAP_POSTCOMPOSE_SOURCE_NO_STAFF`.

Se requiere autorización nueva y separada para máximo `1` Firebase Hosting DEV deploy del source exacto + remote byte/SHA parity del adapter. Ese gate debe mantener Staff `0`, provider/data/Auth/Rules/HR/Storage/Make/Gemini/payment writes `0`, Historical Shopper `0`, Cloud Run `0`, merge/production false.

Después de Hosting PASS se pedirá otra autorización separada de Staff read-only para la observación final.

## Circuit breaker

Un blocker → una causa demostrada → un gate exacto → evidencia. Los workflows históricos rojos no reabren gates congelados. No nueva rama, PR, candidata, metodología ni workaround UI.

## Producto / Claude / Academia

TyA primer tenant; Cinépolis primer proyecto configurable, nunca lógica global. Sin cambio UI en este bloque. El patrón post-compose exact/fail-closed es reusable CXOrbia. Academia sin cambio visible hasta slices funcionales I4.

## Producción

Sin autorización de merge ni producción.
