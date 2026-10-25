# PENDIENTES PROTOTIPO — R19 V145

Fecha: 2026-07-15

La candidata externa V132, interna V145, pasa manifest y sintaxis pero no puede empalmarse todavía.

## Críticos restantes

1. Mostrar y exportar el periodo de medición de cada visita mediante campos canónicos, sin hardcodear Cinépolis.
2. Probar y corregir el cambio MAY/JUN/JUL en todos los módulos y roles usando el runtime source-safe.
3. Completar y persistir la configuración de proyecto, tenant y HR: URL externa, mapping, sincronización, cuestionario, países, monedas y banderas.
4. Abrir el prompt PWA en la primera interacción elegible; no solo al pulsar un botón.
5. Evitar la regresión de Finanzas: `porPais()` debe usar `data.project()` y `serieMensual()` debe conservar `period()` en su adapter local.

Los cambios ya atendidos en V145 no deben rehacerse. La próxima candidata se audita solo contra estos cinco puntos.
