# PENDIENTES PROTOTIPO — Corte 4 visual P0 proven

Fecha: 2026-07-29

## P0 activo

`P0-C4-VIS-01 — FORBIDDEN_DEMO_FALLBACK_ON_AUTH_PENDING`

Corregir en backend/core para que la ausencia de la credencial temporal DEV después del protected smoke NO active `localStorage/demo` ni conserve seeds ficticios.

## Criterio de cierre

- fuente efectiva no debe ser `localStorage/demo`;
- cero proyectos/visitas/shoppers/postulaciones demo en Firestore vacío;
- estado vacío/fail-closed visible y honesto;
- `readOnly=true`, writes=0;
- nueva validación visual PASS.

## No hacer

- no nueva candidata;
- no parche cosmético en módulos UI;
- no reactivar principal temporal como solución permanente;
- no conectar `cxorbia-backend-dev`;
- no materializar datos TyA antes de Corte 5;
- no producción/merge.

## Backlog P1/P2 previo

PDF, Excel, reportKit y copy de Corte 3 siguen en backlog transversal y no forman parte de este P0.