# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-29  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_P0_FIXED_REMOTE_REVALIDATION_PASS__HUMAN_VISUAL_PENDING`

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

P1/P2 de reportes/copy permanecen backlog transversal y no reabren Corte 3.

## 5. Corte activo — Corte 4

Objetivo: `CX.data READ-ONLY → FIREBASE NUEVO Y VACÍO → MISMA INTERFAZ → CERO WRITES`.

Estado: `P0_FIXED_REMOTE_REVALIDATION_PASS__HUMAN_VISUAL_PENDING`.

### 5.1 Hardening

- contrato read-only;
- backend desactivado por defecto;
- Preview DEV solo lectura;
- guard `CX.data` preserva interfaz y bloquea persistencia/acciones;
- backend vacío sin fallback demo;
- errores/read/Auth fail-closed;
- `fallbackUsed=false` observable desde primer estado;
- Rules read-only desplegadas únicamente en Firebase DEV nuevo.

### 5.2 Base existente descartada

`cxorbia-backend-dev` queda excluida: no conectar, copiar ni reutilizar.

### 5.3 Firebase nuevo

- projectId `cxorbia-tya-dev-260729-c4`;
- display name `CXOrbia TyA DEV Clean Corte 4`;
- Firestore `us-central1`.

### 5.4 Gates 1–4 — PASS

- identidad nueva y vacío integral: PASS;
- Web App, Firestore, Rules, Auth config: PASS;
- protected smoke `b698a925f5f6a7c8405afb7fb54a9f4c551e8498`: `source=firestore`, `empty=true`, `fallback=false`, `readOnly=true`, writes=0, cleanup completo.

### 5.5 Hosting DEV inicial — PASS técnico

- authorizationId `c4-hosting-visual-20260729-01`;
- deployed source `fabba5c76bb40f5105f8e10dd54be63e9b3eb783`;
- 1 deploy Hosting-only;
- proof/entrypoint PASS.

### 5.6 Visual inicial — P0 PROVEN

La visual humana mostró fallback prohibido a `localStorage/demo`, fixtures Retail/Banca/Restaurantes y conteos 3/108/18/48.

P0: `P0-C4-VIS-01 — FORBIDDEN_DEMO_FALLBACK_ON_AUTH_PENDING`.

### 5.7 Corrección focalizada P0 — COMPLETADA

Autorización consumida:

`Autorizo corrección focalizada de P0-C4-VIS-01 y un único Hosting DEV de revalidación de Corte 4, sin data writes ni producción`

Solo backend/core:

- `app/core/backend-config-preview-dev.js`;
- `app/core/backend-cxdata-readonly-corte4.js`;
- `app/core/backend-preview-status.js`.

No se tocaron módulos UI.

### 5.8 Diagnóstico local — PASS

- trigger `58f227e2d67c0efa15c363e19e2cbcfea91e19b8`;
- `c4p0vis01-diagnostic=success`;
- `c4p0local-pass=success`;
- provider writes=0.

### 5.9 Hosting DEV revalidación — PASS

- authorizationId `c4-p0-vis01-revalidate-20260729-01`;
- deployed source `424eca2ae5a7cd6f240dfc97b17048f3c124eb2c`;
- `c4p0vis01-revalidation=success`;
- `c4p0vis01-deploys1=success`;
- exactamente 1 deploy en esta autorización;
- browser remoto: 0 proyectos/visitas/shoppers/postulaciones, fixtures=false, demoMode=false, fallbackUsed=false y sin proyectos/badge demo.
- autorización consumida; workflow HOLD.

URL visual nueva:

`https://cxorbia-tya-dev-260729-c4.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&p0vis01=424eca2ae5a7cd6f240dfc97b17048f3c124eb2c`

### 5.10 Gates restantes

1. validación visual humana de Paula sobre URL nueva;
2. si no hay P0: freeze Corte 4;
3. retirar IAM temporal elevado y dejar runner en Viewer.

## 6. Cortes siguientes

- **Corte 5:** materialización DEV con dry-run/idempotencia.
- **Corte 6:** Auth/RBAC completo.
- **Corte 7:** sincronización, evidencias y gates Make/Gemini.
- **Corte 8:** preproducción/producción con autorización.

Corte 5 inicia inmediatamente después del freeze de Corte 4.

## 7. Claude/prototipo

Corte 3 está congelado. No preparar V183. P0-C4-VIS-01 no requiere nueva candidata ni cambio en módulos UI. Solo actuar si la nueva visual prueba otro P0 localizado.

## 8. Academia

- Corte 3: fuente operacional/financiera/pago y monedas separadas.
- Corte 4: provider/Hosting no sustituyen browser/humano; backend real + Auth ausente debe fail-close antes del primer render; `fallbackUsed=false` debe ser observable desde estado inicial.

## 9. Estado seguro

Sin producción, merge, Firestore document writes, Auth users permanentes, Storage/HR writes, imports, pagos/lotes reales, Make ni Gemini live. P0-C4-VIS-01 pasó corrección técnica local/remota; gate vivo único: validación visual humana.
