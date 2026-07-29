# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-29  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_READONLY_STATIC_PASS_PROVIDER_IAM_BLOCKED`

## 1. Objetivo

Operar TyA/Cinépolis como proyecto configurable con HR/histórico, shoppers, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización, sobre base nueva sin conectar/copiar la base vieja.

## 2. Secuencia por corte

`FUENTE → MAPPING/ADAPTER → GATES → BUILD → VALIDACIÓN VISUAL → CORRECCIÓN FOCALIZADA → FREEZE`

Un PASS técnico sin validación real no congela un corte.

## 3. Carril de candidatas

`EXECUTION_LANE_READY → AUDITORÍA DELTA → P0_PROVEN o GO → si GO APPLY_DELTA_DIRECTLY → COMMIT/PUSH → POST-GATES → HOSTING DEV → VALIDACIÓN → FREEZE`

No se sustituye por nueva rama/PR, workflow transportador, PowerShell, incoming, composite, tree directo ni acción manual de Paula.

## 4. Cortes cerrados

### M1 / Corte 1 / Corte 2A

`FROZEN/APROBADO`.

### Corte 3 — Finanzas e histórico de pagos

`FROZEN_ACTIVE_BASELINE`.

- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; no V183/R33.
- R26–R32: 135/135 PASS.
- HR remota, Hosting DEV y smoke de pagos: PASS.
- Mayo: 44 pagadas / 0 pendientes / 2 reviews / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- Pagos/lotes ejecutados por CXOrbia: 0.

P1/P2 de reportes/copy permanecen como backlog transversal y no reabren Corte 3.

## 5. Corte activo — Corte 4

Objetivo: `CX.data READ-ONLY → FIREBASE NUEVO Y VACÍO → MISMA INTERFAZ → CERO WRITES`.

Estado: `READONLY_STATIC_PASS_PROVIDER_IAM_BLOCKED`.

### 5.1 Hardening completado

- contrato read-only;
- backend desactivado por defecto;
- preview DEV solo lectura;
- guard `CX.data` que preserva interfaz y bloquea persistencia/acciones operativas;
- backend vacío sin fallback demo;
- errores de lectura fail-closed;
- Rules read-only candidate preparado y no desplegado;
- gate estático Corte 4 PASS con providerReads=0/providerWrites=0/dataWrites=0.

### 5.2 Base existente descartada

`cxorbia-backend-dev` contiene datos DEV y no puede usarse como base nueva/vacía. Queda excluida y no se conecta, copia o reutiliza.

### 5.3 Candidato nuevo

- projectId `cxorbia-tya-dev-260729-c4`;
- display name `CXOrbia TyA DEV Clean Corte 4`;
- únicos writes solicitados: project create + addFirebase;
- todo lo demás permanece false.

### 5.4 Bloqueo IAM comprobado

- preflight de credenciales: única ruta válida `existing_dev_service_account`;
- probe read-only: `TARGET_PROJECT_PERMISSION_DENIED_C4`;
- creación atómica: `BLOCKED_PROJECT_CREATION_PERMISSION_OR_POLICY`;
- projectCreated=false;
- firebaseAdded=false;
- existingDatabaseReused=false;
- Firestore/Auth/Storage/Rules/Hosting writes=0.

La service account disponible es válida, pero no tiene permiso organizacional para crear/verificar el proyecto candidato.

### 5.5 Desbloqueo mínimo

Una de estas dos acciones externas:

1. configurar `CXORBIA_GCP_PROJECT_CREATOR_JSON` con una service account dedicada con `resourcemanager.projects.create` y permiso para `addFirebase`; o
2. crear una sola vez `cxorbia-tya-dev-260729-c4` con identidad administradora y otorgar lectura a la service account existente.

No se pide PowerShell, ZIP, nueva candidata ni datos TyA.

### 5.6 Gates posteriores al desbloqueo

1. creación/identidad nueva confirmada;
2. vacío verificado;
3. config web DEV sin secretos;
4. Rules candidate read-only autorizado y desplegado solo en DEV;
5. activación de lectura;
6. smoke `source=firestore`, `empty=true`, `fallbackUsed=false`, interfaz preservada y writes=0.

## 6. Cortes siguientes

- **Corte 5:** materialización DEV con dry-run/idempotencia.
- **Corte 6:** Auth/RBAC.
- **Corte 7:** sincronización, evidencias y gates Make/Gemini.
- **Corte 8:** preproducción/producción con autorización.

## 7. Claude/prototipo

Corte 3 está congelado. No preparar V183. No tocar backend/contratos/adapters desde candidata.

## 8. Academia

- Corte 3: fuente operacional/financiera/pago y monedas separadas.
- Corte 4: backend vacío, fail-closed, interfaz estable y separación entre credencial válida, IAM, creación de proyecto, Firebase, Rules, lectura y escritura.

## 9. Estado seguro

Sin producción, merge, provider activation, Rules deploy, Firestore/Auth/Storage/HR writes, imports, pagos, lotes reales, Make ni Gemini live.
