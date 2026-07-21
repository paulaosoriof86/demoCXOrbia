# PENDIENTES-PROTOTIPO.md

> Lista viva de mejoras del prototipo CXOrbia. Actualizada 2026-07-20.
> P0 crítico · P1 importante · P2 posterior · [TyA] específico · [CX] reusable.

## 🔴 P0/P1 ACTUAL — CORTE 1B CON HR VIVA CONFIRMADA

### Resuelto por backend/adapters

- [Backend] La lectura HR viva quedó confirmada: fecha de cuestionario actualizó KPI y asignación HR retiró una visita disponible del shopper.
- [Backend] La revisión excluye timestamps volátiles y no debe provocar recargas falsas.
- [Backend] El build usa bootstrap/cache y comprobación fresca controlada.
- [Backend] El trigger de refresco comprueba al cargar, en `pageshow` y cada 15 segundos.
- [Backend] La proyección live de cuatro reportes operativos está desplegada en DEV.
- [Gobierno] No pedir nueva candidata por rutina ni reabrir empalme, histórico, estados, shoppers o Finanzas.

### P0 — Reportes Admin

- [Claude/CX] `app/modules/operacion-extra.js`: PDF debe exportar el reporte seleccionado y no ejecutar impresión de la página completa.
- [Claude/CX] La edición debe modificar columnas, orden, títulos y notas en vista previa y exportaciones.
- [Claude/CX] Excel debe ser `.xlsx` real; no CSV presentado como Excel.
- [Claude/CX] No mostrar velocidad, calidad, hallazgos, scores, NPS o liquidaciones como cifras reales sin fuente confirmada.

### P0 — Panorama por periodo

- [Claude/CX] `app/core/cliente-data.js`: cache por `tenantId + projectId + periodKey + sourceRevision + mode`.
- [Claude/CX] `app/modules/cliente.js`: separar operación del periodo de score/NPS/secciones.
- [Claude/CX] `app/modules/cliente-insights.js`: revisar comparativos si comparte el mismo estado.
- [Claude/CX] MAY/JUN/JUL deben mostrar indicadores operativos del periodo seleccionado.
- [Claude/CX] Sin score validado, usar un único `Pendiente de fuente`; no mostrar ceros aparentes como resultados.

### P1 bloqueante visual — Diseño reusable de reportes

- [Claude/CX] `app/modules/cliente-extra.js` y `app/modules/operacion-extra.js` deben usar una plantilla común configurable.
- [Claude/CX] Aplicar logo, paleta, tipografía, proyecto, periodo, alcance, fecha, fuente, pie y paginación.
- [Claude/CX] Incluir gráficas de cumplimiento, cobertura, tendencia, distribución o comparativo cuando correspondan.
- [Claude/CX] PDF, Excel y PPT deben contener las mismas filas y la misma revisión.
- [Claude/CX] El estándar aplica a Admin, Cliente, Shopper y demás roles según permisos.
- [Claude/CX] Cinépolis no se hardcodea.

### Paquete vinculante

- `app/docs/PAQUETE-CLAUDE-CORTE1B-REPORTES-PANORAMA.md`.

### Cierre pendiente

`DELTA CLAUDE CORTE 1B → AUDITORÍA FOCALIZADA → APPLY_DELTA_DIRECTLY → GATES → HOSTING DEV → VALIDACIÓN VISUAL → RETIRAR WORKFLOW TEMPORAL → FREEZE CORTE 1`
