# CAMBIOS BACKEND — Addendum C6 observabilidad control-plane HR viva

**Fecha:** 2026-08-06  
**Estado:** `PASS_SOURCE_ONLY_LIVE_HR_CONTROL_PLANE_OBSERVABILITY_ROOT_FIX`

## Archivos creados

1. `tools/qa/cxorbia-live-hr-control-plane-journal.mjs`
   - registra inicio antes de provider;
   - registra frontera de acceso;
   - registra finalización de la secuencia lógica;
   - conserva estado final y límites de consumo;
   - no incluye PII ni secretos.

2. `app/docs/evidence/LIVE-HR-CONTROL-PLANE-OBSERVABILITY-ROOT-FIX-LATEST.json`
   - evidencia source-only del root fix;
   - congela el request v2 anterior como consumo desconocido;
   - confirma cero nueva lectura provider.

3. `app/docs/SOURCE-LOCK-C6-LIVE-HR-CONTROL-PLANE-OBSERVABILITY-20260806.md`
   - fija la nueva autoridad documental;
   - exige request v3 y autorización fresca.

4. Addenda de CAMBIOS, Claude, Pendientes, Academia y tracker del bloque.

## Archivo modificado

`.github/workflows/cxorbia-live-hr-current-reconcile.yml`

Cambios:

- journal abierto antes de cualquier acceso provider;
- status temprano `WORKFLOW_STARTED_PROVIDER_READS_0`;
- status de frontera `PROVIDER_READ_BOUNDARY_ENTERED_MAX1`;
- status de secuencia completada;
- finalización con estado de consumo;
- artifact sanitizado con retención de siete días;
- request v3 obligatorio;
- request v2 anterior fail-closed.

## Commits fuente

```text
dcbfe1ce4b5a98df9f2cc650dc344f983ed7118f
c46e81bba4fd7424e6076e336bcaf86e82564c14
11f7bd7691135a28141852ae000c8ac9bb2c4ee1
b0670c437bd15f210393bf574fd8f779e2ccd36e
```

## No ejecutado

```text
nuevo trigger provider=0
provider reads=0
provider writes=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```

## Clasificación

- **Reusable CXOrbia:** observabilidad de frontera y consumo para integraciones externas.
- **Exclusivo TyA:** siguiente lectura HR y validación de tabs GT/HN.
- **Claude/prototipo:** sin cambios UI.
- **Academia:** patrón de journal, estados y artifact sanitizado.
- **Sin impacto Claude:** identidad Shopper, Auth, Finanzas, Portales y Reservas.
