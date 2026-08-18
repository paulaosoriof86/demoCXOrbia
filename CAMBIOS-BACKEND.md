# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-18 12:37 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-FOCAL-ADJUDICATION-02`  
**Estado:** `I3_11C_FOCAL_PROVIDER_PASS__TARGET_LINK_INTACT__TEMPORAL_RUNTIME_FORENSIC_NEXT__GO_LIVE_35`

## Iteración 2026-08-18 — focal provider identity-link adjudication

### Preparación reusable

Se añadió `tools/qa/cxorbia-i3-focal-provider-identity-link-adjudication-readonly.mjs` y se reutilizó el workflow existente `.github/workflows/cxorbia-readonly-post-gates-runner.yml`; no se creó workflow/rama/PR/candidata nuevos.

El primer harness run `32171482856` falló antes de provider access porque el checkout shallow no contenía el commit viejo usado como ancestry target. Provider reads/writes `0/0`, autorización no consumida. Se corrigió el request para fijarlo al exact prior live HEAD sin cambiar el scope provider.

### Ejecución provider focal PASS

Run `32171812808`, job `95824491418`, artifact `9337537655`, digest `sha256:4f19be2f3d8ecaa05287cdba914b51608db78c7bbb79f7341182b0d176dac394`.

Resultado:
- `PASS_I3_FOCAL_PROVIDER_IDENTITY_LINK_ADJUDICATION_READONLY`;
- adjudication `intact_and_applicable_provider_state`;
- exact link `irl_3ed1b9a65d36c5873c1306bae1621e9d` existe;
- exact mapping `shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
- tenant/project/source `tya/cinepolis/hr`;
- status `materialized`, authority `tenant_adjudication`, period-independent;
- normalized applicable/trusted `true`;
- field diff `[]`;
- tenant collection: `2` docs, `2` trusted normalized, `0` rejected;
- exact doc read `1` + collection observation `1`;
- provider writes `0`.

### Causa descartada / causa pendiente

Ya no corresponde reparar provider identity-link state: deletion, deactivation, re-scope, mutation y structural non-applicability quedan descartados como causas persistentes actuales.

La discrepancia a resolver es temporal/runtime: el Staff runtime previo observó `1` link y `0` target links, mientras el provider actual contiene `2` trusted links y el target exacto está intacto/aplicable.

Siguiente frontera:
`I3_11C_TEMPORAL_WRITE_HISTORY_AND_RUNTIME_STALENESS_FORENSIC_NO_PROVIDER_READS`.

## Efectos de esta iteración

- GitHub source/tooling/docs: sí.
- `/app/modules`: 0.
- `/app/core`: 0.
- `CX.data` interface: 0.
- Auth reads/writes: 0/0.
- provider reads: 2.
- provider writes: 0.
- Firestore data writes: 0.
- Rules/Hosting/Cloud Run deploy: 0.
- HR/Storage/Make/Gemini/payment writes: 0.
- Historical Shopper access: 0.
- merge: false.
- production: false.

## Clasificación

- **Reusable CXOrbia:** focal identity-link adjudicator, source-truth preflight y separación provider-state/runtime-state.
- **Exclusivo tenant TyA:** IDs exactos y evidencia I3.11C.
- **Exclusivo proyecto Cinépolis:** el mapping de la visita/Shopper usado como caso de validación; no hardcode global.
- **Claude/prototipo:** sin parche inmediato; cualquier causa runtime generalizable se documentará por archivo/módulo al probarse.
- **Academia:** sin cambio funcional todavía; conservar distinción provider state ≠ runtime observation.
- **Sin impacto Claude inmediato:** forensic temporal/source del siguiente bloque.

## Avance

**Formal: 35% completado / 65% pendiente.** R2 focal adjudication está 100% cerrado, pero I3 sigue 0/25 hasta PASS integral. El bloque reduce causa y evita un write provider innecesario.

## Camino preservado

R2B temporal/runtime forensic → mínimo cierre I3 → I4 visible → I5 producción → continuidad post-go-live con el mismo Atomic Gate Close.
