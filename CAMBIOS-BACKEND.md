# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-18 14:20 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-R3B-HOLD-DEV-HOSTING-PARITY-05`  
**Estado:** `R3B_STAFF_RUNTIME_HOLD_CONSUMED__DEV_HOSTING_MATERIALIZATION_AUTH_NEXT__GO_LIVE_35`

## Iteración R3-B — Staff/Admin canonical identity close

### Preparación

Se reutilizó el workflow existente `CXORBIA_READONLY_POST_GATES_RUNNER`; no se creó rama, PR, candidata ni workflow nuevo.

Se ajustó el runner reutilizable `tools/qa/tya-i3-staff-authority-readonly.mjs` para:
- vincular la autorización exacta de R3-B;
- ejecutar primero `tools/qa/cxorbia-provider-identity-runtime-contract-parity-gate.mjs`;
- reutilizar las Rules I3.11C ya verificadas sin redeploy;
- seleccionar únicamente Staff/Admin canónico existente;
- mantener Historical Shopper fuera de alcance;
- impedir password changes/resets, user creates/updates y automatic retry.

El primer transporte produjo run `32179904771` sobre evento `pull_request`; fue un preflight de no ejecución (`staffReadonlyExecuted=false`, parity no ejecutada, provider/runtime no consumido). Se reemitió el mismo gate por fast-forward directo de la rama viva, sin rama/PR nuevos.

### Ejecución real

Run `32181137350`, job `95854174365`, artifact `9340865585`, digest `sha256:4485e03cb17d4dcb82915049fe8d2895ba099baff62d08b5fc2ac89cf1dd1ab3`.

Resultado global: `HOLD_READONLY_POST_GATES`.

PASS antes del navegador:
- exact request/single-use/source lock;
- `PASS_PROVIDER_IDENTITY_RUNTIME_CANONICAL_CONTRACT_PARITY`;
- Rules previas verificadas reutilizadas;
- Rules deploys actuales `0`;
- private credential Staff-only;
- I3.6 Historical Shopper frozen reuse PASS.

Runtime:
- Staff/Admin DEV ejecutado una sola vez;
- base `FAIL_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`;
- stable failure `AUTH_RUNTIME_TIMEOUT`;
- app/membership/data/authority/router montados;
- provider runtime link count `1`;
- target link count `0`;
- `shp-57d2e3769946` no resolvió a `TYA_GT_0C0BA8856E`;
- agosto canonical `0`, residual live `2`;
- duplicateVisitKeys `0`, duplicateShopperIds `0`.

El lastState demuestra que postulación y legal permanecen correctos: postulation authority ready, platform posts `8`, HR assignments `15`, HR assignments no son postulaciones; legal loaded/provider authority true y receipt `accepted/human_ui`. Los FAIL I3.4/I3.7 del resumen son downstream del timeout base y no se registran como nuevas regresiones funcionales.

### Causa reducida

`I3_11C_CORRECTED_SOURCE_NOT_EFFECTIVE_IN_REMOTE_DEV__HOSTING_MATERIALIZATION_REQUIRED`.

El source corregido pasa el parity gate, pero R3-A y R3-B realizaron Hosting deploys `0`. La prueba se ejecutó contra `https://cxorbia-backend-dev.web.app`, cuyo comportamiento sigue siendo compatible con el filtro pre-corrección. El provider focal ya probó el target link intacto/aplicable; no corresponde repararlo.

Se conserva como unknown únicamente el byte/hash exacto del adapter actualmente servido, porque el browser probe verificó HTTP 200 y marcadores generales pero no exportó fingerprint semántico de la corrección.

## Efectos de esta iteración

- GitHub source/tooling/docs: sí.
- `/app/modules`: `0`.
- `/app/core`: `0`.
- interfaz `CX.data`: `0`.
- Staff runtime reads: sí, read-only.
- provider writes: `0`.
- Auth writes: `0`.
- password changes/resets: `0/0`.
- Firestore data writes: `0`.
- Rules deploys: `0`.
- Hosting/Cloud Run deploys: `0/0`.
- HR/Storage/Make/Gemini/payment writes: `0`.
- Historical Shopper access: `0`.
- merge: false.
- production: false.

## Clasificación

- **Reusable CXOrbia:** contract parity gate, distinction source-corrected vs remote-materialized, deploy-parity requirement.
- **Exclusivo TyA:** IDs exactos de QA y evidencia R3-B.
- **Exclusivo Cinépolis:** target de validación, no lógica del fix.
- **Claude/prototipo:** sin parche UI; no hardcodear canonical target ni compensar desde módulos.
- **Academia:** sin cambio visible todavía.
- **Sin impacto Claude inmediato:** siguiente bloque Hosting DEV backend.

## Avance

**Formal: 35% completado / 65% pendiente.** R3-B consumido en HOLD; no se suman puntos de I3.

## Siguiente bloque exacto

`NEW_AUTH_REQUIRED_I3_11C_DEV_HOSTING_MATERIALIZE_CORRECTED_IDENTITY_RUNTIME_NO_PROVIDER_DATA_WRITES`.

Máximo un Hosting deploy DEV + verificación de paridad remota; cero provider data/Auth/Firestore-data/Rules/HR/Storage/Make/Gemini/payment writes, cero Historical Shopper, cero Cloud Run/merge/production. El Staff final se autorizará por separado después de Hosting PASS.
