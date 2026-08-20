# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-EXISTING-CLEAN-PROJECT-PROMOTION-RESTORED-42`  
**Estado:** `I4_FROZEN_PASS__I5_EXISTING_CLEAN_PROJECT_PROMOTION_TOPOLOGY_RESTORED`  
**Frontera:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**Subestado:** `I5_EXISTING_PROJECT_PRECUTOVER_EVIDENCE_RECONCILIATION`  
**Score formal:** `85% / 15%`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` existente, draft/open/no merge

## 1. Corte de continuidad

I1–I4 están cerrados/frozen. El producto funcional sigue siendo `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. No volver a Auth, Shopper, Finanzas, nueva candidata, nueva rama/PR o auditoría general.

## 2. Topología productiva recuperada

El contrato `backend/config/cxorbia-production-promotion-contract.json`, autorizado el 2026-08-06, ya había resuelto la estrategia de producción:

`PROMOTE_EXISTING_CLEAN_PROJECT` → `cxorbia-backend-dev`.

También acepta expresamente los identificadores actuales y la URL existente como producción futura.

Destino:

- project `cxorbia-backend-dev`;
- Hosting target `cxorbia-dev`;
- Hosting site `cxorbia-backend-dev`;
- URL `https://cxorbia-backend-dev.web.app`;
- Cloud Run `cxorbia-live-hr-dev` / `us-central1`.

## 3. Separación de ambientes

- `cxorbia-backend-dev`: backend limpio canónico y proyecto a promover.
- `cxorbia-tya-dev-260729-c4`: sandbox técnico Corte 4; no destino Phase A.
- `tya-plataforma`: legacy; no reutilizar como backend nuevo; conservar intacto hasta cutover autorizado.
- `cxorbia-preprod-20260819`: nunca creado y retirado de la ruta canónica.

## 4. Build remota ya existente

Run `32328316954`, artifact `9392151808`:

- `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`;
- source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`;
- `remoteExactByteParity=true`;
- exactamente 1 Hosting deploy al sitio existente;
- 0 writes de negocio/provider.

## 5. Causa del descarrilamiento cerrada

El request I5 posterior convirtió erróneamente “validación previa al go-live” en “crear otro proyecto PREPROD”. Eso contradijo el contrato de promoción ya autorizado y `app/core/backend-config.js`, que declara `newCleanProjectRequired=false` y `cxorbia-backend-dev` como canonical/migration target.

No se ejecuta el carril de creación de proyecto ni Project Creator.

## 6. Circuit breaker anti-bucle

- no crear `cxorbia-preprod-20260819`;
- no pedir Project Creator para ese target;
- no repetir diagnóstico de service-account project creation;
- no reutilizar `cxorbia-tya-dev-260729-c4` como destino Phase A;
- no tocar `tya-plataforma` antes del cutover explícito;
- no reabrir I1–I4;
- no crear workflow/rama/PR nuevos.

## 7. Siguiente movimiento exacto

`I5_EXISTING_PROJECT_PRECUTOVER_EVIDENCE_RECONCILIATION`

Reconciliar los seis gates ya definidos en el contrato de promoción contra evidencia terminal actual. Si un gate ya está satisfecho por I1–I4, se reutiliza y congela; solo una brecha real permanece pendiente.

## 8. Estado seguro

Sin deploy adicional, sin provider writes, sin HR/Firestore/Auth/Rules/Storage writes, sin Make/Gemini/pagos, sin merge y sin producción. Formalmente continúa `85/100` hasta cerrar I5.

## 9. Clasificación

- **Reusable CXOrbia:** precedencia de contrato explícito de promoción y separación de canonical backend/sandbox/legacy.
- **Exclusivo TyA:** promoción futura de `cxorbia-backend-dev` y retiro posterior de `tya-plataforma`.
- **Claude/prototipo:** sin cambio frontend.
- **Academia:** sin cambio funcional; continuidad de ambientes.
- **Sin impacto Claude:** reconciliación de go-live y provider topology.
