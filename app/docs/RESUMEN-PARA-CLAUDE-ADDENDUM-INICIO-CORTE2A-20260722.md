# RESUMEN PARA CLAUDE — Inicio Corte 2A

Fecha: 2026-07-22  
Estado: `FRONTEND_DELTA_REQUIRED_WITH_M1_LOCK`

## Preservar sin cambios de significado

- Build funcional M1 validado: `67c0943260f076f5686284ac509458ed5fd34dbd`.
- HR viva: 14 periodos / 616 visitas.
- Refresco in-place, sin recarga completa.
- Una sola `sourceRevision` para Admin, Cliente, Shopper y reportes.
- Proyecto y periodo separados.
- KPI y periodos coherentes.
- Canary de asignación/cuestionario.
- Marketplace shopper retira la visita asignada en HR.
- Cero pagos inferidos.

## Modificar de forma localizada

### `app/modules/visitas.js`

- sustituir estado crudo por facets canónicas en tabla, filtros, detalles, drilldowns y exportación;
- mantener estados ortogonales;
- diferenciar monto ausente de cero confirmado;
- usar la misma revisión y proyección en pantalla/exportación.

### `app/modules/postulaciones.js`

- reasignación con decisión explícita sobre fecha/franja;
- implementar Exportar para filtro/periodo activo;
- eliminar `undefined`/literales técnicos visibles;
- no afirmar ni activar HR writes en modo read-only.

### `app/core/tya-phase-a-source-safe-preview.js`

Solo si es indispensable: preservar `null` en campos financieros ausentes, sin introducir lógica de UI ni alterar IDs/periodos/facets.

## Fuentes exactas

- `backend/contracts/phase-a-corte2a-shopper-operation-canonical-v1.json`.
- `app/docs/PAQUETE-CLAUDE-CORTE2A-CICLO-SHOPPER-OPERACION-CANONICA-20260722.md`.
- `app/docs/VALIDACION-VISUAL-Y-LOCK-ANTI-REGRESION-CORTE1-M1-20260722.md`.

## Entrega esperada

Una candidata incremental con delta localizado y evidencia. No nueva arquitectura, rama, PR, snapshot hardcodeado, excepción por mes, write real ni relectura de HR desde cero.
