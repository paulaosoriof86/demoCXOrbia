# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__CORTE5_R17N_MATERIALIZED_1406__CXDATA_TECH_PASS__EXISTING_HOSTING_VISUAL_AUTH_PREREQUISITE__DEPLOY0`

## 1. Estado general
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Baseline frontend: `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Hosting DEV visual existente: `cxorbia-backend-dev.web.app`, target `cxorbia-dev`.
- Legacy/Hosting final: `tya-plataforma`.
- No nueva candidata/base/rama/PR/Hosting.

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
- identidad 208/208 ready →194 perfiles canónicos únicos;
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

### Post-compare proveedor/identidad
PASS:
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

### P0 runtime — resuelto
`P0_PROVEN_C5_CXDATA_PERIOD_MODEL_MISMATCH` fue corregido focalmente en `app/core/backend-firebase.js`.

Re-smoke final `30544595440`: source=firestore, fallback=false, projects=1, periods=14, visits=616, currentProjectId=cinepolis, currentPeriodId=2026-07, IDs canónicos exactos, read-only preservado, blockers 0.

### Bloque intermedio agregado — preflight visual seguro
Paula autorizó un único redeploy del Hosting DEV ya existente. El preflight verificó el mismo sitio/target y **detuvo antes del deploy** porque el navegador requiere Firebase Auth/claims para leer PII real protegida.

- new Hosting=false;
- new Firebase project=false;
- authorized deploy max=1;
- deploy executed=0;
- authorization consumed=false;
- Firestore rules requieren `request.auth` + role/tenant;
- login actual de UI = selector de rol, no Auth Firebase;
- autorización actual prohíbe Auth writes/Rules deploy;
- no se publican credenciales/tokens/PII como atajo.

Esto no reabre materialización ni CX.data. Es una dependencia de seguridad de la visualización real.

### Preservado fuera del write
Tenant update1, existing profile updates22, legacy holds7, cert hold1, Agosto HN, deletes, pagos/lotes, Auth/Storage/HR/legacy writes, producción.

## 4. Bloque en progreso / siguiente exacto
`CORTE 6 AUTH/RBAC PREPARATION READ-ONLY/OFFLINE → INVENTARIO/RECONCILIACIÓN DE AUTH EXISTENTE → CLAIMS/RULES/LOGIN SEGURO → autorización específica solo para cambios provider mínimos → REUTILIZAR EL MISMO HOSTING DEV + el redeploy ya autorizado → VALIDACIÓN VISUAL REAL → FREEZE`.

No pedir otra autorización de Hosting mientras `hostingDeployExecutions=0`.

## 5. Criterios para la visual posterior
- usuario Firebase autenticado y claims válidos;
- ninguna credencial en repo/URL/Hosting;
- tenant `tya` y proyecto `cinepolis`;
- 14 periodos /616 visitas;
- 208 refs /194 canonical targets sin regresión;
- identidad real visible solo por rol;
- 77 certificaciones;
- 572 controles, pagos no inferidos;
- fallback demo/local=false;
- data writes=0 durante validación.

## 6. Cortes posteriores
- Corte 6: Auth/RBAC seguro, ahora prerequisito técnico de la visual real de Corte 5.
- Corte 7: sync HR↔plataforma, evidencias, Make/Gemini con gates.
- Corte 8: preproducción/cutover a Hosting `tya-plataforma`, con autorización específica.

## 7. Claude/prototipo
No nueva candidata. El pendiente relevante es login/Auth real; no se sustituye por selector de rol ni se parchea con credenciales embebidas. Claude solo entra con tarea focalizada o P0 frontend reproducible.

## 8. Academia
Actualizar: fuente viva, referencia HR vs perfil canónico, identidad real/source-safe, proyecto padre vs periodo, Auth vs selección de rol, preflight fail-closed, materialización/readback y liquidación ≠ pago.

## 9. Estado seguro
R17N: Firestore writes autorizados ejecutados 1,406. Bloque actual: Hosting deploy=0; Firestore/Auth/Storage/HR/legacy writes=0; Rules/Functions deploy=0; deletes=0; pagos/lotes=0; merge=false; producción=false; Make/Gemini=0; PII cruda repo/artifact=0.
