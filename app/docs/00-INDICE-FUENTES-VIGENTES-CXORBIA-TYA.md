# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_PROVIDER_BOOTSTRAP_COMPLETED__PROTECTED_CXDATA_SMOKE_AUTH_PRINCIPAL_PENDING__NO_DATA_WRITES`

## 1. Repositorio

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos y data writes reales: 0.

## 2. Orden de lectura vigente

1. este índice;
2. reglas maestras vigentes;
3. addendum de empalme directo/carril file-aware;
4. addenda de Academia, patrones y antidesvío;
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. `app/docs/CHECKPOINT-CORTE4-BOOTSTRAP-PREFLIGHT-20260729.md`;
8. `app/docs/ACTIVE-BASELINE-CORTE3-V182-20260729.json`;
9. `app/docs/FREEZE-CORTE3-V182-APPROVED-20260729.md`;
10. contrato/gates Corte 4;
11. CAMBIOS, Claude, PENDIENTES, Academia y tracker;
12. PR #7 y HEAD vivo.

## 3. Corte 3 — congelado

- `FROZEN_ACTIVE_BASELINE`.
- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; no V183/R33.
- 14 periodos / 616 visitas.
- Mayo: 44 pagadas / 0 pendientes / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- P1/P2 de PDF, Excel, reportKit y copy no reabren Corte 3.

## 4. Corte 4 — objetivo y hardening

Objetivo: Firebase nuevo/vacío, `CX.data` read-only, misma interfaz y cero data writes.

Hardening vigente:

- interfaz `CX.data` preservada;
- readOnly=true / writeMode=disabled;
- backend vacío visible como vacío;
- error de lectura fail-closed;
- no fallback mock/localStorage;
- base legacy/preexistente prohibida.

## 5. Firebase nuevo — Gates 1–2 PASS

- projectId `cxorbia-tya-dev-260729-c4`;
- display name `CXOrbia TyA DEV Clean Corte 4`;
- identidad nueva PASS;
- vacío integral previo PASS;
- `cxorbia-backend-dev` sigue excluido.

## 6. Bootstrap DEV read-only — COMPLETADO

Paula autorizó `Autorizo bootstrap DEV read-only de Corte 4` y confirmó `us-central1`.

IAM temporal sobre la service account del runner:

- Viewer;
- Firebase Editor;
- Cloud Datastore Owner;
- Service Usage Admin.

Provider bootstrap completado:

- Web App DEV `CXOrbia TyA DEV Corte 4`: READY;
- Firestore `(default)`: READY, Native/Standard, `us-central1`, sin colecciones;
- Rules `backend/rules/firestore.corte4-readonly.rules`: DEPLOYED + VERIFIED;
- Firebase Authentication: INITIALIZED en consola, sin proveedor habilitado y sin usuarios;
- revalidación idempotente: commit `e524b968c0003c27351d5d5826e21ffcf7cbfdbe`;
- statuses: `cxorbia/corte4-bootstrap-execute=success`, `cxorbia/c4exec-BOOTSTRAP_DEV_READONLY_COMPLETED_C4=success`, `cxorbia/c4bootstrap-w0-webtrue-dbtrue-authtrue-rulestrue=success`;
- provider config writes en la revalidación: 0.

Estado: `BOOTSTRAP_DEV_READONLY_COMPLETED_C4`.

## 7. Gate vivo — principal autenticado para smoke protegido

Las Rules desplegadas permiten lectura únicamente a un operador autenticado con rol permitido y tenant `tya`. El proyecto nuevo continúa con:

- Auth users=0;
- Email/Password=deshabilitado;
- Google/otros proveedores=deshabilitados;
- Firestore document writes=0.

Por tanto el siguiente smoke real de navegador no puede ejecutarse honestamente bajo las Rules actuales sin crear un principal DEV temporal. Crear ese usuario o habilitar un proveedor constituye un nuevo Auth user/config write y no se ejecuta por inferencia.

Siguiente gate propuesto, acotado y reversible:

`AUTORIZAR OPERADOR DEV TEMPORAL PARA SMOKE PROTEGIDO → habilitar Email/Password solo en DEV → crear 1 usuario temporal con claims role=admin + tenantId=tya → ejecutar CX.data read-only contra Firestore vacío → demostrar source=firestore / empty=true / fallbackUsed=false / writes=0 → eliminar usuario temporal → deshabilitar proveedor → conservar Auth users=0`.

Hosting DEV para revisión visual seguirá siendo una autorización separada; no está incluido en este gate.

## 8. Seguridad actual

- Firestore document writes=0;
- Auth user writes permanentes=0;
- Storage writes=0;
- Hosting deploy nuevo=0;
- Functions/imports/HR/Make/Gemini/payments/merge/production=0.

Los únicos config writes del bootstrap fueron los expresamente autorizados para API/Web App/Firestore/Rules. La revalidación posterior a la inicialización manual de Auth fue idempotente y produjo 0 provider writes.

## 9. Siguiente acción exacta

`AUTORIZACIÓN ACOTADA DE PRINCIPAL DEV TEMPORAL → SMOKE PROTEGIDO CX.data → DOCUMENTAR RESULTADO → AUTORIZACIÓN SEPARADA HOSTING DEV → VALIDACIÓN VISUAL → FREEZE CORTE 4 → RETIRAR IAM TEMPORAL A VIEWER`.

No se requiere PowerShell, nueva candidata, ZIP ni datos TyA.

## 10. Claude/prototipo y Academia

- Claude: sin nueva candidata; no tocar backend/contracts/adapters. Solo actuar si smoke demuestra P0 localizado.
- Academia: diferenciar inicialización Auth de habilitación de proveedor, creación de usuario temporal, claims, lectura protegida y Auth/RBAC completo de Corte 6.
- Reusable CXOrbia: bootstrap idempotente/fail-closed, principal temporal reversible para smoke y least privilege posterior.
