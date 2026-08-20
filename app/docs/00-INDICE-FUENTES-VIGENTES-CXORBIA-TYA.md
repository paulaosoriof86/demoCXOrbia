# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260820-I5-PROVIDER-USER-AUTH-ROUTE-REQUIRED-41`  
**Estado:** `I4_FROZEN_PASS__I5_2_SERVICE_ACCOUNT_PARENT_UNAVAILABLE_USER_AUTH_ROUTE_REQUIRED__85_15`

## Orden obligatorio vigente

1. `EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`
2. `SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`
5. addendum prevalente de empalme/carril file-aware y Plan Lock Phase A
6. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`, `CAMBIOS-BACKEND.md` + `CAMBIOS-BACKEND-ADDENDUM-I5-PROVIDER-USER-AUTH-ROOT-CAUSE-20260820.md`, `RESUMEN-PARA-CLAUDE.md` + `RESUMEN-PARA-CLAUDE-ADDENDUM-I5-PROVIDER-USER-AUTH-ROOT-CAUSE-20260820.md`, `PENDIENTES-PROTOTIPO.md` + `PENDIENTES-PROTOTIPO-ADDENDUM-I5-PROVIDER-USER-AUTH-ROOT-CAUSE-20260820.md`
7. `ACADEMIA-ADDENDUM-I5-PROVIDER-USER-AUTH-ROOT-CAUSE-20260820.md` y `ACADEMIA-ADDENDUM-I4-PROTECTED-RUNTIME-CLOSE-20260819.md`
8. PR #7 y HEAD de `docs-tya-v6-v71-audit`

Sigue vigente `ADDENDUM-MAESTRO-PRIORIDAD-GO-LIVE-FINANZAS-ANTES-MAKE-20260819.md`.

## I1–I4 — CERRADOS / NO REPROCESAR

I1 `15/15`, I2 `20/20`, I3 `25/25`, I4 `25/25`: `PASS/FROZEN`. Producto funcional congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. No reabrir Auth, Shopper, Finanzas, multi-proyecto, documentos, reservas, certificaciones o Academia sin P0 nuevo reproducible.

**Score formal:** **85% / 15% pendiente**. El porcentaje no equivale a producción autorizada.

## I5 — evidencia PREPROD actual

La autorización PREPROD sigue vigente para crear/configurar un Firebase PREPROD nuevo y limpio y un único Hosting PREPROD de `f9802f...` + UAT read-only, sin merge/producción ni writes de datos/HR/Auth/Storage/Make/Gemini/pagos.

### Intento previo de creación PREPROD
- target: `cxorbia-preprod-20260819`;
- run `32332125828`, job `96314651567`, artifact `9393386559`;
- 0 proyectos creados;
- 0 Hosting PREPROD deploys;
- 0 UAT;
- 0 writes.

### Creator-route provider read-only
- run `32332788919`, job `96316503352`, artifact `9393599029`;
- dedicated creator secret: ausente;
- alternate creator secret: ausente;
- service account DEV: `firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com`, presente/autenticada;
- 2 proyectos visibles, 0 organizaciones, 0 parent probes;
- `resourcemanager.projects.create` no demostrado.

## Causa raíz I5 — PROBADA

Google Cloud documenta que una service account solo puede crear proyectos dentro de Organization y debe especificar parent. `roles/resourcemanager.projectCreator` se concede en Folder/Organization. Con 0 Organization/Folder parent detectados, otorgar Project Creator a la service account DEV no resuelve un proyecto standalone PREPROD.

Referencias oficiales:
- https://docs.cloud.google.com/resource-manager/docs/creating-managing-projects
- https://docs.cloud.google.com/iam/docs/roles-permissions/resourcemanager

## Autorizaciones vigentes

La autorización IAM mínima y la autorización PREPROD permanecen vigentes y no requieren repetición. El IAM grant no se marca consumido porque no hubo write terminal.

## Frontera viva

`I5_2_PREPROD_SERVICE_ACCOUNT_PARENT_UNAVAILABLE_USER_AUTH_ROUTE_REQUIRED`

### Siguiente gate exacto

`USER_AUTHENTICATED_PREPROD_PROJECT_CREATION_HANDOFF`

El bloqueo actual es técnico de control-plane: falta una sesión Google Cloud/Firebase autenticada como usuario capaz de crear el proyecto standalone `cxorbia-preprod-20260819`. El entorno conectado actual no expone esa sesión ni un conector provider-admin equivalente.

No repetir creator preflight con la service account DEV, no crear identidad/key/Organization/Folder, no crear workflow/rama/PR nuevos y no reabrir I1–I4.

Después de materializar el proyecto, resolver por gate separado la identidad mínima de deploy PREPROD antes del único Hosting; ningún nuevo IAM grant se presume.

## Seguridad

Estado seguro vigente: 0 proyectos PREPROD creados, 0 Hosting PREPROD deploys, 0 PREPROD UAT, 0 IAM writes posteriores a la autorización, 0 Auth/Firestore/Storage/HR/Make/Gemini/payment writes, 0 merge y 0 producción. I4 sigue intacto.
