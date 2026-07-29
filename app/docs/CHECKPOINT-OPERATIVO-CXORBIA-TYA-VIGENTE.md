# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_READONLY_STATIC_PASS_PROVIDER_IAM_BLOCKED_NO_PRODUCTION`

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
- Run `30416875149`, job `90468374816`: SUCCESS.
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

## 5. Candidato nuevo

- Project ID: `cxorbia-tya-dev-260729-c4`.
- Display name: `CXOrbia TyA DEV Clean Corte 4`.
- Reutilización de base existente: false.
- Conexión/copia legacy: false.
- Únicos provider writes autorizados en la solicitud: crear proyecto y agregar Firebase.
- Billing, Auth, Firestore, Storage, Rules, Hosting, Functions, imports y migración: false.

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

## 8. Diagnóstico provider e IAM — bloqueo comprobado

### 8.1 Preflight de credenciales

La primera selección fallaba porque elegía el primer secret no vacío aunque su estructura fuera inválida. Se corrigió para evaluar todas las rutas y seleccionar la primera credencial de service account estructuralmente válida.

Resultado comprobado:

- commit `e698734245b793ef645fb6aeb2aef625fc230437`;
- status `cxorbia/corte4-provider-route-existing_dev_service_account-shape-valid = success`;
- única ruta válida disponible: `existing_dev_service_account`;
- provider calls=0;
- provider writes=0;
- secretos expuestos=0.

### 8.2 Probe read-only de identidad

- commit `adec9039a202ade1753001e79d6fa2d1ba74d1d8`;
- status `TARGET_PROJECT_PERMISSION_DENIED_C4`;
- la service account válida no puede leer/verificar `cxorbia-tya-dev-260729-c4`;
- provider writes=0.

Este resultado no prueba existencia ni ausencia del proyecto. Solo prueba falta de permiso de lectura sobre esa identidad.

### 8.3 Creación atómica

Se corrigió el runner para usar OAuth nativo, timeouts acotados y la credencial válida. La solicitud atómica se ejecutó:

- request `corte4-new-empty-firebase-dev-20260729-04`;
- commit `581c45c245a2b2ea0629900da0296f96088994f3`;
- ruta `existing_dev_service_account`;
- decisión `BLOCKED_PROJECT_CREATION_PERMISSION_OR_POLICY`;
- proyecto creado=false;
- Firebase agregado=false;
- base existente reutilizada=false;
- Firestore/Auth/Storage/Rules/Hosting writes=0;
- producción=false.

## 9. Causa raíz y bloqueo real

La única credencial válida disponible en GitHub corresponde al proyecto DEV existente y carece del permiso organizacional/proveedor necesario para crear el proyecto Firebase nuevo o verificar el candidato.

Estado exacto:

`PROVIDER_IAM_BLOCKED_NEW_PROJECT_NOT_CREATED_NOT_CONNECTED`

No es un bloqueo del prototipo, `CX.data`, GitHub, rama, PR, gate estático ni código read-only. Es un bloqueo externo de IAM/creación de proyecto.

## 10. Qué no se hará

- no reutilizar `cxorbia-backend-dev`;
- no conectar una base preexistente;
- no crear otra rama o PR;
- no activar Rules, Auth, Storage o Firestore;
- no importar datos;
- no pedir una nueva candidata frontend;
- no reabrir Corte 3.

## 11. Desbloqueo mínimo requerido

Se necesita una identidad con capacidad de:

1. crear un proyecto Google Cloud/Firebase nuevo dentro de la organización/cuenta autorizada;
2. agregar Firebase al proyecto creado;
3. permitir lectura de verificación del proyecto.

Opciones válidas:

- corregir/configurar el secret `CXORBIA_GCP_PROJECT_CREATOR_JSON` con una service account dedicada que tenga `resourcemanager.projects.create` y permisos para `addFirebase`; o
- crear una sola vez el proyecto `cxorbia-tya-dev-260729-c4` desde una identidad administradora y otorgar a la service account existente acceso de lectura para verificarlo.

No se requieren PowerShell, ZIP, nueva candidata ni datos TyA.

## 12. Claude/prototipo y Academia

- Claude: Corte 3 congelado; no tocar backend/contracts/adapters; no reintroducir persistencia o fallback mock.
- Academia: documentar diferencia entre credencial estructuralmente válida, permiso IAM, creación de proyecto, agregar Firebase, Rules, lectura y escritura.

## 13. Siguiente bloque exacto

`RESOLVER IAM DE PROJECT CREATOR → CREAR/VERIFICAR FIREBASE NUEVO Y VACÍO → CONFIG WEB DEV SIN SECRETOS → AUTORIZAR RULES READ-ONLY → ACTIVAR SOLO LECTURA DEV → SMOKE CX.data`.

## 14. Estado seguro

Sin producción, merge, provider activation, Rules deploy, Firestore/Auth/Storage/HR writes, imports, pagos, lotes reales, Make ni Gemini live.
