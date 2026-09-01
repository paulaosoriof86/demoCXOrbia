# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-30  
**STATE_SYNC_EPOCH:** `CXORBIA-20260830-F10-OPERATIONAL-AUTHORITY-MULTIPROJECT-SOURCE-AUDIT-16`  
**PHASE_A:** `100/100_CURRENT_LIVE_OPERATION__NEW_PROJECT_ONBOARDING_GATES_OPEN`  
**PRODUCTION_REAL_READINESS:** `100/100_CURRENT_LIVE_RELEASE__SOURCE_SUCCESSOR_NOT_DEPLOYED`  
**NEXT:** `F10_READONLY_AUTHORITY_GATES__PROJECT_SOURCE_GATES__PROVIDER_ROUTE_GATE__THEN_CLAUDE_CODE`

## Baseline live congelada

La baseline actualmente servida permanece `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`, functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`, runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`, con sucesor F10 live del adapter `app/adapters/tya-canonical-state-semantics-v2.js`, blob `941051c96a26017363acfc72f7e88edbe70c68ba`.

Deploy live preservado: run `33289344796`; Hosting release `sites/cxorbia-backend-dev/releases/1788058988151000`; version `sites/cxorbia-backend-dev/versions/958ed37dde65d592`; 41/41 assets remotos exactos. Row-content/KPI PASS: run `33297814889`, digest `a5a6d0bc1ed109e1c4088d09553e49c860f6d390d187859175c1fd2d19741bb0`.

Nada de la auditoría multiproyecto fue desplegado; por tanto, este live lock no debe confundirse con el source successor actual de la rama.

## Source successor de rama — NO desplegado

El source successor autorizado para continuar diagnóstico contiene:

- `app/adapters/tya-phase-a-operational-sync-v1.js`;
- `backend/runtime/cxorbia-operational-command-provider-v1.mjs`;
- `backend/contracts/cxorbia-project-source-contract-v1.json`;
- `app/adapters/cxorbia-project-operational-source-v1.js`;
- `backend/runtime/cxorbia-project-command-provider-v1.mjs`;
- `app/docs/evidence/F10-OPERATIONAL-AUTHORITY-DEFINITIVE-SOLUTION-20260830.md`;
- `app/docs/evidence/F10-MULTIPROJECT-PROJECT-CONFIG-SOURCE-AUDIT-20260830.md`.

Estos archivos son source-only/fail-closed hasta completar gates. No autorizan provider writes, external writes, HR writes, Make, Gemini, pagos, deploy ni producción.

## Lock reusable de fuente por proyecto

Cada proyecto elige su propia fuente operacional:

- `internal`: CXOrbia/Firestore es autoridad de periodos, visitas e hitos observados;
- `external`: el provider configurado por proyecto es autoridad de periodos, visitas e hitos observados;
- plataforma siempre conserva autoridad de postulaciones, decisiones, usuarios, perfiles, certificaciones, crosswalks y auditoría;
- cuestionario se configura independientemente de la Hoja de Ruta;
- ningún endpoint/proveedor/mes/país/proyecto puede hardcodearse como lógica global;
- Cinépolis es proyecto TyA inicial, no arquitectura global.

## Hard preserve

No restore V182, no nueva candidata/rama/PR/workflow, no copia del servicio Cinépolis para nuevos proyectos, no localStorage como verdad de proyecto, no éxito UI antes de ACK, no dedupe por nombre, no IA simulada presentada como real, no URLs/credenciales privadas en repo.

`app/modules/proyecto-wizard.js` y `app/modules/proyectos.js` quedan **bloqueados para modificación por backend**; sus ajustes focales se documentan para Claude Code después de los gates.

## Pendiente

Cerrar gates read-only del authority repair, project source resolver, create/update durable, aislamiento, fuente interna/externa y provider route sintético controlado. Después generar paquete focal para Claude Code.

**NEXT:** `F10_READONLY_AUTHORITY_GATES__PROJECT_SOURCE_GATES__PROVIDER_ROUTE_GATE__THEN_CLAUDE_CODE`.
