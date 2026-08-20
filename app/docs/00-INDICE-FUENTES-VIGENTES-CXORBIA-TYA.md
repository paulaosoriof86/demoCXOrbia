# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I5-PREPROD-CREATOR-BLOCKED-39`  
**Estado:** `I4_FROZEN_PASS__I5_2_PREPROD_PROJECT_CREATOR_AUTH_BLOCKED__85_15`

## Orden obligatorio vigente

1. `EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`
2. `SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`
5. addendum prevalente de empalme/carril file-aware y Plan Lock Phase A
6. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`, `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`
7. `ACADEMIA-ADDENDUM-I4-PROTECTED-RUNTIME-CLOSE-20260819.md`
8. PR #7 y HEAD de `docs-tya-v6-v71-audit`

Sigue vigente `ADDENDUM-MAESTRO-PRIORIDAD-GO-LIVE-FINANZAS-ANTES-MAKE-20260819.md`.

## I1–I4 — CERRADOS / NO REPROCESAR

I1 `15/15`, I2 `20/20`, I3 `25/25`, I4 `25/25`: `PASS/FROZEN`. Producto funcional congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. No reabrir Auth, Shopper, Finanzas, multi-proyecto, documentos, reservas, certificaciones o Academia sin P0 nuevo reproducible.

**Score formal:** **85% / 15% pendiente**. El porcentaje no equivale a producción autorizada.

## I5 — evidencia PREPROD actual

Paula autorizó crear/configurar un Firebase PREPROD nuevo y limpio y un único Hosting PREPROD de `f9802f...` + UAT read-only, sin merge/producción ni writes de datos/HR/Auth/Storage/Make/Gemini/pagos.

### Intento autorizado de creación PREPROD
- target: `cxorbia-preprod-20260819`;
- run `32332125828`, job `96314651567`, artifact `9393386559`;
- decisión: `HOLD_I5_2_PREPROD`;
- el target no existía entre los proyectos accesibles;
- se intentó exactamente un `firebase projects:create`, pero **0 proyectos fueron creados**;
- **0 Hosting PREPROD deploys**, UAT no ejecutado, DEV no reutilizado/copied, 0 business/provider data writes.

### Root cause read-only
- run `32332360361`, artifact `9393462199`: `PASS_I5_PREPROD_PROJECT_CREATE_ROOT_CAUSE_READONLY`;
- la identidad DEV no pudo demostrar `resourcemanager.projects.create`; no ve organización/parent creator scope.

### Creator-route preflight definitivo
- run `32332788919`, job `96316503352`, artifact `9393599029`;
- decisión: `HOLD_I5_NO_EXISTING_CREATOR_ROUTE_AUTHENTICATES`;
- `CXORBIA_GCP_PROJECT_CREATOR_JSON`: ausente;
- `GOOGLE_CLOUD_PROJECT_CREATOR_JSON`: ausente;
- `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`: presente, autenticó, ve 2 proyectos, 0 organizaciones y **no tiene capacidad de creación de proyectos demostrada**;
- provider writes 0, project creates 0, deploys 0.

## Frontera viva

`I5_2_PREPROD_PROJECT_CREATOR_AUTH_BLOCKED`

### Siguiente gate exacto

`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED`

No reintentar `projects:create` hasta que exista una identidad separada con capacidad mínima de Project Creator demostrada, o se autorice explícitamente un cambio IAM mínimo sobre una identidad de provisión. IAM writes/creación de credenciales no están incluidos en el gate read-only y requieren autorización aparte.

Una vez demostrada la capacidad, se puede reemitir el request PREPROD bajo la autorización original, porque el intento anterior produjo 0 proyectos creados y 0 Hosting PREPROD deploys.

## Seguridad

Estado seguro vigente: 0 proyectos PREPROD creados, 0 Hosting PREPROD deploys, 0 PREPROD UAT, 0 Auth/Firestore/Storage/HR/Make/Gemini/payment writes, 0 merge y 0 producción. I4 sigue intacto.
