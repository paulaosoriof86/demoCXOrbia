# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-29  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_VISUAL_P0_PROVEN__FREEZE_BLOCKED`

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

Estado: `VISUAL_P0_PROVEN__FREEZE_BLOCKED`.

### 5.1 Hardening exigido

- contrato read-only;
- backend desactivado por defecto;
- preview DEV solo lectura;
- guard `CX.data` que preserva interfaz y bloquea persistencia/acciones operativas;
- backend vacío sin fallback demo;
- errores de lectura fail-closed;
- Rules read-only desplegadas únicamente en Firebase DEV nuevo.

### 5.2 Base existente descartada

`cxorbia-backend-dev` queda excluida y no se conecta, copia o reutiliza.

### 5.3 Firebase nuevo

- projectId `cxorbia-tya-dev-260729-c4`;
- display name `CXOrbia TyA DEV Clean Corte 4`;
- Firestore `us-central1`;
- creado sin reutilizar base existente.

### 5.4 Gates 1–3 — PASS

- identidad nueva: PASS;
- vacío integral previo: PASS;
- Web App DEV READY;
- Firestore `(default)` READY, Native/Standard, `us-central1`, sin colecciones;
- Rules read-only DEPLOYED + VERIFIED;
- Authentication inicializado;
- bootstrap idempotente `BOOTSTRAP_DEV_READONLY_COMPLETED_C4` PASS.

### 5.5 Gate 4 — protected CX.data smoke: PASS

Intento válido: `b698a925f5f6a7c8405afb7fb54a9f4c551e8498`.

Confirmado: `source=firestore`, `empty=true`, `fallbackUsed=false`, `readOnly=true`, write directo bloqueado, Firestore writes=0, cleanup completo, Auth users=0 y Email/Password deshabilitado al final.

### 5.6 Gate 5 — Hosting DEV: PASS técnico

Autorización consumida: `Autorizo Hosting DEV de Corte 4 para validación visual.`

- authorizationId `c4-hosting-visual-20260729-01`;
- deployed source commit `fabba5c76bb40f5105f8e10dd54be63e9b3eb783`;
- exactamente 1 deploy Hosting-only;
- remote proof y entrypoint verificados;
- cero writes de datos/proveedor fuera de Hosting.

### 5.7 Gate 6 — validación visual: P0 PROVEN

La validación de Paula mostró:

- `Fuente: localStorage/demo`;
- `Auth: pendiente`;
- `Demo comercial · datos ficticios`;
- 3 proyectos, 108 visitas, 18 shoppers y 48 postulaciones ficticias;
- Proyecto Retail/Banca/Restaurantes y KPIs demo visibles.

P0: `P0-C4-VIS-01 — FORBIDDEN_DEMO_FALLBACK_ON_AUTH_PENDING`.

Causa raíz localizada en backend: `backend-config-preview-dev.js` activa preview Auth; tras el cleanup correcto del principal temporal, `backend-firebase.js` no encuentra credencial y cae explícitamente a `localStorage/demo`, contradiciendo el contrato fail-closed/no-fallback.

### 5.8 Gates restantes

7. autorización expresa para corrección focalizada del P0;
8. patch backend/core únicamente;
9. gates de no-fallback y cero writes;
10. Hosting DEV controlado para revalidación;
11. validación visual PASS;
12. freeze Corte 4;
13. retirar IAM temporal elevado y dejar runner en Viewer.

## 6. Cortes siguientes

- **Corte 5:** materialización DEV con dry-run/idempotencia.
- **Corte 6:** Auth/RBAC completo.
- **Corte 7:** sincronización, evidencias y gates Make/Gemini.
- **Corte 8:** preproducción/producción con autorización.

Corte 5 no inicia mientras P0-C4-VIS-01 permanezca abierto.

## 7. Claude/prototipo

Corte 3 está congelado. No preparar V183. No tocar módulos UI ni crear nueva candidata por este P0. La corrección pertenece a backend/core.

## 8. Academia

- Corte 3: fuente operacional/financiera/pago y monedas separadas.
- Corte 4: distinguir provider smoke PASS, Hosting proof PASS y fuente efectiva del runtime visual. Patrón: backend real seleccionado + Auth ausente debe fail-close, nunca caer a demo.

## 9. Estado seguro

Sin producción, merge, Firestore document writes, Auth users permanentes, Storage/HR writes, imports, pagos, lotes reales, Make ni Gemini live. Corte 4 está correctamente detenido por P0 visual reproducible.