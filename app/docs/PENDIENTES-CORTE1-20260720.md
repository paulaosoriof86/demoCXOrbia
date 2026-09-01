# PENDIENTES CORTE 1

Fecha: 2026-07-20
Estado: `CLAUDE_REQUIRED_LOCALIZED_DELTA_READY`

## Ya resuelto

- Proyección por tenant, proyecto, periodo, país y sucursal.
- Matriz de reportes disponibles y pendientes de fuente.
- JSON/CSV filtrables.
- Histórico separado del periodo activo.
- Gates sin blockers ni errores de navegador.

## Pendiente inmediato

Archivo `app/modules/cliente-extra.js`, módulo `cli_reportes`:

- sustituir mensajes demo por archivos reales PDF, Excel y presentación;
- usar solo `window.CX_TYA_CORTE1_REPORTS`;
- habilitar únicamente reportes con fuente;
- mostrar `Pendiente de fuente` cuando corresponda;
- validar periodo, país, alcance y responsive.

Paquete: `PAQUETE-CLAUDE-CORTE1-REPORTES-EXPORTACIONES-20260720.md`.
Gate: `tools/qa/tya-corte1-report-frontend-consumer-acceptance.mjs`.

## Después

Auditoría delta, aplicación directa si GO, post-gates, Hosting DEV con autorización separada, revisión visual de Paula y freeze Corte 1.

Certificaciones: Corte 2 funcional, Corte 6 permisos y Corte 7 sincronización.
Recursos: Corte 1 contexto, Corte 2 entrega, Corte 6 permisos y Corte 7 almacenamiento/versionado.
