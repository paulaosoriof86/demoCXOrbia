# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_DUPLICATE_HUMAN_OWNERSHIP_DECISION_CAPTURE_READY__PAULA_DECISION_REQUIRED__ZERO_PROVIDER_READS__ZERO_REPAIR__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-CAPTURE-PENDING-PAULA-20260810.md`;
4. `app/docs/C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-MATRIX-20260810.md`;
5. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-CAPTURE-20260810.md`;
6. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo, Login, `/app/modules/*`, `/app/core/*` y `CX.data`;
- SKIP13, multi-Auth, target lineage `ac93...`;
- freeze Auth v4 340/HOLD=0;
- PREWRITE, Activation, readback y rollback dry-run;
- Auth DEV 228;
- HashConfig y lifecycle del smoke;
- `fd891...` cerrado sin acceso TyA efectivo.

## 3. Estado backend

```text
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
HumanOwnershipDecisionMatrix=READY
CapturedDecisions=0/4
ProviderReadsCurrentBlock=0
RepairExecuted=false
Production=false
```

A–C: cada par contiene dos principals históricos legacy/pre-import equivalentes; la evidencia no puede escoger member. La matriz exige decisión humana si se desea `KEEP_ONE_MEMBER`, o permite preservar ambos; retiro de ambos exige confirmar un principal canónico externo correcto.

D `ae2f...`: los dos principals son históricos y existe un Cliente canónico externo ya validado. Paula puede aprobar ese principal como único canónico y clasificar ambos históricos como no canónicos pendientes de repair posterior.

## 4. Claude/prototipo

No hacer parche frontend, selector de duplicados, copy técnico visible ni relajación de RBAC. No mostrar fingerprints en producto. Este es un flujo de gobierno backend, no UX.

## 5. Siguiente bloque backend

Esperar las cuatro decisiones humanas mínimas de Paula. Después, si una decisión implica cambio Auth, preparar un repair focal separado con snapshot/readback/rollback y autorización expresa. No repair dentro del bloque actual.
