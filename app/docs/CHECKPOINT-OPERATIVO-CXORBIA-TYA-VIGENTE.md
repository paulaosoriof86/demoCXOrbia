# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-20
Estado: `CORTE_1_V163_HOLD_CORRECCION_CLAUDE_REQUERIDA`

## Baseline

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- `ACTIVE_BASELINE`: V161C/R21.
- Corte 0B congelado y aprobado visualmente.

## Corte 1 aprobado antes de frontend

- 14 periodos y 616 visitas.
- 28 filas periodo/país y 308 filas periodo/país/sucursal.
- 611 asignadas, 5 sin asignar, 592 realizadas, 590 cuestionarios, 527 submitidas y 0 pagos confirmados.
- Run `29727050055`: SUCCESS.
- Artifact `8454684849`.

## Auditoría V163

- Candidata: `Prototype development request (12).zip`.
- SHA-256: `73fcffc48f6d897c7b4e701ff6dbc61898ef6c9afe1ea8291d1950f0d8f5cfe0`.
- Decisión: `HOLD_P0_PROVEN_NO_APPLY`.
- Evidencia: `app/docs/AUDITORIA-V163-CORTE1-REPORTES-HOLD-20260720.md`.

Controles que sí pasaron:

- cuatro archivos autorizados;
- sin adapter generado;
- PptxGenJS local;
- baseline preservada fuera de `cli_reportes`;
- histórico completo de cambios preservado;
- sintaxis Node PASS;
- cuatro reportes disponibles y tres pendientes para Director;
- nombres de exportación con alcance.

P0:

1. El rol Sucursal recibe datos de todo el país en Resumen, Cobertura y Tendencia; solo Estado por sucursal queda acotado.
2. Si falta `periodKey`, el módulo selecciona silenciosamente `latestPeriod` y puede mostrar otro mes.

P1:

1. Tendencia incluye `latestPeriod` pese a que el contrato exige excluir el periodo activo por defecto.
2. La coincidencia normalizada de sucursal no exige unicidad.

## Siguiente bloque exacto

```text
CLAUDE CORRECCION LOCALIZADA V163
-> nueva candidata de cuatro archivos
-> auditoría ChatGPT
-> APPLY_DELTA_DIRECTLY solo si GO sin P0
-> post-gates
-> autorización Hosting DEV
-> revisión visual Paula
-> freeze Corte 1
```

Corte 2 continúa bloqueado. Sin frontend aplicado, deploy, merge, producción, importaciones ni escrituras reales.
