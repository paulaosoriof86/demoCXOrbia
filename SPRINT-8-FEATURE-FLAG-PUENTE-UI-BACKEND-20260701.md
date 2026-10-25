# SPRINT-8-FEATURE-FLAG-PUENTE-UI-BACKEND-20260701.md

Fecha: 2026-07-01

## Objetivo

Validar que el puente UI/backend puede pasar de dry-run a ruta controlada cuando el feature flag DEV esta activo, sin usar credenciales, sin escribir Firestore y sin conectar botones reales.

## Base validada

- Sprint 6 cargo el puente solo en preview backend DEV.
- Sprint 7 confirmo modo dry-run sin credenciales ni Firestore.

## Validacion Sprint 8

La prueba debe simular el adaptador operacional con un stub local y comprobar:

1. Sin feature flag, el puente devuelve dry-run.
2. Con feature flag DEV, el puente llama al adaptador operacional simulado.
3. La llamada usa entidad ficticia.
4. La llamada pasa por `requestAssignVisit`.
5. No se escribe Firestore.
6. No se piden credenciales.
7. No se conectan botones reales.
8. No se toca `app/modules`.

## Entidad ficticia Sprint 8

- Proyecto: `cinepolis-abril-26`.
- Visita: `sprint8-ui-bridge-visit-no-real-data`.
- Shopper: `sprint8-shopper-no-real-data`.
- Fecha: `2099-01-01`.

## Prohibiciones

- No publicar Hosting.
- No tocar produccion.
- No mutar Firestore.
- No pedir credenciales.
- No tocar `app/modules`.
- No conectar botones reales.
- No mezclar Orbit u Orbia.

## Criterio de cierre

Sprint 8 queda cerrado si el puente ejecuta la ruta feature flag hacia un adaptador stub local y confirma que la UI real sigue desconectada y sin mutaciones.

## Siguiente gate

Sprint 9 podra validar la misma ruta con Firebase DEV real y escrituras control/log, pero solo con autorizacion separada.