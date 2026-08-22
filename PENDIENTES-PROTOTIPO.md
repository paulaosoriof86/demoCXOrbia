# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-22  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Avance F0

**138** hallazgos clasificados; **31** HOLD/P0 acumulados; CP093 y CP119 contenidos; **29 residuales**. Exhaustividad **2/4**.

Cerrado: workflows 105/105; `.github/cxorbia-firebase-requests` 33/33; `backend/requests` 6/6; mutation routers 3/3; `hr-live-service` 8/8 por rol; `tools/production` 2/2; `tools/dev` 1/1; `tools/backend` 4/4; top-level `tools/empalme` 2/2; `tools/integration` 5/5 estáticos.

Pendiente global:
- `allRequestsClassified=false`: resolver CP117 y agotar `backend/config`, execute markers, ledgers, aliases y autorizaciones dispersas;
- `allProviderWriteEntrypointsClassified=false`: agotar `tools/qa`, `tools/release` y cualquier entrypoint restante.

## F1 — HOLDs recientes ya acumulados

- CP124: `tya-apply-post-v96-source-lock.sh`, source writer + commit/push histórico. No ejecutar.
- CP125: request V105/V106 históricamente autorizado para reemplazo runtime. No ejecutar.
- CP127: materializador R18B puede sobrescribir snapshot tracked. No ejecutar.
- CP130: creadores Firebase R15/R15B conservan project-create/addFirebase histórico. No ejecutar.
- CP131: runner R15G conserva source rebuild + Hosting deploy histórico. No ejecutar.
- CP011: temp operator Corte4 revalidado en Tramo 13; request histórico sigue `enabled=true` y el executor conserva Auth config/user/claims/delete. HOLD ya contabilizado, no nuevo. No ejecutar.

## Tramo 13 / F2

CP135, CP136 y CP137 demuestran que los ejecutores Auth/staff históricos están actualmente fail-closed por requests consumidos/deshabilitados, pero F2 debe impedir que credencial/caller directo se convierta en autoridad paralela.

CP138 confirma que el ledger actual impide replay de gates conocidos; sin embargo `historicalGlobalExhaustive=false` mantiene CP117 abierto. Por eso no se declara todavía `allRequestsClassified=true`.

## Producto / Claude / Academia

Sin tarea frontend nueva; no cambiar UI ni solicitar candidata. Sin impacto funcional en Academia, manuales, rutas por rol o notificaciones.

## G2-B

Sigue terminal `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; no retry/replay. F3 revalidará contra `00011-f2f` después de F0/F1/F2.

## Regla y siguiente exacto

F0 continúa read-only. Siguiente: `F0_RC15_SYSTEMIC_AUDIT_CONTINUE_CP117_ALIASES_EXECUTE_MARKERS_REMAINING_BACKEND_CONFIG_AND_PROVIDER_ENTRYPOINTS_IN_TOOLS_QA_TOOLS_RELEASE`. F1 no inicia hasta 4/4. G2-B no se toca.
