# CAMBIOS BACKEND — ADDENDUM FAMILIA B: INVENTARIO CRM OPS LEADS

**Fecha:** 2026-08-02  
**Estado:** `SOURCE_ONLY_INVENTORY__NO_FUNCTIONAL_CHANGE__NO_DEPLOY`

## Archivo creado

- `app/docs/RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-B-INVENTARIO-INICIAL-20260802.md`.

## Archivos inspeccionados

- `app/modules/dashboard.js`;
- `app/modules/crm.js`;
- `app/modules/clientes.js`;
- `app/modules/comercial.js`;
- `app/modules/marketing.js`;
- `app/modules/rutas.js`.

## Hallazgos principales

- Dashboard conserva buena UI y drilldowns, pero mezcla `visitBucketFns` con un `phaseFlow()` legacy y depende de bridges posteriores para mostrar la semántica correcta.
- CRM tiene una experiencia amplia, pero su store sigue en memoria/localStorage y no existe todavía una fuente CRM real conectada.
- Clientes crea contactos, correos y prospectos sintéticos que pueden aparecer fuera de un demo explícito.
- Comercial puede aplicar regalías/ISR/defaults genéricos que contradigan el contrato financiero de `tya::cinepolis`.
- Marketing carga fechas, contenidos y métricas ficticias y muestra superficies de Gemini/Make aún no activadas.
- Hojas de Ruta conserva la interfaz útil, pero debe consumir proyecto/periodo y HR viva canónicos y gatear IA/import/conexión.

## Decisión

La mejor UI se preserva, pero la autoridad falsa, local, duplicada o no gateada debe reconciliarse antes del Checkpoint Visual 1 A+B.

## Estado seguro

- cambios funcionales: 0;
- deploy: 0;
- provider writes: 0;
- merge: false;
- producción: false.