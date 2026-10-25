# Paquete Claude — Corte 1.2 Reportes y Exportaciones

Fecha: 2026-07-20
Estado: `CLAUDE_REQUIRED_LOCALIZED_DELTA`
Prioridad: `REPLICABLE_CLAUDE_INMEDIATO`

## 1. Baseline y método

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- `ACTIVE_BASELINE`: V161C/R21.
- No reauditar la plataforma completa.
- No crear nueva metodología, rama o PR.
- Entregar un delta localizado para auditoría y aplicación directa si queda GO.

## 2. Problema reproducible

Archivo: `app/modules/cliente-extra.js`.
Módulo: `cli_reportes`.

Los botones PDF, Excel y PPT solo muestran un toast demo. Además, los nombres actuales prometen score, NPS, benchmark, planes y brechas aunque la fuente HR vigente no entrega todos esos datos.

## 3. Fuente aprobada

Consumir exclusivamente:

`window.CX_TYA_CORTE1_REPORTS`

Contrato de datos:

`backend/contracts/phase-a-corte1-context-history-reports-v1.json`

Contrato frontend:

`backend/contracts/phase-a-corte1-report-frontend-consumer-v1.json`

No reconstruir conteos desde fixtures, DOM, `CX.clienteData` sintético ni proveedores externos.

## 4. Evidencia vigente

- Run `29727050055`: SUCCESS.
- Artifact `8454684849`.
- Digest `sha256:da068c013b3911f062ac5d7154580224b5fa68f5df91a6bfd68c0c7e6ec5aabf`.
- 14 periodos.
- 616 visitas.
- 28 filas periodo/país.
- 308 filas periodo/país/sucursal.
- Julio GT produce 17 filas de sucursal.
- 0 pagos confirmados.
- 0 blockers, 0 errores de página y 0 errores de consola.

## 5. Matriz de reportes

### Disponibles

1. `executive_operational_summary` → “Resumen ejecutivo operativo”.
2. `branch_operational_status` → “Estado operativo por sucursal”.
3. `country_coverage` → “Cobertura por país”.
4. `period_trend` → “Tendencia operativa por periodo”.

### Pendientes de fuente

1. `brand_scorecard`.
2. `action_plans`.
3. `training_gaps`.

Los pendientes deben mostrar “Pendiente de fuente”, explicar el dato requerido y tener los botones de exportación deshabilitados.

No llamar “región” a país. No llamar “benchmark” a una tendencia interna. No mostrar score/NPS si no existe fuente validada.

## 6. Exportaciones requeridas

### PDF

- Abrir una vista imprimible del reporte seleccionado.
- Incluir tenant, proyecto, periodo, país/alcance, fuente y fecha de generación.
- Usar `window.print()`.
- No mostrar controles de navegación en impresión.

### Excel

- Generar `.xlsx` real con SheetJS ya cargado.
- Una hoja de resumen y una hoja de datos.
- Respetar exactamente las filas filtradas por reporte y alcance.

### PPT

- Generar `.pptx` real.
- Usar dependencia local revisada, no CDN remoto.
- Presentación 16:9 con portada, resumen, tabla/gráfico simple y nota de fuente.
- No crear gráficos con métricas ausentes.

JSON y CSV pueden quedar como opciones avanzadas, pero no sustituyen PDF/XLSX/PPTX.

## 7. Contexto y alcance

- Periodo: `CX.data.period().periodKey`.
- Proyecto y periodo deben permanecer separados.
- Cambiar proyecto o periodo debe redibujar KPI, tarjetas y exportación.
- Director: alcance del proyecto/periodo con filtro país opcional.
- Regional: si no existe mapping regional estable, bloquear con “Pendiente de alcance autorizado”.
- Sucursal: exportar solo cuando `scopeSucursal` resuelva a `branchName` estable.
- El selector “Ver como” es preview; no afirmar seguridad de servidor antes de Corte 6.

## 8. Estados honestos

Eliminar del módulo de reportes:

- `— demo`;
- `PDF demo`;
- `Generando` sin archivo real;
- cualquier confirmación de exportación si no se generó archivo.

Estados válidos:

- Disponible;
- Pendiente de fuente;
- Pendiente de alcance autorizado;
- Sin datos para este periodo y alcance;
- Error al generar archivo.

## 9. Responsive y accesibilidad

- Sin overflow horizontal en móvil.
- Botones agrupados y legibles.
- Estado pendiente visible sin depender solo del color.
- Nombres de archivo legibles y sanitizados.
- Botones con `aria-label` o texto claro.

## 10. Archivos permitidos

Principal:

- `app/modules/cliente-extra.js`.

Opcionales solo si son indispensables para PPTX:

- `app/vendor/pptxgenjs.min.js`.
- `app/index.html` para cargar el asset local.

Documentación:

- `app/REPORTE-DE-CAMBIOS.md`.

## 11. Archivos protegidos

No modificar:

- `app/core/data.js`;
- `app/core/store.js`;
- `app/core/router.js`;
- contratos R20/R21;
- builders/gates backend;
- adapters source-safe;
- datos HR;
- finanzas, certificaciones o recursos en este paquete.

## 12. Gate de aceptación

Ejecutar:

`node tools/qa/tya-corte1-report-frontend-consumer-acceptance.mjs`

Después se ejecutarán gates canónicos R18A/R21, navegador, build DEV y revisión visual de Paula.

## 13. Documentación obligatoria de Claude

En `app/REPORTE-DE-CAMBIOS.md` indicar:

- archivos tocados;
- reportes habilitados;
- reportes pendientes de fuente;
- formato PDF/XLSX/PPTX usado;
- dependencia local agregada, si aplica;
- comportamiento por rol;
- responsive;
- pruebas realizadas;
- cualquier limitación real.

## 14. Criterio de entrega

La respuesta debe incluir:

- lista exacta de archivos modificados/agregados;
- resumen del delta;
- resultado del gate de aceptación;
- resultado de `node --check`;
- confirmación de que no tocó archivos protegidos;
- ZIP/candidata incremental únicamente con el delta necesario.

No declarar cierre de Corte 1. El cierre ocurre después de auditoría, aplicación directa, gates, Hosting DEV autorizado y revisión visual de Paula.
