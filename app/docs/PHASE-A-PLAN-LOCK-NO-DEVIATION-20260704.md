# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-29  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_PROTECTED_CXDATA_SMOKE_PASS__HOSTING_DEV_AUTH_PENDING`

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

Estado: `PROTECTED_CXDATA_SMOKE_PASS__HOSTING_DEV_AUTH_PENDING`.

### 5.1 Hardening completado

- contrato read-only;
- backend desactivado por defecto;
- preview DEV solo lectura;
- guard `CX.data` que preserva interfaz y bloquea persistencia/acciones operativas;
- backend vacío sin fallback demo;
- errores de lectura fail-closed;
- Rules read-only desplegadas únicamente en Firebase DEV nuevo;
- gate estático Corte 4 PASS.

### 5.2 Base existente descartada

`cxorbia-backend-dev` contiene datos DEV y no puede usarse como base nueva/vacía. Queda excluida y no se conecta, copia o reutiliza.

### 5.3 Firebase nuevo

- projectId `cxorbia-tya-dev-260729-c4`;
- display name `CXOrbia TyA DEV Clean Corte 4`;
- creado manualmente por Paula sin reutilizar base existente.

### 5.4 Gate 1 — identidad nueva: PASS

- commit `b18f0b6cf74afb8b3ac770a73231c6cf1353b37c`;
- status `TARGET_PROJECT_IDENTITY_VERIFIED_C4`;
- provider writes=0.

### 5.5 Gate 2 — vacío integral: PASS

- commit `7b0e40f8607b80a4f37238314a66064af35c5e6d`;
- nueva identidad=true;
- vacío verificado=true;
- apps=0, Auth users=0, Firestore databases=0, Storage buckets=0 antes del bootstrap;
- provider writes del gate=0.

### 5.6 Gate 3 — bootstrap provider DEV: PASS

Autorización consumida: `Autorizo bootstrap DEV read-only de Corte 4`.

Resultado:

- Web App DEV READY;
- Firestore `(default)` READY, Native/Standard, `us-central1`, sin colecciones;
- Rules read-only DEPLOYED + VERIFIED;
- Authentication inicializado en consola, sin proveedor ni usuarios permanentes;
- revalidación idempotente `e524b968c0003c27351d5d5826e21ffcf7cbfdbe`;
- `BOOTSTRAP_DEV_READONLY_COMPLETED_C4` PASS;
- Web/DB/Auth/Rules=true;
- provider config writes en revalidación=0.

### 5.7 Gate 4 — protected CX.data smoke: PASS

Autorización consumida: `Autorizo operador DEV temporal para smoke protegido de Corte 4`.

Intento válido: `b698a925f5f6a7c8405afb7fb54a9f4c551e8498`.

Evidencia:

- `c4smoke-error-NONE`;
- `c4smoke-srcfirestore-etrue-fbfalse-rotrue`;
- `c4cleanup-u0-emailfalse`.

El smoke confirmó:

- `source=firestore`;
- `empty=true`;
- `fallbackUsed=false`;
- `readOnly=true` / `writeMode=disabled`;
- interfaz `CX.data` preservada;
- claims `role=admin`, `tenantId=tya`;
- bloqueo de write directo;
- Firestore data arrays vacíos;
- Firestore document writes=0;
- operador temporal eliminado;
- Auth users final=0;
- Email/Password final=deshabilitado.

El status agregado quedó falsamente en error porque el publicador esperaba un segundo archivo de cleanup ya redundante. La corrección de raíz quedó en `9967146e112322efcd043155ae05351bbbbd4e8a` sin rerun ni nuevo Auth write.

### 5.8 Gates restantes

5. autorización separada de Hosting DEV para el mismo build read-only;
6. deploy Hosting DEV;
7. validación visual;
8. corrección focalizada solo si existe P0 reproducible;
9. freeze Corte 4;
10. retirar IAM temporal elevado y dejar runner en Viewer.

## 6. Cortes siguientes

- **Corte 5:** materialización DEV con dry-run/idempotencia.
- **Corte 6:** Auth/RBAC completo.
- **Corte 7:** sincronización, evidencias y gates Make/Gemini.
- **Corte 8:** preproducción/producción con autorización.

El principal temporal de Corte 4 fue exclusivamente de smoke y ya fue eliminado; no sustituye Auth/RBAC completo de Corte 6.

## 7. Claude/prototipo

Corte 3 está congelado. No preparar V183. No tocar backend/contratos/adapters desde candidata. Corte 4 no requiere nueva candidata frontend salvo hallazgo visual P0 reproducible.

## 8. Academia

- Corte 3: fuente operacional/financiera/pago y monedas separadas.
- Corte 4: backend vacío, fail-closed, interfaz estable y separación entre proyecto, IAM, Web App, Firestore, inicialización Auth, proveedor temporal, usuario temporal, claims, Rules, protected smoke, cleanup y reporting.

## 9. Estado seguro

Sin producción, merge, Firestore document writes, Auth users permanentes, Storage/HR writes, imports, pagos, lotes reales, Make ni Gemini live. Provider bootstrap y protected smoke de Corte 4 están completados; el siguiente gate es Hosting DEV con autorización separada.
