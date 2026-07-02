# CXOrbia - Adapter Firestore V59 normaliza seed V58

Fecha: 2026-07-01
Rama: `release/cxorbia-tya-rc-20260630`

## Archivos tocados/creados

- `app/core/backend-firebase.js`
- `firebase/client-write-tools/validate-cxorbia-v59-backend-adapter-seed-map.mjs`

## Cambio

Se ajustó el adapter Firestore para que el preview/backend pueda leer correctamente el seed piloto V58 desde Firestore DEV sin exigir cambios en módulos UI.

Normalizaciones agregadas:

- Proyecto: `projectId` -> `id`, `currencies` -> `currency`.
- Shopper: `shopperId` -> `id`, `name` -> `nombre`, primer país/ciudad para campos esperados por UI.
- Visita: `visitId` -> `id`, `status` -> `estado`, `country` -> `pais`, `availableFrom` -> `disponibleDesde`, `fee.amount` -> `honorario`, `fee.currency` -> `currency`.
- Aplicación/postulación: lectura de `applications` además de `postulations`, normalizada hacia `_posts` para mantener la interfaz existente de `CX.data.posts()`.

## Motivo

El seed V58 cargado y validado en Firestore DEV usa el modelo nuevo `applications`, mientras el adapter anterior solo leía `postulations`. Además, algunos campos del seed estaban en formato backend (`status`, `country`, `availableFrom`, `fee`) y los módulos UI esperan nombres históricos (`estado`, `pais`, `disponibleDesde`, `honorario`).

## Restricciones respetadas

- No se tocaron `/app/modules`.
- No se cambió la interfaz pública de `CX.data`.
- No se tocaron reglas Firestore.
- No se hizo deploy.
- No se tocó producción.
- No se tocó Orbit.
- No se usaron datos reales.
- No se versionaron secretos.

## Impacto frontend

El frontend conserva la misma interfaz y debería ver, desde preview backend DEV:

- `projects`: 1
- `_visitas`: 1
- `shoppers`: 1
- `_posts`: 1
- `currentProjectId`: `julio-pilot`

## Siguiente paso

Ejecutar preview backend V59 con servidor Node local, auth DEV local segura y validación visual del badge Firestore.
