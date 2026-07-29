# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_HOSTING_DEV_PASS__VISUAL_VALIDATION_PENDING__NO_DATA_WRITES`

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

## 4. Firebase nuevo / Gates 1–3: PASS

- Project ID: `cxorbia-tya-dev-260729-c4`.
- Display name: `CXOrbia TyA DEV Clean Corte 4`.
- `cxorbia-backend-dev` permanece excluido: no se conecta, copia o reutiliza.
- Identidad nueva: PASS, commit `b18f0b6cf74afb8b3ac770a73231c6cf1353b37c`.
- Vacío integral previo: PASS, commit `7b0e40f8607b80a4f37238314a66064af35c5e6d`.
- Web App DEV `CXOrbia TyA DEV Corte 4`: READY.
- Firestore `(default)`: READY, Native/Standard, `us-central1`, sin colecciones.
- Rules `backend/rules/firestore.corte4-readonly.rules`: DEPLOYED + VERIFIED.
- Firebase Authentication: INITIALIZED; sin usuario permanente.
- Bootstrap revalidado idempotentemente: `e524b968c0003c27351d5d5826e21ffcf7cbfdbe`.
- Decisión: `BOOTSTRAP_DEV_READONLY_COMPLETED_C4`.

## 5. Gate 4 — protected CX.data smoke: PASS

Autorización consumida: `Autorizo operador DEV temporal para smoke protegido de Corte 4`.

Intento válido: `b698a925f5f6a7c8405afb7fb54a9f4c551e8498`.

Comprobado:

- `source=firestore`;
- `empty=true`;
- `fallbackUsed=false`;
- `readOnly=true`;
- `writeMode=disabled`;
- interfaz `CX.data` preservada;
- claims temporales `role=admin`, `tenantId=tya`;
- write directo bloqueado;
- Firestore document writes=0;
- cleanup completo;
- Auth users final=0;
- Email/Password final=false.

El falso negativo del publicador quedó corregido en `9967146e112322efcd043155ae05351bbbbd4e8a` sin rerun ni nuevo Auth write.

## 6. Gate 5 — Hosting DEV para validación visual: PASS

Autorización consumida: `Autorizo Hosting DEV de Corte 4 para validación visual.`

Ejecución:

- authorizationId `c4-hosting-visual-20260729-01`;
- deployed source commit `fabba5c76bb40f5105f8e10dd54be63e9b3eb783`;
- `cxorbia/corte4-hosting-dev-visual = success`;
- `cxorbia/c4hosting-deploys1 = success`;
- exactamente 1 Hosting deploy ejecutado;
- remote proof PASS;
- `index-backend-dev.html` remoto verificado;
- build temporal con Firebase Web config inyectado solo durante deploy, sin credencial de usuario ni secreto persistido en repo;
- `backend-dev-auth.local.js` remoto sin credenciales;
- Hosting-only sobre `cxorbia-tya-dev-260729-c4`.

URL visual canónica:

`https://cxorbia-tya-dev-260729-c4.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&c4visual=fabba5c76bb40f5105f8e10dd54be63e9b3eb783`

La autorización quedó consumida y congelada:

- workflow one-shot pasó a HOLD en `03ce796ee5320ed8c0ecffe8954cbaf735c63df0`;
- request pasó a `enabled=false`, `status=consumed`, `hostingDeployExecutions=0` en `cfca7726e69a3fb2f082a75a27c59c96e29f80fe`.

## 7. Seguridad comprobada

- Firestore document writes: 0.
- Auth users permanentes: 0.
- Email/Password: deshabilitado.
- Storage writes: 0.
- Rules deploy adicionales: 0.
- Functions: 0.
- imports/materialización: 0.
- HR writes: 0.
- Make/Gemini: 0.
- pagos/lotes: 0.
- merge/producción: 0.
- Hosting Corte 4: exactamente 1 deploy autorizado, ya consumido.

## 8. Gate real siguiente — validación visual

La infraestructura y lectura protegida de Corte 4 ya están demostradas técnicamente. Falta validación humana del runtime DEV publicado.

Criterio:

1. Paula abre la URL visual canónica;
2. comprueba arranque, login/shell, navegación y estado vacío/fail-closed sin fallback demo;
3. si existe P0 reproducible, corregir únicamente ese P0;
4. si no existe P0, `FREEZE CORTE 4`;
5. retirar IAM temporal elevado y dejar runner en Viewer;
6. continuar inmediatamente con Corte 5 materialización DEV.

## 9. Siguiente acción exacta

`VALIDACIÓN VISUAL PAULA → FREEZE CORTE 4 SI NO HAY P0 → RETIRAR IAM TEMPORAL A VIEWER → CORTE 5`.

No se necesita PowerShell, nueva candidata, ZIP ni configuración Firebase manual.

## 10. Claude/prototipo y Academia

- Claude/prototipo: sin nueva candidata; solo abrir tarea si la visual demuestra P0 reproducible localizado.
- Academia: separar Hosting DEV, protected smoke, visual humana y producción.
- Reusable CXOrbia: one-shot authorization, Hosting-only config, remote proof, anti-redeploy y cleanup de autorización.
- Exclusivo cliente: projectId DEV TyA y `us-central1`.
- Sin impacto Claude: runner, Firebase Hosting, IAM y proof remoto.

## 11. Estado seguro

PR #7 draft/open/no merge. Corte 3 preservado. Corte 4 tiene bootstrap, protected smoke y Hosting DEV PASS. No hay datos TyA materializados ni producción. Gate vivo único: validación visual.
