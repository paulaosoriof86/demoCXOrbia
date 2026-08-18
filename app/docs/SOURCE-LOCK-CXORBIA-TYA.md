# SOURCE LOCK CXORBIA TyA — ESTABLE Y VIGENTE

**Última sincronización:** 2026-08-18 12:37 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-FOCAL-ADJUDICATION-02`  
**Estado:** `LOCKED__I3_11C_PROVIDER_TARGET_LINK_INTACT_APPLICABLE__TEMPORAL_RUNTIME_DIVERGENCE_FORENSIC__NO_PRODUCTION`

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

Canonical state: `app/docs/CXORBIA-EXECUTION-STATE.json`.

## Formal

**35% completado / 65% pendiente.** I3 sigue `0/25` hasta PASS integral; al cerrar I3 pasa a 60%.

## Frozen / no rerun

I1/I2; I3.1→I3.8; I3.9/I3.10; Historical Shopper run `31906391682`; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C run `32163552089`; focal provider read run `32171812808`; HR 15/660; Finance V2/historical; legal V0.4.

No crear Admin/Shopper workaround. No reset/recovery Historical Shopper. No Rules redeploy. No provider identity-link repair con la evidencia actual.

## Hallazgo nuevo probado

Focal read run `32171812808`:
- exact link `irl_3ed1b9a65d36c5873c1306bae1621e9d` presente;
- mapping exacto `shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
- `tenant=tya`, `project/projectScope=cinepolis`, `sourceSystem=hr`;
- status `materialized`, authority `tenant_adjudication`, periodIndependent `true`;
- normalized applicable/trusted `true`;
- field diff `[]`;
- colección: 2 documentos, 2 trusted normalized, 0 rejected;
- provider reads 2, provider writes 0.

Esto descarta como causa persistente actual: deleted, deactivated, re-scoped, mutated y target structurally non-applicable.

Contradicción pendiente: el Staff runtime previo observó 1 provider link y 0 target links. No está demostrado todavía si hubo cambio provider posterior o si el runtime usó un snapshot stale/incompleto o filtró/ordenó mal el refresh.

## Siguiente frontera

`I3_11C_TEMPORAL_WRITE_HISTORY_AND_RUNTIME_STALENESS_FORENSIC_NO_PROVIDER_READS`

Solo GitHub/source/evidence:
1. reconstruir cronología entre Staff run y focal read;
2. identificar cualquier ejecución autorizada/no-op que pudiera escribir `shopperIdentityLinks`;
3. revisar event ordering, refresh, caching y filtros del runtime;
4. emitir `proven/disproven/unknown` y el mínimo siguiente gate.

Provider/Auth/Firestore-data/Rules/Hosting/CloudRun/HR/Storage/Make/Gemini/pagos/Historical Shopper/merge/production = `0`.

## Circuit breaker

- PASS consumido no se repite salvo regresión nueva reproducible.
- Si el mismo blocker reaparece dos veces sin nueva reducción causal: `FORENSIC_STOP`.
- Si documentación y evidence/HEAD divergen: `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`.
- Si un gate se ejecutó pero no se sincronizó: `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`.

## Producto

TyA = primer tenant; Cinépolis = primer proyecto normal configurable. Multi-tenant/no-code permanece obligatorio; ningún hallazgo local se convierte en hardcode global. Backend conserva CX.data y no parcha módulos UI. Claude recibe hallazgos reusable por archivo/módulo y criterios de aceptación; Academia/manuales/notificaciones acompañan cambios operacionales.

## Producción

I4 visible después de I3; I5 build lock/preprod/rollback/E2E/gate producción/cutover/smoke/baseline. Este source lock y el Atomic Gate Close siguen vigentes post-go-live.
