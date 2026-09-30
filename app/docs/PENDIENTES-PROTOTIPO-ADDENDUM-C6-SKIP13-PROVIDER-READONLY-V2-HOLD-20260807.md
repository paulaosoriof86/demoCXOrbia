# PENDIENTES PROTOTIPO — Addendum C6 SKIP13 provider read-only V2 HOLD

## Pendiente real

Antes de ejecutar Auth 340 hay que reconciliar source-only los ocho perfiles SKIP13 que conservan nueve candidatos con acceso efectivo TyA/Cinépolis.

```text
profilesWithUnplannedEffectiveAccess=8
authCandidates=9
blockingProfile=7cc28c78de9bfda01d14
blockingEffectiveCandidates=2
```

La reconciliación debe clasificar cada acceso entre identidad canónica vigente, alias histórico, identidad duplicada o acceso que debe retirarse; no debe asumir que `PRESERVE_NO_AUTH` equivale automáticamente a ausencia real de Auth.

## No reusar

- request `c6-skip13-auth-access-adjudication-v2-20260807-01`;
- workflow retirado `cxorbia-c6-skip13-provider-readonly-revalidation-v2-once.yml`;
- run `31194614899`;
- job `92919661755`.

No procede Auth 340 hasta cerrar este HOLD.
