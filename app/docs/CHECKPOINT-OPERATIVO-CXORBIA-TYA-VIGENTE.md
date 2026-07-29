# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_NEW_FIREBASE_CREATED_VISUALLY__IAM_READ_ACCESS_PENDING_NO_PRODUCTION`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos ejecutados y Firestore/Auth/Storage/HR writes: 0.

## 2. Corte 3 — FROZEN / ACTIVE_BASELINE

- Aprobación de Paula: `Procede`.
- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- Baseline head: `1b34c3998625a3f2402ceeada283ab57b56ffbf6`.
- V182 empalmada; no V183/R33.
- R26–R32: 135/135 PASS.
- R24, HR remota, Hosting DEV y smoke de pagos: PASS.
- Mayo: 44 pagadas / 0 pendientes / 42 exactas / 2 reviews / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- Pagos y lotes ejecutados por CXOrbia: 0.

Backlog P1/P2 de PDF, Excel, reportKit y copy no reabre Corte 3.

## 3. Corte 4 — objetivo

`CX.data READ-ONLY → Firebase nuevo y vacío → misma interfaz → cero writes`.

## 4. Base existente excluida

`cxorbia-backend-dev` no es nueva ni vacía. La evidencia source-safe registra 17 usuarios Auth DEV, tenant `tya`, 3 clientes, 29 proyectos, 215 shoppers, 20 notificaciones y 572 beneficios shopper.

Decisión vinculante:

- no conectarla como destino de Corte 4;
- no copiarla;
- no reutilizarla;
- no retargetear `.firebaserc` antes de verificar una identidad nueva.

## 5. Firebase nuevo creado por Paula

Evidencia visual recibida el 2026-07-29:

- Firebase Console abierto en `cxorbia-tya-dev-260729-c4`;
- nombre visible: `CXOrbia TyA DEV Clean Corte 4`;
- Project ID visible: `cxorbia-tya-dev-260729-c4`;
- Project number visible en consola;
- plan Spark;
- sección `Tus apps`: `No hay apps en tu proyecto`.

Esta evidencia confirma creación manual del proyecto Firebase correcto y cero apps registradas. No demuestra todavía, por sí sola, vacío integral de Firestore/Auth/Storage; ese gate sigue pendiente de verificación provider read-only.

## 6. Hardening read-only completado

- contrato `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`;
- backend desactivado por defecto;
- `readOnly=true` y `writeMode=disabled`;
- interfaz pública `CX.data` preservada;
- persistencia y acciones operativas bloqueadas;
- backend vacío se representa como vacío;
- errores de lectura fallan cerrado;
- no fallback a mock/localStorage;
- Rules candidate `backend/rules/firestore.corte4-readonly.rules` preparado y no desplegado.

## 7. Gate estático Corte 4 — PASS

- request `corte4-cxdata-firestore-readonly-hardening-20260729-03`;
- commit `8b002f935535e623665ea7d5a8d04639267d25b8`;
- run `30421675166`;
- job `90479605890`: SUCCESS;
- artifact `8712131903`;
- digest `sha256:4b6599e5a1b792d8939faec54b9dc208a48c29972d26cc382fb0c5fc8fff8aa8`;
- decisión `PASS_READONLY_POST_GATES`;
- providerReads=0 / providerWrites=0 / dataWrites=0;
- activación=false.

## 8. Provider/IAM

### 8.1 Preflight de credenciales

- commit `e698734245b793ef645fb6aeb2aef625fc230437`;
- única ruta estructuralmente válida: `existing_dev_service_account`;
- provider calls=0;
- provider writes=0;
- secretos expuestos=0.

### 8.2 Probe anterior

- commit `adec9039a202ade1753001e79d6fa2d1ba74d1d8`;
- decisión `TARGET_PROJECT_PERMISSION_DENIED_C4`;
- provider writes=0.

### 8.3 Creación atómica automática anterior

- request `corte4-new-empty-firebase-dev-20260729-04`;
- commit `581c45c245a2b2ea0629900da0296f96088994f3`;
- decisión `BLOCKED_PROJECT_CREATION_PERMISSION_OR_POLICY`;
- projectCreated=false;
- firebaseAdded=false;
- existingDatabaseReused=false;
- Firestore/Auth/Storage/Rules/Hosting writes=0.

Ese bloqueo de creación quedó superado por creación manual de Paula, sin reutilizar el proyecto DEV histórico.

### 8.4 Re-probe posterior a creación manual

- request `corte4-probe-project-identity-20260729-02`;
- commit `691ec3c0c76ebc45a9d901b82dfb95d08f27daa6`;
- decisión observable: `TARGET_PROJECT_PERMISSION_DENIED_C4`;
- la service account existente sigue sin permiso de lectura sobre el proyecto nuevo;
- provider writes=0.

## 9. Causa raíz vigente

El proyecto nuevo ya existe. El bloqueo actual ya no es `project creation`: es exclusivamente que la service account usada por los runners GitHub no tiene IAM de lectura sobre `cxorbia-tya-dev-260729-c4`.

Estado exacto:

`NEW_FIREBASE_CREATED__RUNNER_IAM_READ_ACCESS_PENDING`

No es un bloqueo del prototipo, `CX.data`, GitHub, rama, PR o hardening read-only.

## 10. Desbloqueo mínimo requerido

Otorgar a la service account existente acceso read-only al proyecto nuevo. El rol básico `Viewer` es suficiente para el gate de lectura general; no se requiere Editor/Owner.

Después:

1. re-probe de identidad;
2. verificación independiente de vacío;
3. config web DEV sin secretos;
4. autorización separada de Rules read-only DEV;
5. activación solo lectura;
6. smoke `CX.data` con `source=firestore`, `empty=true`, `fallbackUsed=false`, interfaz preservada y writes=0.

No se requieren PowerShell, ZIP, nueva candidata ni datos TyA.

## 11. Qué no se hará

- no reutilizar `cxorbia-backend-dev`;
- no conectar una base preexistente;
- no crear otra rama o PR;
- no activar Auth/Storage/Firestore writes;
- no importar datos;
- no pedir nueva candidata frontend;
- no reabrir Corte 3.

## 12. Claude/prototipo y Academia

- Claude: Corte 3 congelado; no tocar backend/contracts/adapters; no reintroducir persistencia o fallback mock.
- Academia: documentar diferencia entre creación del proyecto, IAM de lectura, Firebase app registration, Rules, lectura y escritura.

## 13. Siguiente bloque exacto

`OTORGAR IAM READ-ONLY A RUNNER → RE-PROBE IDENTIDAD → VERIFICAR VACÍO → CONFIG WEB DEV → RULES READ-ONLY → ACTIVAR SOLO LECTURA DEV → SMOKE CX.data`.

## 14. Estado seguro

Sin producción, merge, Rules deploy, Firestore/Auth/Storage/HR writes, imports, pagos, lotes reales, Make ni Gemini live.
