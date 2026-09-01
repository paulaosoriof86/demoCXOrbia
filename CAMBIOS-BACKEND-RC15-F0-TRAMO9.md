# CAMBIOS-BACKEND — RC15 F0 TRAMO 9 · BACKEND REQUESTS + P0 LEGAL RUNTIME

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Avance material

F0 continuó sin provider/data/deploy writes y produjo tres avances medibles:

- hallazgos clasificados: **110 → 119**;
- `backend/requests`: **6/6 clasificados**, directorio cerrado;
- 18 artefactos prioritarios de autoridad en `backend/config` clasificados;
- HOLD/P0 acumulados: **25 → 26**;
- HOLD residuales: **24 → 25**;
- exhaustividad permanece **2/4** porque aún falta terminar `backend/config` y provider-write entrypoints.

## Nuevo P0 demostrado — RC15-CP-119

Se demostró una superficie **actualmente desplegada** que sobrevivió al consumo de su request histórico:

1. El workflow I3 original desplegó `cxorbia-live-hr-dev` con `CXORBIA_I3_LEGAL_ACCEPTANCE_WRITE_ENABLED=true` y gate `PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`.
2. El request terminal I3 quedó `consumed_pass_human_acceptance_pending`, registra `futureHumanLegalAcceptanceWriteBudget=1` y fija como revisión desplegada `cxorbia-live-hr-dev-00010-n78`.
3. El continuity lock actual confirma que **esa misma revisión `00010-n78` sigue siendo la revisión Cloud Run vigente**. No existe una revisión posterior que haya reemplazado ese runtime.
4. El runtime actual conserva `POST /api/tenants/tya/legal/commands`: si los env gates están activos, un usuario autenticado real puede confirmar y registrar una aceptación legal provider-backed en Firestore.
5. `firebase.json` sigue enviando `/api/tenants/**` a ese servicio y el adapter del navegador conserva la acción humana explícita.
6. El execute marker histórico permanece `enabled=true`, `consumed=false`, aunque el request está consumido. El workflow compartido actual ya no permite redeploy I3 porque valida exclusivamente el execute G2-B; por tanto el replay de deploy está fail-closed, pero **eso no desactiva el write gate ya desplegado**.

Clasificación: `P0_PROVEN_CURRENT_DEPLOYED_LEGAL_ACCEPTANCE_WRITE_GATE_SURVIVES_CONSUMED_REQUEST`.

No se ejecutó contención provider porque el plan/lock actual tiene `providerMutationAuthorizedNow=false`. La contención requiere autorización separada y explícita en la conversación vigente para deshabilitar el env gate del runtime existente y verificar readback, sin otras mutaciones.

F0 puede continuar **solo en lectura/auditoría/documentación** mientras esa autorización no exista.

## Otros hallazgos del tramo

- `CP111`: familia `c6-direct-trusted-runner-dev-deploy-request*` histórica, disabled/consumed; v1/v2 fail-closed y v3 terminal PASS histórico.
- `CP112`: requests IAM de creación/reviewer histórico, disabled/consumed y sin IAM mutation en esos intentos.
- `CP113`: familias Corte6 Hosting/Cloud Run/Firestore request+execute inspeccionadas, todas disabled/consumed; conservan evidencia histórica pero no autorización actual.
- `CP114`: familias C6 Auth activation inspeccionadas, disabled/consumed; no retry vigente.
- `CP115`: PREPROD create/Hosting request consumed HOLD, projectCreatesSucceeded=0 y hostingDeploys=0.
- `CP116`: `backend/requests` 6/6 terminal histórico/consumido/superseded.
- `CP117`: el ledger `cxorbia-consumed-one-shot-gates.json` contiene solo seis requests I5 y no cubre de forma exhaustiva las múltiples autorizaciones C6/Corte6/I3 ya demostradas; F2 debe normalizar la cobertura.
- `CP118`: `cxorbia-evidence-aliases.json` es no ejecutable, pero permanece en epoch 47 mientras el continuity lock está en epoch 50; deriva documental/control-plane a corregir en F2.

## Seguridad

En este tramo: provider writes=0; Firestore/Auth/Storage/HR writes=0; Cloud Build/Cloud Run/Hosting deploy=0; recovery=0; synthetic stage=0; Make/Gemini/pagos=0; merge=false; cambios funcionales frontend=0.

## Clasificación obligatoria

- **Reusable CXOrbia:** detección de runtime write gate sobreviviente al consumo del request; reconciliación request↔execute↔runtime↔ledger; inventario por directorios cerrables.
- **Exclusivo TyA:** runtime legal I3 y artefactos históricos C6/Corte6/I3.
- **Claude/prototipo:** sin cambios de UI; se documenta que el adapter legal actual puede invocar el endpoint si el gate provider permanece activo.
- **Academia:** sin impacto funcional en este tramo.
- **Sin impacto Claude:** matriz, evidence, ledger/alias findings y documentación RC15.

## Pendiente y siguiente exacto

Persisten **2/4 flags** por cerrar:
- `allRequestsClassified=false`;
- `allProviderWriteEntrypointsClassified=false`.

Siguiente técnico: continuar read-only sobre el resto de `backend/config`, execute markers, requests/aliases/ledgers dispersos y provider-write entrypoints.

Bloqueo de seguridad paralelo: `RC15-CP-119` requiere una autorización explícita separada antes de cualquier contención Cloud Run. No tocar G2-B.
