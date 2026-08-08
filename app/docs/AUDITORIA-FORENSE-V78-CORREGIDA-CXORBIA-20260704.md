# Auditoria forense V78 corregida

Fecha: 2026-07-04

## Correccion de criterio

La lectura anterior fue incompleta porque solo resumi el cambio V77 a V78 y no separe cambios acumulados, cambios directos y defectos vigentes.

## Comparativo real

### V76 a V77

- Archivos agregados: 0.
- Archivos eliminados: 0.
- Archivos modificados: `app/app.js`, `app/modules/saas-console.js`.

Cambios principales:

- `app/app.js`: el boton PWA pasa a ocultarse si la app ya esta en standalone.
- `app/modules/saas-console.js`: tenants semilla pasan a `V76`, KPI version actual pasa a `V76`, se agrega release `V76`.

### V77 a V78

- Archivos agregados: 0.
- Archivos eliminados: `app/modules/rutas.js`.
- Archivos modificados: `app/app.js`, `app/modules/saas-console.js`.

Cambios principales:

- `app/app.js`: PWA queda consciente del estado instalado y de iOS.
- `app/modules/saas-console.js`: releases cambian de estado publicado a interno sin deploy.
- `app/modules/rutas.js`: eliminado; reduce riesgo de duplicidad en Hojas de Ruta.

## Hallazgos abiertos

### Nuevo tenant SaaS aun nace en V72

En el ZIP V78 recibido, los tenants semilla y KPI ya estan en V76, pero al crear un tenant nuevo el objeto aun usa `version:'V72'`.

Accion Claude: cambiar a V76 o centralizar version vigente en constante.

### Novedades usa nvBanner sin input existente

En `app/modules/novedades.js`, el codigo usa `ov.querySelector('#nvBanner').checked`, pero el modal no contiene un input con ese id.

Impacto: publicar novedad puede romper el flujo.

Accion Claude: restaurar checkbox visible o agregar fallback seguro antes de leer checked.

Si Claude/Codex afirma que esto ya fue restaurado, esa restauracion no esta presente en el ZIP V78 recibido aqui.

## Pendientes residuales de honestidad visual

- Revisar textos operativos que puedan sonar a accion real.
- Mantener API keys e IA como demo local con aviso server-side para produccion.

## Decision

V78 si atiende mejoras relevantes y puede usarse como referencia visual reciente para empalme backend.

Pero el paquete para Claude debe actualizarse por dos pendientes concretos: `nvBanner` en Novedades y version de nuevos tenants en SaaS.

## Estado backend

- Sin cambios frontend desde backend.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
- Sin importacion real.
