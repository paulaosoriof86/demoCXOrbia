# Phase A TyA — smoke visual source-safe R5

Fecha: 2026-07-11
Baseline viva: CXOrbia V103 empalmada Phase A R5.

## Método y límite

Se ejecutó Chromium headless con Playwright sobre el runtime empalmado. La política del navegador del contenedor bloqueó navegación a URL/archivo, por lo que se construyó un harness inline solo de prueba que conserva el orden de CSS/JS y fuerza el flag de la entrada TyA. El harness no modifica el runtime. Esto no sustituye el smoke final sobre Hosting DEV verificado.

## Datos validados

- 14 periodos;
- 616 visitas;
- 213 shoppers;
- 13 periodos históricos / 572 visitas;
- julio 2026 activo / 44 visitas;
- GT 476 / HN 140;
- 0 pagos confirmados;
- 0 ítems elegibles para lote;
- 0 certificaciones elegibles sin fuente;
- gate de pago bloqueado.

## Cobertura por rol

- Admin: 36 rutas renderizadas, sin error de render.
- Ops: 19 rutas, sin error.
- Coordinador GT: 19 rutas y scope correcto de 34 visitas GT.
- Aliado HN: 19 rutas y scope correcto de 10 visitas HN.
- Shopper: 11 rutas, sin error.
- Cliente: HOLD P0; Panorama falla cuando no existen scores/secciones.

## Hallazgos

### P0 — Portal Cliente

`cli_dashboard` dereferencia `R.mejorSeccion/peorSeccion.sec` cuando la fuente source-safe todavía no tiene resultados evaluados. Debe mostrar un empty state honesto y no bloquear el portal.

### P0 — datos demo residuales

R4 mostró notificaciones y reservas ficticias. R5 eliminó las 6 notificaciones demo y desactivó el seed de reservas en la entrada TyA. Usuarios aún muestra `Admin Demo` y `Evaluador 01`; queda para Claude.

### P1 — Histórico

La vista inicial incluye julio activo aunque su copy afirma separación. Backend ya entrega 13 cerrados + 1 activo; el filtro visual debe usar esa separación.

### P1 — móvil shopper

Viewport 390 px produjo `scrollWidth=516`. Debe corregirse el overflow.

## Junio 2026

- 44 liquidaciones candidatas;
- GT 34 / HN 10;
- 25 pendientes de cuestionario;
- 19 pendientes de cruce/revisión;
- 0 pagadas;
- 0 elegibles para lote;
- las 44 requieren fuente/revisión financiera.

## Veredicto

Integridad backend/source-safe: PASS. Smoke visual para deploy: HOLD. Hosting DEV real: pendiente. Sin deploy, merge, import real, writes, proveedores, pagos ni producción.
