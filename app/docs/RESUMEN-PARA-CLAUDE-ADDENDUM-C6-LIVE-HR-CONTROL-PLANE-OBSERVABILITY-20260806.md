# RESUMEN PARA CLAUDE — Addendum C6 observabilidad control-plane HR viva

**Fecha:** 2026-08-06  
**Estado:** `SOURCE_ONLY_CONTROL_PLANE_OBSERVABILITY_PASS__NO_UI_CHANGE`

## Conectado y preservado

- Frontend acumulativo único.
- `CX.data` y contratos existentes.
- Identidades Shopper con `HOLD=0`.
- Finanzas, Liquidaciones, Portal Cliente, Portal Shopper y Reservas.
- Autoridad HR viva y `sourceRevision` como contrato backend.

## Cambio backend de este bloque

El workflow de lectura HR ahora produce estados explícitos antes, durante y después de la frontera provider:

```text
WORKFLOW_STARTED_PROVIDER_READS_0
PROVIDER_READ_BOUNDARY_ENTERED_MAX1
PROVIDER_READ_SEQUENCE_COMPLETED_LOGICAL_1
FINAL_<JOB_STATUS>_<CONSUMPTION>
```

También genera un journal JSON y artifact sanitizado sin PII.

## Impacto frontend

No modificar `/app/modules/*`, `/app/core/*`, layout, navegación ni componentes.

Cuando exista una lectura viva v3 validada, el frontend debe:

- consumir una sola `sourceRevision` transversal;
- invalidar proyecciones solo cuando la revisión cambie;
- no mostrar julio/agosto o conteos como constantes;
- no exponer estados técnicos del journal al usuario final;
- conservar los estados técnicos únicamente para administración/soporte autorizado.

## Pendiente real

El request v2 anterior conserva consumo desconocido. No se ejecutó nueva lectura. Se requiere autorización fresca para un único request v3 bajo el journal corregido.

## Sin impacto Claude

- No reabrir SKIP13.
- No cambiar Auth ni credenciales.
- No rehacer módulos visuales.
- No crear shell paralela.
- No reemplazar HR viva con snapshots o Firestore.
