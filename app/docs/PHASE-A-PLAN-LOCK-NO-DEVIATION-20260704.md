# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-29  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_PROVIDER_BOOTSTRAP_COMPLETED__PROTECTED_CXDATA_SMOKE_AUTH_PRINCIPAL_PENDING`

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

Estado: `PROVIDER_BOOTSTRAP_COMPLETED__PROTECTED_CXDATA_SMOKE_AUTH_PRINCIPAL_PENDING`.

### 5.1 Hardening completado

- contrato read-only;
- backend desactivado por defecto;
- preview DEV solo lectura;
- guard `CX.data` que preserva interfaz y bloquea persistencia/acciones operativas;
- backend vacío sin fallback demo;
- errores de lectura fail-closed;
- Rules read-only preparadas y desplegadas únicamente en Firebase DEV nuevo;
- gate estático Corte 4 PASS.

### 5.2 Base existente descartada

`cxorbia-backend-dev` contiene datos DEV y no puede usarse como base nueva/vacía. Queda excluida y no se conecta, copia o reutiliza.

### 5.3 Firebase nuevo

- projectId `cxorbia-tya-dev-260729-c4`;
- display name `CXOrbia TyA DEV Clean Corte 4`;
- creado manualmente por Paula sin reutilizar base existente.

### 5.4 Gate 1 — identidad nueva: PASS

- request `corte4-probe-project-identity-20260729-03`;
- commit `b18f0b6cf74afb8b3ac770a73231c6cf1353b37c`;
- status `TARGET_PROJECT_IDENTITY_VERIFIED_C4`;
- provider writes=0.

### 5.5 Gate 2 — vacío integral: PASS

- request `corte4-verify-new-empty-firebase-dev-20260729-05`;
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
- Authentication inicializado manualmente por Paula en consola, sin proveedor habilitado y sin usuarios;
- revalidación idempotente commit `e524b968c0003c27351d5d5826e21ffcf7cbfdbe`;
- `BOOTSTRAP_DEV_READONLY_COMPLETED_C4` PASS;
- `web=true`, `db=true`, `auth=true`, `rules=true`;
- provider config writes en revalidación=0;
- Firestore document writes=0;
- Auth user writes=0.

### 5.7 Gate 4 — smoke protegido `CX.data`: pendiente de principal temporal

Las Rules actuales requieren usuario autenticado con rol de operador y tenant permitido. El Firebase nuevo sigue con Auth users=0 y sin proveedores habilitados.

No se crea usuario ni se habilita proveedor por inferencia. Para ejecutar el smoke real de cliente protegido se requiere autorización expresa y acotada para:

1. habilitar Email/Password únicamente en DEV;
2. crear exactamente un operador temporal con credencial aleatoria no expuesta y claims `role=admin`, `tenantId=tya`;
3. ejecutar `CX.data` read-only contra el Firestore vacío;
4. demostrar `source=firestore`, `empty=true`, `fallbackUsed=false`, interfaz preservada y Firestore document writes=0;
5. eliminar el operador temporal;
6. deshabilitar Email/Password;
7. confirmar Auth users=0 nuevamente.

Ese usuario temporal no se migra, no sustituye Corte 6 y no toca datos TyA.

### 5.8 Gates restantes

5. autorización separada de Hosting DEV para el mismo build read-only;
6. validación visual;
7. freeze Corte 4;
8. retirar IAM temporal elevado y dejar runner en Viewer.

## 6. Cortes siguientes

- **Corte 5:** materialización DEV con dry-run/idempotencia.
- **Corte 6:** Auth/RBAC completo.
- **Corte 7:** sincronización, evidencias y gates Make/Gemini.
- **Corte 8:** preproducción/producción con autorización.

El principal temporal de Corte 4, si se autoriza, existe únicamente durante el smoke y se elimina al terminar; no sustituye Auth/RBAC completo de Corte 6.

## 7. Claude/prototipo

Corte 3 está congelado. No preparar V183. No tocar backend/contratos/adapters desde candidata. Corte 4 no requiere nueva candidata frontend salvo hallazgo visual P0 reproducible.

## 8. Academia

- Corte 3: fuente operacional/financiera/pago y monedas separadas.
- Corte 4: backend vacío, fail-closed, interfaz estable y separación entre proyecto, IAM, Web App, Firestore, inicialización Auth, proveedor, usuario temporal, claims, Rules, lectura protegida y materialización.

## 9. Estado seguro

Sin producción, merge, Firestore document writes, Auth users permanentes, Storage/HR writes, imports, pagos, lotes reales, Make ni Gemini live. Provider bootstrap de Corte 4 está completado; el siguiente gate requiere autorización específica antes de crear un principal Auth temporal.
