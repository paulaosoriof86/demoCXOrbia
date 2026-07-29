# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-29  
**Estado:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_NEW_EMPTY_FIREBASE_VERIFIED_PASS__PROVIDER_BOOTSTRAP_AUTHORIZATION_PENDING_NO_PRODUCTION`

## 1. Estado general

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Baseline activa: `CXORBIA-TYA-CORTE3-V182-20260729`.
- Corte 3: `FROZEN_ACTIVE_BASELINE`.
- Corte 4: gates 1–2 PASS; bootstrap provider DEV pendiente autorización.
- Sin producción, merge, imports, pagos/lotes ejecutados por CXOrbia, Firestore/Auth/Storage/HR data writes, Make/Gemini live.

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

### Hardening completado

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

### Firebase nuevo

- projectId: `cxorbia-tya-dev-260729-c4`;
- display name: `CXOrbia TyA DEV Clean Corte 4`;
- creado manualmente por Paula;
- IAM del runner: `Viewer` únicamente;
- reutilización/copia legacy: false.

### Gate 1 — identidad: PASS

- commit `b18f0b6cf74afb8b3ac770a73231c6cf1353b37c`;
- `TARGET_PROJECT_IDENTITY_VERIFIED_C4` success;
- provider writes=0.

### Gate 2 — vacío integral: PASS

- request `corte4-verify-new-empty-firebase-dev-20260729-05`;
- commit `7b0e40f8607b80a4f37238314a66064af35c5e6d`;
- identidad=true;
- vacío=true;
- unavailable=0;
- nonempty=0;
- apps=0;
- Auth users=0;
- Firestore DB=0;
- Storage buckets=0;
- Hosting=1 `DEFAULT_SITE` provider-managed, sin `USER_SITE`/release como señal de contenido;
- provider writes=0.

### Correcciones de causa raíz del gate

- Auth count-only corregido a contrato válido.
- Hosting default provider-managed ya no se confunde con contaminación/materialización.
- Typo intermedio de OAuth corregido antes de ejecutar el intento afectado; sin provider call/write.

## 4. Pendiente vivo Corte 4

1. Autorización expresa de bootstrap provider DEV read-only.
2. Registrar/configurar Web App DEV sin secretos en repo.
3. Inicializar Firestore y Auth bootstrap temporal mínimo para lectura protegida.
4. Desplegar únicamente `backend/rules/firestore.corte4-readonly.rules` en DEV.
5. Activar solo lectura DEV.
6. Smoke `CX.data`: `source=firestore`, `empty=true`, `fallbackUsed=false`, interfaz preservada, writes=0.
7. Validación visual.
8. Freeze Corte 4.

El bootstrap Auth de Corte 4 no sustituye Auth/RBAC completo de Corte 6.

## 5. Cortes siguientes

- Corte 5: materialización DEV con dry-run, idempotencia, trazabilidad y conflictos.
- Corte 6: Auth/RBAC completo.
- Corte 7: sincronización HR/plataforma, evidencias y gates Make/Gemini/Storage.
- Corte 8: preproducción y producción con autorización específica.

## 6. Claude/prototipo

- Corte 3 congelado; no preparar V183/R33.
- No tocar backend/contracts/adapters desde candidata frontend.
- No nueva candidata por Corte 4 salvo P0 visual reproducible.
- Backlog de PDF/Excel/reportKit/copy permanece P1/P2.

## 7. Academia

- Documentar credencial, IAM, identidad, vacío, `DEFAULT_SITE`, Web App, Auth bootstrap, Firestore, Rules, lectura y escritura como gates separados.
- Mantener separación entre backend vacío, fail-closed, read-only y futura materialización.

## 8. Siguiente bloque exacto

`AUTORIZAR BOOTSTRAP DEV READ-ONLY → WEB APP DEV → FIRESTORE/AUTH BOOTSTRAP MÍNIMO → RULES READ-ONLY → ACTIVAR LECTURA DEV → SMOKE CX.data → VALIDACIÓN VISUAL → FREEZE CORTE 4`.

## 9. Estado seguro

PR #7 draft/open/no merge. Sin producción, merge, Rules deploy, Firestore/Auth/Storage/HR data writes, imports, pagos, lotes reales, Make ni Gemini live.
