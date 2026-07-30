# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__R17N_FINAL_DEV_MATERIALIZED_1406__PROVIDER_COMPARE_IDENTITY_PASS__P0_C5_CXDATA_PERIOD_MODEL__RUNTIME_FIX_AUTH_PENDING__NO_PRODUCTION`

## 1. Repositorio y arquitectura
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Legacy a retirar / Hosting público final: `tya-plataforma`.
- Sandbox C4: no destino.
- No nueva base Firebase.

## 2. Corte 3 — FROZEN
`CXORBIA-TYA-CORTE3-V182-20260729`: 14 periodos / 616 visitas hasta julio; mayo 44 pagadas; junio 2 pagadas / 42 pendientes. No V183/R33.

## 3. Fuente e identidad actuales
HR viva hasta julio: 14 periodos, 616 visitas, 208 refs shopper; snapshot 210 refs histórico; Agosto HN HOLD.

Crosswalk final: 208/208 refs ready = 201 reuse existing +2 legacy-create link +5 HR-current create; 0 HOLD. Las 208 referencias resuelven a 194 perfiles canónicos únicos esperados; convergencias determinísticas de referencias no son conflicto ni match por nombre.

Legacy: 149 shoppers únicos; 120 profile creates materializados; 22 existing updates HOLD; 7 legacy HOLD; 77 certificaciones materializadas +1 HOLD.

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

## 5. Post-compare read-only — PASS de proveedor e identidad
Run `30514060348`. Artifact `8748181730`. Digest `sha256:a23f06035043de8568a826aefb52cfce5df9781b3a9b86ccf8238f8fd1c8d3cf`.

### Provider compare
- 1,406/1,406 rutas presentes;
- missing 0;
- authorization drift 0;
- production=true 0;
- tenant no fue actualizado por R17N;
- proyecto padre `cinepolis` presente;
- canonical periods 14;
- visits 616;
- liquidation controls 572;
- certifications 77;
- payments/lots 0/0.

### Identidad
- source refs 208/208;
- targets canónicos únicos 194/194 según mapping R17N;
- 616/616 visitas con nombre real y shopper target existente;
- 194/194 perfiles referenciados con nombre real;
- 77/77 certificaciones apuntan a shopper existente;
- placeholders demo 0.

## 6. P0 demostrado — `P0_C5_CXDATA_PERIOD_MODEL_MISMATCH`
La materialización NO está corrupta. El P0 está en el adapter `app/core/backend-firebase.js`.

Causa reproducible:
1. `loadTenantData()` lee todos los documentos de `tenants/tya/projects`.
2. `buildPeriods(allProjects, activeProjects)` convierte esos project docs en `CX.data.periods`.
3. El adapter no lee `tenants/tya/projects/cinepolis/periods`, donde viven los 14 periodos canónicos materializados.
4. En smoke exacto con padre canónico `cinepolis`: `source=firestore`, `fallback=false`, `projects=1`, `visits=616`, interfaz `CX.data` preservada, read-only preservado, pero `periods=30` y `currentPeriodId=cinepolis`.
5. Esperado: `periods=14`, IDs iguales a la subcolección canónica y `currentPeriodId` dentro de esos 14.

Evidencia: `app/docs/evidence/R17N-POST-MATERIALIZATION-READONLY-SMOKE-LATEST.json`.

## 7. Decisión
`P0_PROVEN__CORTE5_FREEZE_BLOCKED`.

No se corrige automáticamente porque el lock exige autorización expresa de Paula en la conversación actual para modificar runtime ante P0 demostrado.

No repetir los 1,406 writes. No reconstruir la materialización. No tocar módulos UI. No nueva candidata/base/rama/PR.

## 8. Próximo bloque exacto
`AUTORIZACIÓN CORRECCIÓN FOCAL P0-C5-CXDATA-PERIOD-MODEL → PATCH app/core/backend-firebase.js / guard solo si gate demuestra necesidad → POST-COMPARE + CX.data SMOKE READ-ONLY → VALIDACIÓN OPERATIVA → FREEZE CORTE 5 → CORTE 6 AUTH/RBAC`.

La corrección debe preservar:
- proyecto padre `cinepolis`;
- 14 periodos como subcolección;
- 616 visitas y 208 refs;
- identidad real;
- interfaz exacta `CX.data`;
- fail-closed y cero fallback demo;
- cero data writes en la revalidación.

## 9. Claude / Academia
- Claude: sin nueva candidata; P0 es backend/core localizado.
- Academia: proyecto padre vs periodo, source-safe vs identidad operativa, 208 refs vs 194 perfiles canónicos, post-compare fail-closed y liquidación ≠ pago.

## 10. Estado seguro
R17N previo: 1,406 Firestore writes autorizados ya materializados. Este post-compare: provider reads únicamente. Firestore/Auth/Storage/HR/legacy writes=0; deletes=0; pagos=0; deploy=0; merge=false; producción=false; Make/Gemini=0; PII cruda en repo/artifacts=0.
