# Remote smoke workflow post-staging - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego workflow manual para ejecutar smoke remoto contra la URL real de preview/staging cuando este disponible.

Archivo creado:

- `.github/workflows/cxorbia-phase-a-remote-smoke.yml`

Usa el script ya creado:

- `tools/qa/tya-phase-a-remote-smoke.mjs`

## Objetivo

Eliminar trabajo manual cuando exista URL de staging.

En lugar de pedir pasos locales, el workflow permite ejecutar el smoke post-staging desde GitHub Actions con un unico input:

- `base_url`

## Seguridad

El workflow:

- solo acepta URL `https://`;
- rechaza `localhost` y `127.0.0.1`;
- no despliega;
- no lee secrets;
- no llama proveedores internos;
- no escribe base;
- no importa datos;
- no toca produccion.

## Que valida

El smoke remoto recorre roles y modulos criticos definidos en el script:

- shell/login;
- admin;
- shopper;
- Dashboard;
- Postulaciones;
- Reservas;
- Automatizaciones;
- Finanzas;
- Academia;
- Certificacion;
- cuestionario shopper;
- consola/errores;
- copy honesto visible.

## Resultado esperado

El workflow sube artifact:

- `phase-a-remote-smoke-report`

Con reportes:

- `phase-a-remote-smoke-report.json`
- `phase-a-remote-smoke-report.md`
- screenshot final si el navegador logra capturarlo.

## Que necesito de Paula

No necesito revision de logica ahora.

Solo necesito la URL de staging cuando el workflow de deploy la entregue o una captura del fallo si GitHub Actions se bloquea.

## Clasificacion del bloque

### Reusable CXOrbia

Este workflow es reusable para cualquier cliente CXOrbia que tenga URL staging/preview.

### Exclusivo cliente

El script actual conserva prefijo TyA porque se hizo para Phase A actual, pero el patron de workflow es reusable.

### Claude/prototipo

No cambia UI. Sirve para validar que Claude no rompa rutas, roles, copy honesto ni Academia cuando entregue nuevas candidatas.

### Academia

Valida que Academia cargue en flujos criticos y que no quede rota en staging.

### Sin impacto Claude

No hay cambio visual directo.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin proveedores reales, sin imports, sin lectura de secrets y sin datos sensibles.
