# ACADEMIA — impacto C6 autoridad HR viva

**Fecha:** 2026-08-06

## Contenido que debe incorporarse

- Diferencia entre autoridad viva, materialización, cache y last-known-good.
- Descubrimiento dinámico de periodos por metadata provider.
- `sourceRevision` estable basada en contenido y no en timestamps.
- Reconciliación histórica: una corrección retroactiva en HR debe propagarse a todos los módulos.
- Gate de consistencia país/pestaña ejecutado sobre una sola revisión.
- Circuit breaker `STOP_RETRY` cuando no existe evidencia de ejecución provider.

## Rutas por rol

- Admin/Operaciones: verificar periodo actual, revisión, estado de fuente y bloqueos.
- Shopper: consumir visitas y postulaciones derivadas de la misma revisión.
- Cliente: leer indicadores y reportes consistentes con Dashboard/Histórico/Finanzas.

## Manuales y troubleshooting

Agregar casos:

1. HR contiene un mes nuevo, pero la plataforma no lo muestra.
2. Metadata provider no responde y se usa last-known-good.
3. Un cambio histórico no modifica la revisión.
4. Un trigger no genera run/evidence observable.
5. Cuándo aplicar `STOP_RETRY` y solicitar control-plane diagnosis.

## Estado

El contrato y los gates fuente quedaron preparados, pero no existe resultado provider observable. La Academia no debe presentar agosto como confirmado.
