# PENDIENTES PROTOTIPO — Addendum V176 P0 HOLD

## Bloqueador actual

V176 no puede empalmarse. Debe entregarse V177 incremental sobre V176.

## P0 pendientes

1. Eliminar `CX.finStore.crearMesSiguiente()` de la UI financiera y usar únicamente periodos canónicos de `CX.data`.
2. Corregir moneda por fila en drill de movimientos, ingresos por tipo, CxP y modales.
3. Eliminar la primera moneda como fallback de cálculo en Beneficios, incluidas barras y conceptos inferiores.
4. Unificar presupuesto con llave canónica `tenantId + projectId + periodId`.
5. Mostrar presupuesto sin asignación una sola vez, fuera de los registros por país y sin moneda inventada.
6. Ejecutar R26, R27 y R28 completos hasta PASS.
7. Validar contra fuente canónica TyA las dos revisiones GT de mayo.
8. Entregar recorrido móvil real, mayo/julio, host DEV/no autorizado y PDF/Excel abiertos.

## Correcciones que deben preservarse

- devengado/por pagar/pagado separados;
- cero pagos confirmados;
- reembolso sin 85 % inventado;
- bandeja por contratos canónicos;
- acceso Shopper DEV sin sufijos Firebase genéricos;
- KPIs superiores por moneda;
- exportación fail-closed cuando no hay filas derivadas;
- responsive ya incorporado.

## No reabrir

- M1;
- Corte 1;
- Corte 2A;
- HR Source;
- adapters canónicos;
- interfaz pública de `CX.data`;
- datos y conteos preservados.

## Estado

`P0_PROVEN_HOLD_NO_APPLY_NO_DEPLOY`.
