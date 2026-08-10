# RESUMEN PARA CLAUDE — ADDENDUM C6 AUTH V4 ACTIVATION PASS + SMOKE STOP

**Fecha:** 2026-08-10  
**Estado vivo:** `C6_AUTH_V4_ACTIVATED_DEV__READBACK_ROLLBACK_DRYRUN_PASS__SMOKE_STOP_CREDENTIAL_LIFECYCLE__NO_PRODUCTION`

## Qué cambió realmente

Firebase Auth DEV ya fue activado conforme al freeze v4 rector:

```text
rows=340
CREATE_AUTH=118
UPDATE_AUTH=9
HOLD=0
passwordChanges=8
digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
AuthUsersBefore=110
AuthUsersAfter=228
readback=PASS
rollbackDryRun=PASS
```

No reabrir identidad, SKIP13, multi-Auth, plan v3 ni lineage `ac93...`.

## Qué NO debe cambiar Claude

- No tocar backend/Auth para compensar el fallo del smoke.
- No crear segundo login ni gate visual paralelo.
- No cambiar `/app/modules/*` ni `/app/core/*` por este bloque.
- No hardcodear Cinépolis como tenant global.
- No reintroducir datos demo/fallback para aparentar éxito de roles.

## Qué sigue pendiente

El único STOP del bloque fue del **harness de smoke**: la validación multirol intentó reutilizar una ruta temporal de credencial que ya había sido limpiada por el ejecutor. Falló antes de listar usuarios, por lo que no existe evidencia de fallo funcional de Admin/Operaciones, Shopper o Cliente.

Próximo bloque backend, con autorización separada:

```text
SOURCE-ONLY SMOKE CREDENTIAL LIFECYCLE ROOTFIX
-> SINGLE READ-ONLY ACCUMULATIVE MULTIROLE SMOKE
```

Debe usar el estado Auth DEV actual de 228 usuarios sin reejecutar PREWRITE/Auth.

## Impacto frontend

Ninguno demostrado. No existe P0 frontend nuevo. Las superficies de Admin/Operaciones, Shopper y Cliente deben verificarse con el smoke read-only y luego con la validación visual requerida por Phase A.

## Academia

Actualizar cuando se cierre el smoke con:

- Auth como capa detrás del login canónico;
- claims y scopes por rol/tenant/proyecto;
- diferencia entre falla del proveedor, falla Auth y falla del harness de validación;
- rollback dry-run y evidencia segura;
- checklist de diagnóstico antes de tocar UI.

## Estado seguro

Producción, merge, HR, Firestore, Rules, Storage, Make, Gemini y pagos no fueron tocados. No existe request Auth ejecutable ni workflow one-shot latente.
