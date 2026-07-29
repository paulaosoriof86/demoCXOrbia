# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_P0_FIXED_REMOTE_REVALIDATION_PASS__HUMAN_VISUAL_PENDING__NO_DATA_WRITES`

## 1. Repositorio

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos y data writes reales: 0.

## 2. Orden de lectura vigente

1. este índice;
2. reglas maestras vigentes;
3. addendum de empalme directo/carril file-aware;
4. addenda de Academia, patrones y antidesvío;
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`;
8. `app/docs/CAMBIOS-BACKEND-ADDENDUM-CORTE4-P0-VIS01-FIX-REMOTE-PASS-20260729.md`;
9. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE4-P0-VIS01-FIX-REMOTE-PASS-20260729.md`;
10. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-CORTE4-P0-VIS01-FIX-REMOTE-PASS-20260729.md`;
11. `app/docs/ACADEMIA-IMPACTO-CORTE4-P0-VIS01-FIX-REMOTE-PASS-20260729.md`;
12. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-CORTE4-P0-VIS01-FIX-REMOTE-PASS-20260729.md`;
13. `app/docs/VALIDACION-VISUAL-CORTE4-P0-PROVEN-20260729.md` como evidencia histórica del P0 inicial;
14. `app/docs/ACTIVE-BASELINE-CORTE3-V182-20260729.json`;
15. `app/docs/FREEZE-CORTE3-V182-APPROVED-20260729.md`;
16. PR #7 y HEAD vivo.

## 3. Corte 3 — congelado

- `FROZEN_ACTIVE_BASELINE`.
- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; no V183/R33.
- 14 periodos / 616 visitas.
- Mayo: 44 pagadas / 0 pendientes / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- P1/P2 de PDF, Excel, reportKit y copy no reabren Corte 3.

## 4. Corte 4 — objetivo

Firebase nuevo/vacío, `CX.data` read-only, misma interfaz, backend vacío visible como vacío, fail-closed y cero data writes.

Hardening vigente:

- `readOnly=true` / `writeMode=disabled`;
- no fallback mock/localStorage;
- `fallbackUsed=false` observable desde el primer estado;
- base legacy/preexistente prohibida;
- UI modules no reciben lógica backend.

## 5. Gates previos — PASS

- Firebase nuevo `cxorbia-tya-dev-260729-c4`.
- Identidad/vacío integral: PASS.
- Web App DEV, Firestore `us-central1`, Rules read-only, Auth config: PASS.
- Protected smoke: `source=firestore`, `empty=true`, `fallbackUsed=false`, `readOnly=true`, writes=0, cleanup completo.
- Protected smoke commit válido: `b698a925f5f6a7c8405afb7fb54a9f4c551e8498`.
- Hosting inicial: PASS técnico; deployed source `fabba5c76bb40f5105f8e10dd54be63e9b3eb783`.

## 6. Visual inicial — P0 demostrado

La visual humana inicial mostró `localStorage/demo`, Auth pendiente, datos ficticios y 3 proyectos / 108 visitas / 18 shoppers / 48 postulaciones.

P0: `P0-C4-VIS-01 — FORBIDDEN_DEMO_FALLBACK_ON_AUTH_PENDING`.

## 7. Corrección focalizada — PASS técnico

Autorización consumida:

`Autorizo corrección focalizada de P0-C4-VIS-01 y un único Hosting DEV de revalidación de Corte 4, sin data writes ni producción`

Corrección únicamente en:

- `app/core/backend-config-preview-dev.js`;
- `app/core/backend-cxdata-readonly-corte4.js`;
- `app/core/backend-preview-status.js`.

No se tocó `app/modules/`.

Diagnóstico read-only final:

- trigger `58f227e2d67c0efa15c363e19e2cbcfea91e19b8`;
- `cxorbia/c4p0vis01-diagnostic=success`;
- `cxorbia/c4p0local-pass=success`.

Hosting DEV de revalidación:

- authorizationId `c4-p0-vis01-revalidate-20260729-01`;
- deployed source `424eca2ae5a7cd6f240dfc97b17048f3c124eb2c`;
- `cxorbia/c4p0vis01-revalidation=success`;
- `cxorbia/c4p0vis01-deploys1=success`;
- exactamente 1 deploy dentro de esta autorización;
- browser remoto comprobó cero fixtures/demo, conteos 0/0/0/0 y `fallbackUsed=false`.

URL canónica de revalidación humana:

`https://cxorbia-tya-dev-260729-c4.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&p0vis01=424eca2ae5a7cd6f240dfc97b17048f3c124eb2c`

La autorización y el diagnóstico quedaron consumidos/cerrados; no existe redeploy automático habilitado.

## 8. Seguridad actual

- Firestore document writes=0;
- Auth users permanentes=0;
- Email/Password=deshabilitado;
- Storage writes=0;
- Rules/Functions/imports/HR/Make/Gemini/payments/merge/production adicionales=0;
- Hosting Corte 4: 1 deploy inicial + 1 deploy de revalidación P0, cada uno bajo autorización separada y ya consumida.

## 9. Gate vivo único

`REVALIDACIÓN VISUAL HUMANA DE PAULA SOBRE URL NUEVA → si no existe P0, FREEZE CORTE 4 → retirar IAM temporal a Viewer → CORTE 5 materialización DEV`.

No se requiere PowerShell, nueva candidata, ZIP ni configuración Firebase manual.

## 10. Claude/prototipo y Academia

- Claude: sin nueva candidata; no tocar módulos UI ni backend/contracts/adapters. Solo actuar si la nueva visual demuestra otro P0 localizado.
- Academia: documentar fail-closed antes del primer render y diferencia entre provider/Hosting/browser/humano.
- Reusable CXOrbia: backend real seleccionado + Auth ausente jamás habilita fixtures demo/localStorage.
