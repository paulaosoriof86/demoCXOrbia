# PENDIENTES PROTOTIPO — Addendum R20 header variant

Fecha: 2026-07-21

## P0 backend vigente

- Aplicar el paquete `PAQUETE_EJECUCION_CODEX_CXORBIA_R20_HEADER_VARIANT_20260721.zip`.
- Commit/push atómico.
- Desplegar Cloud Run DEV mediante workflow temporal ya autorizado.
- Confirmar `fresh=1` HTTP 200.
- Confirmar variantes:
  - `JULIO 26` = `tab_scoped_compact`;
  - `JULIO 26 HN` = `full_identity`.
- Confirmar 34 GT + 10 HN en JUL 2026.
- Confirmar que `JULIO 26!7` ya no aparece como cuestionario pendiente.
- Confirmar cero recargas, pantalla blanca y `degraded`.

## Validación frontend posterior

Después del PASS backend, revisar sin nueva candidata:

- Reportes Admin con reportKit y sin métricas sintéticas;
- Reportes Cliente con branding, gráficas y PDF/XLSX/PPTX;
- Shopper con `Mis Reportes`;
- Panorama por periodo y revisión;
- Liquidaciones con la misma sourceRevision.

## No hacer

- No enviar a Claude.
- No reempalmar V172.
- No cambiar HR/ID/tabs.
- No crear workflow.
- No producción ni writes.