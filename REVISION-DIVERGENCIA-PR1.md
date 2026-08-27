# REVISION-DIVERGENCIA-PR1.md

## Motivo

PR #1 está detrás de `main` por 1 commit. Se revisó la diferencia antes de sincronizar.

## Hallazgo

El commit pendiente en `main` contiene cambios amplios del prototipo frontend, incluyendo core, index, estilos y varios módulos.

Archivos observados:

```text
app/app.js
app/core/config.js
app/core/router.js
app/core/topbar.js
app/index.html
app/styles/layout.css
app/modules/academia.js
app/modules/aprendizaje.js
app/modules/cliente.js
app/modules/comercial.js
app/modules/configuracion.js
app/modules/correo.js
app/modules/crm.js
app/modules/documentos.js
app/modules/finanzas.js
app/modules/importador.js
app/modules/marca.js
app/modules/misvisitas.js
app/modules/operacion-extra.js
app/modules/postulaciones.js
app/modules/visitas.js
```

## Decisión

No sincronizar automáticamente PR #1 con `main` todavía.

## Razón

PR #1 es de backend, infraestructura y migración. El cambio pendiente en `main` es de evolución del prototipo frontend. Mezclarlos ahora dificultaría auditar la frontera entre backend y prototipo.

## Próximo paso

Antes de sincronizar:

1. Confirmar si el commit pendiente de `main` es la nueva base aprobada del prototipo.
2. Revisar especialmente `app/index.html` porque PR #1 agregó ahí el punto único de conexión backend.
3. Mantener `CX.BACKEND.enabled = false`.
4. Mantener PR #1 como draft.

## Estado

Sin merge, sin deploy y sin datos reales.
