# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**PHASE_A:** `98/100`

## Fuente funcional y proveedor

Source funcional congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. Source-fix G2-B aislado: `1d2cfecba0a89b637398d747a628e549d9823c68`.

Producción canónica: project `cxorbia-backend-dev`; Hosting `cxorbia-backend-dev`; Cloud Run `cxorbia-live-hr-dev` us-central1. Última revisión provider conocida y fijada por continuity lock: `cxorbia-live-hr-dev-00010-n78`.

## Plan lock

Plan blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`; SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`; fase F0; provider mutation no autorizada.

## Nuevo P0 de runtime vigente

RC15-CP-119 demuestra que la revisión `00010-n78` corresponde al despliegue I3 que activó por env `CXORBIA_I3_LEGAL_ACCEPTANCE_WRITE_ENABLED=true` + gate `PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME` para permitir hasta una aceptación legal humana provider-backed. El request fue posteriormente consumido, pero no existe una revisión Cloud Run posterior que haya desactivado ese env gate.

Source actual de `legal-runtime.mjs`, `server.mjs`, `firebase.json` y el adapter legal conservan la ruta y el mecanismo de escritura condicionado a confirmación humana real. Por tanto, el provider source lock debe considerar el write gate desplegado como P0 pendiente de contención, no como una autorización vigente.

No modificar provider/source/release para contenerlo sin autorización explícita actual. Cualquier futura contención debe apuntar únicamente al existing Cloud Run, deshabilitar el gate y probar readback, sin otros writes/deploys no autorizados.

## F0

119 hallazgos; 26 HOLD/P0 acumulados; CP093 contenido; 25 residuales. Exhaustividad 2/4. Inventarios cerrados: workflows 105/105, `.github/cxorbia-firebase-requests` 33/33, `backend/requests` 6/6.

## Próximo

Continuar F0 read-only sobre `backend/config` restante y provider-write entrypoints. CP119 espera autorización separada. No tocar G2-B.
