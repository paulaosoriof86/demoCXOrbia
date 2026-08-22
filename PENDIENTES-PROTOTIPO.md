# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-22  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Avance F0

**125** hallazgos clasificados; **28** HOLD/P0 acumulados; CP093 y CP119 contenidos; **26 residuales**. Exhaustividad global **2/4**.

Cerrado:
- workflows HEAD/base 105/105;
- `.github/cxorbia-firebase-requests` 33/33;
- `backend/requests` 6/6;
- mutation routers HTTP del Cloud Run actual 3/3;
- `backend/runtime/hr-live-service` 8/8 por rol de ejecución;
- `tools/production` 2/2;
- `tools/dev` 1/1;
- `tools/backend` 4/4;
- scripts ejecutables top-level de `tools/empalme` 2/2 clasificados.

Pendiente global:
- `allRequestsClassified=false`: terminar `backend/config`, execute markers, ledgers, aliases y autorizaciones dispersas;
- `allProviderWriteEntrypointsClassified=false`: tooling/provider entrypoints restantes fuera de los subdominios ya cerrados.

## Nuevos pendientes F1

### CP124
`tools/empalme/tya-apply-post-v96-source-lock.sh` es un source writer histórico ungated: puede reescribir `app/core`, `app/modules` y otros runtime files, crear commit y ejecutar push directo a la rama viva. No usa master plan/continuity lock/current authorization. **No ejecutar.** F1: inertizar/tombstonear preservando evidencia.

### CP125
`backend/config/phase-a-v105-v106-empalme-request.source-safe.json` conserva `authorized=true` sin consumed/expiry; `tools/empalme/tya-apply-v105-internal-v106-runtime.sh` puede usarlo para materializar 70 rutas runtime + delta histórico. **No ejecutar.** F1: terminalizar request e inertizar autoridad del materializador.

## Producto actual

El user-admin actual queda clasificado como write productivo intencional con Firebase ID token, tenant exacto y `super`; no es un P0 de control-plane. Legal está CP119-contained y G2-B synthetic permanece deshabilitado/bloqueado. El servidor rechaza otros non-GET con 405.

## G2-B

Sigue terminal `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; no retry/replay. Readiness provider anterior stale tras CP119; F3 debe revalidar contra `00011-f2f`.

## Regla

F0 continúa read-only. No iniciar F1 hasta 4/4 exhaustividad. No tocar G2-B.

## Siguiente exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE` sobre `backend/config` restante, execute markers/aliases/ledgers y provider/tool entrypoints restantes.
