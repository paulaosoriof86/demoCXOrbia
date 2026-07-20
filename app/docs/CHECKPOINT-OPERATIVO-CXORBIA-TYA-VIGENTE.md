# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-20
Estado: `CORTE_1_V164_TECHNICAL_PASS_PENDING_HOSTING_DEV_VISUAL`

## Repositorio y baseline

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- `ACTIVE_BASELINE`: V161C/R21 hasta aprobación visual.
- Corte 0B: congelado.
- V164: integrada técnicamente, pendiente de validación visual.

## Empalme V164

- `HEAD_BEFORE`: `c2ad722ddf7574ba51cc26369c9f532324610646`.
- Commit: `f708515a637a3998eefdbe39ef66d37a3f130fb6`.
- Archivos: `cliente-extra.js`, `index.html`, `pptxgenjs.min.js` y `REPORTE-DE-CAMBIOS.md`.
- Conflictos: ninguno.
- Manifest: `MANIFEST-V164-CORTE1-REPORTES-EMPALME-DIRECTO-20260720.json`.
- Verificador: `tools/qa/verify-v164-corte1-reportes-lock.mjs`.

## Post-gates

- Commit técnico: `cf0dbf735522f5ae2ed67d865dfb97d1a37335f2`.
- Run `29768206645`: SUCCESS.
- Artifact `8471655866`.
- Digest `sha256:37d3a6cc41fcd431ec54ca2cea2d306528e29459ddc48e47a5805ab477e600ac`.

PASS:

- frontend consumer;
- frontend runtime;
- contexto e histórico;
- builder de reportes;
- navegador de reportes;
- integración R18A;
- semántica R21 con warning shopper `209/216` preservado.

Resultado:

- 14 periodos y 616 visitas.
- 28 filas periodo/país y 308 filas de sucursal.
- 611 asignadas, 5 sin asignar, 592 realizadas, 590 cuestionarios y 527 submitidas.
- 0 pagos confirmados.
- 4 reportes disponibles y 3 pendientes de fuente.
- JSON, CSV, PDF, XLSX y PPTX listos técnicamente.
- 0 blockers, 0 errores de página y 0 errores de consola.

## Alcance por rol

- Director: Todos/GT/HN.
- Regional: fail-closed.
- Sucursal: cuatro reportes limitados a su `branchName`.
- Sin `periodKey`: fail-closed.
- Tendencia: excluye el periodo activo.

## Siguiente bloque

`AUTORIZACION HOSTING DEV -> PUBLICAR BUILD EXACTO -> SMOKE REMOTO -> REVISION VISUAL PAULA -> APROBADO -> FREEZE CORTE 1`

No se requiere otra candidata de Claude. Corte 2 continúa bloqueado hasta el freeze.
