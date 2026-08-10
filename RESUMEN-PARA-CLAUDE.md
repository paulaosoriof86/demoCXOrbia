# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_FINDINGS_ADJUDICATION_STOP_ONE_AMBIGUOUS_DUPLICATE__AUTH_DEV_228_PRESERVED__ZERO_WRITES__NO_SECOND_READ__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.md`;
4. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-AUTH-FINDINGS-ADJUDICATION-STOP-20260810.md`;
5. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo, Login, `/app/modules/*`, `/app/core/*` y `CX.data`;
- SKIP13, multi-Auth cerrado, target lineage `ac93...` y plan v3;
- freeze Auth v4 340/HOLD=0;
- PREWRITE, Activation, readback y rollback dry-run;
- Auth DEV 228;
- HashConfig y lifecycle del smoke;
- Finanzas, Liquidaciones, Portal Cliente, Portal Shopper y Reservas;
- estrategia `PROMOTE_EXISTING_CLEAN_PROJECT`.

## 3. Backend Auth actual

```text
rows=340
CREATE_AUTH=118
UPDATE_AUTH=9
HOLD=0
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
PlanDigest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
```

## 4. Hallazgo runtime adjudicado

Una única lectura provider source-safe confirmó cinco grupos de provider email duplicado. Cuatro grupos tienen dos principals habilitados con claims/scope habilitantes —tres Admin/Operaciones y uno Cliente— y requieren adjudicación focal de keeper/retire. El quinto grupo tiene dos principals habilitados pero ninguno con acceso TyA efectivo; sigue ambiguo respecto de keeper/histórico/técnico.

Los cuatro roles fuera de contrato no tienen acceso efectivo; el Admin cross-tenant solapa con el grupo ambiguo; el Shopper outlier carece de shopperId/target scope y tampoco tiene acceso efectivo.

No compensar estos casos desde frontend ni relajar `ROLE_NOT_ALLOWED`, `TENANT_NOT_ALLOWED`, `SHOPPER_SCOPE_REQUIRED` o aislamiento por proyecto.

## 5. Siguiente bloque backend

`C6 AUTH DUPLICATE KEEPER + TARGET-SCOPE ADJUDICATION READ-ONLY FOCAL`.

Sin repair, nuevo smoke, PREWRITE/Activation, writes, merge ni producción hasta nueva autorización.
