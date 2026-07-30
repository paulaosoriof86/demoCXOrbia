# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__CORTE5_R17N_MATERIALIZED_1406__PROVIDER_IDENTITY_PASS__P0_CXDATA_PERIOD_MODEL__FIX_AUTH_PENDING`

## 1. Estado general
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Baseline frontend: `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Legacy/Hosting final: `tya-plataforma`.
- No nueva candidata/base/rama/PR.

## 2. Bloques cerrados
### M1 / Corte 1 / Corte 2A
FROZEN/APROBADO.

### Corte 3
FROZEN_ACTIVE_BASELINE:
- 14 periodos /616 visitas;
- mayo 44 pagadas;
- junio 2 pagadas /42 pendientes;
- no V183/R33.

### Corte 4 — preparación backend/identidad/write plan
CERRADO para materialización:
- HR vigente hasta julio: 14 periodos /616 visitas /208 refs;
- identidad 208/208 ready;
- 120 legacy profile creates +5 HR-current profile creates;
- 77 certification creates;
- R17N FINAL 1,406 exact ready writes;
- idempotencia offline PASS.

## 3. Corte 5 — materialización DEV
### Write/readback completado
Autorización `r17n-final-dev-20260730-01` ejecutada y consumida.

- intended 1,406 /absent 1,406 /conflict 0;
- HR identity 208/208;
- canonical existing targets 201/201;
- nombres reales visibles 201/201;
- financial exact visit links 196;
- Firestore writes 1,406;
- readback 1,406/1,406;
- mismatch 0.

Grupos: foundation16 + legacy profiles120 + current-HR profiles5 + certifications77 + visits616 + liquidation controls572.

### Post-compare proveedor/identidad completado
Run `30514060348`:
- materialized paths 1,406/1,406;
- canonical periods 14;
- visits 616;
- liquidation controls 572;
- certifications 77;
- payments/lots 0;
- source refs 208/208;
- canonical shopper target set 194/194;
- visits with real name/valid target 616/616;
- referenced target profiles with real name 194/194;
- certifications with valid shopper 77/77;
- demo placeholders 0.

### Bloque intermedio agregado — P0 runtime
`P0_PROVEN_C5_CXDATA_PERIOD_MODEL_MISMATCH`.

El adapter `app/core/backend-firebase.js` carga correctamente `cinepolis` y sus 616 visitas, pero deriva `CX.data.periods` de los 30 documentos existentes bajo `tenants/tya/projects`, en vez de leer los 14 documentos de `tenants/tya/projects/cinepolis/periods`.

Smoke:
- source=firestore;
- fallback=false;
- CX.data interface preserved;
- readOnly/writeMode disabled;
- projects=1;
- visits=616;
- **periods=30 vs expected 14**;
- **currentPeriodId=cinepolis**, no canonical period ID.

Corte 5 queda `FREEZE_BLOCKED` hasta fix focal backend autorizado y re-smoke PASS.

### Correcciones metodológicas del bloque
1. Pre-write: hash de identidad del executor alineado con R20 (`trim + lowercase`), después de dos HOLD 207 con writes=0.
2. Post-write harness: se eliminó supuesto incorrecto 208 refs = 208 perfiles únicos; mapping exacto demuestra 194 targets canónicos únicos. Primer post-compare fue read-only, cero writes.

### Preservado fuera del write
Tenant update1, existing profile updates22, legacy holds7, cert hold1, Agosto HN, deletes, pagos/lotes, Auth/Storage/HR/legacy writes, deploy/merge/producción.

## 4. Bloque en progreso / siguiente exacto
`AUTORIZACIÓN P0-C5-CXDATA-PERIOD-MODEL → PATCH BACKEND ADAPTER FOCALIZADO → RE-SMOKE READ-ONLY → VALIDACIÓN OPERATIVA → FREEZE CORTE 5`.

Criterios del re-smoke:
- provider post-compare sigue 1,406/1,406;
- parent project `cinepolis`;
- CX.data periods exactamente 14 desde subcolección canónica;
- currentPeriodId pertenece a esos 14;
- visits 616;
- 208 refs /194 canonical targets sin regresión;
- identidad real preservada;
- fallback demo/local = false;
- read-only/writeMode disabled;
- data writes=0.

## 5. Cortes posteriores
- Corte 6: Auth/RBAC, solo después de freeze Corte 5 y con autorización específica para cambios.
- Corte 7: sync HR↔plataforma, evidencias, Make/Gemini con gates.
- Corte 8: preproducción/cutover a Hosting `tya-plataforma`, con autorización específica.

## 6. Claude/prototipo
No nueva candidata. P0 actual es backend/core, no frontend. Claude solo entra ante P0 frontend reproducible posterior o backlog P1/P2.

## 7. Academia
Actualizar: fuente viva, referencia HR vs perfil canónico, identidad real/source-safe, proyecto padre vs periodo, stable-key, preflight fail-closed, materialización/readback y smoke post-write, certificación carryover y liquidación ≠ pago.

## 8. Estado seguro
R17N previo: Firestore writes autorizados ejecutados 1,406. Post-compare: provider reads únicamente; Firestore/Auth/Storage/HR/legacy writes=0; deletes=0; pagos/lotes=0; deploy=0; merge=false; producción=false; Make/Gemini=0; PII cruda repo/artifact=0.
