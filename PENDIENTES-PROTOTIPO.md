# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-22  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Avance F0

**134** hallazgos clasificados; **31** HOLD/P0 acumulados; CP093 y CP119 contenidos; **29 residuales**. Exhaustividad global **2/4**.

Cerrado:
- workflows HEAD/base 105/105;
- `.github/cxorbia-firebase-requests` 33/33;
- `backend/requests` 6/6;
- mutation routers HTTP del Cloud Run actual 3/3;
- `backend/runtime/hr-live-service` 8/8 por rol de ejecución;
- `tools/production` 2/2;
- `tools/dev` 1/1;
- `tools/backend` 4/4;
- scripts ejecutables top-level de `tools/empalme` 2/2;
- `tools/integration` 5/5 archivos estáticos.

Pendiente global:
- `allRequestsClassified=false`: terminar `backend/config`, execute markers, ledgers, aliases y autorizaciones dispersas;
- `allProviderWriteEntrypointsClassified=false`: terminar universos provider-capable de `tools/qa`, `tools/release` y cualquier entrypoint restante.

## Pendientes F1 acumulados

### CP124
`tools/empalme/tya-apply-post-v96-source-lock.sh`: source writer histórico con commit/push directo. **No ejecutar.** F1 inertizar/tombstonear.

### CP125
Request V105/V106 permanece históricamente `authorized=true`; materializador puede reemplazar runtime histórico. **No ejecutar.** F1 terminalizar + inertizar.

### CP127
`tools/reconciliation/tya-apply-existing-r11d-r14c-certification-r18b.mjs` puede sobrescribir por defecto el snapshot tracked `app/data/tya-hr-source-safe-periods.js` sin master plan/continuity lock/current authorization. **No ejecutar.** F1 inertizar/tombstonear.

### CP130
`tools/release/tya-create-new-empty-firebase-dev-r15.mjs` y `r15b.mjs` pueden crear proyecto + addFirebase con static confirm y caller credential, sin autoridad RC15 actual. **No ejecutar.** F1 inertizar/tombstonear.

### CP131
`tools/release/tya-r15g-dev-root-deploy.sh` conserva un camino manual-dispatch histórico que no valida el request y puede reconstruir source + desplegar Hosting. **No ejecutar.** F1 inertizar/tombstonear.

## Requisitos F2 identificados

F2 debe asegurar autoridad canónica única sobre:
- credencial + execute flag del Rules API primitive;
- credencial/preflight del Hosting REST primitive;
- invocación directa de client Auth/Firestore apply/rollback;
- provenance/authority del atomic source apply runner.

Los primitives no equivalen por sí solos a autorización vigente.

## Requests ya comprobados en este tramo

Familias C6 Auth activation/Auth plan, principal uniqueness, direct runner deploy, IAM identity/reviewer, client membership-only, profile-full Firestore y Hosting DEV muestran estados terminales, consumidos o fail-closed en los requests inspeccionados.

Esto es progreso real, pero no agota aún `backend/config`.

## Producto actual

User-admin sigue clasificado como write productivo intencional y guardado por Firebase ID token + tenant exacto + `super`. Legal permanece CP119-contained. G2-B synthetic permanece deshabilitado/bloqueado.

## Claude/prototipo

Sin tarea frontend nueva. No cambiar UI ni solicitar candidata por estos hallazgos de control-plane.

## Academia

Sin cambio funcional en este tramo.

## G2-B

Sigue terminal `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; no retry/replay. F3 debe revalidar provider contra `00011-f2f`.

## Regla

F0 continúa read-only. No iniciar F1 hasta 4/4 exhaustividad. No tocar G2-B.

## Siguiente exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE` sobre `backend/config` restante + execute markers/aliases/ledgers y provider/tool entrypoints restantes de `tools/qa`/`tools/release`.
