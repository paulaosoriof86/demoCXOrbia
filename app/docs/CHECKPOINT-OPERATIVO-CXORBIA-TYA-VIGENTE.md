# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-12  
**Estado:** `C6_STAFF_SINGLE_VISIBLE_FORM_QA_ROOTCAUSE_FIXED__STOP_RETRY__PHASE_A_88__HOSTING_1_OF_1__NO_PRODUCTION`

## Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Provider target: `cxorbia-backend-dev`.
- Exact Write V2: cerrado y no repetible.
- Producción: intacta.

## Gates cerrados que no se reabren

`PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2_READBACK` permanece válido.

- Auth writes históricos del Exact Write V2: 14.
- Firestore writes históricos del Exact Write V2: 16.
- Deletes: 0.
- A/B/C/D/R4 canonical readback: PASS.
- Ocho históricos deshabilitados con readback.
- Rollback: no requerido.
- No reabrir provider snapshot, private handoff, D rebase, Auth340, SKIP13, MultiAuth, HR o M4 sin drift reproducible.

## One-shot autorizado y ejecutado

Action: `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

Request nuevo:

- requestId: `c6-live-user-admin-membership-runtime-proof-20260812-04`;
- request commit: `eec93e7f1fe89d1a63ca2ea6e7bf8b99f2d6af7d`;
- target HEAD autorizado: `33ad176fb886c51c0dd3d8d81afee3ac83ac4be9`;
- run: `31646324988`;
- artifact: `9160870076`;
- digest: `sha256:e92ec72789ded9db63346bb6b1ca39e71861b4a28b14e35558940124f7e7782b`;
- `singleHostingDeployMax=1`;
- `stopRetryOnFailure=true`.

El workflow pasó request/autorización, Google Cloud DEV, tooling, selector privado Staff/admin, source gate y Hosting DEV.

## Hosting DEV — PASS y consumido 1/1

El deploy autorizado se ejecutó exactamente una vez:

- `deploy.attempted=true`;
- exit code `0`;
- `hostingDeploysThisRun=1`;
- Hosting autorizado consumido: **1/1**.

El gate remoto de entrada pasó:

`PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY`

con root 302 hacia `/index-backend-dev.html`, canonical 200 y paridad exacta `true`.

## Runtime Staff — FAIL antes de credenciales

El proof Staff terminó en:

`FAIL_C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

La cadena solicitada `Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend` **no quedó certificada** porque el smoke falló antes de enviar credenciales. Reload y new-tab no fueron alcanzados.

El artifact demostró que el wrapper Firebase y la UI de login sí estaban presentes, pero el harness esperaba un contrato visual obsoleto: `#cxIntegratedAuthStep/#cxIntegratedAuthLogin/...`.

El contrato real vigente en `app/core/backend-browser-auth.js` usa el único formulario visible del producto:

`#loginForm → #lgUser → #lgPass → #lgSubmit`.

Por tanto, la causa raíz reproducible es `QA_HARNESS_CONTRACT_DRIFT`, no un fallo demostrado de provider, Auth, membership o datos.

## STOP_RETRY y corrección source-only

`STOP_RETRY` aplicado. No hubo rerun, segundo request ni segundo Hosting bajo esta autorización.

Después del fallo se corrigió únicamente el tooling de QA, sin ejecutar nuevamente:

- commit source-only: `5c9663dd6b1174cf8d59186484eb09e83316e862`;
- archivo: `tools/qa/tya-c6-dev-root-runtime-wrapper.mjs`;
- Staff-only ahora sigue el formulario canónico `#loginForm/#lgUser/#lgPass/#lgSubmit`;
- lógica genérica Shopper/Client preservada;
- `app/modules` sin cambios;
- cero deploy posterior a esta corrección.

Evidencia durable: `app/docs/evidence/c6-live-user-admin-runtime-proof-31646324988.json`.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=88% | RESTANTE=12% | DELTA CERTIFICADO DE ESTA EJECUCIÓN=+0%.**

Sí hubo avance técnico verificable: Hosting DEV y root parity pasaron, se aisló el drift exacto del QA y quedó corregido source-only. El porcentaje no aumenta porque el runtime Staff canónico aún no fue certificado.

## Siguiente bloque exacto

No ejecutar nada más con la autorización consumida.

El source queda preparado para repetir exclusivamente `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`, pero requiere **una nueva autorización explícita** que habilite un nuevo Hosting DEV, porque el allowance anterior fue consumido `1/1` y `STOP_RETRY` prohíbe un segundo intento.

Después de un PASS real: `M7 → M8 → M9 → M10`.

## Clasificación

- **Reusable CXOrbia:** corrección del contrato QA Staff al formulario visible canónico.
- **Exclusivo cliente:** Hosting/proof TyA Staff sobre `cxorbia-backend-dev`.
- **Claude/prototipo:** cero cambios a frontend/producto; no reintroducir overlay Staff obsoleto.
- **Academia:** sin cambio de contenido hasta runtime PASS.
- **Sin impacto Claude:** tooling QA, evidencia y documentación operativa.

## Estado seguro

Hosting DEV de esta autorización `1/1`; nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes `0`; segundo Exact Write `0`; segundo intento `0`; merge `false`; producción `false`; secretos expuestos `false`.
