# Smoke real V106 — 20260711

**Cómo se generó:** capturas tomadas directamente sobre `app/index.html` renderizado en un iframe real (no descripción, no maqueta) navegando la app con `CX.router.nav(...)` y leyendo la consola del navegador con la herramienta de logs del entorno tras cada navegación. Esto SÍ se ejecutó en esta ronda — a diferencia de rondas anteriores donde P1-1 quedó marcado como no ejecutado.

## Rutas verificadas en esta pasada

1. `dashboard` (rol admin, modo demo) — carga sin error de consola. Captura: `01-dashboard.png`.
2. `visitas` → botón "Ver detalle completo" (🔍) de una visita liquidada → modal con **Historial de estados** real (verifica el fix de P0-12). Captura: `02-visitas-detalle-historial.png`.
3. `lotes` / `finanzas` (alias de ruta) — lotes de pago demo, etiqueta "Pagado" simple en modo demo (no "(preview)"), consistente con el fix de P0-6. Captura: `03-lotes.png`.
4. `cert` (rol shopper, modo demo) — pantalla de certificación de ejemplo, badge "Ejemplo ilustrativo (modo demo)" visible.

**Consola del navegador:** sin errores ni warnings en ninguna de las navegaciones anteriores (verificado con la herramienta de logs tras cada paso).

## Honestidad de alcance — qué NO cubre este smoke

- No es un recorrido de las ~49 rutas/módulos del prototipo, solo las 4 tocadas por los cambios de esta ronda (dashboard, visitas, lotes/finanzas, cert) más una prueba de humo del shell.
- No se probaron los tamaños de viewport 360/390/412 mencionados en auditorías previas (móvil) — solo el viewport de escritorio del entorno de edición.
- No se generó un JSON de rutas/perfiles recorridos automáticamente; esta es una verificación manual dirigida a los 6 cambios de la ronda V105/V106.
- No sustituye una suite de pruebas automatizada ni QA formal — es evidencia de que los cambios puntuales no rompieron la carga ni introdujeron errores de consola visibles en las pantallas tocadas.
