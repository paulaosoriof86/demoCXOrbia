# CAMBIOS-BACKEND — RC15 F0 TRAMO 12 · BACKEND/CONFIG + TOOLING HISTÓRICO/PROVIDER

**Fecha:** 2026-08-22  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Contrato del bloque

- objetivo: continuar F0 en lectura y clasificar superficies write-capable todavía abiertas;
- entrada: HEAD `0b0e109c5dc2e48cea29d4fb3addd8417f0516e3`, plan congelado validado, `providerMutationAuthorizedNow=false`;
- mutaciones permitidas: únicamente documentación Git atómica de esta auditoría;
- prohibido: provider/data/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos, deploy, G2-B, merge y cambios funcionales frontend;
- salida: hallazgos incorporados a matriz RC15 sin falsear exhaustividad.

## Resultado medible

- hallazgos clasificados: **125 → 134**;
- HOLD/P0 descubiertos acumulativamente: **28 → 31**;
- contenidos: CP093 + CP119 = **2**;
- HOLD/P0 residuales: **26 → 29**;
- exhaustividad global: **2/4**; `allRequestsClassified=false` y `allProviderWriteEntrypointsClassified=false` continúan abiertos;
- `tools/integration`: **5 archivos estáticos** clasificados, sin ejecutables;
- `tools/reconciliation`: inventario de **22 archivos** enumerado y un source materializer histórico aislado;
- familias Auth/IAM/deploy muestreadas en `backend/config`: terminales/consumidas/fail-closed;
- `tools/release` y `tools/qa`: nueve superficies/familias adicionales clasificadas en este tramo.

No hubo provider write, data write, deploy, G2-B, merge ni cambio funcional frontend.

## RC15-CP-126 — tools/integration

`tools/integration` contiene únicamente template y políticas JSON de producto/proyecto/tenant. No existe ejecutable ni primitive de mutación.

Clasificación: `PASS_STATIC_POLICY_AND_TEMPLATE_CONFIG_NO_EXECUTABLE_MUTATION`.

## RC15-CP-127 — HOLD · materializador histórico R18B

`tools/reconciliation/tya-apply-existing-r11d-r14c-certification-r18b.mjs` puede sobrescribir por defecto el mismo archivo tracked que usa como payload: `app/data/tya-hr-source-safe-periods.js`.

El script no valida master plan, continuity lock, consumed ledger ni autorización actual antes de esa mutación de source. Su `safeState.writes=false` se refiere a writes de negocio/proveedor, no a filesystem/source.

Clasificación: `HOLD_HISTORICAL_UNGATED_CANONICAL_APP_DATA_SOURCE_MATERIALIZER`.

Tratamiento F1: inertizar/tombstonear autoridad histórica preservando evidencia. No ejecutar.

## RC15-CP-128 — Rules API primitive

`tools/release/cxorbia-corte6-firestore-rules-deploy.mjs` puede crear Ruleset y actualizar release cuando coinciden:
- `CXORBIA_EXECUTE_FIRESTORE_RULES=true`;
- service account válida del proyecto.

Sin execute flag queda en dry-run/read-only. El primitive no incorpora por sí mismo autoridad RC15 actual.

Clasificación: `PASS_PROVIDER_WRITE_PRIMITIVE_REQUIRES_CREDENTIAL_AND_EXECUTE_FLAG_F2_CALLER_CONTROL_REQUIRED`.

F2 debe gobernar quién puede entregar credencial + execute flag.

## RC15-CP-129 — Hosting REST histórico

`cxorbia-existing-hosting-dev-direct-deploy.mjs` requiere execute flag, credencial y preflight. El prepare canónico dependía del request histórico `phase-a-hosting-dev-execution-request-v1.json`.

El request vivo está:
- `enabled=false`;
- `consumed=true`;
- `hostingDeployExecutions=1`;
- `deployAllowedNow=false`.

No existe autoridad de redeploy actual.

Clasificación: `PASS_HISTORICAL_HOSTING_PRIMITIVE_WITH_CONSUMED_REQUEST_F2_CALLER_CONTROL_REQUIRED`.

## RC15-CP-130 — HOLD · creación histórica de proyecto Firebase

`tya-create-new-empty-firebase-dev-r15.mjs` y `r15b.mjs` pueden crear un proyecto Google Cloud y ejecutar `addFirebase`.

La frontera write se protege solamente con:
- `CXORBIA_CONFIRM=CREATE_NEW_EMPTY_FIREBASE_DEV`;
- target project id;
- credencial provista por caller.

No validan el plan RC15 congelado, continuity lock, consumed ledger ni autorización vigente.

Clasificación: `HOLD_HISTORICAL_PROVIDER_PROJECT_CREATION_ENTRYPOINT_STATIC_CONFIRM_ONLY`.

Tratamiento F1: inertizar/tombstonear autoridad histórica. No ejecutar.

## RC15-CP-131 — HOLD · runner R15G

`tools/release/tya-r15g-dev-root-deploy.sh` conserva dos caminos históricos:
- push: valida request 2026-07-18;
- `workflow_dispatch`: acepta `CXORBIA_MANUAL_CONFIRM=DEPLOY_DEV_ROOT_R15G` sin validar ese request.

Además reconstruye el payload source-safe en `app/data`, reaplica R18B/R20 y puede ejecutar `firebase deploy` a Hosting con credencial provista.

Clasificación: `HOLD_HISTORICAL_SOURCE_REBUILD_AND_HOSTING_DEPLOY_RUNNER_WITH_MANUAL_DISPATCH_BYPASS`.

Tratamiento F1: inertizar/tombstonear autoridad del runner, preservando evidencia.

## RC15-CP-132 — Auth/Firestore client primitive

`tools/qa/cxorbia-c6-client-auth-materialization.mjs` tiene modos write reales:
- `--mode=apply`: puede hacer `setCustomUserClaims` y `membership.ref.set`;
- `--mode=rollback`: puede restaurar claims y set/delete de membership.

Su caller canónico `cxorbia-c6-client-access-runtime-orchestrator.mjs` sí valida request exacto, HEAD y límites antes de invocar apply. El request actual `corte6-client-auth-materialization-request.json` está `enabled=false`, `consumed=true`.

Clasificación: `PASS_AUTH_FIRESTORE_WRITE_PRIMITIVE_WITH_CANONICAL_CONSUMED_ORCHESTRATOR_REQUEST_F2_DIRECT_CALL_CONTROL_REQUIRED`.

No replay. F2 debe impedir que el primitive directo se convierta en autoridad paralela por simple disponibilidad de credencial.

## RC15-CP-133 — Firestore profile writer consumido

`cxorbia-corte6-profile-full-firestore-write-v2.mjs` exige request `enabled=true`, `authorized=true`, `consumed=false` y status `authorized_pending_execution` antes del batch.

El request vivo está `consumed_pass`, `enabled=false`, `authorized=false`, `consumed=true`.

Clasificación: `PASS_HISTORICAL_FIRESTORE_WRITER_FAIL_CLOSED_BY_CONSUMED_REQUEST`.

## RC15-CP-134 — atomic source apply runner

`cxorbia-atomic-apply-runner.mjs` está request-bound y valida repo/rama, commit de request único, parent SHA, hashes por archivo, operaciones autorizadas y token GitHub. El contrato bloquea provider/data writes, deploy, merge, producción, force-push, nuevas ramas/PR y paths protegidos.

Clasificación: `PASS_CONTROLLED_SOURCE_APPLY_RUNNER_REQUEST_BOUND_NO_PROVIDER_DATA_WRITES` con requisito F2 de reconciliar provenance/authority con el master plan vigente y enforcement real del PR/rama.

## backend/config — avance de requests

Se verificaron familias Auth/IAM/deploy históricas incluyendo:
- C6 Auth activation y Auth plan V4;
- principal uniqueness/rootfix;
- direct trusted runner deploy V1–V3;
- IAM admin identity / temporary reviewer / revoke-readback;
- client membership-only repair;
- profile-full Firestore write;
- Hosting DEV execution request.

Los requests inspeccionados están terminales, consumidos o fail-closed. Esto reduce incertidumbre, pero no se declara `allRequestsClassified=true` hasta terminar el directorio y execute markers/aliases/ledgers dispersos.

## Seguridad y alcance

En Tramo 12:
- provider writes = 0;
- Firestore/Auth/Storage/HR writes = 0;
- Cloud Build/Cloud Run/Hosting = 0;
- Rules/Make/Gemini/pagos = 0;
- G2-B/recovery/synthetic = 0;
- merge = false;
- `/app/modules` y `/app/core` = sin cambios;
- frontend funcional = 0.

## Clasificación obligatoria

- **Reusable CXOrbia:** separar primitive técnico de autoridad de ejecución; terminalizar requests; controlar credencial+execute flags desde una autoridad canónica; detectar source writers históricos aunque reporten `writes=false` de negocio.
- **Exclusivo cliente:** runners y solicitudes históricas TyA/Cinépolis R15/R18/Corte6.
- **Claude/prototipo:** sin cambio funcional; no se solicita candidata ni parche frontend.
- **Academia:** sin impacto funcional.
- **Sin impacto Claude:** matriz/evidence/documentación RC15 F0.

## Pendiente real

Los dos flags globales permanecen abiertos:
- `allRequestsClassified=false`;
- `allProviderWriteEntrypointsClassified=false`.

Siguiente exacto: continuar `backend/config` restante + execute markers/aliases/ledgers, después cerrar las familias provider-capable restantes de `tools/qa` y `tools/release`. F1 no inicia hasta 4/4. G2-B no se toca.
