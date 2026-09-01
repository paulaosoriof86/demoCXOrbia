# Empalme RC V70 sobre backend

Fecha: 2026-07-03
Estado: paquete incremental preparado para aplicar en rama `docs-tya-v6-v71-audit`.

## Regla aplicada

Un ZIP nuevo de Claude no reinicia el proyecto. Se procesa como release candidate incremental, se audita delta y se empalma sobre la rama backend estable.

## Archivos del prototipo V70 a empalmar

- `app/core/config.js`
- `app/index.html`
- `app/modules/crm.js`
- `app/modules/finanzas.js`
- `app/modules/hr-source.js`

## Ajuste backend de preview

- `app/index-backend-dev.html` se alinea con el index V70 y conserva carga Firebase/backend DEV.
- Se carga `core/backend-hr-source-bridge.js`.

## Seguridad

- Sin Firestore writes.
- Sin importacion de datos.
- Sin deploy.
- Sin reglas Firebase tocadas.
- Sin credenciales.

## Validaciones esperadas

- `node --check` OK en JS tocados.
- `git status` muestra solo delta esperado y docs.
- Commit local y push a rama PR si Git esta autenticado.
