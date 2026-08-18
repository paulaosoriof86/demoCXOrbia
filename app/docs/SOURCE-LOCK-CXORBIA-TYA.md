# SOURCE LOCK CXORBIA TyA — ESTABLE Y VIGENTE

**Última sincronización:** 2026-08-18 17:41 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4-SCOPE-SOURCE-GAP-16`  
**Estado:** `LOCKED__I3_INTEGRAL_PASS_FROZEN__GO_LIVE_60__I4_SCOPE_SOURCE_GAP__NO_I4_EXECUTION__NO_PRODUCTION`

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
- I4 `0/25` — **no iniciado**.
- I5 `0/15` — no iniciado.

**60% completado / 40% pendiente.**

## Frozen / no reprocesar

I1/I2; I3.1→I3.11C; Historical Shopper; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C run `32163552089`; focal provider read `32171812808`; R3-B `32181137350`; Staff post-hardening `32192976458`; Hosting identityMap PASS `32194641563`; Staff final PASS `32196648462`; HR `15/660`; Finance V2/historical; legal V0.4.

No crear Admin/Shopper alterno, no reset/recovery Historical Shopper, no Rules redeploy, no provider identity-link repair, no otro Hosting identityMap deploy y no rerun de gates I3 consumidos.

## I3 integral — evidencia congelada

- Hosting identityMap: run `32194641563`, job `95896037812`, artifact `9345432655`, digest `sha256:2ee934cd0dbfbe8120250533aa7cd3b3954dc8ebeaffb5dec4b6917eaefb1af5`; `1/1` Hosting DEV deploy consumido; remote byte/SHA parity exacta; exactIdentityMapExport `true`; fuzzy `false`.
- Staff final: run `32196648462`, run number `2368`, event `push`, job `95901931320`, artifact `9346121436`, digest `sha256:b3ccc4d9e45a6d42b6ab8a0dcb4cf8e9cfbe6b6ea8409c72524347c7df02189d`; `PASS_READONLY_POST_GATES`; `staffReadonlyExecuted=true`.
- `CX.data.__identityMap['shp-57d2e3769946'] === 'TYA_GT_0C0BA8856E'`; identityMap size `209`; agosto canonical `2`; residual live `0`; reload/nueva pestaña estables.
- duplicateVisitKeys `0` y duplicateShopperIds `0` preservados desde Staff run `32192976458`; el post-compose interveniente no muta `shoppers` ni `visits` y ambos runs observaron `660` visitas.
- Historical Shopper access `0`; user/password changes `0`; Auth/Firestore/HR/Rules/Storage writes `0`; Rules/Hosting/Cloud Run deploys `0`; Make/Gemini/payment `0`; merge/production false.
- Request I3 final `enabled=false / consumed=true / status=pass_consumed` en `0ea4bb6d58ba547db2337bd367f10c32f2540e8b`.

## I4 — recuperación canónica de alcance

Bloque ejecutado: `RECOVER_CANONICAL_I4_SCOPE_FROM_ACTIVE_PLAN_LOCK__NO_EXECUTION_YET`.

### Hallazgo reproducible

Las fuentes activas recuperadas sostienen simultáneamente dos estructuras distintas:

1. El estado vivo posterior a I3 utiliza la ponderación formal `I1=15`, `I2=20`, `I3=25`, `I4=25`, `I5=15` y deja I4 en `0/25`.
2. El índice/plan canónico heredado disponible está estructurado por `CORTE 0B` y `CORTES 1–8`; contiene un `CORTE 4`, pero **no declara que `CORTE 4` sea equivalente al I4 actual de 25 puntos**.

La búsqueda dirigida en índice, source lock, checkpoint, plan Phase A, documentación viva de `app/docs`, commits y conversación del PR #7 no materializó una definición semántica ni subgates autoritativos para el I4 actual.

### Adjudicación

`ACTIVE_SOURCE_GAP__I1_I5_PERCENT_WEIGHTS_PRESENT_BUT_I4_SEMANTIC_SCOPE_NOT_MATERIALIZED`

Reglas de cierre:
- `CORTE 4` legado **NO se promueve** a I4 por nombre/número.
- La etiqueta histórica `corte4` del PR **NO prueba** equivalencia semántica.
- No se inventan subgates, proveedor, deploy, write ni criterios de PASS de I4.
- I4 permanece `0/25`; avance permanece **60% / 40%**.
- I3 sigue congelado y no se reabre.

## Siguiente frontera exacta

`MATERIALIZE_CANONICAL_I4_SCOPE_FROM_APPROVED_SOURCE__NO_EXECUTION`

Se requiere localizar/aportar la fuente aprobada que definió el esquema I1–I5 de `15/20/25/25/15` junto con el significado/subgates de I4, o una instrucción vigente explícita que los materialice. Hasta entonces no hay ejecución I4 segura.

## Producto / Claude / Academia

- **Reusable CXOrbia:** regla antidesvío de no mapear nomenclaturas históricas por coincidencia numérica.
- **Exclusivo TyA:** brecha documental del plan de salida; sin cambio de datos.
- **Claude/prototipo:** sin parche UI; `/app/modules` y `/app/core` intactos en este bloque.
- **Academia:** sin cambio funcional visible; sin cambios de manuales, cursos, rutas por rol ni notificaciones.
- **Sin impacto Claude inmediato:** recuperación documental/read-only y source lock.
