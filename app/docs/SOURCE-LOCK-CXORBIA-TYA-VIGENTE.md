# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**PHASE_A:** `98/100`

## Fuente funcional y proveedor

Source funcional congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. Source-fix G2-B aislado: `1d2cfecba0a89b637398d747a628e549d9823c68`.

Producción canónica: project `cxorbia-backend-dev`; Hosting `cxorbia-backend-dev`; Cloud Run `cxorbia-live-hr-dev` us-central1.

**Revisión Cloud Run actual:** `cxorbia-live-hr-dev-00011-f2f`.

La revisión actual fue creada exclusivamente por la contención de configuración RC15-CP-119. La imagen del contenedor y la service account permanecieron idénticas a `00010-n78`; no hubo Cloud Build ni Hosting deploy ni cambio de source funcional.

## Plan lock

Plan blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`; SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`; fase F0. El plan no cambió.

## CP119 contenido

La revisión `00010-n78` conservaba el env gate I3 de aceptación legal humana. Mediante autorización explícita se removieron únicamente `CXORBIA_I3_LEGAL_ACCEPTANCE_WRITE_ENABLED` y `CXORBIA_I3_LEGAL_ACCEPTANCE_WRITE_GATE`. La revisión `00011-f2f` sirve 100% del tráfico y devuelve HTTP 423 `LEGAL_RUNTIME_HUMAN_ACCEPTANCE_WRITE_GATE_DISABLED` tanto directo como vía Hosting para el POST legal, antes de autenticación.

Run `32545006587`, job `96961807381`, artifact `9468227008`, digest `sha256:92adc7eee31b3155cb0ac0ee6caff9899b721826e34b5a08632200665355afbc`.

## G2-B histórico vs proveedor actual

El receipt G2-B conserva correctamente su baseline/after histórico `cxorbia-live-hr-dev-00010-n78` y decisión `RECOVERY_NO_PROVIDER_SIDE_EFFECT`. No debe reescribirse retroactivamente.

El proveedor actual, sin embargo, es `00011-f2f` por CP119. Por ello el anterior `FORENSIC_PROVIDER_LANE_READY` ya no puede usarse como readiness vigente: F3 debe revalidar identidad/baseline/config contra `00011-f2f` antes de cualquier recovery. No retry/replay autorizado.

## F0

119 hallazgos; 26 HOLD/P0 acumulados; CP093 y CP119 contenidos; 24 residuales. Exhaustividad 2/4.

## Próximo

Continuar F0 read-only sobre `backend/config` restante, execute markers, ledgers/aliases y provider-write entrypoints. No tocar G2-B.
