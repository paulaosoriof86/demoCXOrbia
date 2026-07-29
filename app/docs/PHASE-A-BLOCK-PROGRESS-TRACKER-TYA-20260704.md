# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-29  
**Estado:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_READONLY_STATIC_PASS_PROVIDER_IAM_BLOCKED_NO_PRODUCTION`

## 1. Estado general

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Baseline activa: `CXORBIA-TYA-CORTE3-V182-20260729`.
- Corte 3: `FROZEN_ACTIVE_BASELINE`.
- Corte 4: `READONLY_STATIC_PASS_PROVIDER_IAM_BLOCKED`.
- Sin producción, merge, imports, pagos/lotes ejecutados por CXOrbia, Firestore/Auth/Storage/HR writes, Make/Gemini live.

## 2. Cortes cerrados

### M1 / Corte 1 / Corte 2A

- `FROZEN/APROBADO`.
- HR viva e histórico preservados.
- 14 periodos, junio 2025–julio 2026.
- 616 visitas.
- 44 visitas por periodo: 34 GT y 10 HN.
- Proyecto y periodo separados.
- Ciclo Shopper y operación preservados.

No reabrir sin evidencia P0 reproducible.

### Corte 3 — Finanzas e histórico de pagos

- `FROZEN_ACTIVE_BASELINE`.
- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; no V183/R33.
- R26–R32: 135/135 PASS.
- HR remota, Hosting DEV y smoke de pagos: PASS.
- Mayo 2026: 44 pagadas, 0 pendientes, 42 vínculos exactos, 2 reviews, CxP GT Q0 / HN L0.
- Junio 2026: 2 pagadas, 42 pendientes, GT pagado Q451 / HN L0.
- Pagos/lotes ejecutados por CXOrbia: 0.
- P1/P2 de PDF, Excel, reportKit y copy permanecen backlog no bloqueante.

## 3. Corte activo — Corte 4 CX.data Firestore read-only

Objetivo: `FIREBASE NUEVO Y VACÍO → CX.data READ-ONLY → MISMA INTERFAZ → CERO WRITES`.

### Completado

- contrato read-only;
- backend desactivado por defecto;
- `readOnly=true` / `writeMode=disabled`;
- interfaz pública `CX.data` preservada;
- persistencia y acciones operativas bloqueadas;
- backend vacío representado como vacío;
- error de lectura fail-closed;
- no fallback mock/localStorage;
- Rules candidate preparado y no desplegado;
- gate estático `PASS_READONLY_POST_GATES`;
- `cxorbia-backend-dev` excluido por no ser nuevo/vacío.

### Candidato nuevo

- projectId: `cxorbia-tya-dev-260729-c4`;
- display name: `CXOrbia TyA DEV Clean Corte 4`;
- reutilización de base existente: false;
- conexión/copia legacy: false.

### Bloqueo comprobado

- única ruta de credencial estructuralmente válida: `existing_dev_service_account`;
- probe: `TARGET_PROJECT_PERMISSION_DENIED_C4`;
- creación atómica: `BLOCKED_PROJECT_CREATION_PERMISSION_OR_POLICY`;
- projectCreated=false;
- firebaseAdded=false;
- existingDatabaseReused=false;
- Firestore/Auth/Storage/Rules/Hosting writes=0.

Estado exacto: `PROVIDER_IAM_BLOCKED_NEW_PROJECT_NOT_CREATED_NOT_CONNECTED`.

La causa es IAM/proveedor: la service account válida disponible carece del permiso necesario para crear/verificar el proyecto nuevo. No es un bloqueo de frontend, V182, GitHub, rama, PR, `CX.data` ni gate estático.

## 4. Pendiente vivo Corte 4

1. Resolver IAM Project Creator.
2. Crear/verificar `cxorbia-tya-dev-260729-c4`.
3. Verificar que el proyecto/base estén realmente nuevos y vacíos.
4. Obtener/configurar web config DEV sin secretos.
5. Autorizar y desplegar únicamente Rules read-only DEV.
6. Activar solo lectura DEV.
7. Smoke `CX.data`: `source=firestore`, `empty=true`, `fallbackUsed=false`, interfaz preservada, writes=0.
8. Validación visual.
9. Freeze Corte 4.

## 5. Cortes siguientes

- Corte 5: materialización DEV con dry-run, idempotencia, trazabilidad y conflictos.
- Corte 6: Auth/RBAC.
- Corte 7: sincronización HR/plataforma, evidencias y gates Make/Gemini/Storage.
- Corte 8: preproducción y producción con autorización específica.

## 6. Claude/prototipo

- Corte 3 congelado; no preparar V183/R33.
- No tocar backend/contracts/adapters desde candidata frontend.
- Backlog de PDF/Excel/reportKit/copy permanece P1/P2 y no bloquea Corte 4.

## 7. Academia

- Mantener documentada la diferencia entre credencial válida, permiso IAM, creación de proyecto, agregar Firebase, Rules, lectura y escritura.
- Mantener separación entre backend vacío, fail-closed, read-only y futura materialización.

## 8. Siguiente bloque exacto

`RESOLVER IAM PROJECT CREATOR → CREAR/VERIFICAR FIREBASE NUEVO/VACÍO → CONFIG WEB DEV → RULES READ-ONLY → ACTIVAR LECTURA DEV → SMOKE CX.data → VALIDACIÓN VISUAL → FREEZE CORTE 4`.

## 9. Estado seguro

PR #7 draft/open/no merge. Sin producción, provider activation, Rules deploy, Firestore/Auth/Storage/HR writes, imports, pagos, lotes reales, Make ni Gemini live.
