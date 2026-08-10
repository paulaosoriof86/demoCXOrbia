# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_DUPLICATE_KEEPER_SOURCE_GATE_STOP_PRE_PROVIDER_FALSE_POSITIVE__AUTH_DEV_228_PRESERVED__ZERO_PROVIDER_READS__NO_REQUEST__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-KEEPER-SOURCE-GATE-PREPROVIDER-STOP-RETRY-20260810.md`;
4. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-AUTH-DUPLICATE-KEEPER-PREPROVIDER-STOP-20260810.md`;
5. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo, Login, `/app/modules/*`, `/app/core/*` y `CX.data`;
- SKIP13, multi-Auth, target lineage `ac93...` y plan v3;
- freeze Auth v4 340/HOLD=0;
- PREWRITE, Activation, readback y rollback dry-run;
- Auth DEV 228;
- HashConfig y lifecycle del smoke;
- estrategia `PROMOTE_EXISTING_CLEAN_PROJECT`.

## 3. Estado backend

```text
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
FiveDuplicateGroups=FROZEN
CurrentProviderReads=0
ProviderRequestEmitted=false
AuthWrites=0
Production=false
```

La adjudicación previa de los cinco pares sigue vigente. El bloque más reciente no los volvió a leer: se detuvo pre-provider al detectar que el source gate confundía los flags seguros `creationTimeUsed:false` / `lastSignInTimeUsed:false` con uso real de metadatos temporales.

## 4. Claude/prototipo

No hacer ningún parche frontend ni relajar `ROLE_NOT_ALLOWED`, `TENANT_NOT_ALLOWED`, `PROJECT_SCOPE_REQUIRED` o `SHOPPER_SCOPE_REQUIRED`. Las 20/20 superficies Phase A source-side siguen preservadas.

## 5. Siguiente bloque backend

`C6 AUTH DUPLICATE KEEPER SOURCE-GATE FALSE-POSITIVE ROOTFIX → ONE READ FOCAL`.

Corregir únicamente el falso positivo del gate. Solo con PASS source-only se podrá emitir un request nuevo para máximo una lectura de los mismos diez candidates. Sin repair, PREWRITE/Activation, nuevo smoke, writes, deploy, merge ni producción.
