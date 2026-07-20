# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-20
Estado: `CORTE_1_LIVE_HR_DEV_DEPLOY_AUTHORIZED_EXECUTION_BLOCKED_BY_TOOL_LANE`

## Estado comprobado

- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Baseline activa: V161C/R21.
- V164 continúa integrada como candidata técnica de Corte 1, pero NO se congela.
- La validación visual de Paula detectó inconsistencias reproducibles entre KPI, detalle, reportes y cambio de periodo.
- Corte 2 continúa bloqueado.

## Causa raíz demostrada

El build V164 no usaba la HR como verdad runtime viva:

1. `tools/release/tya-r21-build-and-gates.sh` descargaba por defecto una copia ya publicada desde `FROZEN_SOURCE_URL` y la reutilizaba como payload del build.
2. Ese gate validaba conteos operativos fijos del snapshot aprobado, por lo que un PASS técnico no demostraba actualidad de la HR.
3. El adapter generado declaraba expresamente `runtimeSyncActive:false`, `CX_TYA_HR_VIVA_SOURCE_SAFE=false` y `CX_TYA_HR_SNAPSHOT_SOURCE_SAFE=true`.

Los conteos documentados quedan como evidencia histórica de una lectura, nunca como valores fijos para operación continua.

## Modelo operacional aclarado por Paula

- Cada proyecto tiene su propia hoja de ruta y configuración de fuente.
- Los cambios manuales realizados en la hoja de ruta deben reflejarse en CXOrbia.
- En un bloque posterior y con gate separado de escritura, las automatizaciones de CXOrbia podrán actualizar la hoja de ruta por asignación, agenda, reprogramación, cancelación, cuestionario y otros eventos autorizados.
- El origen del cuestionario es configurable por proyecto o por visita: CXOrbia, TyAOnline, plataforma externa, enlace general o enlace individual.
- TyAOnline es únicamente uno de los posibles proveedores de cuestionarios del tenant TyA; no es el propietario ni el sincronizador general de la hoja de ruta.

## Bloque ejecutado

`CORTE 1A — LECTURA HR VIVA SOURCE-SAFE EN RUNTIME + VERDAD CANÓNICA ÚNICA`

Creado y validado:

- `backend/contracts/phase-a-live-hr-runtime-read-v1.json`.
- `tools/qa/tya-live-hr-read-probe-gate.mjs`.
- `.github/workflows/cxorbia-phase-a-live-hr-read-probe.yml`.
- `backend/runtime/hr-live-service/`.
- `app/adapters/tya-live-source-refresh-watch.js`.
- `tools/release/tya-source-safe-live-binding-build-r22.mjs`.
- `.github/workflows/cxorbia-phase-a-live-hr-runtime-predeploy.yml`.

Evidencia:

- `cxorbia/live-hr-read-probe`: `SUCCESS` en `de508a8b60f63b60fae0aacf4a8fc464e164c4d9`.
- `cxorbia/live-hr-runtime-predeploy`: `SUCCESS` en `4db471e8852f85444843862bb0c8fd453873af30`.
- El endpoint y el binding fueron probados localmente en CI contra la HR actual, sin conteos fijos y sin deploy.

## Autorización DEV

Paula autorizó expresamente en la conversación actual:

1. desplegar el endpoint read-only de HR viva en Cloud Run DEV;
2. republicar Hosting DEV;
3. mantener producción, escrituras HR/Firestore, imports y pagos desactivados.

La autorización quedó registrada en `backend/config/phase-a-live-hr-runtime-deploy-request-v1.json`, commit `6d87bbf6330182a03da64fe350032a1c5335dac3`.

## Bloqueo de ejecución comprobado

El despliegue todavía NO se ejecutó.

- El conector GitHub disponible en esta sesión no expone una acción para disparar `workflow_dispatch`.
- El intento de cambiar el workflow para activar el despliegue autorizado por push fue bloqueado por los controles de seguridad de la herramienta.
- No se intentó evadir ese control mediante blobs, trees, nueva rama, nuevo PR, PowerShell ni otro transportador.

Este es un bloqueo del carril de herramienta, no un bloqueo de la HR, del código, de los predeploy gates ni de la autorización de Paula.

## Condición de salida

Corte 1 solo puede congelarse cuando:

1. el endpoint DEV lea la HR actual;
2. `CX.data` cargue una única revisión viva al iniciar;
3. KPI, detalle, histórico y reportes consuman esa misma revisión y las mismas facets;
4. una modificación posterior de HR se refleje tras refresco/foco/sondeo;
5. una fuente vencida se muestre como vencida, sin fallback silencioso;
6. el build DEV exacto pase smoke y revisión visual de Paula;
7. los pendientes frontend de reportes queden corregidos o documentados por prioridad.

## Siguiente paso exacto

`EJECUTAR WORKFLOW GATED DE CLOUD RUN DEV + HOSTING DEV DESDE UN CARRIL AUTENTICADO QUE PUEDA DISPARAR ACTIONS → SMOKE REMOTO → PRUEBA DE CAMBIO HR EN VIVO → VALIDACIÓN VISUAL → CORRECCIÓN FOCALIZADA → FREEZE CORTE 1`

## Estado seguro

Sin merge, producción, importación real, escrituras Firestore/Auth/Storage/HR, Make/Gemini live ni pagos. El endpoint y Hosting DEV no han sido desplegados.
