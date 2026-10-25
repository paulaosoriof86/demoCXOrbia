# CAMBIOS BACKEND — AUDITORÍA V163 HOLD

Fecha: 2026-07-20
Estado: `HOLD_P0_PROVEN_NO_APPLY`

## Ejecutado

- Se auditó directamente la candidata `Prototype development request (12).zip`.
- Se verificó SHA-256 `73fcffc48f6d897c7b4e701ff6dbc61898ef6c9afe1ea8291d1950f0d8f5cfe0`.
- Se confirmó que el delta se limita a cuatro archivos autorizados.
- Se verificó sintaxis Node de módulo y vendor.
- Se comprobó preservación exacta de baseline fuera de `cli_reportes` y preservación exacta del histórico de cambios.
- Se ejecutaron pruebas dinámicas de Director, Regional, Sucursal, periodo faltante y tendencia.

## Hallazgos

- P0: tres reportes de Sucursal usan datos de todo el país.
- P0: ausencia de `periodKey` cae silenciosamente en `latestPeriod`.
- P1: Tendencia incluye el periodo activo pese al contrato.
- P1: coincidencia normalizada de sucursal no exige unicidad.

## Sin aplicación

- No se modificó frontend runtime.
- No se aplicó V163.
- No se ejecutó deploy.
- No hubo merge, producción, importación ni escrituras reales.

## Clasificación

- Reusable CXOrbia: alcance por rol, fail-closed de periodo, histórico sin periodo activo y resolución única de sucursal.
- Exclusivo TyA: fixtures y conteos Cinépolis usados para reproducir el problema.
- Claude/prototipo: corrección localizada en `cli_reportes`.
- Academia: explicar alcance por rol, periodo y diferencia entre activo e histórico.
- Sin impacto Claude: hashes, blobs, Node checks y evidencia de auditoría.
