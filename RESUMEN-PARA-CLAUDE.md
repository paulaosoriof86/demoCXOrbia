# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_DUPLICATE_OWNERSHIP_RECONCILIATION_HUMAN_DECISION_REQUIRED_4__AUTH_DEV_228_PRESERVED__ZERO_PROVIDER_READS__ZERO_DATA_WRITES__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-OWNERSHIP-ANCHOR-SOURCE-SAFE-HUMAN-DECISION-REQUIRED-20260810.md`;
4. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-AUTH-DUPLICATE-OWNERSHIP-SOURCE-SAFE-HUMAN-DECISION-20260810.md`;
5. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo, Login, `/app/modules/*`, `/app/core/*` y `CX.data`;
- SKIP13, multi-Auth, target lineage `ac93...`;
- freeze Auth v4 340/HOLD=0;
- PREWRITE, Activation, readback y rollback dry-run;
- Auth DEV 228;
- HashConfig y lifecycle del smoke;
- grupo `fd891...` ya cerrado sin acceso TyA efectivo.

## 3. Estado backend

```text
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
OwnershipReconciliationProviderReads=0
OwnershipUniqueKeeperAnchors=0
OwnershipHumanDecisionRequiredGroups=4
AuthWrites=0
Production=false
```

A–C: los candidates son legacy/pre-import namespace `NONE`; ninguno coincide con los principals staff canónicos importados namespace `staff`, pero la evidencia no permite elegir entre los dos members de cada par.

D `ae2f...`: ambos candidates son históricos. El Cliente canónico actual es un principal separado ya materializado/validado; no existe keeper member-level demostrable dentro del par histórico.

Resultado para los cuatro grupos: `HUMAN_OWNERSHIP_DECISION_REQUIRED`.

## 4. Claude/prototipo

No hacer parche frontend, selector alternativo, copy técnico ni relajación de RBAC para resolver este conflicto. La decisión es de ownership backend y debe mantenerse fuera de UI hasta una decisión humana y, si corresponde, un repair focal separado.

## 5. Siguiente bloque backend

`C6 AUTH DUPLICATE HUMAN OWNERSHIP DECISION CAPTURE — NO PROVIDER / NO REPAIR`.

Capturar una decisión humana mínima/source-safe de ownership o disposition para los cuatro grupos. No provider, repair, PREWRITE/Activation, smoke, deploy, merge ni producción.
