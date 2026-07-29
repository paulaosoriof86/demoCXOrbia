# RESUMEN-PARA-CLAUDE.md

## ESTADO VIGENTE — 2026-07-29

### Baseline y cortes

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- M1 / Corte 1 / Corte 2A: `FROZEN/APROBADO`.
- Corte 3: `FROZEN_ACTIVE_BASELINE`.
- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; **no crear V183/R33**.
- R26–R32: 135/135 PASS; HR remota, Hosting DEV y smoke de pagos PASS.

### Verdad financiera congelada

- Mayo 2026: 44 pagadas, 0 pendientes, 42 vínculos exactos, 2 reviews, CxP GT Q0 / HN L0.
- Junio 2026: 2 pagadas, 42 pendientes, GT pagado Q451 / HN L0.
- CXOrbia no ha ejecutado pagos ni lotes reales.

### Corte 4 — backend, no tarea frontend

Objetivo: `FIREBASE NUEVO Y VACÍO → CX.data READ-ONLY → MISMA INTERFAZ → CERO WRITES`.

Ya está preparado y validado técnicamente:

- interfaz pública `CX.data` preservada;
- backend desactivado por defecto;
- `readOnly=true` / `writeMode=disabled`;
- persistencia y acciones operativas bloqueadas;
- backend vacío = vacío;
- error de lectura fail-closed;
- no fallback mock/localStorage;
- Rules candidate preparado, no desplegado;
- gate `PASS_READONLY_POST_GATES`.

`cxorbia-backend-dev` está excluido por no ser nuevo/vacío. No copiarlo, conectarlo ni reutilizarlo.

Candidato nuevo: `cxorbia-tya-dev-260729-c4`.

Bloqueo actual comprobado: `PROVIDER_IAM_BLOCKED_NEW_PROJECT_NOT_CREATED_NOT_CONNECTED`.

- probe: `TARGET_PROJECT_PERMISSION_DENIED_C4`;
- creación atómica: `BLOCKED_PROJECT_CREATION_PERMISSION_OR_POLICY`;
- projectCreated=false;
- firebaseAdded=false;
- existingDatabaseReused=false.

Este bloqueo es IAM/proveedor; no requiere cambios de Claude ni nueva candidata.

### Lo que Claude NO debe hacer ahora

- no preparar V183/R33;
- no reinterpretar HR;
- no reabrir Finanzas/Corte 3;
- no tocar `backend/contracts`, adapters, tools, workflows, Rules, secrets ni configuración provider;
- no introducir persistencia local/mock para suplir Firestore;
- no activar proveedores reales desde módulos UI.

### Backlog frontend no bloqueante preservado

- PDF sin gráfica visible al imprimir;
- Excel con formato básico;
- mejora transversal de `reportKit`;
- copy genérico de fuentes;
- cualquier ajuste futuro se hará por archivo/módulo con evidencia reproducible y no reabre Corte 3.

### Academia

Debe reflejar la diferencia entre:

1. credencial estructuralmente válida;
2. permiso IAM;
3. creación/verificación de proyecto;
4. agregar Firebase;
5. Rules;
6. lectura read-only;
7. escritura/materialización posterior.

No presentar “credencial válida” como “Firebase conectado”.

### Siguiente bloque exacto backend

`RESOLVER IAM PROJECT CREATOR → CREAR/VERIFICAR FIREBASE NUEVO/VACÍO → CONFIG WEB DEV → RULES READ-ONLY → ACTIVAR LECTURA DEV → SMOKE CX.data → VALIDACIÓN VISUAL → FREEZE CORTE 4`.

## Referencias históricas que siguen vigentes donde no contradigan este estado

- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE1-LIVE-HR-REPORTES-20260720.md`.
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-SOURCE-SAFE-IMPORTERS-R4-20260711.md`.
- `app/docs/CLAUDE-PACKAGE-ACCUMULATED-PHASE-A-TYA-20260709.md`.
- Addenda posteriores de candidatas/Corte 2A/Corte 3 quedan como trazabilidad histórica, pero el baseline vigente es V182 congelada.

## Estado seguro

Sin merge, producción, provider activation, Rules deploy, Firestore/Auth/Storage/HR writes, imports, pagos, lotes reales, Make ni Gemini live.
