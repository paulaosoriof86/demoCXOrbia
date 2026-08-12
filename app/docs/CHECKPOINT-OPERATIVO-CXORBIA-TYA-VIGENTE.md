# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-12 15:23 -06:00  
**Estado:** `C6_STAFF_ADMIN_SELECTOR_CHAIN_ROOTCAUSE_FIXED__PREDEPLOY_PROOF_FAILED__PHASE_A_88__HOSTING_0_OF_1__NO_PRODUCTION`

## Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Provider target: `cxorbia-backend-dev`.
- Exact Write V2: cerrado y no repetible.
- Producción: intacta.

## Estado C6 Staff

`PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2_READBACK` permanece válido.

- Auth writes consumidos previamente por Exact Write V2: 14.
- Firestore writes consumidos previamente por Exact Write V2: 16.
- Deletes: 0.
- A/B/C/D/R4 canonical readback: PASS.
- Ocho históricos deshabilitados con readback.
- Rollback: no requerido.
- No reabrir provider snapshot, private handoff, D rebase, Auth340, SKIP13, MultiAuth, HR o M4 sin drift reproducible.

## C6 live user/admin wiring — SOURCE IMPLEMENTADO

El recorrido humano DEV contiene el wiring fail-closed `Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend` para Staff. No se modificó `app/modules`.

## Corrección del scope Staff/admin

El action exacto es:

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

Se corrigieron tres capas action-scoped:

1. `.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml`: para este action no selecciona Client ni exige Shopper/Client.
2. `tools/qa/cxorbia-phase-a-existing-users-e2e-credentials-dynamic.mjs`: genera bundle privado Staff-only y corta antes de HR/visitas/Shopper.
3. `tools/qa/tya-c6-dev-root-runtime-wrapper.mjs`: ejecuta únicamente paridad de raíz + autenticación Staff/admin + reload/new-tab; omite Shopper/Client/domain/finance/reservations únicamente para este action.

Fuera del action exacto se conserva la lógica genérica Staff+Shopper+Client.

## Ejecución one-shot 31642038173 — fallo pre-deploy

Se rearmó el request contra el HEAD corregido y el workflow `31642038173` pasó:

- checkout exacto;
- lectura del request;
- autorización y one-shot scope;
- autenticación Google Cloud DEV;
- instalación de tooling.

Falló en `Select existing DEV credentials privately` antes del paso de deploy. El artifact sanitizado certifica:

- `deploy.attempted=false`;
- `hostingDeploysThisRun=0`;
- runtime no ejecutado;
- Firestore/Auth/HR/Rules/Storage/Make/Gemini/pagos writes=0;
- merge=false;
- production=false.

### Tercera causa raíz reproducible

El wrapper `tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs` todavía imponía incondicionalmente la decisión genérica `PASS_PHASE_A_EXISTING_E2E_CREDENTIAL_SELECTION_DYNAMIC` y la reescribía como `PASS_C6_EXISTING_E2E_CREDENTIAL_SELECTION`.

Por eso, aunque el selector dinámico ya producía correctamente `PASS_C6_EXISTING_STAFF_ADMIN_E2E_CREDENTIAL_SELECTION_READONLY`, el wrapper superior lo rechazaba antes del Hosting.

### Corrección aplicada

Commit fuente: `1dae2e5e2718d49e607e24ad38be692c945b921f`.

`tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs` ahora:

- reconoce el action exacto Staff/admin;
- acepta únicamente `PASS_C6_EXISTING_STAFF_ADMIN_E2E_CREDENTIAL_SELECTION_READONLY` para ese action;
- conserva writes/passwordChanges=0 y valuesExported=false;
- no reescribe la decisión Staff/admin;
- preserva sin cambio funcional el comportamiento genérico fuera del action.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=88% | RESTANTE=12%. Delta certificado: +0%.**

El avance técnico de esta iteración fue eliminar una tercera dependencia superpuesta antes del Hosting. El porcentaje no aumenta hasta el proof remoto.

## Siguiente bloque exacto

El único Hosting DEV autorizado permanece físicamente **sin consumir: 0/1**. Sin embargo, el request one-shot `31642038173` terminó en failure y llevaba `stopRetryOnFailure=true`; por ello no se ejecuta un segundo request automáticamente.

Siguiente acción segura: nueva autorización puntual para rearmar un request one-shot contra el HEAD vigente y consumir, como máximo, el mismo único Hosting DEV todavía disponible para `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

## Clasificación

- **Reusable CXOrbia:** scope por action exacto atravesando toda la cadena de wrappers, fail-closed.
- **Exclusivo cliente:** proof TyA Staff/admin sobre `cxorbia-backend-dev`.
- **Claude/prototipo:** cero frontend modificado.
- **Academia:** sin cambio de contenido hasta runtime PASS.
- **Sin impacto Claude:** selector/orquestación/runtime QA.

## Estado seguro

Hosting DEV consumido `0/1`; nuevos Firestore/Auth/HR/Rules/Storage/Make/Gemini/pagos writes `0`; segundo Exact Write `0`; merge `false`; producción `false`.
