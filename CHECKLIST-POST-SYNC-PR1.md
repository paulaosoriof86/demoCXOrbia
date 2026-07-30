# CHECKLIST-POST-SYNC-PR1.md

## Objetivo

Checklist obligatorio para revisar PR #1 después de sincronizarlo con `main`.

Este archivo no ejecuta sincronización ni merge.

## Validación de archivos backend

```text
[ ] app/core/backend-config.js existe
[ ] app/core/backend-firebase.js existe
[ ] firestore.rules existe
[ ] firestore.indexes.json existe
[ ] storage.rules existe
[ ] firebase.json existe
[ ] .firebaserc existe
```

## Validación de `app/index.html`

Confirmar que se carguen estos scripts:

```html
<script src="core/backend-config.js"></script>
<script src="core/backend-firebase.js"></script>
```

Ubicación esperada:

```text
después de core/notif.js
antes de core/topbar.js
```

## Validación de seguridad

```text
[ ] CX.BACKEND.enabled sigue false
[ ] no se conectó Firebase desde la app
[ ] no se escribió seed
[ ] no se cargaron datos reales
[ ] no se crearon usuarios reales
[ ] storage.rules sigue cerrado
[ ] no hubo deploy
[ ] producción no se tocó
```

## Validación de reglas

```text
[ ] firestore.rules conserva deny by default
[ ] roles dependen de claims controlados
[ ] cliente no lee finance
[ ] cliente no lee postulations
[ ] ops no lee finance
[ ] shopper no lee otro shopper
[ ] shopper puede leer visita disponible solo si el proyecto está asignado
[ ] auditLogs no permite update/delete
```

## Validación de frontend

```text
[ ] no se parchearon módulos desde el PR backend
[ ] módulos nuevos de main siguen cargando si son parte de la base aprobada
[ ] no se removió el boot app.js
[ ] no se duplicó ningún script backend
```

## Validación documental

```text
[ ] CAMBIOS-BACKEND.md actualizado
[ ] RESUMEN-PARA-CLAUDE.md actualizado
[ ] PENDIENTES-PROTOTIPO.md actualizado
[ ] CHECKLIST-PR1-VALIDACION.md sigue vigente
[ ] PLAN-SINCRONIZACION-MAIN-PR1.md sigue vigente
```

## Cierre

Si algún punto falla, no hacer merge y documentar el hallazgo en `PENDIENTES-PROTOTIPO.md` o `RESUMEN-PARA-CLAUDE.md`, según corresponda.
