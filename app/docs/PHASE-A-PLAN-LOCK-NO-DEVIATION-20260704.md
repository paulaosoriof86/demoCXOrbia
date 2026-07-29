# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-29  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_READONLY_HARDENED_PROVIDER_IDENTITY_PENDING`

## 1. Objetivo

Operar TyA/Cinépolis como proyecto configurable con HR/histórico, shoppers, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización, sobre base nueva sin conectar/copiar la base vieja.

## 2. Secuencia por corte

`FUENTE → MAPPING/ADAPTER → GATES → BUILD → VALIDACIÓN VISUAL → CORRECCIÓN FOCALIZADA → FREEZE`

Un PASS técnico sin validación real no congela un corte.

## 3. Carril de candidatas

`EXECUTION_LANE_READY → AUDITORÍA DELTA → P0_PROVEN o GO → si GO APPLY_DELTA_DIRECTLY → COMMIT/PUSH → POST-GATES → HOSTING DEV → VALIDACIÓN → FREEZE`

No se sustituye por nueva rama/PR, workflow transportador, PowerShell, incoming, composite, tree directo ni acción manual de Paula.

Una falla reproducible después del empalme se corrige focalizadamente en backend/contratos/adapters/tools o se documenta para Claude si pertenece al frontend. No genera por sí sola nueva candidata o reauditoría.

## 4. Cortes cerrados

### M1 / Corte 1 / Corte 2A

`FROZEN/APROBADO`.

- source lock `d057d77c9117d9d451cfc9a6563083b78b926d57`;
- 14 periodos y 616 visitas preservados;
- HR, adapters y `CX.data` preservados.

### Corte 3 — Finanzas e histórico de pagos

`FROZEN_ACTIVE_BASELINE`.

- Aprobación Paula: `Procede`.
- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- Manifest: `app/docs/ACTIVE-BASELINE-CORTE3-V182-20260729.json`.
- Freeze: `app/docs/FREEZE-CORTE3-V182-APPROVED-20260729.md`.
- Baseline head: `1b34c3998625a3f2402ceeada283ab57b56ffbf6`.
- V182 empalmada; no V183/R33.
- R26–R32: 135/135 PASS.
- R24: PASS.
- HR remota y smoke de pagos: PASS.
- Run `30416875149`, job `90468374816`: SUCCESS.
- Mayo: 44 pagadas / 0 pendientes / 2 reviews / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- Pagos/lotes ejecutados por CXOrbia: 0.

P1/P2 de reportes/copy permanecen como backlog transversal y no reabren Corte 3.

## 5. Corte activo — Corte 4

Objetivo: `CX.data READ-ONLY → FIREBASE NUEVO Y VACÍO → MISMA INTERFAZ → CERO WRITES`.

Estado: `READONLY_HARDENED_PROVIDER_IDENTITY_PENDING`.

### 5.1 Hardening ya aplicado

- contrato `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`;
- `app/core/backend-config.js` con backend desactivado por defecto y modo read-only estricto;
- `app/core/backend-config-preview-dev.js` con preview exclusivamente read-only;
- `app/core/backend-cxdata-readonly-corte4.js` para:
  - conservar interfaz pública `CX.data`;
  - bloquear persistencia Firestore;
  - bloquear acciones operativas públicas;
  - representar backend vacío como vacío;
  - fallar cerrado ante error de lectura;
  - impedir fallback silencioso a mock/localStorage;
- `app/index-backend-dev.html` carga el guard antes del bridge UI;
- gate `tools/qa/cxdata-firestore-readonly-corte4-gate.mjs` creado sin activar proveedor.

### 5.2 Hallazgo prevenido

El adapter Firebase existente podía envolver métodos `CX.data` con persistencia y conservar datos mock cuando Firestore estaba vacío o fallaba. Corte 4 bloquea esas rutas antes de conectar la base.

### 5.3 Gates pendientes

1. Verificar que `cxorbia-backend-dev` sea la base nueva, limpia y autorizada.
2. Verificar proyecto/tenant vacío.
3. Verificar Firestore Rules read-only.
4. Completar config DEV sin secretos en repo.
5. Ejecutar gate Corte 4.
6. Autorizar activación de lectura DEV.
7. Smoke:
   - source=`firestore`;
   - empty=true cuando corresponda;
   - fallbackUsed=false;
   - interfaz `CX.data` preservada;
   - writes=0.

No se activa proveedor, Auth, Storage, HR writes, imports ni producción antes de estos gates.

## 6. Cortes siguientes

- **Corte 5:** materialización DEV con dry-run/idempotencia.
- **Corte 6:** Auth/RBAC.
- **Corte 7:** sincronización, evidencias y gates Make/Gemini.
- **Corte 8:** preproducción/producción con autorización.

## 7. Claude/prototipo

Corte 3 está congelado. No preparar V183. No tocar backend/contratos/adapters desde candidata. Cualquier P1/P2 se documenta y corrige por archivo/módulo sin reinterpretar HR, finanzas o pagos.

## 8. Academia

- Corte 3: documentar fuente operacional, financiera y de pago; revisión vs pago; grupos históricos; monedas separadas.
- Corte 4: explicar backend nuevo/vacío, read-only, fail-closed, interfaz estable y diferencia entre lectura, persistencia y activación de proveedor.

## 9. Estado seguro

Sin producción, merge, provider activation, Firestore/Auth/Storage/HR writes, imports, ejecución de pagos, lotes reales, Make ni Gemini live.
