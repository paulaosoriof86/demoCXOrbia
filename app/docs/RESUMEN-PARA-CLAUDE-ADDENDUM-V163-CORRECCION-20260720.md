# RESUMEN PARA CLAUDE — CORRECCIÓN V163 CORTE 1.2

Fecha: 2026-07-20
Estado: `CLAUDE_CORRECTION_REQUIRED`

## Candidata auditada

- ZIP: `Prototype development request (12).zip`.
- SHA-256: `73fcffc48f6d897c7b4e701ff6dbc61898ef6c9afe1ea8291d1950f0d8f5cfe0`.
- Decisión: `HOLD_P0_PROVEN_NO_APPLY`.

## Conservar

- Solo cuatro archivos autorizados.
- Sin adapter generado.
- PptxGenJS local.
- Histórico completo preservado.
- `rows`, `branchRows`, `catalog`, `report()` y `filter()`.
- Director con Todos/GT/HN.
- Cuatro disponibles y tres pendientes.
- PDF/XLSX/PPTX reales.
- Nombres con alcance.
- Sin score, NPS, benchmark ni región inventados.

## Corregir

1. Para `role === 'sucursal'`, los cuatro reportes disponibles deben consumir exclusivamente `branchRows` filtradas por `resolvedBranchName`.
2. Eliminar el fallback `proj.latestPeriod`; si falta `CX.data.period().periodKey`, fallar cerrado.
3. Excluir `proj.latestPeriod` de `period_trend` por defecto.
4. Aceptar coincidencia normalizada de sucursal solo si es única.

## Evidencia

Con Miraflores 2 visitas y Oakland 2 visitas, ambas GT:

- reporte de sucursal: 2 visitas — correcto;
- resumen ejecutivo: 34 visitas GT — incorrecto;
- cobertura: 34 visitas GT — incorrecto;
- tendencia: 68 visitas GT — incorrecto.

Con contexto junio sin `periodKey`, el módulo selecciona julio por fallback — incorrecto.

## Archivos permitidos

- `app/modules/cliente-extra.js`.
- `app/index.html`.
- `app/vendor/pptxgenjs.min.js`.
- `app/REPORTE-DE-CAMBIOS.md`.

No tocar core, contratos, builders, gates, adapters, HR, finanzas, certificaciones ni recursos.

## Entrega

Candidata incremental con los mismos cuatro archivos y pruebas dinámicas de Director, Regional, Sucursal, periodo faltante y tendencia histórica.

No declarar cerrado Corte 1.
