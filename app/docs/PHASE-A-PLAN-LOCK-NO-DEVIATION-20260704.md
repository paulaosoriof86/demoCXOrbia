# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-29  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_NEW_EMPTY_FIREBASE_VERIFIED_PASS__PROVIDER_BOOTSTRAP_AUTHORIZATION_PENDING`

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

Estado: `NEW_EMPTY_FIREBASE_VERIFIED_PASS__PROVIDER_BOOTSTRAP_AUTHORIZATION_PENDING`.

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

### 5.3 Firebase nuevo

- projectId `cxorbia-tya-dev-260729-c4`;
- display name `CXOrbia TyA DEV Clean Corte 4`;
- creado manualmente por Paula sin reutilizar base existente;
- service account del runner con rol `Viewer` únicamente para verificación read-only.

### 5.4 Gate 1 — identidad nueva: PASS

- request `corte4-probe-project-identity-20260729-03`;
- commit `b18f0b6cf74afb8b3ac770a73231c6cf1353b37c`;
- status `TARGET_PROJECT_IDENTITY_VERIFIED_C4`;
- provider writes=0.

### 5.5 Gate 2 — vacío integral: PASS

- request `corte4-verify-new-empty-firebase-dev-20260729-05`;
- commit `7b0e40f8607b80a4f37238314a66064af35c5e6d`;
- statuses `cxorbia/corte4-verify-new-empty-firebase = success` y diagnóstico `id1-e1-u0-n0-a0-au0-f0-s0-h1`;
- nueva identidad=true;
- vacío verificado=true;
- checks no disponibles=0;
- señales no vacías=0;
- apps=0;
- Auth users=0;
- Firestore databases=0;
- Storage buckets=0;
- Hosting=1 `DEFAULT_SITE` provider-managed, sin user sites/releases como señal de contenido;
- provider writes=0.

### 5.6 Correcciones focalizadas del verificador

El primer intento integral reveló dos defectos del gate y no contaminación del proyecto:

1. query Auth count-only inválida; corregida para `returnUserInfo=false` sin límite incompatible;
2. `DEFAULT_SITE` de Firebase Hosting se trataba erróneamente como contaminación; ahora se separa infraestructura provider-default de sitios/release de usuario.

Un typo intermedio de OAuth `grant_type` fue detectado y corregido en `a11191177d0c91c63c273dc731675772f5d0f5c9` antes de disparar ese intento; no produjo provider call ni write.

### 5.7 Gates restantes

3. registrar/configurar Web App DEV sin secretos en repo;
4. con autorización expresa, inicializar únicamente el mínimo provider necesario para lectura DEV: Firestore + Auth bootstrap temporal de operador y desplegar `backend/rules/firestore.corte4-readonly.rules`;
5. activar solo lectura DEV;
6. smoke `source=firestore`, `empty=true`, `fallbackUsed=false`, interfaz preservada y writes=0;
7. validación visual;
8. freeze Corte 4.

Los pasos 3–4 implican provider writes de configuración y requieren autorización separada. No autorizan import/materialización, Storage, Hosting deploy, Functions, Make/Gemini, pagos ni producción.

## 6. Cortes siguientes

- **Corte 5:** materialización DEV con dry-run/idempotencia.
- **Corte 6:** Auth/RBAC completo.
- **Corte 7:** sincronización, evidencias y gates Make/Gemini.
- **Corte 8:** preproducción/producción con autorización.

El Auth de Corte 4, si se autoriza, es solo bootstrap DEV mínimo para demostrar lectura protegida; no sustituye el Auth/RBAC completo de Corte 6.

## 7. Claude/prototipo

Corte 3 está congelado. No preparar V183. No tocar backend/contratos/adapters desde candidata. Corte 4 no requiere nueva candidata frontend salvo hallazgo visual P0 reproducible.

## 8. Academia

- Corte 3: fuente operacional/financiera/pago y monedas separadas.
- Corte 4: backend vacío, fail-closed, interfaz estable y separación entre credencial, IAM, identidad, vacío, infraestructura provider-default, Web App, Auth bootstrap, Firestore, Rules, lectura y escritura.

## 9. Estado seguro

Sin producción, merge, Rules deploy, Firestore/Auth/Storage/HR writes de datos, imports, pagos, lotes reales, Make ni Gemini live. Los únicos provider writes ya ocurridos en Corte 4 fueron la creación manual del proyecto y el grant IAM Viewer expresamente ejecutados por Paula; los probes/gates posteriores fueron read-only.
