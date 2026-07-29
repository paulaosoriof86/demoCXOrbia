# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-29  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_VIS01_VIS02_VIS02B_TECHNICALLY_RESOLVED__FINAL_REMOTE_DIAGNOSTIC_PASS__HUMAN_VISUAL_PENDING`

## 1. Objetivo
Operar TyA/Cinépolis como proyecto configurable con HR/histórico, shoppers, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización, sobre base nueva sin conectar/copiar la base vieja.

## 2. Secuencia por corte
`FUENTE → MAPPING/ADAPTER → GATES → BUILD → VALIDACIÓN VISUAL → CORRECCIÓN FOCALIZADA → FREEZE`

Un PASS técnico sin validación humana final no congela un corte.

## 3. Carril de candidatas
`EXECUTION_LANE_READY → AUDITORÍA DELTA → P0_PROVEN o GO → si GO APPLY_DELTA_DIRECTLY → COMMIT/PUSH → POST-GATES → HOSTING DEV → VALIDACIÓN → FREEZE`

No se sustituye por nueva rama/PR, PowerShell, incoming, nueva candidata ni acción manual de Paula salvo imposibilidad técnica real.

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
- P1/P2 de reportes/copy permanecen backlog transversal y no reabren Corte 3.

## 5. Corte activo — Corte 4
Objetivo: `CX.data READ-ONLY → FIREBASE NUEVO Y VACÍO → MISMA INTERFAZ → CERO WRITES`.

Estado: `VIS01_VIS02_VIS02B_TECHNICALLY_RESOLVED__FINAL_REMOTE_DIAGNOSTIC_PASS__HUMAN_VISUAL_PENDING`.

### 5.1 Hardening
- contrato read-only;
- backend desactivado por defecto;
- Preview DEV solo lectura;
- guard `CX.data` preserva interfaz y bloquea persistencia/acciones;
- backend vacío sin fallback demo;
- errores/read/Auth fail-closed;
- `fallbackUsed=false` observable desde primer estado;
- Rules read-only desplegadas únicamente en Firebase DEV nuevo.

### 5.2 Firebase nuevo
- projectId `cxorbia-tya-dev-260729-c4`;
- display name `CXOrbia TyA DEV Clean Corte 4`;
- Firestore `us-central1`;
- base anterior `cxorbia-backend-dev` excluida: no conectar, copiar ni reutilizar.

### 5.3 Gates provider/smoke — PASS
- identidad nueva y vacío integral: PASS;
- Web App, Firestore, Rules, Auth config: PASS;
- protected smoke `source=firestore`, `empty=true`, `fallbackUsed=false`, `readOnly=true`, writes=0, cleanup completo.

### 5.4 P0-C4-VIS-01 — CORREGIDO
Visual inicial mostró fallback prohibido a demo/localStorage. Fix backend/core revalidado; visual humana posterior confirmó Firestore activo, sin fixtures demo y conteos 0/0/0/0.

### 5.5 P0-C4-VIS-02 — CORREGIDO
Visual humana mostró Admin blanco y shell Shopper residual con backend vacío.

Fix focalizado sin `app/modules`:
- `app/core/backend-corte4-empty-shell-guard.js`;
- backend vacío tratado como first-class state;
- null-safety proyecto/período;
- limpieza de rail/view/crumb entre roles.

Gate local Admin vacío → logout → Shopper vacío → logout → Admin vacío: PASS.

### 5.6 P0-C4-VIS-02B — CORREGIDO
El primer deploy VIS-02 reveló `Unexpected token '<'`. Causa raíz: `index-backend-dev.html` referenciaba `adapters/tya-phase-a-source-safe-dev-adapter.js`, archivo inexistente; el rewrite de Hosting devolvía HTML 200 para esa ruta `.js`.

Corrección:
- referencia huérfana eliminada;
- no se creó adapter ficticio;
- gate reusable `tools/qa/cxorbia-corte4-entrypoint-script-integrity.mjs` PASS.

### 5.7 Hosting DEV final VIS-02B — AUTORIZACIÓN CONSUMIDA
Autorización:
`Autorizo un único Hosting DEV final para revalidación de P0-C4-VIS-02B, sin data writes ni producción`.

- authorizationId `c4-p0-vis02b-final-20260729-01`;
- deployed source `e9b7441fab4370ba455a77791b79b6e167cd33ac`;
- `cxorbia/c4p0vis02b-final-deploys1=success`;
- `cxorbia/c4p0vis02b-final-scripts=success`;
- exactamente 1 deploy;
- workflow one-shot convertido a HOLD después de consumir la autorización.

### 5.8 Diagnóstico remoto final — PASS
El status agregado del runner final quedó `error`; no se declaró PASS por inferencia. Se ejecutó diagnóstico remoto independiente read-only con providerWrites=0.

- `cxorbia/c4p0vis02b-diag-summary=success`;
- `cxorbia/c4p0vis02b-diag-pass=success`;
- proof del source desplegado: correcto;
- 0 pageerrors;
- todos los scripts locales: JavaScript válido;
- Admin vacío → logout → Shopper vacío → logout → Admin vacío: PASS;
- sin shell Shopper residual;
- conteos 0/0/0/0 y sin demo/localStorage.

### 5.9 Gate restante
1. validación visual humana final de Paula sobre la URL VIS-02B;
2. si no existe P0 reproducible: freeze Corte 4;
3. retirar IAM temporal elevado y dejar Viewer.

## 6. Cortes siguientes
- **Corte 5:** materialización DEV con dry-run/idempotencia.
- **Corte 6:** Auth/RBAC completo.
- **Corte 7:** sincronización, evidencias y gates Make/Gemini.
- **Corte 8:** preproducción/producción con autorización.

Corte 5 inicia inmediatamente después del freeze de Corte 4.

## 7. Claude/prototipo
Corte 3 está congelado. No preparar nueva candidata por VIS-01/VIS-02/VIS-02B. Preservar fix core/entrypoint y no tocar `app/modules` para estos P0.

## 8. Academia
- backend conectado + dataset vacío es estado válido;
- role-switch debe limpiar DOM previo;
- rewrite Hosting puede convertir asset faltante en HTML 200;
- gate de integridad de entrypoint debe validar existencia + tipo de contenido, no solo status HTTP.

## 9. Estado seguro
Sin producción, merge, Firestore document writes, Auth users permanentes, Storage/HR writes, imports, pagos/lotes reales, Make ni Gemini live. Hosting final VIS-02B fue exactamente 1/1 y la autorización quedó consumida. Gate vivo único: validación visual humana final.
