# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_FINDINGS_ADJUDICATION_STOP_ONE_AMBIGUOUS_DUPLICATE__AUTH_DEV_228_PRESERVED__ZERO_WRITES__NO_SECOND_READ__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.md`;
4. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-AUTH-FINDINGS-ADJUDICATION-STOP-20260810.md`;
5. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- freeze Auth v4: 340 filas, HOLD=0, digest `c0c31f...`;
- SKIP13, multi-Auth y lineage `ac93...` cerrados;
- PREWRITE, Activation, readback y rollback dry-run PASS;
- Auth DEV 228;
- HashConfig y lifecycle del smoke cerrados;
- 20/20 superficies Phase A source-side preservadas;
- estrategia `PROMOTE_EXISTING_CLEAN_PROJECT`.

## 3. P0 vivo

`C6 AUTH DUPLICATE KEEPER + TARGET-SCOPE ADJUDICATION READ-ONLY FOCAL`.

La única adjudicación provider actual produjo:

```text
duplicateGroups=5
claimScopeDuplicateDefects=4
ambiguousDuplicateGroups=1
unknownRoleNoEffectiveAccess=4
adminCrossTenantNoTyaAccess=1
shopperMissingScopeNoEffectiveAccess=1
providerReads=1
secondProviderRead=false
```

Cuatro grupos tienen dos principals habilitados con claims/scope habilitantes, pero todavía no existe keeper/retire reproducible ni sign-in probe. El quinto grupo tiene dos principals habilitados sin acceso TyA efectivo y quedó ambiguo respecto de keeper/histórico/técnico.

## 4. No hacer

- no reconstruir las 340 identidades;
- no repetir PREWRITE ni Activation;
- no ejecutar repair ni nuevo smoke con la autorización consumida;
- no compensar duplicados desde frontend;
- no relajar roles/tenant/shopper scope;
- no crear proyecto nuevo, rama nueva ni PR nuevo;
- no deploy, merge ni producción sin autorización específica.

## 5. Después del P0

Si la adjudicación focal demuestra keeper/retire inequívocos, solicitar repair Auth mínimo con snapshot/readback/rollback. Solo después ejecutar un smoke acumulativo read-only nuevo; luego validación humana y gate específico de cutover.

## 6. Seguridad

El bloque actual terminó con un provider read, cero writes, cero deploy, cero merge y producción intacta. Request consumido/deshabilitado y workflows temporales retirados.
