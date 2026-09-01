# Auditoría V162 — Corte 1.2

Fecha: 2026-07-20
Estado: `HOLD_P0_PROVEN_NO_APPLY`

Candidata: `Prototype development request CXOrbia V162.zip`
SHA-256: `3d7a1462392bc054947e5a0374b905a0a7b00aa2f1a442b785bba4158817e24b`

## Aprobado

- ZIP extraíble.
- Sintaxis JS correcta.
- Gate frontend replicado: PASS.
- Director: 4 reportes disponibles, 3 pendientes y selector país.
- PDF/XLSX/PPT tienen flujo real en prueba controlada.
- Sin secretos ni PII.

## P0 demostrados

1. La candidata incluye y carga `app/adapters/tya-corte1-report-projection.js`, aunque debe generarse solo en build. El archivo está fechado 2026-07-13 y contiene 616 asignadas, 0 sin asignar, 574 realizadas, 542 cuestionarios y 400 submitidas. La evidencia canónica vigente es 611, 5, 592, 590 y 527. No puede persistirse esta fotografía vieja.
2. El rol Sucursal compara `scopeSucursal` directamente con `branchName`. La plataforma guarda normalmente un id; con `scopeSucursal="suc-miraflores"` y `branchName="C. Miraflores"`, los 4 reportes operativos quedan bloqueados. Debe resolverse id a nombre estable.
3. `app/REPORTE-DE-CAMBIOS.md` fue sustituido por un archivo corto que elimina V161C y el histórico anterior. Debe agregarse la nueva sección sin borrar el acumulado.

## P1

Los nombres de exportación no incluyen alcance. Todos y GT generan el mismo nombre.

## Decisión

No aplicar, no Codex y no Hosting DEV. Claude debe corregir únicamente este delta. V161C/R21 permanece como baseline activa.
