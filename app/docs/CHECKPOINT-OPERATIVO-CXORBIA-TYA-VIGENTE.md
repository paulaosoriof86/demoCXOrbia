# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-20
Estado: `CORTE_1_V162_HOLD_CORRECCION_CLAUDE_REQUERIDA`

## Baseline

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- `ACTIVE_BASELINE`: V161C/R21.
- Corte 0B congelado y aprobado visualmente.

## Corte 1

El backend y la proyección canónica permanecen aprobados:

- 14 periodos y 616 visitas.
- 28 filas periodo/país y 308 filas periodo/país/sucursal.
- 611 asignadas, 5 sin asignar, 592 realizadas, 590 cuestionarios, 527 submitidas y 0 pagos confirmados.
- Run `29727050055`: SUCCESS.
- Artifact `8454684849`.

## Auditoría V162

- ZIP SHA-256: `3d7a1462392bc054947e5a0374b905a0a7b00aa2f1a442b785bba4158817e24b`.
- Decisión: `HOLD_P0_PROVEN_NO_APPLY`.
- Evidencia: `app/docs/AUDITORIA-V162-CORTE1-HOLD-20260720.md`.

P0:

1. Adapter generado viejo incluido y cargado como fuente.
2. Rol Sucursal bloqueado porque no resuelve id a nombre estable.
3. REPORTE-DE-CAMBIOS truncado y sin histórico anterior.

P1:

- Nombres de exportación sin alcance, con colisión entre Todos y GT/HN.

## Siguiente bloque exacto

```text
CLAUDE CORRECCION LOCALIZADA V162
-> nueva candidata de máximo cuatro archivos
-> auditoría ChatGPT
-> APPLY_DELTA_DIRECTLY solo si GO sin P0
-> gates
-> autorización Hosting DEV
-> revisión visual Paula
-> freeze Corte 1
```

Corte 2 continúa bloqueado. Sin frontend aplicado, deploy, merge, producción, importaciones ni escrituras reales.
