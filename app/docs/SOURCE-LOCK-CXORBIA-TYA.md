# SOURCE LOCK CXORBIA TyA — ESTABLE Y VIGENTE

**Última sincronización:** 2026-08-18 13:13 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-RUNTIME-CONTRACT-DRIFT-03`  
**Estado:** `LOCKED__I3_11C_ROOT_CAUSE_PROVEN_RUNTIME_CONTRACT_DRIFT__SOURCE_CORRECTION_NEXT__NO_PRODUCTION`

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

Canonical state: `app/docs/CXORBIA-EXECUTION-STATE.json`.

## Formal

**35% completado / 65% pendiente.** I3 sigue `0/25` hasta PASS integral; al cerrar I3 pasa a 60%.

## Frozen / no rerun

I1/I2; I3.1→I3.10; Historical Shopper `31906391682`; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C run `32163552089`; focal provider read run `32171812808`; R2B temporal/runtime forensic; HR 15/660; Finance V2/historical; legal V0.4.

No Admin/Shopper workaround, reset/recovery Historical Shopper, Rules redeploy, HR reimport, Finance rebuild ni provider identity-link repair.

## Causa raíz vigente — PROBADA

`PROVEN_RUNTIME_CONTRACT_DRIFT__LEGACY_PROVIDER_IDENTITY_LINK_APPLICABILITY_FILTER`

Evidencia:
- provider focal probó target intacto: `materialized`, `tenant_adjudication`, period-independent, field diff `[]`, normalizado trusted;
- contrato reusable `cxorbia-identity-roll-forward-v1` acepta `materialized` y `tenant_adjudication` con authorityRef;
- runtime live `cxorbia-provider-identity-link-runtime-v1` solo acepta `status === active` + `providerAck === true`;
- por tanto el target `materialized` se excluye determinísticamente del set runtime;
- `index-backend-dev.html` carga ese runtime legacy y no el contrato roll-forward.

Esto explica el Staff runtime `1` link / `0` target links sin necesitar deletion, mutation, re-scope, deactivation ni provider write intermedio.

Evidencia activa: `app/docs/evidence/I3-11C-TEMPORAL-RUNTIME-CONTRACT-DRIFT-FORENSIC-LATEST.json`.

## Siguiente frontera

`I3_11C_UNIFY_PROVIDER_IDENTITY_RUNTIME_WITH_CANONICAL_ROLL_FORWARD_SOURCE_CORRECTION_NO_PROVIDER_IO`

Permitido:
- modificar solo `app/adapters/cxorbia-provider-identity-link-runtime-v1.js` para alinear trust/applicability con el contrato canónico y preservar su API;
- agregar QA source/parity gate reusable;
- actualizar evidencia/documentación.

Prohibido en este bloque:
- `/app/modules` y `/app/core`;
- provider/Auth/Firestore data/Rules/HR/Storage/Make/Gemini/pagos I/O;
- deploy Hosting/Cloud Run/Rules;
- Historical Shopper;
- merge/producción.

## Después de la corrección source

No se asume PASS runtime por estática. Se define un gate read-only exacto para Staff. PASS I3 mínimo: `shp-57d2e3769946 → TYA_GT_0C0BA8856E`, agosto canonical `2`, residual live `0`, duplicados `0`, invariantes congeladas preservadas.

## Circuit breaker / source truth

PASS consumido no se repite salvo regresión nueva reproducible. Mismatch docs/evidence → `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`. Gate ejecutado no sincronizado → `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`. Dos repeticiones no reductivas → `FORENSIC_STOP`.

## Producto

TyA = primer tenant; Cinépolis = primer proyecto configurable. El defecto es **Reusable CXOrbia**, no lógica Cinépolis. La corrección debe mantener multi-tenant, multi-proyecto, exact technical identity y cero fuzzy/name/email/phone matching. Backend no parcha UI; Claude recibe cualquier impacto frontend solo si se demuestra.

## Producción

I4 visible después de I3; I5 build lock/preprod/rollback/E2E/gate producción/cutover/smoke/baseline. Este source lock y Atomic Gate Close continúan post-go-live.
