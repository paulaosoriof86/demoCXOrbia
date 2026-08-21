# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE Y CONGELADO

**Fecha de congelamiento:** 2026-08-21  
**SYNC_EPOCH de producto:** `CXORBIA-20260821-I5-G2B-FORENSIC-PROVIDER-LANE-READY-50`  
**PLAN_ID Phase A:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.0.0`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentIteration Phase A:** `I5-G2`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`  
**ACTIVE_BLOCKER:** `RC15_SYSTEMIC_AUDIT_AND_G2B_RECOVERY_HOLD`

## 1. Autoridad y regla de congelamiento

Este archivo es el **único plan operativo vigente hacia producción y postproducción**. Absorbe los requisitos todavía aplicables de planes, addenda, checkpoints y soluciones definitivas anteriores. Esos documentos permanecen como evidencia/histórico y no pueden crear un plan paralelo, alterar el orden de ejecución ni reactivar un gate consumido.

El contenido de este plan queda congelado. El `backend/config/cxorbia-phase-a-continuity-lock.json` debe conservar `masterPlan.id`, `version`, `path`, `gitBlobSha` y `sha256` coincidentes con este archivo. El validador de continuidad debe fallar cerrado si el hash cambia.

Una modificación futura del plan solo es válida mediante `PLAN_CHANGE_REQUEST` con:
- causa demostrada;
- alcance e impacto;
- hash anterior y hash propuesto;
- clasificación de riesgo;
- autorización explícita de Paula en la conversación vigente;
- actualización atómica de plan + lock + índice + evidencia.

Ningún cambio de conversación, comentario de PR, checkpoint, request histórico, workflow, addendum, nueva auditoría ni hallazgo puede sustituir ese procedimiento.

## 2. Estado formal preservado

I1–I4, R1–R4 y G1 permanecen PASS/FROZEN. G2-A permanece PASS/FROZEN. G2-B es el único frente pendiente dentro de Phase A.

P0 abierto: `G2B_CANONICAL_WRITE_PATH_DISABLED_OR_UNROUTED`.

Última recuperación terminal: `i5-g2b-p0-writepath-recovery-20260821-02` = `RECOVERY_NO_PROVIDER_SIDE_EFFECT`; Cloud Run y Hosting permanecieron en baseline; `providerMutationExecutions=0`; request consumido; replay y retry automático prohibidos.

Readiness provider posterior: `FORENSIC_PROVIDER_LANE_READY`. Readiness no equivale a autorización ni a recovery ejecutado.

Hasta terminar F0 y obtener la transición explícita correspondiente:
- Cloud Build / Cloud Run / Hosting writes = 0;
- Firestore / Auth / Storage / HR externa / datos o credenciales reales / pagos / Rules / Make / Gemini = 0;
- merge = false;
- synthetic stage = bloqueado.

## 3. Plan maestro único — fases congeladas

### F0 — Auditoría sistémica RC15

Objetivo: demostrar que no queda una superficie relevante desconocida capaz de cambiar producto, estado canónico o proveedor y evitar que aparezcan nuevos bloqueos por mecanismos no auditados.

Cobertura obligatoria:
1. repositorio, rama, PR, source lock y release provenance;
2. todos los workflows, triggers, `workflow_dispatch`, paths, permisos, secrets, tokens, service accounts, concurrency y fan-out;
3. todos los requests, execute markers, one-shots, gates, receipts, ledgers, aliases y autorizaciones históricas;
4. autoridad documental, epochs, mirrors, checkpoints y continuidad entre conversaciones;
5. build, Artifact Registry, Cloud Run, Hosting, Firebase/Firestore/Auth/Storage/Rules e IAM;
6. CX.data, adapters, backend runtime y contratos sin reescribir frontend;
7. HR viva/histórica, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos y multi-proyecto;
8. sincronización HR↔plataforma, idempotencia, deduplicación, conflictos y partial failures;
9. seguridad, tenant isolation, secretos, PII, evidencia y supply chain;
10. performance, cuotas, costos, timeouts, retries y capacidad;
11. backup, restore, rollback, RTO/RPO y disaster recovery;
12. observabilidad, logs, métricas, alertas, SLI/SLO y runbooks;
13. cutover, smoke, aceptación humana, cleanup, reconciliación y postproducción;
14. Claude/prototipo, Academia, manuales, rutas por rol y notificaciones.

Criterio de salida: matriz exhaustiva de superficies con `PASS`, `HOLD`, `INERT`, `HISTORICAL` o `BLOCKED`, responsable de evidencia y cero superficie write-capable sin clasificación. Si queda una superficie no clasificada, F0 no cierra.

### F1 — Inertización histórica

Revocar/tombstonear de forma segura requests/gates/autorizaciones históricas write-capable y separar artefactos `ACTIVE`, `CONSUMED`, `HISTORICAL` e `INERT`.

Criterio de salida: ningún request/autorización histórica puede producir un provider/data write por push, replay o `workflow_dispatch`. No se elimina evidencia necesaria.

### F2 — Autoridad canónica única y control-plane

Consolidar state machine, plan freeze, continuity lock, consumed ledger, aliases, triggers y governance. El PR queda mirror; el lock y los receipts determinan estado. Verificar branch/repository enforcement y fail-closed ante drift.

Criterio de salida: una sola autoridad puede autorizar ejecución; cualquier inconsistencia bloquea antes de provider access.

### F3 — Revalidación del carril G2-B

Revalidar source-only/read-only el recovery: SHA exacto, trigger, checkout, tokens, IAM, provider baseline, budgets, request/execute lineage, no replay y cero provider mutation.

Criterio de salida: `G2B_RECOVERY_LANE_PASS`.

### F4 — Recovery G2-B one-shot

Solo con nueva autorización explícita: máximo un Cloud Build, un update de `cxorbia-live-hr-dev` y un deploy de Hosting; cero business/Auth/Firestore/Storage/HR/payment/Rules/Make/Gemini writes.

Criterio de salida: `RECOVERY_PASS_FULL` o STOP terminal. Sin retry automático.

### F5 — Aceptación sintética integral

Solo `CXORBIA_E2E_SYNTH_*` en la misma plataforma productiva. Probar flujos reales autorizados, mantener escenario visible para Paula, capturar observaciones, cleanup total y post-clean readback.

Criterio de salida: PASS integral + cero residuo sintético + evidencia visible.

### F6 — Freeze Phase A como release inmutable

Crear Release Manifest con source SHA, release SHA, hashes/config, build/image digest, Cloud Run revision, Hosting release/version, receipts, data fingerprints y readbacks.

Criterio de salida: `PHASE_A_RELEASE_100_FROZEN`.

Regla: el 100% pertenece al release certificado. Un defecto posterior abre `INCIDENT_OPEN` y un patch release; no reduce retroactivamente Phase A de 100 a 98.

### F7 — Readiness integral preproducción

Ejecutar contra el release exacto: seguridad/IAM/Rules/secrets, tenant isolation, migración, E2E, regresión, carga/cuotas, failure injection, idempotencia, backup/restore, rollback, observabilidad, alertas, runbooks, Claude y Academia.

Criterio de salida: `GO`, `GO_WITH_WARNINGS`, `HOLD` o `NO_GO` con matriz completa y sin supuestos.

### F8 — Cutover de producción

Requiere autorización específica. Preservar backup/export, restore verificable, deployment exacto del manifest, provider readbacks, smoke por rol/flujo y punto de rollback. Nunca conectar legacy DB.

Criterio de salida: release exacto operando y reconciliado en proveedor.

### F9 — Aceptación postproducción

Ventana formal definida antes del cutover. Monitorear Auth, HR, sync, shoppers, visitas, evidencias, liquidaciones/pagos, errores, performance, drift y alertas.

Criterio de salida: `POSTPROD_ACCEPTED` después de estabilidad y reconciliación.

### F10 — Modelo operativo permanente

Incidentes, patches, observabilidad continua, backups/restores periódicos, evidence TTL, seguridad, revalidaciones programadas, cambios Claude/Academia y mejoras futuras.

Criterio: operación normal sin reabrir Phase A ni reactivar planes/gates históricos.

## 4. Contrato obligatorio de cada bloque

Cada fase/subpaso debe declarar antes de actuar:
- objetivo y criterios de entrada;
- alcance exacto;
- mutaciones permitidas y prohibidas;
- provider/data budget;
- evidencia requerida;
- criterios de salida;
- STOP/rollback;
- autorización necesaria;
- documentos que deben sincronizarse;
- clasificación `Reusable CXOrbia / Exclusivo cliente / Claude-prototipo / Academia / Sin impacto Claude`.

Un hallazgo nuevo se incorpora primero a la matriz RC15. No crea automáticamente otra metodología, candidata, rama, PR, workflow o plan.

## 5. Invariantes heredados absorbidos

Se preservan sin crear planes paralelos:
- prototipo manda; backend no rediseña `/app/modules` ni `/app/core`;
- `APPLY_DELTA_DIRECTLY` para candidata frontend GO/no P0 bajo el lock vigente;
- base nueva/limpia; legacy solo export/import de datos reales limpios;
- CX.data conserva exactamente su interfaz;
- multi-tenant por `tenantId` + `projectId`;
- HR histórica/completa, shoppers, certificaciones, liquidaciones/pagos y multi-proyecto;
- sync HR↔plataforma con identidad estable, idempotencia y revisión de conflictos;
- datos sensibles protegidos y UTF-8 sin BOM;
- Make/Gemini/pagos únicamente en su bloque y con gate humano;
- ningún éxito se declara sin evidence/readback;
- si no está documentado, no se hizo.

## 6. Modelo de progreso y continuidad

`PHASE_A=98/100` permanece congelado mientras F0–F5 no cierren lo pendiente de G2-B.

El avance de RC15 se reporta por fase y por cobertura auditada, sin inventar porcentaje sobre superficies aún no inventariadas.

Continuidad obligatoria:
1. leer índice vigente;
2. leer continuity lock;
3. verificar hash/identidad de este plan;
4. leer evidence/cursor de la fase actual;
5. resolver HEAD vivo dinámicamente;
6. continuar exactamente desde `currentMasterPhase/currentMasterStep`.

## 7. Próximo paso exacto

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE`.

Prioridad inicial: inventario completo de control-plane write-capable: workflows + triggers + `workflow_dispatch` + requests/execute markers + permisos + replay/concurrency/fan-out. Hasta cerrar esa matriz, ningún provider mutation ni recovery G2-B está permitido.
