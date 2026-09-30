# Pendientes prototipo - Addendum V82 lock

Fecha: 2026-07-04

## Decision

V82 queda como baseline viva/source lock por decision de Paula, porque Claude perdio capacidad.

## Pendientes activos sobre V82

1. `app/modules/cuestionario-shopper.js`
   - Cambiar texto externo `marca la visita como cuestionario enviado` por `marca el cuestionario como realizado/completado`.

2. `app/modules/revision-admin.js`
   - Cambiar `Cuestionario: enviado` por `Cuestionario: realizado/completado`.
   - Agregar alias/campo `status=estado`.
   - Guardar `projectId:p.id`.
   - Guardar `hrRowId:v.hrRowId||v.rowId||v.extId||''` cuando exista.
   - Exigir nota/referencia HR explicita para `submitido_registered` en proyectos HR-driven.

3. `app/modules/misvisitas.js`
   - Cambiar textos que dicen `sincroniza estado` o `sincroniza la hoja de ruta`.
   - Usar estado honesto: pendiente backend, preparado o se reflejara cuando HR sync este activo.

4. `app/modules/postulaciones.js`
   - Cambiar toasts `HR sincronizada` por `se reflejara en HR cuando el sync este activo (pendiente backend)`.

## Regla de continuidad

Estos pendientes ya no se envian a Claude como V83. Se resuelven internamente por ChatGPT/Codex si Paula lo autoriza o si bloquean el siguiente bloque Phase A.

## Seguridad

No activar deploy, produccion, Firestore real, Auth real, Make real, Gemini real, WhatsApp API real, Storage real ni import real desde estos pendientes.
