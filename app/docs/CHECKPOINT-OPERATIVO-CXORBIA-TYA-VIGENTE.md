# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__R17N_FINAL_DEV_MATERIALIZED_1406__C5_CXDATA_PERIOD_MODEL_FIXED__READONLY_RESMOKE_PASS__EXISTING_HOSTING_VISUAL_PREFLIGHT_AUTH_HOLD__DEPLOY0__NO_PRODUCTION`

## 1. Repositorio y arquitectura
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Legacy a retirar / Hosting público final: `tya-plataforma`.
- Hosting DEV de visualización existente: `cxorbia-backend-dev` / target `cxorbia-dev` / `https://cxorbia-backend-dev.web.app`.
- Sandbox C4: no destino.
- No nueva base Firebase ni nuevo Hosting.

## 2. Corte 3 — FROZEN
`CXORBIA-TYA-CORTE3-V182-20260729`: 14 periodos / 616 visitas hasta julio; mayo 44 pagadas; junio 2 pagadas / 42 pendientes. No V183/R33.

## 3. Fuente e identidad actuales
- HR viva hasta julio: 14 periodos, 616 visitas, 208 refs shopper; snapshot 210 refs histórico; Agosto HN HOLD.
- Crosswalk: 208/208 refs ready; resuelven a 194 perfiles canónicos únicos esperados.
- Legacy: 149 shoppers únicos; 120 profile creates materializados; 22 existing updates HOLD; 7 legacy HOLD; 77 certificaciones materializadas +1 HOLD.

## 4. R17N FINAL — MATERIALIZACIÓN DEV PASS
Autorización consumida: `r17n-final-dev-20260730-01`.

- preflight 1,406 intended /1,406 absent /0 conflict;
- HR identity recheck 208/208;
- 201/201 targets canónicos existentes con nombre real visible;
- 196 links financieros exactos;
- Firestore writes **1,406/1,406**;
- readback **1,406/1,406**;
- mismatch 0.

Grupos: foundation16 + legacy profiles120 + HR profiles5 + certifications77 + visits616 + liquidation controls572.

Excluido: tenant update1, updates22, legacy holds7, cert hold1, Agosto HN, deletes, pagos/lotes, Auth/Storage/HR/legacy writes, deploy/merge/producción.

## 5. P0 Corte 5 — CORREGIDO TÉCNICAMENTE
P0 histórico: `P0_C5_CXDATA_PERIOD_MODEL_MISMATCH`.

Causa raíz confirmada:
- `app/core/backend-firebase.js` derivaba `CX.data.periods` de documentos raíz `tenants/tya/projects`;
- no consumía la subcolección canónica `tenants/tya/projects/cinepolis/periods`;
- además podía conservar un `currentPeriodId` stale que no perteneciera al conjunto canónico.

Corrección focal autorizada:
- runtime commit `96cb7601559a76595d6203724a4bcf2d0b35b390`;
- `CX.data.periods` ahora lee periodos canónicos de la subcolección del proyecto activo;
- los project docs ya no se transforman en periodos;
- `currentPeriodId` se conserva solo si pertenece al conjunto canónico; si no, usa el periodo activo/último canónico;
- no se tocaron módulos UI ni datos Firestore.

## 6. Re-smoke read-only — PASS
Run final: `30544595440`.  
Artifact: `8760141578`.  
Digest: `sha256:337c4e8b07786effea5c326c77dfb31f9edc2fa49e09d7e46e18fa4c8dacbc98`.

Provider:
- 1,406/1,406 rutas presentes;
- missing 0;
- authorization drift 0;
- production=true 0;
- proyecto padre `cinepolis` presente;
- 14 periodos canónicos;
- 616 visitas;
- 572 controles de liquidación;
- 77 certificaciones;
- payments/lots 0/0;
- tenant sin update R17N.

Identidad:
- source refs 208/208;
- perfiles canónicos únicos referenciados 194/194;
- 616/616 visitas con nombre real y shopper existente;
- 194/194 perfiles referenciados con nombre real;
- 77/77 certificaciones con shopper existente;
- placeholders demo 0.

CX.data:
- `source=firestore`;
- `fallbackUsed=false`;
- interfaz preservada;
- projects=1;
- periods=14;
- visits=616;
- currentProjectId=`cinepolis`;
- currentPeriodId=`2026-07`;
- IDs de periodos del adapter = IDs canónicos exactos;
- currentPeriodId pertenece al conjunto canónico;
- read-only/writeMode disabled;
- blockers 0.

## 7. Incidencia de instrumentación cerrada
El primer intento post-fix `30544254033` mostró `periods=0` porque el snapshot Firestore simulado por el smoke no incluía los 14 documentos de `periods`, aunque el bloque provider sí los había leído y validado. No demostró una regresión runtime.

Se corrigió únicamente el harness QA para incluir en memoria la misma colección canónica ya leída del proveedor (`21ce464772bfe6543b3672ad4b6d7deafd564adc`). El rerun final pasó. No hubo data writes ni un segundo runtime fix.

## 8. Preflight del Hosting DEV existente — HOLD antes de deploy
Paula autorizó un único redeploy del **Hosting DEV ya existente**, no uno nuevo.

Verificado:
- `.firebaserc` apunta `cxorbia-backend-dev` + target `cxorbia-dev` al sitio existente `cxorbia-backend-dev`;
- el Hosting histórico de validación es `https://cxorbia-backend-dev.web.app`;
- nuevo Hosting requerido: **no**;
- nuevo proyecto Firebase requerido: **no**.

El redeploy no se ejecutó porque el preflight fail-closed demostró una dependencia previa de Auth:
- las reglas Firestore requieren `request.auth` + rol/tenant para leer la data real protegida;
- `index-backend-dev.html` carga `backend-firebase.js` con preview Auth y el helper local de credenciales no puede publicarse;
- el login visible actual selecciona rol de UI, pero no autentica ante Firebase;
- la autorización vigente excluye Auth writes/Rules deploy;
- publicar passwords/tokens/service account o PII en Hosting/URL está prohibido.

Request one-shot: `backend/config/phase-a-hosting-dev-execution-request-v1.json` = `preflight_hold_auth_required_no_deploy`, `hostingDeployExecutions=0`, `consumed=false`.

## 9. Decisión actual
`CORTE5_TECHNICAL_PASS__VISUAL_BLOCKED_BY_SECURE_AUTH_PREREQUISITE__DEPLOY_NOT_CONSUMED`.

No repetir los 1,406 writes. No reconstruir materialización. No nueva base/candidata/rama/PR/Hosting. No UI patch inseguro.

La autorización del único redeploy queda reservada; no debe pedirse otra autorización de Hosting mientras permanezca sin consumir.

## 10. Siguiente bloque exacto
`CORTE 6 AUTH/RBAC PREPARATION READ-ONLY/OFFLINE → reconciliar 17 usuarios Auth existentes y claim taxonomy sin PII → definir cambios mínimos Auth/Rules/login seguro → autorización solo para cambios Auth/Rules estrictamente necesarios → reutilizar EL MISMO Hosting DEV y el redeploy ya autorizado → validación visual con datos reales → freeze`.

No tocar `tya-plataforma` todavía.

## 11. Claude / Academia
- Claude: no nueva candidata. El login visible debe evolucionar a autenticación real para producción; no se parchea desde backend ni se exponen credenciales.
- Academia: selección de rol ≠ autenticación; Hosting con PII requiere Auth/RBAC; proyecto padre y periodo son objetos distintos; liquidación no equivale a pago.

## 12. Estado seguro
R17N histórico: 1,406 Firestore writes autorizados ya materializados. En el bloque actual: Hosting deploy=0; nuevo Hosting/proyecto=0; Firestore/Auth/Storage/HR/legacy writes=0; Rules/Functions deploy=0; deletes=0; pagos=0; merge=false; producción=false; Make/Gemini=0; PII cruda en repo/artifacts=0.
