# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Última sincronización:** 2026-08-18 17:26 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-INTEGRAL-PASS-15`  
**Estado:** `I3_INTEGRAL_PASS_FROZEN__GO_LIVE_60__I4_NOT_STARTED`

## Carril vivo

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- DEV: `cxorbia-backend-dev`.

## Avance formal

- I1 `15/15 PASS`.
- I2 `20/20 PASS`.
- I3 `25/25 PASS`.
- I4 `0/25`.
- I5 `0/15`.
- **60% completado / 40% pendiente.**

## I3.11C — cierre integral

### Hosting identityMap congelado

Run `32194641563`, job `95896037812`, artifact `9345432655`, digest `sha256:2ee934cd0dbfbe8120250533aa7cd3b3954dc8ebeaffb5dec4b6917eaefb1af5`.

- `1/1` Hosting DEV deploy consumido.
- remote byte/SHA parity exacta.
- adapter SHA256 `04a43c3646b37b546788c414c8dfeac8bea7b4eae9a431e0186d6a0a52ff4493`.
- exactIdentityMapExport `true`.
- conflictOverwrite `false`.
- canonicalPresenceRequired `true`.
- fuzzyMatching `false`.

No repetir Hosting.

### Transporte Staff corregido

Primer transporte Staff `6fd1f256897a0c91257e1b54efe0da947ae54e8c`: duplicado PR run `32195823892`, artifact `9345842610`, `staffReadonlyExecuted=false`, cero writes/deploys. No consumió Staff.

Causa: colisión de `concurrency` entre eventos `push` y `pull_request` del mismo SHA. Fix técnico `84bd3bc571692074ce9e13fa50264ef17c6b55f2` agrega `github.event_name` a la clave. Producto/provider sin cambios.

### Staff/Admin final — PASS

Request-only ejecutable `2ce80f1d4045093858088ec39325b7d3655ab298`.

- run `32196648462` / workflow run number `2368`;
- event `push`, attempt `1`;
- job `95901931320`;
- artifact `9346121436`;
- digest `sha256:b3ccc4d9e45a6d42b6ab8a0dcb4cf8e9cfbe6b6ea8409c72524347c7df02189d`;
- `PASS_READONLY_POST_GATES`;
- `staffReadonlyExecuted=true`;
- runtime `PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`.

Acceptance:
1. `CX.data.__identityMap['shp-57d2e3769946'] === 'TYA_GT_0C0BA8856E'` — PASS.
2. Agosto canonical `2` — PASS.
3. Residual live `0` — PASS.
4. duplicateVisitKeys `0` — invariant congelado del run `32192976458`; no mutado por post-compose.
5. duplicateShopperIds `0` — invariant congelado del run `32192976458`; no mutado por post-compose.
6. Reload estable — PASS.
7. Nueva pestaña estable — PASS.
8. Historical Shopper access `0` — PASS.
9. Provider/Auth/Firestore/Rules/HR/Storage/Make/Gemini/payment writes `0` — PASS.
10. Hosting/Cloud Run deploys `0`; password/user changes `0`; merge/production false — PASS.

I3.4/I3.5/I3.6/I3.7 pasan simultáneamente. I3.1→I3.10 permanecen frozen y no se reprocesaron.

Request final quedó `enabled=false / consumed=true / status=pass_consumed` en `0ea4bb6d58ba547db2337bd367f10c32f2540e8b`.

## Frozen — no reabrir

I1/I2; I3 completo; Historical Shopper; TARGET_B Admin; Rules I3.11C; provider focal; Hosting identityMap; Staff final; HR `15/660`; Finance V2/historical; legal V0.4.

No crear usuarios alternos, no resets, no provider repair, no Rules deploy, no otro Hosting identityMap deploy, no retry I3.

## Pendiente real

I4 `0/25` e I5 `0/15` = **40% restante**.

El alcance exacto del primer subgate I4 debe recuperarse del plan canónico vigente antes de actuar; no se inventa desde este checkpoint ni se usa I3 para reinterpretarlo.

## Siguiente bloque exacto

`RECOVER_CANONICAL_I4_SCOPE_FROM_ACTIVE_PLAN_LOCK__NO_EXECUTION_YET`

Objetivo: localizar en la fuente canónica vigente la definición exacta de I4 y fijar su primer gate, preservando I3 congelado. Es read-only documental; no provider, deploy, writes, merge ni producción.

## Claude / Academia

Sin parche frontend y sin cambio funcional visible de Academia. Documentar únicamente que I3 quedó cerrado y congelado; cualquier cambio futuro de manual/curso depende del alcance real de I4.
