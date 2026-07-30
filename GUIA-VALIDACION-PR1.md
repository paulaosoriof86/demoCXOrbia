# GUIA-VALIDACION-PR1.md

## Objetivo

Preparar la revisión de PR #1 antes de actualizarlo con `main`.

## Contexto

- PR #1: preparación backend DEV y migración T&A.
- Rama: `feat/firebase-backend-dev-config-20260627`.
- Base: `main`.
- Estado: draft.

## Motivo de revisión

La rama está detrás de `main` por 1 commit. Ese commit incluye cambios de prototipo frontend en core, index, estilos y módulos.

## Archivos principales a revisar

```text
app/index.html
app/core/config.js
app/core/router.js
app/core/topbar.js
app/modules/academia.js
app/modules/correo.js
app/modules/marca.js
app/modules/crm.js
app/modules/configuracion.js
app/modules/importador.js
```

## Preguntas de validación

1. ¿El `main` actual es la base aprobada del prototipo?
2. ¿Hay conflicto con el punto de conexión backend en `app/index.html`?
3. ¿Conviene sincronizar PR #1 ahora o esperar revisión de frontend?
4. ¿Qué archivos deben revisarse después de sincronizar?

## Punto backend que debe conservarse

```html
<script src="core/backend-config.js"></script>
<script src="core/backend-firebase.js"></script>
```

## Resultado esperado

- Dictamen de base aprobada o pendiente.
- Riesgos de sincronización.
- Pasos seguros para actualizar PR #1.
- Pendientes de frontend documentados aparte.
