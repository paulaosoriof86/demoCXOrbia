# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-18 17:26 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-INTEGRAL-PASS-15`  
**Estado:** `I3_INTEGRAL_PASS_FROZEN__GO_LIVE_60__I4_NOT_STARTED`

## Carril preservado

Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

No se creó rama, PR, candidata ni metodología nueva. No hubo merge ni producción. `/app/modules` y `/app/core` no fueron tocados por este cierre.

## I3.11C — cadena técnica preservada

### Staff post-hardening previo

Run `32192976458`, job `95891132356`, artifact `9344922862`, digest `sha256:2ac557db3318bbcd9013e455aa8bc34d64324ce89edbb4e325801ee08c3cc2dc`.

Probó HR `15` períodos / `660` visitas; provider exact link `shp-57d2e3769946 -> TYA_GT_0C0BA8856E` presente/aplicado (`materialized`, `tenant_adjudication`); agosto canonical `2`; residual live `0`; duplicateVisitKeys `0`; duplicateShopperIds `0`; postulación/legal sanos; Historical Shopper `0`.

Único blocker entonces: `PROVIDER_EXACT_LINK_APPLIED_BUT_NOT_EXPORTED_TO_CANONICAL_IDENTITY_MAP`.

### Corrección source-only identityMap — PASS

- Adapter reusable: `app/adapters/cxorbia-provider-identity-link-runtime-v1.js`, commit `e8742207db9e81b23f53429d7f487894ae9a9a0d`.
- Parity source: `0d73d6c3dced2d5c0e826a16fd2f785634af7515`.
- Integración P0: `a4c85480b10678eca83aae5781d255a27a994446`.
- Blob adapter: `c1c0627f34243e43b52219198ea023b0af387041`.

Contrato: exact/autoritativo únicamente; canonical ya existente; export exacto a `identityMap`; no overwrite de conflictos; no creación de identidad; fuzzy/nombre/email/teléfono desactivados; post-compose no modifica `shoppers` ni `visits`; cero writes.

### Hosting DEV identityMap — PASS / consumido

Autorización: máximo `1` Hosting DEV deploy, cero Staff y cero demás writes/deploys.

Primer transporte `7ccd1f7c1659ebade36d5019ea9b5833061c7372`, run `32194417895`, job `95895391462`, se detuvo en preflight antes de claim/Firebase/deploy; Hosting deploys `0`.

Ejecución efectiva:
- request `d2ff658e7fb1bdac4ae3d4a2df1e6f2a9c8c835a`;
- run `32194641563`;
- job `95896037812`;
- artifact `9345432655`;
- digest `sha256:2ee934cd0dbfbe8120250533aa7cd3b3954dc8ebeaffb5dec4b6917eaefb1af5`;
- source `3a6d33810719f4b98ea0dd10a4ec7408d043f336`;
- Hosting deploys `1/1`;
- `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`;
- local/remote SHA256 `04a43c3646b37b546788c414c8dfeac8bea7b4eae9a431e0186d6a0a52ff4493`;
- remoteExactByteParity `true`;
- exactIdentityMapExport `true`;
- conflictOverwrite `false`;
- canonicalPresenceRequired `true`;
- fuzzyMatching `false`.

Request Hosting consumido/disabled en `c225981c57ba8583456174e39366db8a20f5b35a`. No repetir.

## I3.11C — Staff/Admin final post-Hosting

### Transporte inicial no ejecutado

Request `6fd1f256897a0c91257e1b54efe0da947ae54e8c` generó el duplicado `pull_request` run `32195823892`, artifact `9345842610`, digest `sha256:53bf05066396cb82b676cf561f4d88ae093b96096d07f55544f36e70ae07e61b`.

Resultado: `staffReadonlyExecuted=false`; Historical Shopper `0`; writes/deploys `0`. No consumió la observación autorizada.

Causa raíz reproducible: `push` y `pull_request` compartían una misma clave de concurrencia para el mismo SHA y el pending de un evento podía ser sustituido por el otro.

### Corrección del runner

Commit `84bd3bc571692074ce9e13fa50264ef17c6b55f2` modifica `.github/workflows/cxorbia-readonly-post-gates-runner.yml` para incluir `github.event_name` en la clave de `concurrency`.

Cambio funcional: separar `push` y `pull_request`; conserva serialización dentro de cada evento. Producto, adapter, provider, credenciales y reglas no cambiaron.

### Ejecución Staff efectiva — PASS

Request-only `2ce80f1d4045093858088ec39325b7d3655ab298`.

- run `32196648462`, run number `2368`;
- event `push`, attempt `1`;
- job `95901931320`;
- artifact `9346121436`;
- digest `sha256:b3ccc4d9e45a6d42b6ab8a0dcb4cf8e9cfbe6b6ea8409c72524347c7df02189d`;
- `PASS_READONLY_POST_GATES`;
- `staffReadonlyExecuted=true`;
- runtime `PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`.

Acceptance final:
- `CX.data.__identityMap['shp-57d2e3769946'] === 'TYA_GT_0C0BA8856E'`;
- identityMap size `209`;
- agosto canonical `2`;
- residual live `0`;
- reload/nueva pestaña estables;
- duplicateVisitKeys `0` y duplicateShopperIds `0` preservados desde `32192976458`; el post-compose no muta shoppers/visits y ambos runs observaron `660` visitas;
- I3.4/I3.5/I3.6/I3.7 PASS.

Safety: Historical Shopper `0`; Shopper credential selection `0`; user/password changes `0`; Auth/Firestore/HR/Rules/Storage writes `0`; Rules/Hosting/Cloud Run deploys `0`; Make/Gemini/payment `0`; merge/production false; credenciales/tokens expuestos false.

Request final consumido/disabled con `status=pass_consumed` en `0ea4bb6d58ba547db2337bd367f10c32f2540e8b`. No retry.

## Clasificación

- **Reusable CXOrbia:** provider exact-link → canonical identityMap; post-compose fail-closed; aislamiento `push`/`pull_request` del runner one-shot.
- **Exclusivo TyA/Cinépolis:** IDs focales, agosto `2/0`, HR `15/660`.
- **Claude/prototipo:** sin parche UI ni cambio de módulos.
- **Academia:** sin cambio funcional visible; no se localizó tracker Academia específico en repo para este slice; impacto registrado aquí y en continuidad viva: sin cambios de manuales, cursos, rutas por rol ni notificaciones.
- **Sin impacto Claude inmediato:** ejecución read-only, gates y documentación.

## Avance Phase A

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS`; I4 `0/25`; I5 `0/15` = **60% completado / 40% pendiente**.

## Siguiente bloque exacto

`RECOVER_CANONICAL_I4_SCOPE_FROM_ACTIVE_PLAN_LOCK__NO_EXECUTION_YET`.

I4 no se inicia hasta recuperar su definición exacta desde la fuente canónica vigente. No reabrir I3.
