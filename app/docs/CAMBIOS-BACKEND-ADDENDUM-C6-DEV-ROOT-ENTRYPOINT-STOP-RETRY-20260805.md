# CAMBIOS-BACKEND — Addendum C6 DEV root entrypoint STOP_RETRY

**Fecha:** 2026-08-05  
**Clasificación:** Reusable CXOrbia · Backend/Hosting · Sin cambio funcional de módulos

## P0 demostrado

`https://cxorbia-backend-dev.web.app/` servía `app/index.html`, mientras los gates técnicos abrían `/index-backend-dev.html`.

```text
CODE=DEV_ROOT_ENTRYPOINT_CANONICAL_RUNTIME_MISMATCH
GATE_URL_NE_HUMAN_VALIDATION_URL=true
```

## Archivos técnicos creados

- `tools/qa/tya-c6-dev-root-entrypoint-source-gate.mjs`;
- `tools/qa/tya-c6-dev-root-entrypoint-remote-parity-gate.mjs`;
- `tools/qa/tya-c6-dev-root-runtime-wrapper.mjs`;
- `.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml`;
- `backend/config/corte6-dev-root-entrypoint-hosting-execute.json`;
- `app/docs/evidence/CORTE6-DEV-ROOT-ENTRYPOINT-PREDEPLOY-STOP-RETRY-LATEST.json`.

## Archivos técnicos modificados

- `firebase.json`: redirect exacto `/` → `/index-backend-dev.html`, tipo `302`;
- `tools/qa/tya-dev-scenario-lab-source-contract-gate.mjs`: incorpora la paridad source del root;
- `app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`: pins del P0 raíz;
- `.github/cxorbia-gate-requests/request.json`: source/static PASS consumido.

No se modificaron `app/modules`, diseño, Login, Auth ni lógica de negocio.

## Source/static

```text
run=31035432458
job=92406210890
artifact=8942354869
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
PASS_C6_DEV_ROOT_ENTRYPOINT_SOURCE_PARITY
```

## STOP_RETRY

El workflow one-shot falló antes del deploy:

```text
run=31035653127
job=92406957537
artifact=8942474073
failedStage=predeploy_workflow_shell_parse
errorCode=BASH_HEREDOC_TERMINATOR_INDENTATION_INVALID
deployAttempted=false
hostingDeploysThisBlock=0
```

Los terminadores `NODE` estaban indentados dentro del subshell Bash. Se consumieron y deshabilitaron ambos requests. No hubo reintento.

## Seguridad

```text
Hosting DEV total=2
Hosting DEV bloque=0
Cloud Run=0
Firestore/Auth/Rules/Storage/HR writes=0
Make/Gemini/pagos=0
merge=false
production=false
```

## Siguiente cambio permitido

Únicamente corregir la indentación de los terminadores heredoc del workflow, repinar ese blob y volver a source/static. Cualquier deploy requiere nueva autorización expresa.
