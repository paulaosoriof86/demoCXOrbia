# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_FINDINGS_ADJUDICATION_STOP_ONE_AMBIGUOUS_DUPLICATE__AUTH_DEV_228_PRESERVED__ZERO_WRITES__NO_SECOND_READ__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.md`;
- evidencia terminal: `app/docs/evidence/C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.json`;
- request vigente terminal: `backend/config/c6-auth-smoke-findings-adjudication-readonly-request-v1.json` consumido/deshabilitado;
- herramienta source-safe: `tools/qa/cxorbia-c6-auth-smoke-findings-adjudication-readonly-v1.mjs`;
- freeze rector: `backend/config/c6-shopper-auth-final-freeze-v4.json`;
- digest rector: `c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4`;
- producción: intacta.

## 2. Baseline Auth protegido — no reabrir

```text
rows=340
CREATE_AUTH=118
UPDATE_AUTH=9
HOLD=0
passwordChanges=8
AuthExecuted=true
AuthUsersAfter=228
Readback=PASS
RollbackDryRun=PASS
RealRollbackExecuted=false
PREWRITE repeated=false
Activation repeated=false
```

Identidad histórica cerrada y protegida:

```text
SKIP13=closed 13/13
multiAuthProfile=7cc28c78de9bfda01d14
keeper=4e6d26551d11db444bd0
duplicateAccessRetired=9b2b7ca1bd72c1301d29
targetLineage(ac93)=closed
updateUniversePlanV3=closed
```

No reconstruir las 340 identidades.

## 3. Adjudicación read-only actual

Source gate previo:

```text
sourceGateCommit=2fcc0cc79ecf4cf77a32f45245020dc4e2b8cef0
sourceGateRunId=31432971654
decision=PASS_C6_AUTH_SMOKE_FINDINGS_ADJUDICATION_SOURCE_ZERO_WRITES_ONE_READ_NO_PII
```

Única lectura provider:

```text
requestId=c6-auth-smoke-findings-adjudication-readonly-20260810-01
requestCommit=ed081e79b3207692cb8b90b22c08feb3a241ba7b
runId=31433085997
jobId=93600894310
artifactId=9079893971
artifactDigest=sha256:1e300e105f29fa1d85385d495ad794633a0628127366221c6597e3ff97e454d0
providerReads=1
secondProviderRead=false
```

Terminal:

```text
decision=STOP_RETRY_C6_AUTH_SMOKE_FINDINGS_ADJUDICATION
errorCode=AMBIGUOUS_ADJUDICATION_1
errorFingerprint=5a3ad62369651f48b197d362
```

## 4. Resultado adjudicado

```text
AuthPopulation=228
DuplicateProviderEmailGroups=5
UnknownEnabledRoles=4
AdminTenantOutliers=1
ShopperScopeOutliers=1
claimScopeDuplicateDefects=4
ambiguousDuplicateGroups=1
noEffectiveAccessCases=5
expectedHistoricalTechnicalCases=1
```

Cuatro grupos duplicados tienen dos principals habilitados con claims/scope que habilitan la superficie correspondiente: tres grupos Admin/Operaciones y un grupo Cliente. Esta es evidencia de **riesgo/defecto a nivel de principal y claims**, no una prueba de que ambos ingresen mediante el login canónico, porque no se autorizó sign-in probe.

El quinto grupo contiene dos principals habilitados con el mismo provider-email fingerprint, pero ninguno tiene acceso TyA efectivo: uno queda rechazado por rol fuera de contrato y el otro es Admin/Operaciones de otro tenant/proyecto. La selección keeper/histórico/técnico no quedó demostrada y activa `STOP_RETRY`.

## 5. Outliers no independientes

```text
unknownRoleNoEffectiveAccess=4
adminCrossTenantNoTyaAccess=1
shopperMissingScopeNoEffectiveAccess=1
duplicateEmail__unknownRole=1
duplicateEmail__adminTenant=1
duplicateEmail__shopperScope=0
```

- Los 4 roles fuera de contrato no tienen acceso efectivo bajo `ROLE_NOT_ALLOWED`; uno solapa con el grupo duplicado ambiguo.
- El Admin/Operaciones outlier tiene tenant explícito no TyA, un proyecto no objetivo y no tiene acceso TyA; solapa con el mismo grupo ambiguo.
- El Shopper outlier tiene tenant permitido pero carece de target project y shopperId; no tiene relación con el plan v4 y falla `SHOPPER_SCOPE_REQUIRED`.

## 6. Grupos duplicados source-safe

```text
1acdcb3782b7cf351056 -> 6dee7f31c738218ce63a / b561d9c46660715e214f -> DEFECT_REAL_DUPLICATE_EFFECTIVE_ACCESS
2c4d19f2b066835473d3 -> aa5cbada6c5388ee1d8b / f8405e17df357c121ccc -> DEFECT_REAL_DUPLICATE_EFFECTIVE_ACCESS
54225792eeb65f6739c0 -> ce178298b2df136541d4 / 19937aedc77af3404bdc -> DEFECT_REAL_DUPLICATE_EFFECTIVE_ACCESS
ae2f920fe6d9ce1fdd82 -> ca9e2f644334833ab572 / 360af509dcdcd1880f04 -> DEFECT_REAL_DUPLICATE_EFFECTIVE_ACCESS
fd891812eca020d27ee3 -> e1773a24c98d6bbe26c3 / 50d360f17c1fbdd69770 -> AMBIGUOUS_MULTI_ENABLED_PROVIDER_IDENTITY_WITH_BLOCKED_MEMBER
```

Todos los grupos tienen `internalCxorbiaEmail=false`. No se exportó email/dominio/UID/shopperId/nombre/claims crudos y no se usó antigüedad ni orden de resultados para decidir keeper.

## 7. Fail-close

```text
request=consumed/disabled
allowedExecutions=0
oneShotWorkflow=removed
sourceGateWorkflow=removed
providerReads=1
secondProviderRead=false
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreWrites=0
membershipWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
PREWRITE=false
Activation=false
newSmoke=false
CloudBuild=0
CloudRun=0
Hosting=0
Make=0
Gemini=0
payments=0
merge=false
production=false
rawPIIExported=false
```

## 8. Documentación acumulativa

- `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.md`;
- `app/docs/evidence/C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.json`;
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-AUTH-FINDINGS-ADJUDICATION-STOP-20260810.md`;
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-AUTH-FINDINGS-ADJUDICATION-STOP-20260810.md`;
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-AUTH-FINDINGS-ADJUDICATION-STOP-20260810.md`;
- `app/docs/ACADEMIA-ADDENDUM-C6-AUTH-FINDINGS-ADJUDICATION-STOP-20260810.md`;
- `app/docs/PHASE-A-TRACKER-ADDENDUM-C6-AUTH-FINDINGS-ADJUDICATION-STOP-20260810.md`.

## 9. Próximo bloque exacto

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE KEEPER + TARGET-SCOPE ADJUDICATION READ-ONLY FOCAL`

Limitarse exclusivamente a los diez candidate fingerprints de los cinco grupos anteriores. Resolver keeper vs histórico/técnico/retirable para los cuatro grupos con claims habilitantes y cerrar la política del grupo ambiguo, usando discriminadores técnicos source-safe autorizados. No repair, no nuevo smoke, no PREWRITE/Activation, no writes y no reconstrucción de las 340 identidades. Ante empate: `STOP_RETRY` sin segundo provider read.

## 10. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados. Las 20/20 superficies Phase A source-side del smoke previo continúan preservadas.

## 11. Cierre de bloque

- **Qué se hizo:** una adjudicación Auth focal de los outliers ya detectados, con un único provider read.
- **Avance Phase A:** se redujo el bloqueo a cuatro pares que requieren keeper/retire y un grupo ambiguo sin acceso TyA efectivo.
- **Qué se preservó:** Auth DEV 228, freeze v4, frontend y todas las superficies Phase A.
- **Claude/Academia:** sin parche frontend; addenda actualizados.
- **Pendiente real:** keeper/target-scope adjudication focal.
- **Siguiente bloque:** `C6 AUTH DUPLICATE KEEPER + TARGET-SCOPE ADJUDICATION READ-ONLY FOCAL`.
- **Estado seguro:** un read, cero writes, request consumido y workflows temporales retirados.
- **Bloqueo comprobado:** una única ambigüedad reproducible `AMBIGUOUS_ADJUDICATION_1`.
