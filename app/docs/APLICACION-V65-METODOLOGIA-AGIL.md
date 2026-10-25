# APLICACION-V65-METODOLOGIA-AGIL.md

Fecha: 2026-07-02

## Objetivo

Aplicar V65 como prototipo visual reciente sin afectar backend avanzado.

## Regla

No extraer el ZIP de forma destructiva sobre el repo.
Debe aplicarse por overlay controlado y con validacion de archivos protegidos.

## Backend protegido

No modificar:
- app/index-backend-dev.html
- app/core/backend-config.js
- app/core/backend-config-preview-dev.js
- app/core/backend-firebase.js
- app/core/backend-operational-actions.js
- app/core/backend-ui-action-bridge.js
- app/core/backend-active-project.js
- app/core/backend-ai.js
- app/core/backend-resources.js
- app/core/backend-cxdata-read-guard.js
- app/core/backend-finance-benefits.js
- app/core/backend-cxdata-finance-read.js
- app/core/backend-bulletins.js
- app/core/backend-automations.js
- app/core/backend-preview-status.js
- firestore.rules
- firebase.json
- .firebaserc
- firebase/seeds/*
- firebase/client-write-tools/*

## Validaciones antes de commit

- UTF-8 sin BOM.
- Sin mojibake.
- node --check en JS.
- app/index.html con meta charset UTF-8.
- app/index.html sin modules/rutas.js.
- app/index.html sin modules/aprendizaje.js.
- app/index.html sin backend protegido.
- app/index-backend-dev.html intacto.
- app/core/backend*.js intactos.
- app/modules puede cambiar porque es prototipo.
- No Hosting.
- No produccion.
- No Orbit.
- No Orbia.

## Sprint 9

Sprint 9 no esta cerrado. No se debe mezclar su diagnostico con la aplicacion visual V65.
