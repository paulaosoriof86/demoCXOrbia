# Cambios P0 DEV URL secret blocker TyA

Fecha: 2026-07-09

## Archivo agregado

- `app/docs/P0-DEV-URL-SECRET-BLOCKER-TYA-20260709.md`

## Objetivo

Identificar el bloqueo exacto que impide entregar URL DEV visible para validacion de PR #7 / V91.

## Resultado

El workflow requiere el secret `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`.

Sin ese secret, el deploy DEV root queda bloqueado antes de cualquier llamada a Firebase y no se verifica `https://cxorbia-backend-dev.web.app`.

## Impacto Phase A

El siguiente paso real es desbloquear el secret/deploy DEV, no pedir smoke ni GO DEV todavia.

## Estado seguro

Documentacion solamente. No cambia UI/core, no activa runtime, no importa, no escribe, no despliega, no produce y no usa datos sensibles.
