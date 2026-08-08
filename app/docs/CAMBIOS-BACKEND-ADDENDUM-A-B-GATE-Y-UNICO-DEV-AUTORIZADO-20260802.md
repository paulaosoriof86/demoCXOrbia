# CAMBIOS BACKEND — GATE A+B Y ÚNICO DEV AUTORIZADO

**Fecha:** 2026-08-02  
**Estado:** `AUTHORIZED_EXACT_GATE_THEN_SINGLE_DEV_FOR_VISUAL_CHECKPOINT_1`

## 1. Autorización vigente

Paula autorizó proceder de forma segura y ágil para visualizar la candidata única y acumulativa definitiva.

Alcance exacto:

1. ejecutar el gate source-only A+B sobre el checkout exacto;
2. ejecutar los gates estáticos/cumulativos preservados;
3. detener con `STOP_RETRY` ante cualquier fallo predeploy;
4. solamente si todos los predeploy gates pasan, realizar un único deploy al Hosting DEV existente `cxorbia-backend-dev` target `cxorbia-dev`;
5. ejecutar las verificaciones remotas read-only;
6. detener para Checkpoint Visual 1 de Paula.

No incluye merge ni producción.

## 2. Integración de gate

Se actualizó:

`tools/qa/tya-c6-unified-cumulative-runtime-gate.mjs`

Commit:

`165fd0f9f8f9e4d4cb4c17c3a12804e3e000c9e1`

El gate C6 ahora ejecuta primero:

`tools/qa/tya-ab-cumulative-candidate-source-gate.mjs`

Por tanto, el flujo de deploy existente no puede alcanzar Firebase Hosting sin validar antes:

- manifest A+B;
- Git blobs;
- orden de carga;
- sintaxis;
- unit gate;
- ausencia de llamadas ejecutables a proveedores;
- estado honesto de módulos;
- build-lock aún no congelado.

## 3. Carril de ejecución

Se reutiliza el workflow existente:

`.github/workflows/cxorbia-c6-live-domain-readonly-audit.yml`

No se crea workflow, rama, PR, Firebase o Hosting nuevo.

Destino permitido:

- proyecto: `cxorbia-backend-dev`;
- Hosting: `cxorbia-backend-dev`;
- target: `cxorbia-dev`;
- deploy máximo: 1;
- Cloud Run deploys: 0;
- Firestore/Auth/Rules/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- producción: false.

## 4. Resultado esperado

`PREDEPLOY_PASS → SINGLE_HOSTING_DEV_DEPLOY → REMOTE_READONLY_GATES → CHECKPOINT_VISUAL_1`

Ante fallo:

`STOP_RETRY_NO_SECOND_DEPLOY`.

## 5. Clasificación

- **Reusable CXOrbia:** gate acumulativo obligatorio antes de visualización.
- **Exclusivo cliente:** TyA/Cinépolis y Hosting DEV existente.
- **Claude/prototipo:** revisión visual posterior; cero nueva candidata.
- **Academia:** sin actualización hasta validación visual.
- **Sin impacto Claude:** workflow, gate, hashes y evidencia.
