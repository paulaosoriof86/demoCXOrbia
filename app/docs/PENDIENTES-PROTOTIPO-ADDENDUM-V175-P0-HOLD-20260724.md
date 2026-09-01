# PENDIENTES PROTOTIPO — Addendum V175 P0 HOLD

**Fecha:** 2026-07-24  
**Estado:** `V175_REJECTED_FOR_P0_V176_REQUIRED`

## P0 vivos

1. Restringir selector Shopper DEV a allowlist exacta o flag fail-closed; prohibido aceptar Firebase Hosting genérico.
2. Incluir en bandeja las filas `reviewRequired` y estados financieros canónicos, aunque tengan monto/moneda.
3. Eliminar periodo paralelo `CX.finStore.curPeriod()` de Finanzas/Movimientos.
4. Eliminar moneda del primer país en filas, CxP, presupuestos y Beneficios.
5. Unificar llave canónica de presupuesto y evitar duplicación por país/moneda.
6. Bloquear exportación sin filas financieras reales.
7. Entregar evidencia no duplicada de las dos revisiones de mayo y de la ruta Shopper DEV segura.

## P1/P2 asociados

- wrappers y pistas móviles también en Beneficios y modales;
- mostrar explícitamente moneda en cada fila de Movimientos;
- reemplazar “Mes siguiente” local por gestión canónica de periodos o retirarlo de este corte;
- validar PDF y Excel con fuente canónica, no únicamente demo;
- documentar distribución de gastos fijos por país/moneda.

## Preservar

- V174/M1/Corte 1/Corte 2A;
- 14 periodos y 616 visitas;
- mayo: 44 visitas, 42 exactas y 2 revisiones;
- 32 GT y 10 HN exactas;
- 209 vínculos y 207 montos;
- 0 pagos y 0 lotes;
- interfaz pública de `CX.data`.

## Cierre

V175 no puede pasar a empalme, Hosting DEV ni freeze. V176 debe ser incremental y pasar R26+R27 antes de cualquier aplicación.
