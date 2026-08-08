# Claude tasks status V78 TyA

Fecha: 2026-07-04

## Decision actual

Todavia no es necesario pedir una nueva candidata a Claude.

Hay pendientes importantes para Claude, pero no son suficientes para interrumpir el avance backend en este momento. Se mantienen documentados y acumulados.

## Tareas importantes para Claude acumuladas

### 1. Novedades - nvBanner

Archivo: `app/modules/novedades.js`

Problema:

- El modulo usa `nvBanner`, pero en V78 no esta claro que exista el input correspondiente.
- Riesgo: publicar novedades puede fallar si intenta leer `.checked` sobre un elemento inexistente.

Decision:

- Claude debe restaurar el checkbox visible o agregar fallback seguro.
- Backend no debe tocar este modulo.

### 2. SaaS Console - version default de nuevo tenant

Archivo: `app/modules/saas-console.js`

Problema:

- En V78 el prototipo mantiene V78 como baseline visual, pero hay pendiente de revisar que el nuevo tenant no siga naciendo con version antigua.

Decision:

- Claude debe corregir la version default al crear tenants.
- Backend no debe tocar este modulo.

### 3. Mensajes de honestidad visual

Archivos posibles:

- Dashboard.
- Postulaciones.
- Visitas.
- Integraciones.
- Automatizaciones.

Problema:

- Aun se deben revisar textos como envio real, WhatsApp enviado, Make enviado, En vivo o similares.

Decision:

- Claude debe dejarlos como demo, simulado, preparado o preview cuando no exista backend real.
- Backend no debe parchear UI.

### 4. PWA

Archivo probable: `app/app.js`

Problema:

- V78 mejoro el estado install-aware, pero debe validarse en nueva candidata si la experiencia de instalacion queda clara y no promete descarga automatica imposible en iOS.

Decision:

- Mantener pendiente de validacion UX con Claude.

## Mejoras realizadas directamente por backend que Claude debe conocer

- V78 quedo como source lock visual.
- Se creo contrato `CX.data` backend adapter.
- Se creo scaffold inactivo del adapter.
- Se creo compatibility map metodo por metodo.
- Se creo connection point disabled.
- Se creo bridge disabled.
- Ninguno esta importado por `index.html`.
- Ninguno reemplaza `CX.data`.
- Ninguno modifica modulos.

## Criterio para pedir nueva candidata a Claude

Pedir nueva candidata cuando ocurra uno de estos casos:

1. Se acumulen 5 o mas tareas frontend importantes.
2. Alguna tarea frontend bloquee el backend.
3. Se vaya a probar el punto unico de conexion con frontend.
4. Se necesite validar PWA/UX antes de demo comercial.
5. Se detecte un bug visual critico en V78.

## Decision de continuidad

Continuar backend ahora.

No pedir nueva candidata todavia.

## Estado

- Documento acumulativo para Claude.
- Sin cambios frontend.
- Sin runtime conectado.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
