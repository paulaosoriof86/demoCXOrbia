# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-12 15:54 -06:00  
**Estado:** `C6_STAFF_ADMIN_SHELL_HEREDOC_ROOTCAUSE_FIXED__STOP_RETRY__PHASE_A_88__HOSTING_0_OF_1__NO_PRODUCTION`

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

El action exacto permanece:

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

## Ejecución autorizada 31644318836 — STOP_RETRY aplicado

Request one-shot:

- request commit: `3a44ae709e2e0728c26e3351f4ddff98319ac699`;
- target HEAD: `9f9779d7adac30a72058464d819dcb94aa5e1b42`;
- autorización exacta Staff/admin;
- `singleHostingDeployMax=1`;
- `stopRetryOnFailure=true`.

El workflow pasó checkout, request/authorization, Google Cloud DEV y tooling. El selector Staff/admin produjo correctamente:

`PASS_C6_EXISTING_STAFF_ADMIN_E2E_CREDENTIAL_SELECTION_READONLY`

con `authWrites=0`, `passwordChanges=0`, `valuesExported=false` y lógica genérica Shopper/Client preservada.

La ejecución falló inmediatamente después, todavía dentro de `Select existing DEV credentials privately`, antes de source gate, Hosting o runtime.

Evidencia:

- workflow: `31644318836`;
- artifact: `9160122511`;
- artifact digest: `sha256:909ef87970ece8fe972691765255e990b8c4314a8d154f26915f2c600c3c63ef`;
- `deploy.attempted=false`;
- `hostingDeploysThisRun=0`;
- runtime=null;
- Firestore/Auth/HR/Rules/Storage/Make/Gemini/pagos writes=0;
- merge=false;
- production=false.

No se ejecutó un segundo intento.

## Cuarta causa raíz reproducible

La selección privada ya estaba corregida. El fallo real de `31644318836` fue sintáctico en el shell generado por el workflow:

`warning: here-document ... delimited by end-of-file (wanted 'NODE')`

seguido de:

`syntax error: unexpected end of file`.

Causa: dos terminadores `NODE` dentro del `if/else` Staff/admin estaban indentados. Bash exige que el delimitador de cierre del heredoc quede en columna cero salvo el uso explícito de `<<-` con tabs. El shell no alcanzaba a ejecutar las validaciones privadas posteriores al selector, aunque el selector ya había producido PASS.

## Corrección source aplicada después del STOP_RETRY

Commit source-only: `f8efd98e92448739b458aa838cd1f6f8c6efbc6e`.

Archivo:

`.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml`.

Cambios:

1. Se eliminaron los heredocs anidados dentro del `if/else` y se sustituyeron por validaciones `node -e`, evitando dependencia de indentación shell/YAML.
2. Se agregó `gha-creds-*.json` a `.git/info/exclude`. El artifact del run fallido demostró que `google-github-actions/auth` crea temporalmente ese archivo como untracked; sin exclusión, el gate posterior `git status --porcelain` habría fallado incluso después de un Hosting/runtime exitoso. Esta dependencia latente quedó eliminada antes de consumir Hosting.
3. No se cambió el alcance Staff/admin, no se modificó `app/modules` y no se ejecutó deploy con esta corrección.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=88% | RESTANTE=12%. Delta certificado de esta ejecución: +0%.**

Sí hubo avance técnico: el selector Staff/admin quedó demostrado en PASS y se eliminaron el bloqueo shell reproducible y un bloqueo latente de limpieza del worktree. El porcentaje no aumenta hasta certificar el runtime remoto.

## Siguiente bloque exacto

El Hosting DEV autorizado permanece físicamente **sin consumir: 0/1**.

Por `STOP_RETRY`, no ejecutar automáticamente otro request ni rerun del workflow `31644318836`.

Siguiente acción segura, únicamente con nueva autorización puntual: crear un nuevo request one-shot bound al HEAD vivo que incluya `f8efd98e92448739b458aa838cd1f6f8c6efbc6e` y volver a intentar una sola vez `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

## Clasificación

- **Reusable CXOrbia:** validaciones action-scoped sin heredocs frágiles; exclusión explícita de credenciales efímeras antes del clean-worktree gate.
- **Exclusivo cliente:** proof TyA Staff/admin sobre `cxorbia-backend-dev`.
- **Claude/prototipo:** cero frontend modificado.
- **Academia:** sin cambio de contenido hasta runtime PASS.
- **Sin impacto Claude:** workflow, selector privado, gate de limpieza y runtime QA.

## Estado seguro

Hosting DEV consumido `0/1`; nuevos Firestore/Auth/HR/Rules/Storage/Make/Gemini/pagos writes `0`; segundo Exact Write `0`; merge `false`; producción `false`.
