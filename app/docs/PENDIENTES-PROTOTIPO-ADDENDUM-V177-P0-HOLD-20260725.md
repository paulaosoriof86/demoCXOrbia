# PENDIENTES PROTOTIPO — Addendum V177 P0 HOLD

## P0 activos

1. El Dashboard llama `CX.finStore.pres(p.id)` sin periodo canónico explícito.
2. La UI crea presupuestos ficticios de 4000/1200/800 cuando no existe fuente.
3. `curOf`, `curOfRow`, CxP/CxC y liquidaciones usan fallback `|| cur`; filas sin moneda pueden clasificarse como la primera moneda.
4. El análisis suma financiamientos multipaís y los rotula con `defCur0(p)`.
5. `__unassignedBudget.total` se presenta como gasto real y `Total ejecutado`.
6. Se conserva la referencia obsoleta `d.fijosPendienteAsignacion`.
7. Presupuesto sin asignación se muestra con la primera moneda del proyecto.
8. `CX.fin.porPais(data)` toma el periodo desde `CX.data` global y no desde el contexto recibido.
9. Falta evidencia canónica/móvil/exportación completa.

## Correcciones válidas que no deben perderse

- estados devengado/por pagar/pagado;
- cero pagos sin referencia confirmada;
- eliminación del 85 % inventado;
- allowlist DEV exacta;
- review queue por contratos;
- selector canónico;
- eliminación de `crearMesSiguiente` en UI;
- Beneficios por moneda;
- export guard;
- `__unassignedBudget` fuera del mapa enumerable por país;
- responsive y pistas de scroll.

## Evidencia requerida para cierre

- mayo: 2 revisiones GT visibles;
- mayo↔julio;
- fila sin moneda fail-closed;
- presupuesto vacío sin fixtures;
- presupuesto pendiente no presentado como ejecutado;
- financiamientos por moneda;
- shopper HNL sin Q 0;
- PDF y Excel abiertos;
- móvil real;
- host DEV y host no autorizado.

## Estado

`V177_P0_PROVEN_HOLD_NO_APPLY`. Corte 3 no se congela y Corte 4 no inicia.
