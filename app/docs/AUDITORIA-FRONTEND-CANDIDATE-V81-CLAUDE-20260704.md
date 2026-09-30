# Auditoria frontend candidate V81 Claude

Fecha: 2026-07-04

## Alcance

Se audito el ZIP `Prototype development request CXOrbia V81.zip` entregado por Paula. Claude lo describe internamente como V80 corregido; esta diferencia de numeracion no se considera incoherencia porque Paula lleva versionado interno por cada cambio recibido.

La auditoria compara V81 contra:

- el ZIP V80 previo;
- el source lock vigente V79;
- los fixes ya documentados en repo `docs-tya-v6-v71-audit`;
- los contratos backend/documentales Phase A.

Esta auditoria no empalma V81, no crea source lock V81 y no activa runtime. V81 queda como candidato corregido de Claude, todavia pendiente de ajuste antes de empalme completo.

## Resultado ejecutivo

V81 mejora V80 y cierra parcialmente los puntos pedidos:

- `app/modules/proyecto-wizard.js`: ya no usa `externa`/`link` como valores del selector, agrega `qMode()` y guarda `visitLinkField:'questionnaireLink'`.
- `app/modules/cuestionario-shopper.js`: ya busca el link por visita en los 5 campos solicitados.
- `app/modules/revision-admin.js`: ya usa claves canonicas en ingles y fallback `CX.data.revisiones`/`localStorage`.
- `app/modules/misvisitas.js`: corrige `plantilla lista (plantilla lista)`.
- La sintaxis JS de V81 valida: `node --check` sobre 61 archivos JS, `OK=61 FAIL=0`.

Pero V81 todavia NO debe empalmarse completo porque quedan regresiones/parciales importantes:

1. `proyecto-wizard.js` no conserva todos los defaults Phase A ya aplicados en el repo actual: faltan `hrFuente`, `revision`, `submitido` y `contactos` en la configuracion creada.
2. `proyecto-wizard.js` todavia muestra el campo URL base cuando el modo es `externo_visita`, porque el display usa `st.cuestModo==='interna'` en vez de usar `qMode(st.cuestModo)` y ocultarlo para `externo_visita`.
3. `cuestionario-shopper.js` conserva textos `cuestionario enviado` en la descripcion externa y en el flujo interno; debe quedar `cuestionario realizado` para no confundir con submitido.
4. `revision-admin.js` mejora, pero sigue sin generar un registro compatible con el contrato backend: no incluye `tenantId`, `projectId`, `reviewId`, `assignmentId`, `shopperId`, `hrRowId`, `source`, `createdAt`, `updatedAt` ni `auditTrail` estructurado.
5. `revision-admin.js` permite seleccionar `submitido_registered` desde UI; aunque el toast dice pendiente HR/backend para HR-driven, falta exigir nota/referencia HR o bloquear esa transicion si el proyecto es HR-driven.
6. `misvisitas.js` corrige el duplicado, pero sigue diciendo que la accion `sincroniza la hoja de ruta` en el `aiBox` y el comentario superior mantiene `sincroniza estado de visita y liquidacion`.
7. V81 no actualiza documentacion interna del prototipo; no trae addendum propio en `app/docs`, `RESUMEN-PARA-CLAUDE.md` ni `PENDIENTES-PROTOTIPO.md`.

## Comparativo V80 ZIP -> V81 ZIP

Archivos agregados:

- Ninguno.

Archivos eliminados:

- Ninguno.

Archivos modificados:

- `app/modules/proyecto-wizard.js`
- `app/modules/cuestionario-shopper.js`
- `app/modules/revision-admin.js`
- `app/modules/misvisitas.js`

## Validaciones tecnicas ejecutadas

- Se descomprimio V81 localmente.
- Se comparo V81 contra V80 local.
- Se revisaron los archivos modificados.
- Se ejecuto `node --check` sobre 61 archivos JS de V81: resultado `OK=61 FAIL=0`.
- No se ejecuto la app en navegador.
- No se hizo deploy.
- No se escribio Firestore.
- No se activo Auth real.
- No se activo Make/Gemini/WhatsApp API real.

## Analisis por archivo

### `app/modules/proyecto-wizard.js`

Avances:

- Agrega `qMode()`.
- Selector usa `interna`, `externo_general`, `externo_visita`.
- Ya no aparecen opciones `value="externa"` ni `value="link"`.
- Guarda `cuestionario.modo` con `qMode(st.cuestModo)`.
- Guarda `visitLinkField:'questionnaireLink'`.

Pendientes/regresiones:

- No conserva los defaults Phase A ya aplicados en repo actual:
  - `hrFuente:{origen:..., etiqueta:...}`;
  - `revision:{consultora:false, cliente:false}`;
  - `submitido:{quien:'consultora', rol:'hr'}`;
  - `contactos:{evidencias:'', soporte:'', cuestionario:'', reprog:'', pagos:'', coordinacion:''}`.
- El campo de URL base se muestra para `externo_visita`; debe ocultarse para `interna` y `externo_visita`.
- Sigue sin exponer el Wizard Phase A completo definido en `app/docs/WIZARD-PHASE-A-COMPLETE-CONTRACT-TYA-20260704.md`.

Correccion solicitada:

- Tomar como base `proyecto-wizard.js` actual del repo, no el V81 ZIP completo.
- Mantener `qMode()`, selector canonico y `visitLinkField`.
- Restaurar defaults Phase A.
- Corregir visibilidad de URL general usando `const qm=qMode(st.cuestModo)`.
- Agregar configuracion Phase A completa como UI honesta, sin runtime real.

### `app/modules/cuestionario-shopper.js`

Avances:

- Link por visita busca los 5 campos requeridos:
  - `questionnaireLink`;
  - `cuestionarioUrl`;
  - `linkCuestionario`;
  - `urlCuestionario`;
  - `hrQuestionnaireLink`.
- Boton externo dice `Marcar cuestionario realizado`.
- Toast externo dice `Cuestionario realizado`.
- Si no hay link, sigue mostrando aviso y no cae al interno.

Pendientes:

- En la descripcion del modal externo todavia dice `marca la visita como cuestionario enviado`.
- En el flujo interno todavia usa `Cuestionario enviado` como titulo/toast.
- Esto debe cambiarse a `cuestionario realizado` o `cuestionario completado` para no mezclarlo con submitido.

Correccion solicitada:

- Cambiar todos los textos visibles `cuestionario enviado` a `cuestionario realizado` o `cuestionario completado`.
- Mantener los 5 campos de busqueda y el comportamiento de no caer al interno si falta link.

### `app/modules/revision-admin.js`

Avances:

- Estados canonicos implementados:
  - `pending_review`;
  - `in_review`;
  - `needs_correction`;
  - `approved_for_submitido`;
  - `submitido_registered`;
  - `rejected`;
  - `hr_conflict`;
  - `cancelled`.
- Labels visibles en espanol.
- Usa `CX.data.revisiones` cuando existe y fallback `localStorage`.
- HR-driven ya no promete submitido real en el toast; dice pendiente HR/backend.

Pendientes:

- La estructura no cumple aun el contrato de revision admin Phase A.
- Falta registro con campos minimos/recomendados:
  - `tenantId`;
  - `projectId`;
  - `reviewId`;
  - `visitId`;
  - `assignmentId`;
  - `shopperId`;
  - `hrRowId`;
  - `source`;
  - `createdAt`;
  - `updatedAt`;
  - `auditTrail`.
- No exige nota ni referencia HR cuando se selecciona `submitido_registered` en proyecto HR-driven.
- No impide que un usuario admin marque `submitido_registered` como estado aunque HR-driven no este confirmado.
- No integra todavia revision con liquidaciones ni estados visibles fuera del modal.

Correccion solicitada:

- Mantener UI simple, pero guardar estructura compatible con contrato.
- Para HR-driven, `submitido_registered` debe requerir nota/referencia HR o quedar bloqueado como `approved_for_submitido`/`pending_hr_submitido` hasta backend.
- Mantener estado honesto: no prometer liquidacion habilitada real si no hay backend/HR.

### `app/modules/misvisitas.js`

Avance:

- Corrige `plantilla lista (plantilla lista)` a `plantilla lista`.

Pendiente:

- El `aiBox` aun dice que cada accion `sincroniza la hoja de ruta`.
- Comentario superior aun dice `sincroniza estado de visita y liquidacion`.

Correccion solicitada:

- Cambiar textos a algo honesto: `prepara actualizacion`, `notifica al equipo`, `pendiente backend HR sync`, `se reflejara cuando la sincronizacion HR este activa`.

## Decision recomendada

V81 es mejor que V80, pero aun no debe empalmarse como paquete completo.

Puede pedirse a Claude una V82 corta y focalizada con estos ajustes:

1. Restaurar defaults Phase A en `proyecto-wizard.js` y ocultar URL para `externo_visita`.
2. Eliminar todos los textos `cuestionario enviado` en `cuestionario-shopper.js`.
3. Ajustar `revision-admin.js` para estructura compatible con contrato y bloquear/exigir nota HR en `submitido_registered` si HR-driven.
4. Limpiar textos de `misvisitas.js` que prometen sincronizacion HR.
5. Actualizar documentacion interna del prototipo.

## Prompt corto para Claude

Claude: V81 mejora V80, pero aun no debe empalmarse completo. Haz una V82 focalizada conservando lo bueno y corrigiendo solo esto:

1. `proyecto-wizard.js`
   - Conserva `qMode()`, `interna`, `externo_general`, `externo_visita` y `visitLinkField:'questionnaireLink'`.
   - Restaura los defaults Phase A del repo actual: `hrFuente`, `revision`, `submitido`, `contactos`.
   - Oculta URL general cuando el modo es `externo_visita`; usa `qMode(st.cuestModo)` para calcular visibilidad.
   - No vuelvas a `externa`/`link` como valores guardados.

2. `cuestionario-shopper.js`
   - Conserva los 5 campos de link por visita.
   - Cambia todos los textos visibles `cuestionario enviado` por `cuestionario realizado` o `cuestionario completado`.
   - No confundas cuestionario con submitido.

3. `revision-admin.js`
   - Conserva estados canonicos en ingles y labels visibles en espanol.
   - Guarda estructura compatible con el contrato: `tenantId`, `projectId`, `reviewId`, `visitId`, `assignmentId`, `shopperId`, `source`, `createdAt`, `updatedAt`, `auditTrail` cuando sea posible.
   - Si el proyecto es HR-driven, no permitas `submitido_registered` libre: exige nota/referencia HR o deja `approved_for_submitido`/pendiente HR backend.
   - No prometas liquidacion real habilitada sin backend/HR.

4. `misvisitas.js`
   - Quita textos que digan que ya sincroniza la hoja de ruta.
   - Usa mensajes honestos: pendiente backend, preparado, se reflejara cuando HR sync este activo.

5. Documentacion
   - Actualiza `RESUMEN-PARA-CLAUDE.md`.
   - Actualiza `PENDIENTES-PROTOTIPO.md`.
   - Crea addendum en `app/docs` con archivos tocados, motivo, impacto, riesgo y validacion.

No tocar `tools/migration`, `app/contracts`, reglas Firestore, Auth real, Make real, Gemini real, WhatsApp API real, Storage real, deploy ni datos reales.

## Estado seguro

- Sin empalme V81.
- Sin source lock V81.
- Sin cambios frontend aplicados desde esta auditoria.
- Sin deploy.
- Sin produccion.
- Sin Firestore writes reales.
- Sin Auth real.
- Sin Make/Gemini/WhatsApp API real.
- Sin runtime backend conectado.
