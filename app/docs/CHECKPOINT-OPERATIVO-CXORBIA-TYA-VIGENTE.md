# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7`, draft/open/unmerged

## Plan congelado

Plan blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`; SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`; `providerMutationAuthorizedNow=false`.

G2-B permanece `RECOVERY_NO_PROVIDER_SIDE_EFFECT`, request consumido, sin retry/replay.

## F0 — avance real

- 119 hallazgos clasificados.
- 26 HOLD/P0 descubiertos acumulativamente.
- CP093 contenido; 25 residuales.
- exhaustividad 2/4.
- workflows HEAD/base 105/105 cerrados.
- `.github/cxorbia-firebase-requests` 33/33 cerrados.
- `backend/requests` 6/6 cerrados.
- 18 artefactos prioritarios adicionales de `backend/config` clasificados en Tramo 9.

## P0 actual CP119

Se demostró que la revisión Cloud Run vigente `cxorbia-live-hr-dev-00010-n78` es la misma desplegada por I3 con el gate de escritura de aceptación legal activado. El request histórico está consumido pero registra aceptación humana pendiente y presupuesto futuro de 1 write; el execute marker sigue `enabled=true/consumed=false`.

El runtime actual permite `POST /api/tenants/tya/legal/commands` cuando el env gate está activo, exige identidad Firebase real y confirmación humana, y persiste el recibo provider-backed. Hosting reescribe `/api/tenants/**` al servicio y el adapter protegido conserva el botón de aceptación.

El replay de deploy I3 está ahora fail-closed por el workflow compartido G2-B; el P0 es el **write gate ya desplegado**, no un redeploy automático.

No se ejecutó contención porque no existe autorización vigente de provider mutation. La única contención segura requiere una autorización explícita separada para deshabilitar el env gate en el Cloud Run existente y verificar readback sin otras mutaciones.

## Otros controles

Consumed ledger: política fail-closed correcta para las entradas registradas, pero cobertura histórica no exhaustiva. Evidence aliases: epoch 47 vs lock 50, no ejecutable pero stale.

## Seguridad del tramo

Provider/data/Auth/Firestore/Storage/HR writes=0; deploy=0; recovery=0; synthetic=0; Make/Gemini/pagos=0; merge=false; frontend functional changes=0.

## Siguiente exacto

Continuar F0 read-only sobre el resto de `backend/config` y provider-write entrypoints para cerrar los 2 flags restantes. CP119 queda pendiente de autorización explícita de contención; F1 y G2-B no se inician.
