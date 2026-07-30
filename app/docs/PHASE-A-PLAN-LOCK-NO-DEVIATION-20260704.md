# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-30  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN__R17N_FINAL_DEV_MATERIALIZED_1406__PROVIDER_COMPARE_IDENTITY_PASS__P0_C5_CXDATA_PERIOD_MODEL__RUNTIME_FIX_AUTH_PENDING__NO_PRODUCTION`

## 1. Objetivo
Operar TyA/Cinépolis como primer tenant/proyecto configurable de CXOrbia con HR/histórico, shoppers reales, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización.

Arquitectura vinculante:
- `tya-plataforma` = legacy a retirar + Hosting/URL pública final;
- `cxorbia-backend-dev` = backend DEV canónico, reutilizado;
- sandbox C4 = no destino;
- proyecto padre `cinepolis`; meses = periodos;
- identidad real en backend/UI autorizada; source-safe solo para repo/log/evidencia.

## 2. Secuencia obligatoria
`FUENTE VIVA → INVENTARIO/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE → WRITE PLAN → DRY-RUN/IDEMPOTENCIA → WRITE EXACTO AUTORIZADO → READBACK/POST-COMPARE → SMOKE → VALIDACIÓN OPERATIVA → FREEZE/CUTOVER`

Para candidatas frontend continúa `EXECUTION_LANE_READY → AUDITORÍA → GO/P0 → APPLY_DELTA_DIRECTLY`.

## 3. Cortes cerrados
- M1 / Corte 1 / Corte 2A: `FROZEN/APROBADO`.
- Corte 3: `FROZEN_ACTIVE_BASELINE` en `CXORBIA-TYA-CORTE3-V182-20260729`.
- Corte 3 conserva 14 periodos / 616 visitas; mayo 44 pagadas; junio 2 pagadas /42 pendientes; no V183/R33.

## 4. Fuente actual y reconciliación
HR actual hasta julio: 14 periodos, 616 visitas, 208 refs shopper; snapshot 210 refs histórico; Agosto HN HOLD.

Identidad: 201 refs reuse canonical existing +2 link a legacy create +5 create desde HR actual = 208/208 ready, 0 HOLD. Las 208 referencias resuelven a 194 perfiles canónicos únicos según mapping estable; no se deduplica por nombre.

Legacy: 149 shoppers únicos; 120 profile create materializados; 22 stable-linked updates HOLD; 7 legacy HOLD; 78 certificaciones útiles =77 materializadas +1 HOLD.

R14C preserva 247 filas financieras, 196 links exactos por `visitId` y 51 reviews. No se reactiva snapshot shopper=210.

## 5. Corte 5 — MATERIALIZACIÓN DEV
**Estado de write: MATERIALIZED + READBACK PASS. Estado operativo: FREEZE BLOQUEADO POR P0 CX.data.**

Autorización consumida: `r17n-final-dev-20260730-01`.

Preflight/write:
- 1,406 intended /1,406 absent /0 conflictos;
- HR identity recheck 208/208;
- 201/201 targets existentes con nombre real visible;
- 196 links financieros exactos;
- **1,406 Firestore writes**;
- **1,406/1,406 readback PASS**;
- mismatch 0.

Grupos: foundation16 + legacy profiles120 + HR-current profiles5 + certifications77 + visits616 + liquidation controls572.

Fuera: tenant update1, existing updates22, legacy holds7, cert hold1, Agosto HN, deletes, pagos/lotes, Auth/Storage/HR/legacy writes, deploy/merge/producción.

## 6. Post-write provider compare + identidad
Run read-only `30514060348`:
- 1,406/1,406 rutas presentes;
- missing/auth drift/production drift = 0/0/0;
- canonical project `cinepolis` presente;
- 14 periodos, 616 visitas, 572 controles, 77 certificaciones;
- payments/lots 0/0;
- 208/208 refs y 194/194 targets canónicos esperados;
- 616/616 visitas con identidad real y target válido;
- 194/194 perfiles referenciados con nombre real;
- 77/77 certificaciones con shopper válido;
- placeholder demo 0.

Proveedor y datos materializados: **PASS**.

## 7. P0 Corte 5 — modelo de periodos en CX.data
**Decisión: `P0_PROVEN_C5_CXDATA_PERIOD_MODEL_MISMATCH`.**

Smoke del adapter real `app/core/backend-firebase.js`, con la data Firestore real mantenida solo en memoria:
- source `firestore`: PASS;
- fallback demo: false;
- interfaz CX.data: preservada;
- read-only/writeMode disabled: preservados;
- canonical parent `cinepolis`: cargado;
- visitas: 616 PASS;
- periodos: **30 observados vs 14 canónicos**;
- `currentPeriodId`: **`cinepolis`**, no un ID de la subcolección canónica.

Causa raíz localizada:
- `loadTenantData()` obtiene `tenants/tya/projects`;
- `buildPeriods()` infiere un periodo por cada documento de proyecto;
- el adapter no lee `tenants/tya/projects/cinepolis/periods`.

El P0 no invalida la materialización ni autoriza rehacerla. Se corrige focalizadamente en backend/core únicamente después de autorización expresa.

## 8. Gate actual
`AUTORIZACIÓN EXPRESA P0-C5-CXDATA-PERIOD-MODEL → PATCH BACKEND FOCALIZADO → POST-COMPARE/SMOKE READ-ONLY → VALIDACIÓN OPERATIVA → FREEZE CORTE 5`.

No iniciar Corte 6 antes del PASS del smoke corregido.

## 9. Corte 6 — Auth/RBAC
Después del freeze Corte 5: reutilizar Auth DEV existente; claims por persona/rol/tenant/project/country; proteger PII por Rules/RBAC. No importar Auth legacy a ciegas. Cualquier Auth change requiere autorización específica.

## 10. Corte 7 — sincronización/evidencias
HR↔plataforma con stable keys, no duplicación, reviewQueue, evidencias protegidas y cuestionario configurable. Make/Gemini solo con gate y revisión humana.

## 11. Corte 8 — preproducción/cutover
Cortes previos congelados, refresh delta final si aplica, rollback probado, smoke integral y cutover sobre Hosting/URL `tya-plataforma` con autorización específica; no cambiar URL pública.

## 12. Claude/prototipo
No nueva candidata. No reabrir V182. P0 actual está localizado en backend adapter, no en módulos UI. Claude interviene solo si un smoke posterior demuestra un P0 frontend reproducible o por backlog P1/P2.

## 13. Academia
Actualizar manuales/cursos/rutas con: fuente viva vs snapshot, referencia HR vs perfil canónico, identidad operativa vs source-safe, proyecto padre vs periodo, preflight fail-closed, materialización/readback y liquidación ≠ pago.

## 14. Estado seguro
R17N: 1,406 Firestore writes autorizados ya ejecutados. Post-compare actual: provider reads únicamente; Firestore/Auth/Storage/HR/legacy writes=0; deletes=0; pagos/lotes=0; deploy=0; merge=false; producción=false; Make/Gemini=0; PII cruda en repo/artifacts=0.
