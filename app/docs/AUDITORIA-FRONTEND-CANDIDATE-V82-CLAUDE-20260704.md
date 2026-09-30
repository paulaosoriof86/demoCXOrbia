# Auditoria frontend candidate V82 Claude

Fecha: 2026-07-04

## Alcance

Se audito el ZIP `Prototype development request CXOrbia V82.zip` entregado por Paula como version mas reciente de Claude. La numeracion interna de Paula se respeta y no se interpreta como incoherencia si Claude describe la entrega como V82 sobre V80/V81.

La auditoria compara V82 contra:

- V81 ZIP;
- source lock vigente V79;
- fixes ya documentados en repo `docs-tya-v6-v71-audit`;
- contratos backend/documentales Phase A.

Esta auditoria no empalma V82, no crea source lock V82 y no activa runtime. V82 queda como candidato muy cercano a empalme, pero requiere correcciones puntuales antes de aceptarse como baseline viva.

## Resultado ejecutivo

V82 corrige varios puntos importantes de V81:

- `app/modules/proyecto-wizard.js` conserva `qMode()`, usa `interna`, `externo_general`, `externo_visita`, guarda `visitLinkField:'questionnaireLink'`, restaura defaults Phase A (`hrFuente`, `revision`, `submitido`, `contactos`) y oculta URL general para `externo_visita`.
- `app/modules/cuestionario-shopper.js` conserva los 5 campos de link por visita y ya usa `Cuestionario completado` en el modal final y toast interno.
- `app/modules/revision-admin.js` conserva estados canonicos, labels en espanol, fallback `CX.data.revisiones`/`localStorage`, estructura backend-ready parcial y bloqueo de `submitido_registered` sin nota en proyectos HR-driven.
- `app/modules/misvisitas.js` conserva el fix `plantilla lista` sin duplicado.
- V82 agrega documentacion interna: `app/docs/ADDENDUM-V82-PHASE-A.md`, `app/docs/RESUMEN-PARA-CLAUDE.md` y actualiza `app/docs/PENDIENTES-PROTOTIPO.md`.
- Sintaxis validada localmente: `node --check` sobre 61 archivos JS, `OK=61 FAIL=0`.

## Hallazgos pendientes antes de empalme/source lock

V82 todavia no coincide al 100% con el reporte de Claude. Quedan puntos menores pero relevantes:

1. `app/modules/cuestionario-shopper.js` todavia contiene en el modal externo la frase `marca la visita como cuestionario enviado`. Debe cambiarse a `marca el cuestionario como realizado/completado`.
2. `app/modules/revision-admin.js` muestra `Cuestionario: enviado` cuando `v.submit` existe. Debe decir `realizado` o `completado`.
3. `app/modules/misvisitas.js` mantiene comentario y aiBox que dicen que cada accion `sincroniza estado` o `sincroniza la hoja de ruta`. Debe decir que prepara/notifica y que HR sync queda pendiente backend.
4. `app/modules/postulaciones.js` conserva toasts con `HR sincronizada` al autorizar nueva fecha o editar asignacion. Debe cambiarse a `se reflejara en HR cuando el sync este activo (pendiente backend)`.
5. `app/modules/revision-admin.js` esta cerca del contrato, pero todavia usa `estado` como clave principal en lugar de exponer tambien `status`; no pasa `projectId` desde `p.id` al guardar, y no incluye `hrRowId` cuando exista en la visita. Esto no bloquea visualmente, pero debe corregirse para empalme backend limpio.
6. Documentacion de V82 existe dentro de `app/docs`, pero tambien debe quedar reflejada en los documentos raiz vivos del PR (`RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, `CAMBIOS-BACKEND.md`) para continuidad entre ChatGPT/backend y Claude.

## Comparativo V81 ZIP -> V82 ZIP

Archivos agregados:

- `app/docs/ADDENDUM-V82-PHASE-A.md`
- `app/docs/RESUMEN-PARA-CLAUDE.md`

Archivos eliminados:

- Ninguno.

Archivos modificados:

- `app/docs/PENDIENTES-PROTOTIPO.md`
- `app/modules/cuestionario-shopper.js`
- `app/modules/postulaciones.js`
- `app/modules/proyecto-wizard.js`
- `app/modules/revision-admin.js`

## Validaciones tecnicas ejecutadas

- Se descomprimio V82 localmente.
- Se comparo V82 contra V81 local.
- Se revisaron los archivos modificados.
- Se buscaron regresiones de enum, textos de cuestionario, textos de HR sync y duplicado `plantilla lista`.
- Se ejecuto `node --check` sobre 61 archivos JS de V82: resultado `OK=61 FAIL=0`.
- No se ejecuto la app en navegador.
- No se hizo deploy.
- No se escribio Firestore.
- No se activo Auth real.
- No se activo Make/Gemini/WhatsApp API real.

## Analisis por archivo

### `app/modules/proyecto-wizard.js`

Estado: casi correcto.

Validado:

- `qMode()` normaliza legacy `externa` y `link`.
- Selector usa `interna`, `externo_general`, `externo_visita`.
- Crea `cuestionario:{modo:qMode(...), visitLinkField:'questionnaireLink'}`.
- Restaura defaults Phase A:
  - `hrFuente`;
  - `revision`;
  - `submitido`;
  - `contactos`.
- URL general se oculta para `interna` y `externo_visita` usando `qMode()`.

Pendiente menor:

- En el resumen del paso 5 muestra `Cuestionario: ${st.cuestModo}`; si el estado trae legacy, podria mostrar legacy aunque guarde canonico. Recomendado mostrar `qMode(st.cuestModo)` o label amigable.

### `app/modules/cuestionario-shopper.js`

Estado: funcionalmente mucho mejor, pero con un texto pendiente.

Validado:

- Link por visita busca:
  - `questionnaireLink`;
  - `cuestionarioUrl`;
  - `linkCuestionario`;
  - `urlCuestionario`;
  - `hrQuestionnaireLink`.
- Externo sin link muestra aviso y no cae al formulario interno.
- Modal/toast interno usa `Cuestionario completado`.

Pendiente:

- Texto externo todavia dice `marca la visita como cuestionario enviado`. Cambiar a `marca el cuestionario como realizado/completado`.

### `app/modules/revision-admin.js`

Estado: avance fuerte, pendiente de ajuste fino contractual.

Validado:

- Estados canonicos:
  - `pending_review`;
  - `in_review`;
  - `needs_correction`;
  - `approved_for_submitido`;
  - `submitido_registered`;
  - `rejected`;
  - `hr_conflict`;
  - `cancelled`.
- Usa labels visibles en espanol.
- Usa `CX.data.revisiones` si existe; fallback `localStorage`.
- Guarda `tenantId`, `projectId`, `reviewId`, `visitId`, `assignmentId`, `shopperId`, `source`, `createdAt`, `updatedAt`, `auditTrail` de forma parcial.
- Bloquea `submitido_registered` sin nota cuando el proyecto es HR-driven.

Pendientes:

- Agregar alias/campo `status` junto con `estado` para compatibilidad de contrato.
- Pasar `projectId:p.id` al guardar, no depender de `CX.data.currentProjectId`.
- Pasar `hrRowId:v.hrRowId||v.rowId||v.extId||''` cuando exista.
- Cambiar etiqueta `Cuestionario: enviado` a `Cuestionario: realizado/completado`.
- Si HR-driven, la nota requerida deberia expresarse como referencia/nota HR, no solo cualquier nota generica.

### `app/modules/misvisitas.js`

Estado: duplicado corregido, textos HR sync aun pendientes.

Validado:

- No aparece `plantilla lista (plantilla lista)`.

Pendiente:

- Comentario superior dice `Cada accion sincroniza estado de visita y liquidacion`.
- aiBox dice que cada accion `sincroniza la hoja de ruta`.

Correccion esperada:

- Cambiar a: `prepara actualizacion`, `notifica al equipo`, `se reflejara en HR cuando el sync este activo (pendiente backend)`.

### `app/modules/postulaciones.js`

Estado: parcialmente corregido, aun tiene textos de HR real.

Pendiente:

- Toast al autorizar nueva fecha mantiene `HR sincronizada`.
- Toast al editar asignacion mantiene `HR sincronizada`.

Correccion esperada:

- Cambiar ambos a `se reflejara en HR cuando el sync este activo (pendiente backend)`.

### Documentacion interna V82

Validado:

- Existe `app/docs/ADDENDUM-V82-PHASE-A.md`.
- Existe `app/docs/RESUMEN-PARA-CLAUDE.md`.
- Se modifica `app/docs/PENDIENTES-PROTOTIPO.md`.

Pendiente:

- Mantener tambien actualizados los documentos raiz del PR para continuidad con ChatGPT/backend.

## Decision recomendada

V82 esta cerca, pero no lo marcaria todavia como source lock final mientras existan textos visibles que prometen HR sync y mientras `revision-admin.js` no pase `projectId/status/hrRowId` de forma limpia.

Recomendacion:

- Pedir a Claude una V83 ultra-corta solo con los ajustes listados abajo; o
- Autorizar a ChatGPT/Codex a aplicar estos parches menores directamente sobre la rama y luego crear source lock.

## Prompt corto para Claude

Claude: V82 esta casi listo, pero el ZIP no coincide al 100% con tu reporte. Entrega una V83 ultra-corta SOLO con estos ajustes, sin tocar nada mas:

1. `app/modules/cuestionario-shopper.js`
   - Cambia el texto externo `marca la visita como cuestionario enviado` por `marca el cuestionario como realizado/completado`.
   - Mantén los 5 campos de link y el aviso si falta link.

2. `app/modules/revision-admin.js`
   - Cambia `Cuestionario: enviado` por `Cuestionario: realizado/completado`.
   - Al guardar, agrega tambien `status=estado`.
   - Pasa `projectId:p.id` al `R.set(...)`.
   - Guarda `hrRowId:v.hrRowId||v.rowId||v.extId||''` cuando exista.
   - Para HR-driven, el bloqueo de `submitido_registered` debe pedir explicitamente nota/referencia HR.

3. `app/modules/misvisitas.js`
   - Cambia el comentario y el aiBox que dicen `sincroniza estado` / `sincroniza la hoja de ruta`.
   - Usar texto honesto: `prepara la actualizacion`, `notifica al equipo`, `se reflejara en HR cuando el sync este activo (pendiente backend)`.

4. `app/modules/postulaciones.js`
   - Cambia los dos toasts que todavia dicen `HR sincronizada` por `se reflejara en HR cuando el sync este activo (pendiente backend)`.

5. Documentacion
   - Actualiza `app/docs/ADDENDUM-V82-PHASE-A.md` o crea `ADDENDUM-V83-PHASE-A.md` con estos ajustes.
   - No toques `tools/migration`, `app/contracts`, reglas Firestore, Auth/Make/Gemini/WhatsApp/Storage reales, deploy ni datos reales.

## Estado seguro

- Sin empalme V82.
- Sin source lock V82.
- Sin cambios frontend aplicados desde esta auditoria.
- Sin deploy.
- Sin produccion.
- Sin Firestore writes reales.
- Sin Auth real.
- Sin Make/Gemini/WhatsApp API real.
- Sin runtime backend conectado.
