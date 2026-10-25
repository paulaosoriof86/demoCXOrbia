# Auditoria frontend candidate V80 Claude

Fecha: 2026-07-04

## Alcance

Se audito el ZIP `Prototype development request CXOrbia V80.zip` entregado por Paula, comparandolo contra el candidato V79 disponible localmente y contra los fixes/documentos recientes del repo `docs-tya-v6-v71-audit`.

Esta auditoria no empalma V80, no crea source lock V80 y no autoriza backend/runtime. V80 queda como candidato de Claude para correccion, no como baseline aceptada.

## Resultado ejecutivo

V80 trae avances utiles, especialmente:

- agrega modulo `app/modules/revision-admin.js`;
- carga el modulo en `app/index.html`;
- agrega boton de revision desde el modal de visita en `app/modules/dashboard.js`;
- mejora algunos textos honestos de automatizaciones;
- conserva/restaura `nvBanner`;
- sube SaaS Console a version visual V79;
- corrige un mensaje de agenda para no prometer HR sincronizada.

Pero V80 todavia NO debe empalmarse completo al repo porque trae regresiones y pendientes P0/P1:

1. `app/modules/proyecto-wizard.js` no incluye el fix P0 ya aplicado en repo para modos canonicos de cuestionario. Sigue usando `externa` y `link` en el selector y al guardar.
2. `app/modules/cuestionario-shopper.js` retrocede parte del fix P0: no busca todos los campos de link por visita documentados (`questionnaireLink`, `urlCuestionario`, `hrQuestionnaireLink`) y vuelve a usar texto de cuestionario `enviado`.
3. `app/modules/revision-admin.js` existe, pero es una revision aislada en `localStorage`, no integrada a `CX.data`, visitas, liquidaciones, submitido ni HR sync gates.
4. Los estados internos de revision en V80 estan en espanol (`pendiente_revision`, `en_revision`, etc.) y no mapean a los estados canonicos documentados (`pending_review`, `in_review`, etc.). Puede usarse como label visible, pero no como estado interno definitivo.
5. Reaparece el texto duplicado `plantilla lista (plantilla lista)` en `app/modules/misvisitas.js`.
6. Siguen textos que aparentan integraciones reales en modulos existentes (`En vivo`, `HR sincronizada`, `Programado via Make`, `Respuesta enviada via Make`, etc.). Algunos son preexistentes, pero siguen pendientes para Claude.
7. V80 no actualizo documentos `app/docs`, `RESUMEN-PARA-CLAUDE.md` ni `PENDIENTES-PROTOTIPO.md` dentro del ZIP.

## Comparativo forense V79 ZIP -> V80 ZIP

Archivos agregados:

- `app/modules/revision-admin.js`

Archivos eliminados:

- Ninguno.

Archivos modificados:

- `app/app.js`
- `app/core/automations.js`
- `app/index.html`
- `app/modules/cuestionario-shopper.js`
- `app/modules/dashboard.js`
- `app/modules/misvisitas.js`
- `app/modules/novedades.js`
- `app/modules/saas-console.js`

## Validaciones tecnicas ejecutadas

- Se descomprimio V80 localmente.
- Se comparo contra V79 local.
- Se revisaron scripts cargados en `app/index.html`.
- Se ejecuto `node --check` sobre 61 archivos JS de V80: resultado `OK=61 FAIL=0`.
- No se detectaron modulos cargados faltantes, aparte de scripts CDN externos esperados.
- No se ejecuto la aplicacion en navegador.
- No se hizo deploy.
- No se escribio Firestore.
- No se activo runtime.

## Analisis por archivo

### `app/index.html`

Cambio:

- Agrega `<script src="modules/revision-admin.js"></script>` antes de `cuestionario-shopper.js`.

Evaluacion:

- Correcto a nivel de carga.
- El archivo existe en V80.
- No rompe sintaxis.

Estado:

- Aceptable si el modulo se corrige antes de empalme.

### `app/modules/revision-admin.js`

Cambio:

- Nuevo modulo de revision admin.
- Crea `CX.revisionStore` y `CX.revisionAdmin`.
- Guarda revision en localStorage con key `cx_revision`.
- Muestra modal con etapas separadas: cuestionario, revision, submitido, liquidacion.

Avance real:

- Responde parcialmente al pendiente de revision admin funcional.
- La UI ya comunica que cuestionario, revision, submitido y liquidacion son etapas separadas.
- Muestra bitacora de revision.
- Advierte que HR sync queda pendiente backend.

Problemas:

- No usa `tenantId`, `projectId`, `reviewId`, `assignmentId`, `shopperId` ni `hrRowId` como contrato backend.
- No usa `CX.data` ni interfaz preparada para backend.
- No cambia `v.estado` ni llama `data.setVisitState()` al aprobar/submitir.
- No afecta liquidacion real ni estado operativo visible fuera del modal.
- No manda conflictos a flujo de revision real.
- Usa estados internos en espanol, no canonicos.
- Permite marcar `submitido` desde UI sin asegurar fuente HR/configuracion del proyecto.

Correccion requerida para Claude:

- Mantener labels visibles en espanol si quiere, pero mapear internamente a canonicos:
  - `pending_review`
  - `in_review`
  - `needs_correction`
  - `approved_for_submitido`
  - `submitido_registered`
  - `rejected`
  - `hr_conflict`
  - `cancelled`
- No tratar `submitido` como accion libre si el proyecto es HR-driven.
- La accion de submitido debe quedar como `pendiente HR/backend` o `admin_confirmed_hr` con nota, no como confirmacion productiva.
- Integrar visualmente el estado de revision en dashboard/mis visitas/liquidaciones sin prometer backend real.

### `app/modules/dashboard.js`

Cambio:

- Agrega boton `🔎 Revisar` para visitas con estado `realizada`, `cuestionario` o `liquidada`.
- Abre `CX.revisionAdmin(data,p,v,ui)`.

Avance:

- Buen punto de entrada para revision admin.

Pendiente:

- Solo existe dentro del modal de visita; no hay tablero consolidado de revision.
- El boton no aparece para otros estados que podrian requerir revision por conflicto.
- Depende de que `revision-admin.js` se corrija.

### `app/modules/cuestionario-shopper.js`

Cambio:

- Reconoce `externo_general`, `externo_visita` y legacy `externa`, `link`.
- Evita caer al formulario interno si el modo es externo.
- Cambia toast hacia revision/validacion.

Avance:

- Intencion correcta.

Regresion contra el fix P0 ya aplicado en repo:

- V80 no conserva todos los campos de link por visita documentados. Debe buscar:
  - `questionnaireLink`
  - `cuestionarioUrl`
  - `linkCuestionario`
  - `urlCuestionario`
  - `hrQuestionnaireLink`
- V80 solo busca `cuestionarioUrl` y `linkCuestionario`, con fallback a `cfg.url`.
- V80 vuelve a usar textos `cuestionario enviado` / `Marcar cuestionario como enviado`; debe decir `realizado` para no mezclar con submitido.
- Debe conservar el fix actual del repo, no reemplazarlo por esta version.

Correccion requerida para Claude:

- Usar como base el archivo actual del repo, no el de V80 para este modulo.
- Si agrega mejoras, incorporarlas encima del fix P0 documentado.

### `app/modules/proyecto-wizard.js`

Cambio:

- En V80 no cambio contra V79 ZIP.

Problema critico:

- Contra el repo actual, V80 queda atrasado. El repo ya tiene el P0 cerrado con:
  - `interna`
  - `externo_general`
  - `externo_visita`
  - normalizacion `qMode()`
  - `visitLinkField:'questionnaireLink'`
  - defaults de `hrFuente`, `revision`, `submitido` y `contactos`.
- V80 sigue usando en el selector `externa` y `link` y guarda `cuestionario.modo` con esos valores legacy.

Correccion requerida para Claude:

- No usar el `proyecto-wizard.js` de V80 tal como viene.
- Debe partir del archivo actual del repo y ampliar el wizard Phase A sin revertir el enum.
- Debe exponer configuracion Phase A completa segun `app/docs/WIZARD-PHASE-A-COMPLETE-CONTRACT-TYA-20260704.md`.

### `app/core/automations.js`

Cambio:

- Actualiza catalogo de canales hacia estados mas honestos:
  - WhatsApp Web plantilla lista;
  - WhatsApp API pendiente backend;
  - Make webhook pendiente backend;
  - correo/Sheets pendiente backend;
  - apagado.
- `fire()` ya no procesa canal `off`.
- Logs externos quedan como preparados/pendientes backend.

Avance:

- Mejora honesta importante.

Pendiente:

- El comentario superior todavia dice que en produccion hace POST a Make.
- `CX.ai.ask()` sigue haciendo fetch real desde frontend con API key en localStorage si se configura. Esto es pendiente preexistente y no debe activarse para produccion.
- Defaults todavia usan canales legacy `whatsapp` y `sheet`, que no estan en el nuevo `CANALES`; deben migrarse o mapearse a `whatsapp_web`/`make`/`off` para evitar inconsistencias.

### `app/modules/novedades.js`

Cambio:

- Restaura/agrega `nvBanner` y campo version opcional.

Evaluacion:

- Correcto. No revertir.

### `app/modules/saas-console.js`

Cambio:

- Actualiza tenants seed, KPI version y nuevos tenants a `V79`.
- Agrega release V79.
- Mantiene V72 solo como release historico.

Evaluacion:

- Correcto si se decide que V80 pasa a trabajar sobre version visual V79.
- Lo importante es que ya no crea tenants nuevos con V72.

### `app/modules/misvisitas.js`

Cambio positivo:

- Cambia toast de agenda para no prometer `HR y liquidacion sincronizadas`; ahora dice equipo notificado in-app y liquidacion actualizada.

Regresion:

- Reaparece texto duplicado: `plantilla lista (plantilla lista)`.
- Sigue existiendo texto que promete sincronizacion de HR/hoja en el `aiBox`: `sincroniza la hoja de ruta`.

Correccion requerida:

- Volver a `plantilla lista`.
- Cambiar textos a estado honesto: `pendiente backend`, `preparado`, `se reflejara cuando HR sync este activo`, etc.

## Pendientes preexistentes que V80 no cierra

- Wizard Phase A completo.
- Submitido configurable por proyecto, aunque V80 abre una primera UI de revision.
- Liquidacion desacoplada de cuestionario realizado.
- Estados honestos globales en Dashboard, Visitas, Postulaciones, Marketing, Soporte y algunos manuales.
- Documentacion del cambio por parte de Claude.
- Mapper de estados visibles a estados canonicos backend.

## Decision recomendada

No empalmar V80 completo todavia.

Enviar a Claude correccion puntual sobre V80, con estas prioridades:

1. Conservar `revision-admin.js`, pero corregirlo para usar estados canonicos o al menos mapear labels visibles a canonicos.
2. Restaurar el `proyecto-wizard.js` actual del repo y ampliar desde ahi, no desde el V80 ZIP.
3. Restaurar el `cuestionario-shopper.js` actual del repo y aplicar solo mejoras no regresivas.
4. Quitar `plantilla lista (plantilla lista)`.
5. Cambiar textos que prometen HR/Make/sync reales.
6. Actualizar documentacion del prototipo.

## Prompt corto para Claude

Claude: V80 trae un avance util con `revision-admin.js`, pero NO debes empalmarlo completo. Corrige sobre la rama actual del repo, no sobre el ZIP en bruto. Conserva los fixes ya aplicados en repo:

- `proyecto-wizard.js` debe seguir usando `interna`, `externo_general`, `externo_visita`, con `qMode()` y `visitLinkField:'questionnaireLink'`.
- `cuestionario-shopper.js` debe buscar links en `questionnaireLink`, `cuestionarioUrl`, `linkCuestionario`, `urlCuestionario`, `hrQuestionnaireLink` y debe decir `cuestionario realizado`, no `enviado`.
- No reintroduzcas `plantilla lista (plantilla lista)`.
- `revision-admin.js` debe usar estados canonicos o mapear labels visibles a canonicos: `pending_review`, `in_review`, `needs_correction`, `approved_for_submitido`, `submitido_registered`, `rejected`, `hr_conflict`, `cancelled`.
- No marques submitido como real si el proyecto es HR-driven; debe quedar pendiente HR/backend o admin-confirmed-HR con nota.
- No muestres HR/Make/Gemini/WhatsApp API como ejecutados si no hay backend autorizado.
- Actualiza `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` y un addendum `app/docs` con archivos tocados, motivo, impacto, riesgo y validacion.

## Estado seguro

- Sin empalme de V80.
- Sin source lock V80.
- Sin cambios frontend aplicados desde esta auditoria.
- Sin deploy.
- Sin produccion.
- Sin Firestore writes reales.
- Sin Auth real.
- Sin Make/Gemini/WhatsApp API real.
- Sin runtime backend conectado.
