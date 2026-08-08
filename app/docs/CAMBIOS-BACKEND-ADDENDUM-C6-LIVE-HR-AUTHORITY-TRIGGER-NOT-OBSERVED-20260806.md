# CAMBIOS BACKEND — C6 autoridad HR viva, ejecución provider no observada

**Fecha:** 2026-08-06  
**Estado:** `SOURCE_ROOT_FIX_APPLIED__PROVIDER_RESULT_UNAVAILABLE__STOP_RETRY`

## Archivos modificados

1. `tools/hr-source/tya-live-provider-registry-identity-dev.mjs`
   - deriva periodo calendario y tabs GT/HN sin fijar agosto;
   - registra metadata provider como autoridad viva;
   - conserva salida source-safe.
2. `tools/hr-source/tya-enforce-live-tab-registry.mjs`
   - sustituye registry fijo por auto-refresh provider cuando está disponible;
   - fail-closed con último registry válido solo como contingencia;
   - recalcula periodos, visitas, shoppers y conteos desde la revisión actual.
3. `tools/qa/tya-hr-country-tab-consistency-current.mjs`
   - elimina la segunda lectura GViz;
   - valida país/pestaña sobre la misma revisión viva.
4. `tools/qa/cxorbia-august-delta-readonly-plan.mjs`
   - pasa de agosto fijo a periodo calendario vivo;
   - elimina expectativas fijas `GT=34`, `HN=10` y el histórico `1406` como constantes;
   - compara revisión viva con materialización Firestore read-only.
5. `.github/workflows/cxorbia-live-hr-current-reconcile.yml`
   - agrega gate acumulativo de autoridad viva, revisión histórica y periodo actual;
   - mantiene provider read-only y cero writes/deploys.
6. `.github/workflows/tya-hr-country-tab-consistency-current.yml`
   - construye una sola revisión viva antes de validar país.
7. `.github/cxorbia-firebase-requests/live-hr-current-reconcile.json`
   - request único ligado al source commit exacto.

## Archivos creados

- `tools/qa/tya-live-hr-authority-contract.mjs`;
- `app/docs/evidence/LIVE-HR-AUTHORITY-TRIGGER-NOT-OBSERVED-LATEST.json`;
- `app/docs/SOURCE-LOCK-C6-LIVE-HR-AUTHORITY-TRIGGER-NOT-OBSERVED-20260806.md`;
- documentación complementaria de CAMBIOS, Claude, Pendientes, Academia y tracker.

## Resultado

El root fix está materializado en Git. El request provider no produjo run, status o evidence observable dentro del timeout de 20 minutos. No se declara PASS/FAIL de agosto y se aplica `STOP_RETRY`.

## Seguridad

```text
provider read consumido=desconocido por falta de evidencia
provider writes=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```

## Clasificación

- **Reusable CXOrbia:** revisión viva estable, autodiscovery, reconciliación histórica.
- **Exclusivo cliente:** fuente HR TyA/Cinépolis.
- **Claude/prototipo:** consumir una revisión única; no fijar datos HR.
- **Academia:** autoridad, cache, lineage, pruebas de mutación.
- **Sin impacto Claude:** UI y módulos protegidos no fueron modificados.
