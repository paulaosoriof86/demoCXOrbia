# ADDENDUM PENDIENTES-PROTOTIPO — C6 Runtime 11

Fecha: 2026-08-12

## Pendiente vivo

### P0 backend/session — no frontend

`C6_SESSION_MEMBERSHIP_METADATA_OVERWRITTEN_BY_BACKEND_BROWSER_AUTH_APP_ENTER_REAPPLY`

Estado: **reparado source-only, pendiente únicamente de runtime final**.

Runtime 11 demostró B/admin canónico, Auth, membership/handoff, HR authority y shell visible. El bloqueo fue la pérdida de `membershipVerified/membershipSource` en `CX.session.user` cuando `CX.app.enter()` fue interceptado por el wrapper Auth y la sesión se reconstruyó desde claims.

La reparación está en `app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js`: republica por cache la membership ya verificada después de `CX.app.enter()` y falla cerrado si no persiste. Source preflight post-repair PASS.

### Validación faltante para cerrar

- un único runtime Staff canónico `B=admin` sobre HEAD vivo final;
- `membershipVerified=true` y `membershipSource` persistentes post-enter;
- handoff `entered`;
- stale backend/Corte4 empty false;
- shell visible;
- 3 reloads estables;
- new-tab estable.

## Claude/prototipo

No hay bug frontend nuevo que Claude deba corregir por este incidente. No tocar módulos ni `app/core` para resolverlo.

## Academia

Sin pendiente de contenido nuevo hasta que M7 quede PASS. Después deberá reflejarse la experiencia real de acceso Admin/Operativo por tenant/proyecto sin detalles técnicos DEV.

## Prioridad

P0 operativo de cierre M7. Con PASS, Phase A pasa de 88% a 93% y se continúa M8 → M9 → M10.
