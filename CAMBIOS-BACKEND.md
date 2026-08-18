# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-18 13:13 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-RUNTIME-CONTRACT-DRIFT-03`  
**Estado:** `I3_11C_ROOT_CAUSE_PROVEN_RUNTIME_CONTRACT_DRIFT__SOURCE_CORRECTION_NEXT__GO_LIVE_35`

## Iteración 2026-08-18 — R2B temporal/runtime forensic

### Objetivo

Explicar la divergencia entre el Staff runtime (`1` provider link, `0` target links) y el focal provider PASS (`2` trusted links, target intacto), sin ninguna nueva lectura/escritura provider.

### Causa raíz probada

`PROVEN_RUNTIME_CONTRACT_DRIFT__LEGACY_PROVIDER_IDENTITY_LINK_APPLICABILITY_FILTER`.

Archivos fuente revisados:
- `app/adapters/cxorbia-provider-identity-link-runtime-v1.js`;
- `app/adapters/cxorbia-identity-roll-forward-v1.js`;
- `app/index-backend-dev.html`;
- evidencias Staff, focal provider e I3.5C-2.

Prueba reproducible:
- target provider authoritative: status `materialized`, authorityType `tenant_adjudication`, authorityRef presente, periodIndependent;
- contrato canónico reusable acepta `materialized` y `tenant_adjudication`;
- runtime legacy exige `status === active` y `providerAck === true`;
- el target se rechaza determinísticamente por `status !== active` antes de precompose/enrichment;
- `index-backend-dev.html` carga el runtime legacy, no el roll-forward canónico.

Por tanto un provider write temporal no es necesario para explicar el HOLD. No se debe reparar/recrear el link.

Evidencia creada:
`app/docs/evidence/I3-11C-TEMPORAL-RUNTIME-CONTRACT-DRIFT-FORENSIC-LATEST.json`.

### Siguiente frontera

`I3_11C_UNIFY_PROVIDER_IDENTITY_RUNTIME_WITH_CANONICAL_ROLL_FORWARD_SOURCE_CORRECTION_NO_PROVIDER_IO`.

Corrección mínima: adapter reusable únicamente + QA contract parity. Sin módulos/core/UI workaround ni provider I/O.

## Efectos de esta iteración

- GitHub source/evidence/docs reads: sí.
- provider reads/writes: `0/0`.
- `/app/modules`: `0`.
- `/app/core`: `0`.
- Auth/Firestore data/Rules/Hosting/Cloud Run/HR/Storage/Make/Gemini/payments: `0`.
- Historical Shopper: `0`.
- merge: false.
- production: false.

## Clasificación

- **Reusable CXOrbia:** defecto de contrato de identidad runtime y futura paridad de trust semantics.
- **Exclusivo tenant TyA:** IDs exactos usados como caso reproducible.
- **Exclusivo proyecto Cinépolis:** mapping objetivo de validación, no lógica del fix.
- **Claude/prototipo:** sin parche UI; no hardcodear el canonical target.
- **Academia:** sin cambio funcional visible todavía.
- **Sin impacto Claude inmediato:** corrección adapter/source siguiente.

## Avance

**Formal 35% completado / 65% pendiente.** R2B queda 100% cerrado operacionalmente con causa raíz probada. I3 sigue `0/25` hasta source correction + Staff runtime read-only PASS integral.

## Camino preservado

R3-A source correction → R3-B Staff read-only close → I3 PASS 60% → I4 visible → I5 producción → continuidad post-go-live.
