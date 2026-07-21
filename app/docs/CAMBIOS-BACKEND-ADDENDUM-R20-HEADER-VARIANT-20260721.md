# CAMBIOS BACKEND — Addendum R20 header variant

Fecha: 2026-07-21
Estado: `FIX_READY_NOT_APPLIED`

## Diagnóstico ejecutado

Se leyó directamente la HR configurada y se compararon las cabeceras reales:

- `JULIO 26`: variante compacta sin País/ID CINEMA y con `Fecha submitido` duplicada.
- `JULIO 26 HN`: variante completa con País/ID CINEMA.

Se confirmó que el mapper R20 exige siempre País + ID CINEMA, causando `header_not_found` en GT.

## Paquete creado

- `PAQUETE_EJECUCION_CODEX_CXORBIA_R20_HEADER_VARIANT_20260721.zip`.
- SHA-256: `371199c7790c181dbc8077aedcc4c22286146e17f116b58d2611e68b2ab7b899`.

## Archivos previstos

- `tools/hr-source/tya-build-live-hr-source-safe-r20.mjs`;
- `backend/contracts/tya-hr-column-map-r20-v1.json`;
- `tools/qa/tya-hr-header-variants-r20-gate.mjs`.

## Clasificación

- Reusable CXOrbia: variantes de encabezado declaradas y duplicados de evidencia fail-closed.
- Exclusivo cliente: firma compacta actual de la HR TyA/Cinépolis.
- Claude/prototipo: sin impacto; no intervenir.
- Academia: documentar que la identidad de una fila puede provenir de tab + hrRowId cuando el origen no entrega ID de sucursal.
- Sin impacto Claude: Cloud Run, mapper y gates read-only.

## Estado seguro

No aplicado todavía. Sin deploy, merge, producción o writes.