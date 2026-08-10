# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_DUPLICATE_KEEPER_ONE_READ_STOP_4_ANCHOR_AMBIGUITIES__FD891_POLICY_CLOSED__AUTH_DEV_228_PRESERVED__NO_SECOND_READ__ZERO_WRITES__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-KEEPER-ONE-READ-FOCAL-STOP-RETRY-20260810.md`;
4. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-AUTH-DUPLICATE-KEEPER-ONE-READ-STOP-20260810.md`;
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
DuplicateKeeperSourceRootfix=PASS
DuplicateKeeperProviderReads=1
SecondProviderRead=false
ResolvedKeeperGroups=0/4
fd891PolicyClosed=true
CurrentDecision=STOP_RETRY_KEEPER_ANCHOR_INSUFFICIENT_4
AuthWrites=0
Production=false
```

La única lectura focal autorizada demostró que los tres pares Admin/Operaciones son equivalentes bajo los discriminadores permitidos y que el par Cliente tiene lineage no única: ninguno coincide con la lineage canónica disponible y ambos coinciden con los dos hashes históricos. Por tanto no existe keeper reproducible para esos cuatro grupos.

El grupo `fd891...` sí quedó cerrado como `POLICY_CLOSED_NO_TYA_EFFECTIVE_ACCESS`: ambos principals carecen de acceso TyA efectivo y no requieren repair TyA en el alcance actual.

## 4. Claude/prototipo

No hacer ningún parche frontend ni relajar `ROLE_NOT_ALLOWED`, `TENANT_NOT_ALLOWED`, `PROJECT_SCOPE_REQUIRED` o `SHOPPER_SCOPE_REQUIRED`. No agregar selectores para escoger entre duplicados ni compensar este problema en UI. Las 20/20 superficies Phase A source-side siguen preservadas.

## 5. Siguiente bloque backend

`C6 AUTH DUPLICATE OWNERSHIP ANCHOR SOURCE-SAFE EVIDENCE RECONCILIATION — NO PROVIDER`.

Trabajar solo sobre evidencia source-safe existente para buscar una ancla no temporal, no PII y reproducible de propiedad/lineage para los cuatro grupos A–D. Si no existe, declarar `HUMAN_OWNERSHIP_DECISION_REQUIRED`. Cero provider reads, repair, PREWRITE/Activation, nuevo smoke, writes, deploy, merge o producción.
