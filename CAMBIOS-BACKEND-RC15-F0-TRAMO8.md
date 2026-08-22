# CAMBIOS-BACKEND — RC15 F0 TRAMO 8 · CIERRE WORKFLOWS + REQUEST DIRECTORY

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Objetivo y resultado

Se continuó `F0_RC15_SYSTEMIC_AUDIT_CONTINUE` con una meta medible: cerrar exhaustivamente la unión de workflows del HEAD vivo y de la rama base del PR, y cerrar el directorio `.github/cxorbia-firebase-requests` sin tocar proveedor, datos, deploy ni producto.

Resultado del tramo:
- hallazgos clasificados: **106 → 110**;
- HOLD/P0 descubiertos acumulativamente: **24 → 25**;
- `RC15-CP-093` continúa contenido;
- HOLD residuales: **23 → 24**;
- flags de exhaustividad verdaderos: **0/4 → 2/4**;
- `allWorkflowsClassified=true`;
- `allWorkflowDispatchClassified=true`;
- `allRequestsClassified=false`;
- `allProviderWriteEntrypointsClassified=false`.

Esto es avance de F0 aunque Phase A permanezca 98/100: los dos puntos finales siguen reservados por el plan congelado para recovery G2-B verificado + aceptación sintética integral, no para la auditoría previa.

## 1. Cierre exhaustivo de workflows

La rama viva `docs-tya-v6-v71-audit` permanece en `c3ae23d9c215301e25e28f465dd346ca85fd15c3` como baseline de entrada de este tramo y contiene 103 archivos de workflow, todos reconciliados contra `RC15-CP-001..106`.

La rama base viva `release/cxorbia-tya-rc-20260630` está en `fc7ead694ccdb01bee79856d47a761d34c8d88b9` y contiene únicamente dos workflows:
- `.github/workflows/cxorbia-v156-atomic-promotion.yml` → `RC15-CP-093`, ya contenido e inerte;
- `.github/workflows/cxorbia-resolve-dev-service-account.yml` → nuevo `RC15-CP-107`.

La unión auditada contiene 105 workflows. No queda un workflow de esa unión sin clasificación y tampoco queda un `workflow_dispatch` sin clasificación. Por eso se cierran dos flags F0.

### RC15-CP-107

`cxorbia-resolve-dev-service-account.yml` es una superficie histórica de rama base que accede al secret DEV, pero solo valida el JSON, verifica `project_id` e imprime el `client_email` no secreto. Tiene `contents:read`, no llama al proveedor, no modifica repositorio, no despliega y no escribe datos. Se clasifica como read-only histórico; F2 deberá gobernar también accesos a secretos/control-plane de rama base.

## 2. Cierre del directorio `.github/cxorbia-firebase-requests`

Se inventariaron sus **33 archivos** y se reconciliaron contra la matriz RC15. El directorio queda clasificado por completo, pero `allRequestsClassified` sigue false porque todavía faltan `backend/config`, `backend/requests`, execute markers, ledgers, aliases y autorizaciones dispersas.

Se confirmaron como fail-closed/consumidos o read-only varios requests que ya tenían workflow clasificado, incluyendo C6 V2, R17N final, Corte4 entrypoint, Hosting visual, VIS01 y diagnósticos remotos VIS02/VIS02B.

### RC15-CP-108 — nuevo HOLD material

El request `.github/cxorbia-firebase-requests/corte4-p0-vis02b-final-revalidate.json` conserva:
- `enabled=true`;
- autorización histórica para un Hosting DEV;
- `allowedProviderWrites.hostingDeployExecutions=1`;
- sin ledger `consumed/executionsConsumed`.

Sin embargo su workflow nominal `cxorbia-corte4-p0-vis02b-final-revalidate.yml` está inerte: `contents:read`, `workflow_dispatch` únicamente, job `if:false` y texto que declara la autorización consumida.

No existe riesgo de deploy **a través de ese executor nominal en su estado actual**, pero sí existe una contradicción de autoridad: el artefacto de autorización continúa write-capable mientras el executor declara consumo. Esto prueba que inertizar un executor no basta para considerar cerrada la autorización canónica.

Tratamiento congelado: F1 tombstone del request histórico junto con las demás autoridades residuales; F2 exigirá coherencia plan + lock + ledger + request + executor antes de cualquier acceso sensible o mutación.

### RC15-CP-109

`c6-staff-repair-bootstrap-exact-write.json` V1: `enabled=false`, `consumed=true`, `STOP_RETRY`, ejecutedWrites 0/0, sin segundo intento. Histórica y fail-closed.

### RC15-CP-110

`cxorbia-i3-shopper-persistence-exact-write-v1.json`: `enabled=false`, `consumed=true`, `STOP_RETRY`, `automaticRetryAllowed=false`. Histórica y fail-closed.

## Causa raíz refinada

RC15 añade una octava dimensión de gobierno: **desacuerdo entre artefacto de autorización y executor**. Puede existir un executor inerte junto a un request que aún expresa permiso real de escritura. Por tanto, el cierre debe demostrarse en todas las capas de autoridad y no inferirse por el estado de un único archivo.

## Seguridad y alcance

En este tramo:
- provider writes = 0;
- Firestore/Auth/Storage/HR writes = 0;
- Cloud Build/Cloud Run/Hosting deploy = 0;
- datos reales = 0;
- recovery G2-B = 0;
- synthetic stage = 0;
- Make/Gemini/pagos = 0;
- merge = false;
- cambios funcionales de frontend = 0;
- `/app/modules` y `/app/core` = sin cambios.

## Clasificación obligatoria

- **Reusable CXOrbia:** inventario de workflow-union HEAD/base; coherencia request/ledger/executor; cierre por flags de exhaustividad.
- **Exclusivo TyA:** requests históricos Corte4/C6/I3 y control-plane de este repositorio.
- **Claude/prototipo:** sin cambios funcionales; no requiere ajuste frontend en este tramo.
- **Academia:** sin cambio funcional; permanece como control transversal posterior.
- **Sin impacto Claude:** evidencia, control-plane y documentación RC15.

## Pendiente real y siguiente bloque exacto

Quedan **2/4 flags de exhaustividad** por cerrar:
1. `allRequestsClassified`;
2. `allProviderWriteEntrypointsClassified`.

Siguiente exacto:

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE` → inventariar `backend/config`, `backend/requests`, execute markers, ledgers, aliases y todos los provider-write entrypoints hasta poder demostrar los dos flags restantes.

F1 no inicia todavía. G2-B no se toca.
