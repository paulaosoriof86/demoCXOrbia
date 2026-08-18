# SOURCE LOCK CXORBIA TyA — ESTABLE Y VIGENTE

**Última sincronización:** 2026-08-18 13:20 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-RUNTIME-SOURCE-CORRECTION-04`  
**Estado:** `LOCKED__RUNTIME_IDENTITY_CONTRACT_SOURCE_CORRECTED__STAFF_READONLY_CLOSE_AUTH_REQUIRED__NO_PRODUCTION`

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

**Formal 35% / 65% pendiente.** I3 integral PASS → 60%.

## Frozen
I1/I2; I3.1→I3.10; Historical Shopper `31906391682`; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules `32163552089`; focal provider `32171812808`; R2B root-cause forensic; HR 15/660; Finance V2/historical; legal V0.4.

## Causa raíz y corrección
Causa probada: `PROVEN_RUNTIME_CONTRACT_DRIFT__LEGACY_PROVIDER_IDENTITY_LINK_APPLICABILITY_FILTER`.

Corrección R3-A:
- `app/adapters/cxorbia-provider-identity-link-runtime-v1.js` conserva API/runtime bridge pero adopta estados `active|confirmed|approved|materialized`, authorities confiables y authorityRef, sourceSafe, period-independent y tenant/project isolation en paridad con `cxorbia-identity-roll-forward-v1`;
- cuando el contrato canónico está disponible, delega a `normalizeLink`; si no, usa fallback equivalente;
- sigue prohibiendo fuzzy/name/email/phone matching;
- `tools/qa/cxorbia-provider-identity-runtime-contract-parity-gate.mjs` protege futura paridad.

Cero `/app/modules`, `/app/core`, provider I/O, data writes, deploy, merge o producción.

## Frontera actual
`NEW_AUTH_REQUIRED_I3_11C_STAFF_RUNTIME_CANONICAL_IDENTITY_CLOSE_READONLY_NO_WRITES`

No ejecutar sin autorización exacta nueva. La prueba debe ser read-only, usar Staff/Admin canónico existente, cero password change/reset/creación, y demostrar target canonical + 2/0 agosto + duplicados 0. Ejecutar parity gate source antes del browser runtime.

## Circuit breaker
No provider repair. No reabrir Auth/Rules/I3.9/I3.10. Mismatch docs/evidence detiene ejecución; PASS consumido no se repite sin regresión reproducible.

## Producto
El fix es reusable CXOrbia, no TyA/Cinépolis hardcode. Multi-tenant/no-code, exact identity, `CX.data`, Claude/prototipo y Academia se preservan.
