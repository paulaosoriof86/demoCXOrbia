# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-12 15:55 -06:00  
**Estado:** `C6_STAFF_ADMIN_SHELL_HEREDOC_ROOTCAUSE_FIXED__STOP_RETRY__PHASE_A_88`

## Bloque actual

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

El wiring Staff ya estaba implementado en source. En esta iteración se autorizó y ejecutó un único one-shot para demostrar en DEV:

`Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend`, incluyendo reload/new-tab.

## Ejecución 31644318836

Request commit: `3a44ae709e2e0728c26e3351f4ddff98319ac699`.

Target source HEAD: `9f9779d7adac30a72058464d819dcb94aa5e1b42`.

El workflow pasó:

- checkout exacto;
- validación de autorización y one-shot;
- autenticación Google Cloud DEV;
- instalación de tooling.

El selector Staff/admin produjo `PASS_C6_EXISTING_STAFF_ADMIN_E2E_CREDENTIAL_SELECTION_READONLY`, con `authWrites=0`, `passwordChanges=0`, `valuesExported=false` y preservación de la lógica genérica Shopper/Client.

La ejecución se detuvo antes de Hosting/runtime por error shell reproducible:

- heredoc `NODE` anidado dentro del `if/else` no cerró por indentación;
- `syntax error: unexpected end of file`.

Artifact sanitizado: `9160122511`, digest `sha256:909ef87970ece8fe972691765255e990b8c4314a8d154f26915f2c600c3c63ef`.

Resultado seguro:

- deploy attempted=false;
- Hosting consumido=0/1;
- runtime=null;
- nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0;
- segundo Exact Write=0;
- merge=false;
- producción=false.

`STOP_RETRY` aplicado: no se ejecutó segundo intento.

## Causa raíz y corrección source

Commit: `f8efd98e92448739b458aa838cd1f6f8c6efbc6e`.

Archivo modificado:

- `.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml`.

Cambios:

1. Los dos heredocs anidados de validación privada se sustituyeron por `node -e`, eliminando el acoplamiento frágil entre indentación YAML y delimitadores Bash.
2. Se agregó `gha-creds-*.json` a `.git/info/exclude`. El artifact del run fallido demostró que el action de Google genera temporalmente ese archivo como untracked; sin exclusión, el `git status --porcelain` final habría generado otro fallo después de un deploy/runtime correcto.

No se modificó frontend ni `app/modules`.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=88% | RESTANTE=12% | DELTA CERTIFICADO=+0%.**

Hubo avance técnico real: el selector Staff/admin quedó probado en PASS y se eliminaron el bloqueo shell y un bloqueo latente de worktree. El porcentaje no aumenta hasta el runtime remoto.

## No reabrir

Exact Write V2, private handoff, D rebase, provider snapshot, Auth340, SKIP13, MultiAuth, HR y M4 permanecen cerrados salvo drift reproducible.

## Siguiente frontera exacta

No rerun automático ni reutilización del request fallido.

Con nueva autorización puntual: nuevo request one-shot bound al HEAD vivo que incluya `f8efd98e92448739b458aa838cd1f6f8c6efbc6e`, máximo un Hosting DEV, mismo proof Staff/admin read-only.

Después: `M7 → M8 → M9 → M10`.

## Clasificación

- **Reusable CXOrbia:** workflow fail-closed sin heredocs anidados frágiles; credencial efímera excluida del clean-worktree gate.
- **Exclusivo cliente:** TyA Staff/admin en `cxorbia-backend-dev`.
- **Claude/prototipo:** cero frontend modificado.
- **Academia:** sin cambio hasta runtime PASS.
- **Sin impacto Claude:** workflow, selector y QA interno.

## Estado seguro

Hosting DEV consumido `0/1`; nuevos provider/data writes `0`; merge=false; producción=false.
