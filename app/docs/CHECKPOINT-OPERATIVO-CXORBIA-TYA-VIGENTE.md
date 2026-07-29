# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_PROTECTED_CXDATA_SMOKE_PASS__HOSTING_DEV_AUTH_PENDING__NO_DATA_WRITES`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos y Firestore/Auth/Storage/HR data writes permanentes: 0.

## 2. Corte 3 — FROZEN / ACTIVE_BASELINE

- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; no V183/R33.
- R26–R32: 135/135 PASS.
- HR remota, Hosting DEV y smoke de pagos de Corte 3: PASS.
- Mayo: 44 pagadas / 0 pendientes / 42 exactas / 2 reviews / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- Pagos/lotes ejecutados por CXOrbia: 0.

Backlog P1/P2 de PDF, Excel, reportKit y copy no reabre Corte 3.

## 3. Corte 4 — objetivo

`CX.data READ-ONLY → Firebase nuevo y vacío → misma interfaz → cero data writes`.

## 4. Firebase nuevo / Gates 1–2

- Project ID: `cxorbia-tya-dev-260729-c4`.
- Display name: `CXOrbia TyA DEV Clean Corte 4`.
- `cxorbia-backend-dev` permanece excluido: no se conecta, copia o reutiliza.
- Identidad nueva: PASS, commit `b18f0b6cf74afb8b3ac770a73231c6cf1353b37c`.
- Vacío integral previo: PASS, commit `7b0e40f8607b80a4f37238314a66064af35c5e6d`.

## 5. Hardening read-only

- contrato `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`;
- `readOnly=true` / `writeMode=disabled`;
- interfaz pública `CX.data` preservada;
- mutaciones/persistencia bloqueadas;
- backend vacío = vacío;
- errores fail-closed;
- no fallback mock/localStorage.

## 6. Gate 3 — bootstrap provider DEV: PASS

Autorización consumida: `Autorizo bootstrap DEV read-only de Corte 4`.

Resultado:

- Web App DEV `CXOrbia TyA DEV Corte 4`: READY;
- Firestore `(default)`: READY, Native/Standard, `us-central1`, sin colecciones;
- Rules `backend/rules/firestore.corte4-readonly.rules`: DEPLOYED + VERIFIED;
- Firebase Authentication inicializado por Paula desde Console sin proveedor ni usuarios;
- revalidación idempotente `e524b968c0003c27351d5d5826e21ffcf7cbfdbe`;
- `BOOTSTRAP_DEV_READONLY_COMPLETED_C4`;
- Web App=true / Firestore=true / Auth=true / Rules=true;
- provider config writes en la revalidación=0.

## 7. Gate 4 — protected CX.data smoke: PASS

Autorización consumida: `Autorizo operador DEV temporal para smoke protegido de Corte 4`.

### Ejecución

El gate hizo únicamente lo autorizado:

1. habilitó temporalmente Email/Password en el Firebase nuevo DEV;
2. creó un único operador temporal con credencial aleatoria no expuesta;
3. aplicó claims `role=admin`, `tenantId=tya`;
4. ejecutó navegador real contra `app/index-backend-dev.html` y Firestore vacío bajo Rules read-only;
5. verificó lectura protegida y bloqueo de escrituras;
6. eliminó el usuario temporal;
7. restauró Email/Password a deshabilitado;
8. confirmó Auth users=0 y Firestore aún vacío.

### Evidencia válida

Commit: `b698a925f5f6a7c8405afb7fb54a9f4c551e8498`.

Statuses sanitizados:

- `cxorbia/c4smoke-error-NONE`;
- `cxorbia/c4smoke-srcfirestore-etrue-fbfalse-rotrue`;
- `cxorbia/c4cleanup-u0-emailfalse`.

Condiciones demostradas:

- `source=firestore`;
- `empty=true`;
- `fallbackUsed=false`;
- `readOnly=true`;
- `writeMode=disabled`;
- interfaz `CX.data` preservada;
- claims del principal temporal verificados;
- arrays de datos Firestore vacíos;
- write directo bloqueado por guard;
- Firestore document writes=0;
- cleanup completo;
- Auth users final=0;
- Email/Password final=false.

### Falso negativo del publicador — no reabre el gate

El contexto agregado `cxorbia/corte4-protected-cxdata-smoke` quedó `error` porque el publicador exigía `cleanup.source-safe.json` además de `main.cleanup.complete=true`. El executor principal ya había realizado y verificado cleanup antes de eliminar el directorio privado, por lo que el segundo cleanup redundante no generó ese archivo.

La combinación `errorCategory=NONE + source=firestore + empty=true + fallback=false + readOnly=true + usersAfter=0 + emailAfter=false` solo ocurre después de que el executor pasa su browser smoke y cleanup internos.

Corrección de raíz: `9967146e112322efcd043155ae05351bbbbd4e8a`.

- el publicador acepta cleanup verificado en el reporte principal;
- la edición del workflow ya no lo auto-dispara;
- no se creó otro usuario temporal para corregir reporting.

## 8. Seguridad comprobada

- Firestore document writes: 0.
- Auth users permanentes: 0.
- Email/Password: deshabilitado.
- Storage writes: 0.
- Hosting deploy nuevo de Corte 4: 0.
- Functions: 0.
- imports/materialización: 0.
- HR writes: 0.
- Make/Gemini: 0.
- pagos/lotes: 0.
- merge/producción: 0.

## 9. Gate real siguiente — Hosting DEV

Corte 4 tiene lectura protegida técnicamente demostrada. El siguiente paso modifica Hosting DEV y por eso conserva gate separado:

1. autorización explícita para Hosting DEV del mismo build read-only;
2. deploy DEV sin producción;
3. validación visual real;
4. si aparece un P0 reproducible, corrección focalizada únicamente;
5. freeze Corte 4;
6. retirar los roles IAM elevados temporales y dejar runner en Viewer.

## 10. Siguiente acción exacta

`AUTORIZAR HOSTING DEV DE CORTE 4 → DEPLOY READ-ONLY DEV → VALIDACIÓN VISUAL → FREEZE CORTE 4 → RETIRAR IAM TEMPORAL A VIEWER`.

No se necesita PowerShell, nueva candidata, ZIP ni datos TyA.

## 11. Claude/prototipo y Academia

- Claude/prototipo: sin nueva candidata; no tocar backend/contracts/adapters. Solo abrir tarea si la validación visual demuestra una diferencia P0 reproducible localizada.
- Academia: separar gate ejecutado, cleanup y publicador; documentar falso negativo metodológico de reporting y corrección sin rerun.
- Reusable CXOrbia: preflight IAM/location, bootstrap idempotente, fail-closed, principal temporal reversible, protected smoke, cleanup verificable y retiro de privilegios.
- Exclusivo cliente: projectId DEV TyA y `us-central1`.
- Sin impacto Claude: runners, IAM, Auth temporal y reporting.

## 12. Estado seguro

PR #7 draft/open/no merge. Corte 3 preservado. Corte 4 tiene provider bootstrap y protected CX.data smoke PASS. No hay datos TyA materializados ni producción; el único gate actual es Hosting DEV para validación visual.
