# ACADEMIA — Impacto V182 Hosting DEV PASS

**Fecha:** 2026-07-28  
**Estado:** pendiente de aprobación visual final

## Aprendizaje validado técnicamente

- Fuente financiera exacta y pago confirmado son conceptos distintos.
- Una fila exacta puede estar legítimamente impaga y aun así formar parte de métricas, CxP y reportes.
- `pending_source_confirmation` describe el estado del pago; no convierte una fila exacta en revisión de fuente.
- Revisión de fuente se activa por `reviewRequired`, `financialSourceStatus=pending_or_review`, `liquidationState=pending_financial_source` o datos esenciales de país/moneda no resueltos.
- Pago confirmado continúa requiriendo fuente/evidencia; no se infiere por liquidación, ejecución o submitido.
- GTQ y HNL permanecen separados.

## Evidencia

Hosting DEV run `30402212216`:

- mayo 44 visitas;
- 42 exactas y 2 reviews fail-closed;
- GT 32 exactas / HN 10 exactas;
- 0 pagos / 0 lotes;
- reporte financiero capturado con 2 filas y 10 columnas;
- Beneficios canónico y 0 pagadas.

## Manuales/cursos a actualizar después de `APROBADO`

- Finanzas;
- Movimientos y Tesorería;
- Liquidaciones y Lotes;
- Beneficios del Shopper;
- errores frecuentes: revisión de fuente vs pago pendiente, moneda, presupuesto y exportación.

No declarar material final antes de la revisión visual de Paula.
