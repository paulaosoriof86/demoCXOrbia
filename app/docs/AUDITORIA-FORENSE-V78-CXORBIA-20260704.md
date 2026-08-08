# Auditoria forense CXOrbia V78

Fecha: 2026-07-04

## Alcance

Auditoria del ZIP `Prototype development request CXOrbia V78.zip` contra V77 disponible localmente.

Este documento separa prototipo/frontend de backend. No modifica modulos ni core.

## Resultado forense de archivos

- V77: 94 archivos.
- V78: 93 archivos.
- Archivos agregados: 0.
- Archivos eliminados: 1.
- Archivos modificados por hash: 2.

## Cambios detectados

### Eliminado

- `app/modules/rutas.js`

Lectura tecnica: el retiro es pertinente si `rutas.js` era la version simple que podia sobrescribir la version completa de HR desde `operacion-extra.js` o el modulo vigente. Este cambio reduce riesgo de regresion por duplicidad.

### Modificado

- `app/app.js`
- `app/modules/saas-console.js`

## Cambios funcionales visibles

### PWA / login

V78 cambia el bloque de instalacion PWA para detectar modo standalone y mostrar `App instalada` cuando aplica. En iOS cambia el texto hacia una guia de instalacion.

Lectura: mejora frente al pendiente anterior. No implica instalacion automatica real, porque eso depende del navegador/dispositivo.

### SaaS console / releases

V78 cambia estados de releases desde `Publicado` hacia `Interno (sin deploy)` y agrega texto que aclara que el prototipo es interno y que el despliegue real centralizado por tenant corresponde al backend.

Lectura: mejora importante. Reduce el riesgo de prometer produccion o deploy real desde prototipo.

### Rutas / Hojas de Ruta

V78 elimina `app/modules/rutas.js`. Esto atiende el pendiente de duplicidad/sobrescritura de Hojas de Ruta si el archivo simple quedaba cargado o disponible como confusion.

## Busqueda estatica relevante V78

Hallazgos que aun deben interpretarse con cuidado:

- `En vivo` sigue apareciendo en `modules/dashboard.js`, `modules/postulaciones.js` y `modules/visitas.js`.
- `WhatsApp enviado` sigue apareciendo en `modules/dashboard.js` y `modules/postulaciones.js`.
- `API key` y `apiKey` siguen apareciendo en automatizaciones/IA, aunque hay avisos de demo y pendiente server-side.
- `Publicado` queda en `modules/marketing.js` como estado de contenido de marketing, no necesariamente como deploy SaaS.
- `Produccion` aparece como rubro/etiqueta funcional en CRM y como gate bloqueado en HR Source, no necesariamente como accion real.

## Decision forense

V78 si atiende puntos relevantes frente a V77:

- reduce el problema PWA;
- corrige estados de release para no prometer deploy;
- elimina `rutas.js` y reduce duplicidad en HR;
- permite iniciar empalme backend sobre esta base como candidata visual reciente.

Pero no debe declararse cierre total sin validacion visual porque aun hay textos que pueden sonar a accion real: `En vivo` y `WhatsApp enviado` en modulos operativos.

## Empalme backend

Se puede continuar backend sobre V78 como referencia visual/prototipo reciente, sin copiar archivos frontend al PR backend y sin tocar `/app/modules` ni `/app/core`.

El empalme se hara por documentacion y contratos backend:

- mantener readiness V5;
- mantener paquete DEV controlado;
- mantener runner disabled;
- mantener gates, rollback y contrato de datos;
- dejar ajustes visuales residuales para Claude.

## Estado

- Auditoria documental.
- Sin cambios frontend.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
- Sin importacion real.
