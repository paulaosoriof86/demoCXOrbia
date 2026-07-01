# RESULTADO-SPRINT1-GATE-PREVIEW-BACKEND-V63

Fecha: 2026-07-01
Rama: release/cxorbia-tya-rc-20260630

## Objetivo

Iniciar Sprint 1 para validar preview backend V63 sobre la ultima base visual aplicada.

## Hallazgo inmediato

`app/index-backend-dev.html` seguia cargando `modules/rutas.js`, aunque V63 ya elimino esa carga en `app/index.html`. Esto podia reintroducir el problema documentado de sobrescritura visual de HR/rutas en el preview backend.

## Correccion aplicada

Se actualizo `app/index-backend-dev.html` para alinearlo con `app/index.html` V63 y dejar de cargar `modules/rutas.js`.

Commit: 5f61c71d18899f17dd64cd7bffd0e78251198c70

## Archivos tocados

- `app/index-backend-dev.html`

## Restricciones respetadas

- No se toco `app/modules`.
- No se toco `app/index.html`.
- No se hizo deploy.
- No se publico Hosting.
- No se toco produccion.
- No se usaron datos reales.
- No se toco Orbit.
- No se tocaron secretos.

## Estado Sprint 1

Pendiente de validacion local controlada con servidor Node y preview backend DEV.

Criterios a validar localmente:

1. HTTP 200 para `app/index-backend-dev.html`.
2. Carga de scripts sin error fatal.
3. Badge `Backend DEV` visible.
4. Auth DEV OK o error claro.
5. Fuente `firestore` cuando haya credencial local disponible.
6. Tenant `tya`.
7. Conteos Firestore del seed piloto V58.
8. Confirmar que no se muestra localStorage/demo como si fuera backend real.

## Siguiente paso

Ejecutar bloque local unico para gate preview backend V63. No usar Python. Usar Node.
