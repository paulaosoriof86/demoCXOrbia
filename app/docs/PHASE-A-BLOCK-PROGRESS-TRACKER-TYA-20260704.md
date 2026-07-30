# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__CORTE5_R17N_MATERIALIZED_1406__CXDATA_PERIOD_P0_FIXED__READONLY_RESMOKE_PASS__OPERATIONAL_VISUAL_PENDING`

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

### Post-compare proveedor/identidad completado
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

### Bloque intermedio agregado — P0 runtime RESUELTO
P0 histórico: `P0_PROVEN_C5_CXDATA_PERIOD_MODEL_MISMATCH`.

Causa:
- `app/core/backend-firebase.js` derivaba periodos de los 30 documentos raíz bajo `tenants/tya/projects`;
- no consumía los 14 documentos canónicos de `tenants/tya/projects/cinepolis/periods`;
- `currentPeriodId` podía quedar en `cinepolis`, que es ID de proyecto, no de periodo.

Fix autorizado:
- commit runtime `96cb7601559a76595d6203724a4bcf2d0b35b390`;
- adapter lee periodos desde la subcolección canónica del proyecto activo;
- currentPeriodId se valida contra el conjunto canónico y usa active/último si está stale;
- UI y datos no modificados.

### Re-smoke read-only final — PASS
Run `30544595440`, artifact `8760141578`:
- source=firestore;
- fallback=false;
- CX.data interface preserved;
- projects=1;
- periods=14;
- visits=616;
- currentProjectId=cinepolis;
- currentPeriodId=2026-07;
- period IDs adapter = canonical IDs;
- readOnly/writeMode disabled;
- provider/identity/adapter/period blockers=0.

### Instrumentación QA
Primer intento post-fix `30544254033` mostró periods=0 porque el fake Firestore del smoke omitía `periods`, aunque el mismo gate había leído 14 del proveedor. Se corrigió solo el harness en `21ce464772bfe6543b3672ad4b6d7deafd564adc`; no hubo un segundo runtime fix ni data writes.

### Preservado fuera del write
Tenant update1, existing profile updates22, legacy holds7, cert hold1, Agosto HN, deletes, pagos/lotes, Auth/Storage/HR/legacy writes, merge/producción.

## 4. Estado actual / siguiente exacto
Corte 5 está en:
`TECHNICAL_PASS_PENDING_OPERATIONAL_VISUAL`.

Siguiente secuencia:
`AUTORIZACIÓN BIND DEV READ-ONLY A cxorbia-backend-dev + UN ÚNICO HOSTING DEV CONTROLADO → VALIDACIÓN VISUAL/OPERATIVA CON DATOS REALES → si no aparece P0: FREEZE CORTE 5 → CORTE 6 AUTH/RBAC`.

Criterios visuales mínimos:
- un proyecto padre Cinépolis;
- exactamente 14 periodos canónicos;
- current period canónico;
- histórico y 616 visitas coherentes;
- identidad real por rol;
- 77 certificaciones carryover;
- 572 controles de liquidación sin inferir pago;
- fallback demo/local=false;
- sin fuga de PII.

## 5. Cortes posteriores
- Corte 6: Auth/RBAC, solo después de freeze Corte 5 y con autorización específica para cambios.
- Corte 7: sync HR↔plataforma, evidencias, Make/Gemini con gates.
- Corte 8: preproducción/cutover a Hosting `tya-plataforma`, con autorización específica.

## 6. Claude/prototipo
No nueva candidata. P0 backend está técnicamente cerrado. Claude solo entra ante P0 frontend reproducible posterior o backlog P1/P2.

## 7. Academia
Actualizado con: fuente viva, referencia HR vs perfil canónico, identidad real/source-safe, proyecto padre vs periodo, readback vs consumidor, stable-key, preflight fail-closed, materialización/readback, certificación carryover y liquidación ≠ pago.

## 8. Estado seguro
R17N: Firestore writes autorizados ejecutados 1,406. Fix/re-smoke: provider reads únicamente; Firestore/Auth/Storage/HR/legacy writes=0; deletes=0; pagos/lotes=0; deploy=0; merge=false; producción=false; Make/Gemini=0; PII cruda repo/artifact=0.
