# SOURCE LOCK — C6 observabilidad determinística del control-plane HR viva

**Fecha:** 2026-08-06  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** `C6_LIVE_HR_CONTROL_PLANE_OBSERVABILITY_ROOT_FIX_PASS__PREVIOUS_V2_READ_UNKNOWN__NO_NEW_PROVIDER_READ__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Antecedente congelado

El request v2:

```text
requestCommit=4e404f2db48ff8b07430d7ac7505eff6c040458a
sourceCommit=31f4af0f7501b23b4e72b1a5f8457669a5f91c77
providerReadConsumption=UNKNOWN_NO_EXECUTION_EVIDENCE
```

permanece inconcluso. Este bloque no reintentó, no consultó HR y no cambia esa clasificación.

## 2. Causa raíz de observabilidad

El workflow anterior publicaba status únicamente al final. Si la ejecución no aparecía en el conector disponible, no existía una frontera observable que permitiera distinguir entre:

- workflow no iniciado;
- fallo previo a provider;
- provider boundary alcanzado;
- lectura completada y fallo posterior.

Además, el conector disponible para runs filtra ejecuciones de `pull_request`, mientras este workflow se activa por `push`.

## 3. Root fix aplicado directamente

Se agregaron:

```text
dcbfe1ce4b5a98df9f2cc650dc344f983ed7118f  journal determinístico source-safe
c46e81bba4fd7424e6076e336bcaf86e82564c14  workflow con fronteras y artifact sanitizado
```

Archivos:

- `tools/qa/cxorbia-live-hr-control-plane-journal.mjs`;
- `.github/workflows/cxorbia-live-hr-current-reconcile.yml`.

## 4. Estados contractuales nuevos

```text
WORKFLOW_STARTED_PROVIDER_READS_0
PROVIDER_READ_BOUNDARY_ENTERED_MAX1
PROVIDER_READ_SEQUENCE_COMPLETED_LOGICAL_1
FINAL_<JOB_STATUS>_<CONSUMPTION>
```

El primer estado se publica antes de validar el request y antes de cualquier acceso provider. La frontera provider se publica inmediatamente antes del acceso. La finalización conserva el estado de consumo aunque falle un gate posterior.

## 5. Fail-closed

El workflow ahora exige:

```text
schemaVersion=cxorbia.live-hr-current-reconcile.request.v3
controlPlaneContract=cxorbia.live-hr-control-plane-journal.v1
```

El request v2 anterior no puede ser aceptado por el workflow corregido. No se modificó el archivo request y, por tanto, este bloque no disparó la lectura HR.

## 6. Evidencia recuperable futura

Cada ejecución v3 debe producir:

- commit status `cxorbia/live-hr-control-plane`;
- journal JSON sin PII ni secretos;
- artifact `cxorbia-live-hr-control-plane-<runId>` durante siete días;
- status final de autoridad HR separado.

## 7. Validación source-only

```text
journal node --check=PASS
journal transitions open/boundary/complete/finalize=PASS
workflow generic YAML parse=PASS
GitHub runtime execution=NO EJECUTADA
```

La validación genérica YAML no sustituye una ejecución real de GitHub Actions.

## 8. Clasificación

- **Reusable CXOrbia:** journal de frontera provider, estados de consumo, artifact sanitizado y fail-closed v3.
- **Exclusivo TyA:** siguiente lectura de spreadsheet HR y sus tabs GT/HN.
- **Claude/prototipo:** sin cambios de UI; consumir una sola `sourceRevision` cuando exista evidencia viva.
- **Academia:** agregar patrón de observabilidad previa a integraciones externas.
- **Sin impacto Claude:** SKIP13, Auth, Finanzas, Portales, Reservas y composición frontend permanecen preservados.

## 9. Estado seguro

```text
nuevo provider read=0
provider writes=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

## 10. Siguiente acción exacta

Se requiere autorización fresca y explícita para un único request v3 de lectura HR viva. La autorización debe reconocer que el consumo del request v2 anterior permanece desconocido y autorizar una sola ejecución lógica adicional bajo el nuevo journal. Sin esa autorización no se toca el request ni se consulta HR.
