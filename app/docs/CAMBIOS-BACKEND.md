# CAMBIOS-BACKEND.md

> Registro principal de cambios backend. Los bloques históricos completos permanecen versionados en Git y en sus addenda fechados. Para el estado operativo actual consultar primero el índice vigente.

## Estado vigente — 2026-08-10

Estado:

`C6_AUTH_DUPLICATE_OWNERSHIP_RECONCILIATION_HUMAN_DECISION_REQUIRED_4__AUTH_DEV_228_PRESERVED__ZERO_PROVIDER_READS__ZERO_DATA_WRITES__NO_PRODUCTION`

Fuentes rectoras actuales:

- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-OWNERSHIP-ANCHOR-SOURCE-SAFE-HUMAN-DECISION-REQUIRED-20260810.md`;
- `app/docs/evidence/C6-AUTH-DUPLICATE-OWNERSHIP-ANCHOR-SOURCE-SAFE-RECONCILIATION-20260810.json`;
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-AUTH-DUPLICATE-OWNERSHIP-SOURCE-SAFE-HUMAN-DECISION-20260810.md`.

### Auth protegido

```text
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
PlanV4Digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
```

No reabrir las 340 identidades, SKIP13, multi-Auth, `ac93...`, HashConfig, PREWRITE ni Activation.

### Bloque vigente

La reconciliación source-safe sin provider concluyó que los cuatro grupos pendientes carecen de una ancla member-level única. Resultado:

```text
1acdcb3782b7cf351056 = HUMAN_OWNERSHIP_DECISION_REQUIRED
2c4d19f2b066835473d3 = HUMAN_OWNERSHIP_DECISION_REQUIRED
54225792eeb65f6739c0 = HUMAN_OWNERSHIP_DECISION_REQUIRED
ae2f920fe6d9ce1fdd82 = HUMAN_OWNERSHIP_DECISION_REQUIRED
```

A–C son principals legacy/pre-import namespace `NONE` y ninguno coincide con el staff canónico importado namespace `staff`; la evidencia no permite elegir entre los dos members de cada par. D contiene dos principals históricos, mientras el Cliente canónico vigente es un principal separado ya materializado/validado.

No se usaron provider reads, PII cruda, antigüedad, orden de resultados ni metadatos temporales para desempatar.

### Siguiente gate

`C6 AUTH DUPLICATE HUMAN OWNERSHIP DECISION CAPTURE — NO PROVIDER / NO REPAIR`.

Capturar únicamente la decisión humana mínima de ownership/disposition. Cualquier repair Auth debe ser un bloque posterior, focal y expresamente autorizado.

### Estado seguro

Provider reads0; Auth/IAM/Firestore/HR/Rules/Storage writes0; PREWRITE/Activation/smoke0; Make/Gemini/pagos/deploy/merge/producción0. Frontend y Phase A permanecen preservados.
