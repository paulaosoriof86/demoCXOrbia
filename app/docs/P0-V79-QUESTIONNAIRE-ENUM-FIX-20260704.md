# P0 V79 questionnaire enum fix

Fecha: 2026-07-04

## Objetivo

Cerrar el P0 de V79 sobre enum inconsistente de cuestionario entre creacion, edicion y ejecucion.

## Archivos modificados

- `app/modules/proyecto-wizard.js`
- `app/modules/cuestionario-shopper.js`

## Problema original

V79 introdujo en edicion de proyecto los modos:

- `interna`;
- `externo_general`;
- `externo_visita`.

Pero el wizard de creacion todavia usaba:

- `interna`;
- `externa`;
- `link`.

Y el shopper questionnaire reconocia externo solo con:

- `externa`;
- `link`.

Riesgo: un proyecto configurado como externo podia caer en formulario interno.

## Correccion aplicada

### `app/modules/proyecto-wizard.js`

- Se agrego normalizacion `qMode()`.
- Se actualizo el selector de modo de cuestionario para crear proyectos con:
  - `interna`;
  - `externo_general`;
  - `externo_visita`.
- Se conserva compatibilidad legacy:
  - `externa` => `externo_general`;
  - `link` => `externo_visita`.
- Al crear proyecto se guarda `cuestionario.modo` con el enum V79.
- Si el modo es `externo_visita`, se declara `visitLinkField:'questionnaireLink'`.
- Se agregan defaults Phase A basicos para `hrFuente`, `revision`, `submitido` y `contactos` al crear proyecto.

### `app/modules/cuestionario-shopper.js`

- Reconoce `externo_general` y `externo_visita`.
- Mantiene compatibilidad legacy con `externa` y `link`.
- Para `externo_general`, abre `cfg.url`.
- Para `externo_visita`, busca link en la visita:
  - `questionnaireLink`;
  - `cuestionarioUrl`;
  - `linkCuestionario`;
  - `urlCuestionario`;
  - `hrQuestionnaireLink`.
- Si falta URL, no cae en cuestionario interno; muestra aviso de falta de link.
- Al marcar cuestionario realizado externo, actualiza estado con `data.setVisitState()` si esta disponible.
- Cambia texto a cuestionario realizado para no tratarlo como submitido.

## Impacto

- El flujo de cuestionario queda alineado entre creacion, edicion y ejecucion.
- Los modos externos ya no caen por error en formulario interno.
- El proyecto nuevo queda mas cerca de Phase A al nacer con defaults de revision, submitido y contactos.

## Pendientes vivos despues de este fix

- Revision aun no funcional completa como accion admin.
- Submitido aun requiere mejor control por proyecto y HR.
- Wizard todavia no expone toda la configuracion Phase A, aunque ya crea defaults basicos.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin Firestore writes reales.
- Sin runtime backend conectado.
- Sin Make/Gemini/WhatsApp API real.
