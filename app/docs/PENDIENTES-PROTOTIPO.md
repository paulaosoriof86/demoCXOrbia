# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-12 15:57 -06:00  
**Estado:** `C6_STAFF_ADMIN_SHELL_HEREDOC_ROOTCAUSE_FIXED__STOP_RETRY__PHASE_A_88`

## Pendiente vivo único de continuidad

```text
C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF
→ M7
→ M8
→ M9
→ M10
```

## Wiring C6 ya implementado en source

- `app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js` permanece implementado.
- `app/index-backend-dev.html` mantiene el orden Auth bridge → membership wiring → Firebase backend.
- Staff queda fail-closed contra `tenants/tya/users/{uid}` antes del consumo backend.
- Cero módulos UI modificados.

## Resultado de la ejecución autorizada

Run `31644318836`:

- selector Staff/admin: `PASS_C6_EXISTING_STAFF_ADMIN_E2E_CREDENTIAL_SELECTION_READONLY`;
- Auth/password writes=0;
- Hosting intentado=false;
- Hosting consumido=0/1;
- runtime no ejecutado;
- production=false.

Se aplicó `STOP_RETRY`; no hubo segundo intento.

## Nueva causa raíz cerrada a nivel source

El workflow tenía dos heredocs `NODE` dentro del `if/else` Staff/admin con terminadores indentados. El shell terminó con `syntax error: unexpected end of file` antes de Hosting.

Commit correctivo source-only:

`f8efd98e92448739b458aa838cd1f6f8c6efbc6e`.

Además se cerró preventivamente un bloqueo latente: `google-github-actions/auth` crea `gha-creds-*.json` temporal en el worktree; el artifact del run lo mostró como untracked y el gate final de limpieza habría fallado. Ese patrón ya está excluido localmente en el workflow.

## Ya no está pendiente

- Exact Write V2 y canonical readback.
- D technical-login rebase y private handoff.
- Auth340, SKIP13, MultiAuth, HR y M4/static.
- Scope Staff-only del selector dinámico.
- Wrapper superior de selección Staff-only.
- Runtime wrapper Staff-only.
- Heredoc shell blocker del workflow.
- Bloqueo latente `gha-creds-*.json` contra clean-worktree.

No reabrir estos puntos sin drift reproducible.

## Pendiente inmediato

No rerunear `31644318836` ni reutilizar su request.

Con nueva autorización puntual: crear un nuevo request one-shot bound al HEAD vivo que contenga el commit `f8efd98e92448739b458aa838cd1f6f8c6efbc6e` y ejecutar como máximo un Hosting DEV para el mismo proof Staff/admin read-only.

## Pendiente frontend heredado, separado de C6

`app/modules/cliente-extra.js` mantiene PDF print, XLSX y PPTX como pendientes Claude/prototipo. No son causa del wiring y no bloquean este proof.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**88% certificado | 12% restante | delta certificado +0%.**

## Claude / Academia

No pedir nueva candidata. No tocar frontend desde backend. Academia se actualiza cuando el runtime Staff certifique comportamiento real de roles/administración.
