# Empalme RC V75 sobre backend PR #7

Fecha: 2026-07-03
ZIP base visual: `Prototype development request CXOrbia V75.zip`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Empalmar V75 como nueva base visual incremental sin perder backend, scripts, documentos ni contratos ya creados en PR #7.

## Que se empalma desde V75

Empalme visual seguro:

- `app/index.html`
- `app/app.js`
- `app/manifest.webmanifest`
- `app/sw.js`
- `app/core/*.js`, excluyendo `app/core/backend-*.js` existentes en PR #7.
- `app/modules/*.js`
- `app/styles/*.css`
- `app/demo/index.html`

## Que NO se borra ni reemplaza

- `app/index-backend-dev.html`
- `app/core/backend-config-preview-dev.js`
- `app/core/backend-data-contract.js`
- `app/core/backend-hr-source-bridge.js`
- `tools/`
- Documentos backend del PR #7 bajo `app/docs/`.
- Documentos vivos raiz: `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`.

## Politica de docs durante empalme

No copiar destructivamente `app/docs/*` desde el ZIP porque esos documentos son de prototipo y pueden pisar documentos vivos de backend. Para V75 se documenta con addendums nuevos:

- `app/docs/AUDITORIA-RC-V75-CLOUD-FRONTEND-20260703.md`
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-RC-V75-20260703.md`
- `app/docs/EMPALME-RC-V75-BACKEND-20260703.md`

## Validaciones requeridas post-empalme

1. Rama correcta: `docs-tya-v6-v71-audit`.
2. Repo correcto: `paulaosoriof86/demoCXOrbia`.
3. `app/index-backend-dev.html` sigue existiendo.
4. `app/core/backend-data-contract.js` sigue existiendo.
5. `app/core/backend-hr-source-bridge.js` sigue existiendo.
6. `tools/` sigue existiendo.
7. `app/modules/saas-console.js` existe y `app/index.html` lo carga.
8. `app/modules/hr-source.js` contiene flujo de sourceRef opaco.
9. `app/modules/finanzas.js` no muestra `En vivo` en liquidaciones/movimientos.
10. `app/modules/automatizaciones.js` muestra pendiente backend/server-side.
11. `node --check` pasa en JS locales.
12. No hay deploy.
13. No hay importacion.
14. No hay escritura Firestore.

## Estado actual

Documentacion V75 preparada. El empalme de archivos visuales puede ejecutarse como bloque local seguro o commit selectivo, preservando backend.
