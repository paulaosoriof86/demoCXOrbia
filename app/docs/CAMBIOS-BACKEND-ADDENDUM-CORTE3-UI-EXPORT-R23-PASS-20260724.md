# CAMBIOS BACKEND — Addendum Corte 3 UI/export R23 PASS

**Fecha:** 2026-07-24  
**Bloque:** `CORTE3_CANONICAL_FINANCE_UI_EXPORT_R23`  
**Estado:** `TECHNICAL_PASS_PENDING_HOSTING_DEV_VISUAL`

## Archivos modificados

### `app/index-backend-dev.html`

- **Tipo:** modificado.
- **Qué cambió:** se restauró la cadena V174 source-safe antes del snapshot/adapter financiero y se mantuvo el orden de módulos aprobado.
- **Por qué:** la entrada DEV no estaba levantando la misma fuente HR canónica requerida por Finanzas y Beneficios.
- **Impacto frontend:** solo entrada DEV; no se modificaron módulos ni `app/index.html`.
- **Pendiente/riesgo:** publicar el mismo build en Hosting DEV únicamente con autorización específica.

### `tools/release/tya-source-safe-binding-build-r15g.mjs`

- **Tipo:** modificado.
- **Qué cambió:** se corrigió el reemplazo de `CX.dataSource.warnings` para no cortar el texto en un punto y coma interno; se agregó validación sintáctica del adapter generado.
- **Por qué:** el adapter generado podía contener `Unexpected identifier 'referencias'`.
- **Impacto frontend:** ninguno; corrección reusable de build/gate.
- **Pendiente/riesgo:** ninguno abierto en el generador para este caso.

### `tools/qa/tya-corte3-canonical-finance-ui-export-r23-gate.mjs`

- **Tipo:** modificado.
- **Qué cambió:** diagnóstico fail-closed, bloqueo de service workers, selección de mayo 2026, separación 44 visitas HR vs 42 filas financieras exactas, validación de colas de revisión, pagos en cero, Finanzas, Beneficios y especificación de reporte.
- **Por qué:** evitar falsos PASS, recargas del navegador y la inferencia incorrecta de una fila financiera por cada visita.
- **Impacto frontend:** ninguno; prueba la UI existente.
- **Pendiente/riesgo:** el gate no sustituye inspección visual del PDF/Excel real.

### `tools/qa/cxorbia-controlled-runners-contract-gate.mjs`

- **Tipo:** modificado.
- **Qué cambió:** contrato de runners alineado con el perfil canónico de UI/export y sus evidencias.
- **Por qué:** el preflight debía reconocer el perfil y sus rutas exactas.
- **Impacto frontend:** ninguno.
- **Pendiente/riesgo:** ninguno para el perfil actual.

### `.github/workflows/cxorbia-readonly-post-gates-runner.yml`

- **Tipo:** modificado.
- **Qué cambió:** instalación Playwright sin lockfile, preparación del binding V174, captura de delta, carga de evidencias y exclusión local de `.tmp/` mediante `.git/info/exclude`.
- **Por qué:** `.tmp/` contiene únicamente outputs efímeros del gate y provocaba un falso `repository_unchanged_after_gates`.
- **Impacto frontend:** ninguno.
- **Pendiente/riesgo:** el guard de archivos rastreados continúa activo; no se ignoraron cambios funcionales.

### `.github/cxorbia-gate-requests/request.json`

- **Tipo:** actualizado de forma controlada.
- **Qué cambió:** solicitudes sucesivas del mismo perfil para diagnóstico focalizado hasta el PASS final.
- **Por qué:** cada ejecución congeló `targetHeadSha`, perfil, safe state y ejecución única.
- **Impacto frontend:** ninguno.
- **Pendiente/riesgo:** no reutilizar la solicitud como autorización de Hosting o producción.

## Resultado final verificado

- Run: `30074835544`.
- Job: `89423207982`.
- Artifact: `8589444193`.
- Digest: `sha256:06188dc26dcba0a4e0b9b6fc4119ed32ca31d38462a6e513f177ab84cdba0deb`.
- Estado: `PASS_READONLY_POST_GATES`.
- Commit status: `cxorbia/readonly-post-gates/overall = success`.

## No ejecutado

- Hosting DEV nuevo;
- deploy productivo;
- merge;
- producción;
- imports;
- Firestore/Auth/Storage/HR writes;
- Make/Gemini live;
- lotes o pagos.
