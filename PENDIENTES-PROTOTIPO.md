# PENDIENTES-PROTOTIPO.md

**Fecha:** 2026-08-23  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Avance F0

**142** hallazgos clasificados; **32** HOLD/P0 acumulados; CP093 y CP119 contenidos; **30 residuales**. Exhaustividad **2/4**.

Cerrado: workflows 105/105; `.github/cxorbia-firebase-requests` 33/33; `backend/requests` 6/6; mutation routers 3/3; `hr-live-service` 8/8 por rol; `tools/production` 2/2; `tools/dev` 1/1; `tools/backend` 4/4; top-level `tools/empalme` 2/2; `tools/integration` 5/5 estáticos.

Avance Tramo 14:
- workflow compartido I3/G2-B reconciliado: los markers históricos I3 y G2-B original no pueden pasar el guard actual; recovery tampoco mientras su request siga consumido;
- cinco execute markers Corte6 comprobados terminales `enabled=false/consumed=true`;
- M8/M10 comprobados read-only con writes/deploys en cero;
- nuevo HOLD CP142: `backend/config/m9-provider-precutover-readonly-execute.json` conserva una autorización histórica de promoción + rollback con `enabled=true`, `consumed=false`.

Pendiente global:
- `allRequestsClassified=false`: terminar autoridad/request artifacts de `backend/config`, CP117, aliases/ledgers y autorizaciones dispersas;
- `allProviderWriteEntrypointsClassified=false`: agotar `tools/qa`, `tools/release` y cualquier entrypoint restante.

## F1 — HOLDs recientes ya acumulados

- CP124: `tya-apply-post-v96-source-lock.sh`, source writer + commit/push histórico. No ejecutar.
- CP125: request V105/V106 históricamente autorizado para reemplazo runtime. No ejecutar.
- CP127: materializador R18B puede sobrescribir snapshot tracked. No ejecutar.
- CP130: creadores Firebase R15/R15B conservan project-create/addFirebase histórico. No ejecutar.
- CP131: runner R15G conserva source rebuild + Hosting deploy histórico. No ejecutar.
- CP011: temp operator Corte4 conserva Auth config/user/claims/delete y request histórico activo. No ejecutar.
- **CP142: M9 conserva autorización histórica de una promoción productiva + rollback condicional, `enabled=true/consumed=false`. No ejecutar. F1 terminalizar/inertizar.**

## F2 — autoridad canónica

F2 debe asegurar que:
- terminal receipt prevalezca sobre execute/event artifacts históricos;
- una credencial/caller directo no cree autoridad paralela;
- aliases y epochs no permitan reabrir trabajo cerrado;
- CP117 quede normalizado con cobertura histórica exhaustiva;
- los markers históricos habilitados no puedan confundirse con autorización vigente.

## Producto / Claude / Academia

Sin tarea frontend nueva; no cambiar UI ni solicitar candidata. Sin impacto funcional en Academia, manuales, rutas por rol o notificaciones.

## G2-B

Sigue terminal `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; no retry/replay. El request recovery está `enabled=false/consumed=true`. F3 revalidará contra `00011-f2f` después de F0/F1/F2.

## Regla y siguiente exacto

F0 continúa read-only. Siguiente: `F0_RC15_SYSTEMIC_AUDIT_CONTINUE_REMAINING_BACKEND_CONFIG_REQUEST_AUTHORITY_AND_PROVIDER_ENTRYPOINTS_TOOLS_QA_TOOLS_RELEASE`. F1 no inicia hasta 4/4. G2-B no se toca.
