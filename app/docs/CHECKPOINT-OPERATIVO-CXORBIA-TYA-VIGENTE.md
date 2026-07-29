# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_VISUAL_P0_PROVEN__FREEZE_BLOCKED__NO_DATA_WRITES`

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

## 4. Gates técnicos previos

### Gates 1–3: PASS

- Project ID `cxorbia-tya-dev-260729-c4`.
- Nueva identidad y vacío integral: PASS.
- Web App DEV READY.
- Firestore `(default)` Native/Standard `us-central1`, sin colecciones.
- Rules read-only DEPLOYED + VERIFIED.
- Firebase Authentication INITIALIZED, sin usuario permanente.
- Bootstrap idempotente `BOOTSTRAP_DEV_READONLY_COMPLETED_C4`.

### Gate 4 — protected CX.data smoke: PASS

Intento válido: `b698a925f5f6a7c8405afb7fb54a9f4c551e8498`.

Comprobado técnicamente:

- `source=firestore`;
- `empty=true`;
- `fallbackUsed=false`;
- `readOnly=true` / `writeMode=disabled`;
- interfaz `CX.data` preservada;
- write directo bloqueado;
- Firestore document writes=0;
- principal temporal eliminado;
- Auth users final=0;
- Email/Password final=false.

### Gate 5 — Hosting DEV: PASS técnico

Autorización consumida: `Autorizo Hosting DEV de Corte 4 para validación visual.`

- authorizationId `c4-hosting-visual-20260729-01`;
- deployed source commit `fabba5c76bb40f5105f8e10dd54be63e9b3eb783`;
- exactamente 1 Hosting deploy;
- remote proof PASS;
- entrypoint remoto PASS;
- Hosting-only;
- provider/data writes adicionales=0.

## 5. Gate 6 — validación visual humana: P0 PROVEN

Evidencia visual aportada por Paula contra la URL canónica:

- login muestra `Demo comercial · datos ficticios`;
- status visible `Fuente: localStorage/demo`;
- status visible `Auth: pendiente`;
- status visible `Proyecto: proyecto retail`;
- conteos visibles `Proyectos: 3 · Visitas: 108 · Shoppers: 18 · Postulaciones: 48`;
- dentro de Administración aparecen `Proyecto Retail`, `Proyecto Banca`, `Proyecto Restaurantes`;
- Dashboard Operativo renderiza KPIs y datos demo.

Esto incumple el criterio visual que exigía backend vacío/fail-closed sin fallback demo.

### P0 activo

`P0-C4-VIS-01 — FORBIDDEN_DEMO_FALLBACK_ON_AUTH_PENDING`.

### Causa raíz localizada

No es un fallo del Firebase nuevo ni una necesidad de materializar datos.

La cadena publicada contiene una contradicción backend:

1. `backend-config-preview-dev.js` activa `devPreviewAuth.enabled=true`;
2. después del protected smoke, el principal temporal fue correctamente eliminado y Email/Password quedó deshabilitado;
3. `backend-firebase.js::ensurePreviewAuth()` no encuentra credencial temporal;
4. el código marca explícitamente `localStorage/demo` y lanza error;
5. el `catch` vuelve a marcar `localStorage/demo` y conserva la UI con mock/localStorage.

Ese comportamiento es incompatible con `failClosedOnReadError=true`, `fallbackToMockOnReadError=false`, `fallbackToLocalStorageOnEmpty=false` y `emptyBackendMustRenderAsEmpty=true`.

## 6. Seguridad comprobada

- Firestore document writes: 0.
- Auth users permanentes: 0.
- Email/Password: deshabilitado.
- Storage writes: 0.
- Hosting Corte 4: exactamente 1 deploy autorizado y consumido.
- Rules deploy adicionales: 0.
- Functions/imports/materialización/HR/Make/Gemini/pagos/lotes/merge/producción: 0.

## 7. Bloqueo real actual

Corte 4 **NO puede congelarse** mientras el runtime publicado caiga a demo/localStorage.

La corrección debe ser focalizada en backend/core y no puede sustituirse por nueva candidata, UI patch, PowerShell, nueva rama/PR, nueva base o materialización anticipada.

## 8. Siguiente acción exacta

`AUTORIZACIÓN EXPRESA DE PAULA PARA CORREGIR P0-C4-VIS-01 → PATCH BACKEND FOCALIZADO → GATES → HOSTING DEV CONTROLADO → REVALIDACIÓN VISUAL → FREEZE CORTE 4 SI PASS → RETIRAR IAM TEMPORAL A VIEWER → CORTE 5`.

## 9. Claude/prototipo y Academia

- Claude/prototipo: no nueva candidata; no tocar módulos UI.
- Reusable CXOrbia: cuando backend real está seleccionado y Auth no está disponible, el runtime debe fail-close; jamás caer silenciosamente a datos demo.
- Exclusivo cliente: projectId DEV TyA y conteos observados.
- Academia: registrar diferencia entre provider smoke PASS, Hosting proof PASS y runtime visual con fuente efectiva incorrecta.
- Sin impacto Claude: corrección futura permanece en backend/core.

## 10. Estado seguro

PR #7 draft/open/no merge. Corte 3 preservado. Corte 4 detenido correctamente por P0 visual reproducible. No hay datos TyA materializados ni producción.