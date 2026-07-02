# RESUMEN PARA CLAUDE - Sprint 3 Backend CXOrbia

Fecha: 2026-07-01
Rama vigente backend: release/cxorbia-tya-rc-20260630

## Que hizo ChatGPT/backend

Sprint 2 queda cerrado: el adapter Firestore ya resuelve el proyecto activo antes del primer render y evita el titileo que ocurria al filtrar despues del render.

Sprint 3 queda preparado en backend:

- Acciones operativas controladas.
- Registro de operationActions.
- Registro de operationEvents.
- Registro de entityAuditTrail.
- Registro de operationActionLocks.
- Registro de responsibilityLog por proyecto.
- Smoke DEV preparado para validar logs sin mutar entidades finales.

## Archivos backend protegidos tocados por ChatGPT/backend

- app/core/backend-operational-actions.js
- firestore.rules
- firebase/client-write-tools/smoke-cxorbia-sprint3-operation-actions-dev.mjs
- SPRINT-2-CIERRE-DOCUMENTAL-20260701.md
- SPRINT-3-ACCIONES-OPERATIVAS-CONTROLADAS-20260701.md
- CAMBIOS-BACKEND-SPRINT3-20260701.md

## Que NO debe tocar Claude

Claude no debe modificar ni sobrescribir:

- app/index-backend-dev.html
- app/core/backend*.js
- firestore.rules
- firebase/seeds/*
- firebase/client-write-tools/*
- smoke tests
- validadores
- firebase.json
- .firebaserc
- documentacion backend protegida

## Pendiente que si corresponde a Claude/prototipo

Corregir la separacion visual y funcional entre:

- Proyecto
- Periodo
- Pais
- Historico

Proyecto no es mes. Mes/periodo/ciclo debe estar en un control separado. El historico debe poder consultarse, no mezclarse con la operacion activa.

## Estado honesto de backend Sprint 3

Preparado en GitHub, pero no publicado ni validado contra Firestore DEV despues de estas reglas Sprint 3.

Antes de conectar botones reales del prototipo a acciones de backend se requiere:

1. Autorizacion explicita de Paula para publicar solo reglas Firestore DEV.
2. Ejecutar smoke Sprint 3.
3. Confirmar que solo se escriben logs/control.
4. Documentar resultado.

## Restricciones respetadas

- No deploy.
- No Hosting.
- No produccion.
- No datos reales nuevos.
- No app/modules.
- No Orbit.
- No Orbia.
