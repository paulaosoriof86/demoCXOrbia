# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-DEFINITIVE-ROOT-CAUSE-PLAN-43`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**Frontera:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**Iteración activa:** `I5-R2_CONTROL_PLANE_AND_DOCUMENT_DRIFT_CLOSURE`  
**Score formal:** `87/100`  
**Producción autorizada:** `NO`

## 1. Regla de continuidad

Este es el plan formal único de trabajo hacia producción. No se reconstruye desde una conversación y no se sustituye por un roadmap nuevo ante bloqueos intermedios.

Su estado machine-readable vive en `backend/config/cxorbia-phase-a-continuity-lock.json`. Toda conversación nueva debe leer el índice vigente, ese control, Execution State, Checkpoint, este plan, contrato de promoción, evidencia de gates y PR #7. Si existe contradicción se declara `CONTINUITY_DRIFT_BLOCKED` y se reconcilia el control-plane antes de hacer trabajo funcional.

I1–I4 permanecen `PASS/FROZEN` sobre el source funcional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. Solo un `P0_PROVEN` nuevo y reproducible permite reabrirlos.

## 2. Topología productiva canónica

La estrategia vigente sigue siendo `PROMOTE_EXISTING_CLEAN_PROJECT` sobre `cxorbia-backend-dev`.

- Hosting target: `cxorbia-dev`.
- Hosting site: `cxorbia-backend-dev`.
- URL aceptada como producción futura: `https://cxorbia-backend-dev.web.app`.
- Cloud Run: `cxorbia-live-hr-dev`, `us-central1`.
- `cxorbia-tya-dev-260729-c4`: sandbox, no destino Phase A.
- `tya-plataforma`: legacy preservado hasta cutover explícito.
- `cxorbia-preprod-20260819`: ruta descartada; no crear.

## 3. Causas raíz que deben quedar cerradas antes del cutover

1. `RC01 CANONICAL_STATE_DRIFT`: documentos y control-plane con estados distintos.
2. `RC02 PLAN_LOSS_ACROSS_CONVERSATIONS`: plan dependiente de contexto conversacional.
3. `RC03 PROMOTION_CONTRACT_VS_ADHOC_TOPOLOGY_DRIFT`: ruta PREPROD contradictoria con contrato autorizado.
4. `RC04 PROMOTION_VALIDATOR_SCHEMA_MISMATCH`: validador no alineado al schema real del contrato.
5. `RC05 ONE_SHOT_GATE_STATE_DRIFT_OR_STALE_REQUESTS`: requests/gates consumidos que pueden reaparecer como activos.
6. `RC06 EVIDENCE_NAMING_MISMATCH_CAUSING_REDUNDANT_RERUNS`: equivalencias de evidencia no reconciliadas.
7. `RC07 LIVE_HR_CLONE_STALE_OR_DEMO_FALLBACK_RISK`.
8. `RC08 SHOPPER_VISIT_SCOPE_VISIBILITY_RISK`.
9. `RC09 FINANCE_PAYMENT_SEMANTICS_REGRESSION_RISK`.
10. `RC10 MULTIROLE_HARNESS_OR_CREDENTIAL_STALENESS`.
11. `RC11 SAME_ARTIFACT_NO_REBUILD_AND_ROLLBACK_ENFORCEMENT`.
12. `RC12 POST_PRODUCTION_OBSERVABILITY_AND_SYNC_REGRESSION_RISK`.

Ninguna causa crítica puede quedar abierta antes de `I5-G1`.

## 4. Plan cerrado de seis iteraciones

Los 15 puntos restantes de I5 quedan subdivididos y solo avanzan con evidencia terminal.

| Iteración | Peso | Objetivo | Estado | Salida obligatoria |
|---|---:|---|---|---|
| `I5-R1` | 2 | Persistencia del plan, control machine-readable y validadores fail-closed | **PASS** | `CANONICAL_CONTINUITY_AND_VALIDATOR_LOCK_PASS` |
| `I5-R2` | 3 | Cerrar deriva documental/control-plane, requests stale y equivalencias de evidencia | **ACTIVA** | `CONTINUITY_DRIFT_AUDIT_PASS` |
| `I5-R3` | 3 | Reconciliar aceptación crítica del producto exacto | PENDIENTE | `CRITICAL_PRODUCT_ACCEPTANCE_PASS` |
| `I5-R4` | 2 | Auditoría independiente posterior a remediación | PENDIENTE | `ROOT_CAUSE_CLOSED_PASS` |
| `I5-G1` | 3 | Autorización explícita + cutover/promoción del mismo artefacto | PENDIENTE AUTORIZACIÓN | `PRODUCTION_CUTOVER_EXECUTED` |
| `I5-G2` | 2 | Smoke productivo, hypercare, rollback si falla y freeze | PENDIENTE | `PRODUCTION_FROZEN_PASS_100` |

**Total I5 = 15 puntos.** Con `I5-R1` cerrado, el score formal pasa de `85/100` a `87/100`.

## 5. I5-R1 — cerrado en este epoch

Se resolvió:

- plan persistente fuera del chat;
- control `backend/config/cxorbia-phase-a-continuity-lock.json`;
- corrección de la evidencia productiva para reflejar promoción del proyecto limpio existente, no PREPROD inexistente;
- corrección del validador `tools/production/validate-production-promotion-gates.js` para usar el schema real `requiredPreCutoverGates` y los flags reales del contrato;
- validador de continuidad `tools/continuity/validate-cxorbia-phase-a-continuity-lock.js`.

## 6. I5-R2 — siguiente bloque exacto

Objetivo: eliminar estados competidores sin tocar producto frozen.

Debe revisar y reconciliar como una sola unidad:

- índice vigente;
- Execution State;
- Checkpoint;
- este plan;
- Phase A Plan Lock;
- tracker de progreso;
- PR #7;
- contrato/evidencia de promoción;
- requests one-shot consumidos;
- CAMBIOS/RESUMEN/PENDIENTES y addenda actuales.

Criterios de salida:

- un solo `SYNC_EPOCH` para documentos operativos vivos;
- ningún blocker PREPROD/Project Creator sigue marcado como activo;
- ningún request consumido puede volver a ejecutarse por deriva de estado;
- nomenclaturas históricas se mapean a evidencia terminal sin rerun automático;
- el validador de continuidad produce `CONTINUITY_LOCK_PASS`;
- cero cambios funcionales y cero deploy.

## 7. I5-R3 — aceptación crítica del producto

Sobre exactamente el source `f9802f...` ya materializado, se debe demostrar o reutilizar evidencia suficiente para:

- `ROADMAP_LIVE_NO_CLONES`: HR/hoja de ruta viva, sin clonación ni fallback silencioso.
- `SHOPPERS_VISIBLE_EXPECTED_SCOPE`: shoppers históricos/reales visibles según rol/proyecto.
- `VISITS_CURRENT_AND_HISTORY_VISIBLE`: visitas actuales e históricas visibles y coherentes.
- `FINANCE_CANONICAL_SEMANTICS`: mayo 44/44 pagadas; junio 2/44 pagadas + 42 pendientes + Q451; `liquidada != pagada`.
- `MULTIROLE_SCOPE_PASS`: Admin/Staff/Shopper/Cliente según scope real.
- `RELOAD_SESSION_PASS`: reload/nueva sesión no cambia fuente, identidad ni alcance.
- `NO_DEMO_OR_STALE_FALLBACK`.
- `SAME_ARTIFACT_PASS`.

Solo una brecha terminal real abre una corrección focalizada. No se reabre I1–I4 por defecto.

## 8. I5-R4 — auditoría definitiva de causas raíz

Debe auditar después de las remediaciones, no antes. El único PASS aceptable es `ROOT_CAUSE_CLOSED_PASS` y exige:

- RC01–RC11 cerradas o no aplicables con evidencia;
- cero P0 abierto;
- misma build y rollback listos;
- control-plane coherente;
- aceptación crítica del producto PASS;
- autorización de cutover todavía pendiente.

Si falla, se corrige únicamente la causa concreta y se repite esta auditoría; no se crea un nuevo plan.

## 9. I5-G1 — producción

Solo después de `ROOT_CAUSE_CLOSED_PASS` se solicita/consume autorización explícita para cutover.

Reglas:

- mismo artefacto probado; `no rebuild`;
- rollback preparado antes de cambiar tráfico/estado productivo;
- no Make/Gemini/pagos/writes fuera de los gates ya autorizados;
- legacy intacto hasta que el cutover confirme PASS.

Al ejecutarse, el score llega a `98/100`: producción desplegada pero todavía pendiente smoke terminal.

## 10. I5-G2 — post-producción inmediata

Smoke/hypercare obligatorio sobre producción real:

- login/roles;
- HR viva;
- shoppers;
- visitas;
- Finanzas;
- reload/nueva sesión;
- cross-tenant/scope;
- ausencia de fallback demo/stale;
- sincronización HR/plataforma sin duplicados ni overwrites silenciosos;
- errores y métricas de runtime.

Si cualquier P0 aparece: rollback inmediato y corrección focalizada. Solo `PRODUCTION_FROZEN_PASS_100` cierra Phase A al 100%.

## 11. Conteo comprometido de iteraciones

- **4 iteraciones** (`R1–R4`) para cerrar y auditar definitivamente las causas raíz antes de producción.
- **5.ª iteración** (`G1`) para ejecutar el cutover y estar efectivamente en producción, siempre que no aparezca un nuevo `P0_PROVEN` externo al plan.
- **6.ª iteración** (`G2`) para smoke/hypercare y cierre estable al `100/100`.

No se agregan iteraciones por explicación, reauditoría general o pérdida de conversación. Solo un P0 reproducible o dependencia externa real puede añadir un bloque focalizado y debe quedar registrado en este mismo plan, no en uno nuevo.

## 12. Seguridad y circuit breaker

Prohibido:

- nueva candidata/rama/PR/workflow;
- nuevo proyecto PREPROD;
- Project Creator por la ruta descartada;
- reabrir I1–I4 sin P0 nuevo;
- rebuild antes de promoción;
- cutover antes de `ROOT_CAUSE_CLOSED_PASS`;
- cutover sin autorización explícita;
- fallback silencioso a demo/stale;
- sobrescribir conflictos HR/plataforma;
- afirmar PASS sin evidencia terminal.
