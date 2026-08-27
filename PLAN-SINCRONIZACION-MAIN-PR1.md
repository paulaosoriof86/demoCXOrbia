# PLAN-SINCRONIZACION-MAIN-PR1.md

## Objetivo

Definir cómo sincronizar PR #1 con `main` sin mezclar a ciegas backend y frontend.

Este documento no ejecuta la sincronización.

## Estado actual

```text
PR #1: draft
Rama PR: feat/firebase-backend-dev-config-20260627
Base: main
Estado: branch diverged
main: 1 commit adelante
PR #1: múltiples commits adelante
```

## Motivo del bloqueo

El commit pendiente en `main` no es backend. Trae cambios amplios de prototipo frontend, incluyendo core, estilos, index y módulos.

Por eso no se debe hacer sync automático hasta confirmar que `main` es la base aprobada.

## Regla para sincronizar

Si Paula confirma que `main` es la base aprobada, la sincronización debe conservar este punto backend en `app/index.html`:

```html
<script src="core/backend-config.js"></script>
<script src="core/backend-firebase.js"></script>
```

Ubicación requerida:

```text
después de core/notif.js
antes de core/topbar.js
```

## Archivos que no deben perderse

```text
app/core/backend-config.js
app/core/backend-firebase.js
firestore.rules
firestore.indexes.json
storage.rules
firebase.json
.firebaserc
firebase/seed-tya-piloto.json
firebase/README.md
```

## Documentación que debe mantenerse

```text
CAMBIOS-BACKEND.md
RESUMEN-PARA-CLAUDE.md
PENDIENTES-PROTOTIPO.md
ARQUITECTURA-TENANTS-TYA.md
AUTH-DEV-TYA.md
MATRIZ-ROLES-FIRESTORE.md
CASOS-PRUEBA-FIRESTORE.md
VALIDACION-ESTATICA-REGLAS-ADAPTER.md
MIGRACION-BASE-BUENA-TYA.md
CHECKLIST-PR1-VALIDACION.md
DICTAMEN-MAIN-BASE-PR1.md
RESULTADO-DRY-RUN-SEED-TYA.md
```

## Estrategia recomendada

1. Confirmar visualmente que `main` es la base correcta del prototipo.
2. Revisar `app/index.html` de `main`.
3. Aplicar los archivos backend nuevos encima de `main`.
4. Resolver solo el conflicto de `app/index.html` si aparece.
5. No tocar módulos del frontend desde el PR backend.
6. Verificar que `CX.BACKEND.enabled` siga en `false`.
7. Verificar que no haya datos reales.
8. Mantener PR #1 como draft.

## Checklist después de sincronizar

```text
[ ] app/index.html conserva scripts backend
[ ] app/core/backend-config.js existe
[ ] app/core/backend-firebase.js existe
[ ] CX.BACKEND.enabled sigue false
[ ] firestore.rules conserva regla de visitas disponibles para shopper
[ ] storage.rules sigue cerrado
[ ] firebase/seed-tya-piloto.json sigue ficticio
[ ] no se modificó /app/modules desde backend
[ ] PR #1 sigue draft
[ ] no deploy
[ ] no producción
[ ] no datos reales
```

## Criterio para avanzar después de sync

Solo después de sincronizar y revisar se puede pasar a:

```text
validación real de reglas en DEV / Rules Playground
seed ficticio con escritura controlada
activación controlada del adapter
```

Cada uno requiere autorización separada.
