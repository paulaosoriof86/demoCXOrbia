# SOURCE LOCK CXORBIA TyA — ESTABLE Y VIGENTE

**Última sincronización:** 2026-08-18 17:26 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-INTEGRAL-PASS-15`  
**Estado:** `LOCKED__I3_INTEGRAL_PASS_FROZEN__GO_LIVE_60__I4_NOT_STARTED__NO_PRODUCTION`

## Carril vigente

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR: #7 draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- DEV: `cxorbia-backend-dev`.

No crear nueva rama/PR/candidata/metodología. No usar workaround UI. No merge ni producción sin gate explícito.

## Avance formal

- I1 `15/15 PASS`.
- I2 `20/20 PASS`.
- I3 `25/25 PASS` — integral y congelado.
- I4 `0/25` — no iniciado.
- I5 `0/15` — no iniciado.

**60% completado / 40% pendiente.**

## Frozen / no reprocesar

I1/I2; I3.1→I3.11C; Historical Shopper; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C run `32163552089`; focal provider read `32171812808`; R3-B `32181137350`; R3-C Hosting anterior `32185940998`; Staff navigation HOLD `32188716203`; Staff post-hardening HOLD `32192976458`; identityMap source fix; Hosting identityMap PASS `32194641563`; Staff final PASS `32196648462`; HR `15/660`; Finance V2/historical; legal V0.4.

No crear Admin/Shopper alterno, no reset/recovery Historical Shopper, no Rules redeploy, no provider identity-link repair, no otro Hosting identityMap deploy y no rerun de gates I3 consumidos.

## I3.11C — cadena final cerrada

### Evidencia Staff previa congelada

Run `32192976458`, job `95891132356`, artifact `9344922862`, digest `sha256:2ac557db3318bbcd9013e455aa8bc34d64324ce89edbb4e325801ee08c3cc2dc`.

Probó antes del fix post-compose:
- provider exact link `shp-57d2e3769946 -> TYA_GT_0C0BA8856E` presente/aplicado;
- agosto canonical `2`;
- residual `0`;
- duplicateVisitKeys `0`;
- duplicateShopperIds `0`;
- HR `15` períodos / `660` visitas;
- postulación/legal sanos;
- Historical Shopper access `0`.

Único blocker de ese run: el exact link no sobrevivía al `CX.data.__identityMap` final.

### IdentityMap source fix — PASS

Adapter protected/reusable `app/adapters/cxorbia-provider-identity-link-runtime-v1.js`, commit `e8742207db9e81b23f53429d7f487894ae9a9a0d`; parity `0d73d6c3...`; integración P0 `a4c85480...`.

Contrato lock:
- exact/autoritativo únicamente;
- canonical preexistente obligatorio;
- export exacto a identityMap;
- conflicto existente no se sobreescribe;
- no identity creation;
- fuzzy/name/email/phone matching prohibidos;
- post-compose retorna copia de `result` cambiando únicamente `identityMap`; no modifica `result.shoppers` ni `result.visits`;
- no writes.

### Hosting DEV identityMap — PASS / consumido

- request efectivo `d2ff658e7fb1bdac4ae3d4a2df1e6f2a9c8c835a`;
- run `32194641563`;
- job `95896037812`;
- artifact `9345432655`;
- digest `sha256:2ee934cd0dbfbe8120250533aa7cd3b3954dc8ebeaffb5dec4b6917eaefb1af5`;
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

### Transporte Staff final — causa raíz y corrección

Primer request final `6fd1f256897a0c91257e1b54efe0da947ae54e8c` produjo el duplicado `pull_request` run `32195823892`, artifact `9345842610`, con `staffReadonlyExecuted=false` y seguridad completa en cero. No consumió la observación Staff.

Causa reproducible: `push` y `pull_request` usaban la misma clave de `concurrency`; un pending podía ser sustituido por otro evento del mismo grupo. Fix de transporte `84bd3bc571692074ce9e13fa50264ef17c6b55f2`: la clave incluye `github.event_name`. No cambia producto, adapter ni provider; separa únicamente los grupos de evento.

### Staff/Admin final post-Hosting — PASS / consumido

Request ejecutable `2ce80f1d4045093858088ec39325b7d3655ab298`.

Evidencia efectiva:
- workflow `CXORBIA_READONLY_POST_GATES_RUNNER`;
- run `32196648462`, run number `2368`, event `push`, attempt `1`;
- job `95901931320`;
- artifact `9346121436`;
- digest `sha256:b3ccc4d9e45a6d42b6ab8a0dcb4cf8e9cfbe6b6ea8409c72524347c7df02189d`;
- `PASS_READONLY_POST_GATES`;
- `staffReadonlyExecuted=true`;
- runtime `PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`;
- I3.4 `PASS_I3_4_POSTULATION_VS_HR_ASSIGNMENT_AUTHORITY_RUNTIME_READONLY`;
- I3.5 `PASS_I3_5_EXACT_AUGUST_CROSSWALK_RUNTIME_READONLY`;
- I3.6 `PASS_I3_6_HISTORICAL_SHOPPER_PROFILE_HISTORY_REUSE_NO_REPROCESS`;
- I3.7 `PASS_I3_7_DURABLE_LEGAL_RECEIPT_RUNTIME_READONLY`.

Acceptance exacta:
- `CX.data.__identityMap['shp-57d2e3769946'] === 'TYA_GT_0C0BA8856E'`;
- identityMap size `209`;
- agosto canonical `2`;
- residual live `0`;
- reload estable `true`;
- nueva pestaña estable `true`;
- duplicateVisitKeys `0` y duplicateShopperIds `0` conservados desde el run Staff congelado `32192976458`; la única corrección intermedia post-compose no muta shoppers/visits y ambos runs observaron `660` visitas;
- fuzzy matching `false`.

Safety del run final:
- Historical Shopper access `0`;
- Shopper credential selection `0`;
- user creates/updates `0`;
- password changes/resets `0`;
- Auth/Firestore/HR/Rules/Storage writes `0`;
- Rules deploy `0`;
- Make/Gemini/payment `0`;
- Hosting/Cloud Run deploys `0`;
- merge/production false;
- credenciales/tokens expuestos false.

Request final consumido/disabled en commit `0ea4bb6d58ba547db2337bd367f10c32f2540e8b`. **No repetir I3.**

## Siguiente frontera

`I4` queda en `0/25` y **no se ejecuta en este bloque**. El source lock anterior únicamente fijaba “pasar a I4” al cerrar I3; no contiene aquí una redefinición de su subgate. Antes de actuar en I4 se debe resolver su alcance exacto desde el plan canónico vigente, sin inventar un nuevo plan ni reabrir I3.

## Producto / Claude / Academia

- **Reusable CXOrbia:** exact provider link → canonical identityMap; fail-closed; aislamiento de concurrencia por evento para runner one-shot.
- **Exclusivo TyA/Cinépolis:** IDs focales y conteos de agosto; no lógica global.
- **Claude/prototipo:** sin parche UI; `/app/modules` y `/app/core` sin cambios de producto en este cierre.
- **Academia:** sin cambio funcional visible; registrar cierre técnico I3, sin crear contenido nuevo por este slice.
- **Sin impacto Claude inmediato:** ejecución/read-only, consumo de gates y documentación.
