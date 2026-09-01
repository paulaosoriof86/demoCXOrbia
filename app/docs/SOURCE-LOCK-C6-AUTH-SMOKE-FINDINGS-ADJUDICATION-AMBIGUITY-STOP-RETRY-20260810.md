# SOURCE LOCK — C6 AUTH READ-ONLY SMOKE FINDINGS ADJUDICATION · AMBIGUITY STOP_RETRY

**Fecha:** 2026-08-10  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `C6_AUTH_FINDINGS_ADJUDICATION_STOP_ONE_AMBIGUOUS_DUPLICATE__AUTH_DEV_228_PRESERVED__ZERO_WRITES__NO_SECOND_READ__NO_PRODUCTION`

## 1. Baseline protegido

El bloque partió del estado ya validado y no lo reabrió:

```text
AuthUsers=228
AuthActivation=PASS
Readback=PASS
RollbackDryRun=PASS
PlanV4Digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
PREWRITE repeated=false
Activation repeated=false
new smoke=false
```

No se reconstruyó el universo de 340 perfiles.

## 2. Source gate — PASS antes de provider

Se creó `tools/qa/cxorbia-c6-auth-smoke-findings-adjudication-readonly-v1.mjs` y un gate temporal para verificar:

- `node --check` y self-test;
- baseline Auth 228 y freeze v4;
- lineage cerrado de `7cc...`, keeper `4e6...` y retiro `9b2...`;
- contrato real de `backend-browser-auth.js` para rol/tenant/shopper scope;
- exactamente una llamada `listUsers(1000)` y fail-close si hubiera segunda página;
- cero tokens de Auth/IAM/Firestore/Storage/deploy write;
- salida sin UID, email, shopperId, nombre, claims crudos ni credencial.

Resultado:

```text
sourceGateCommit=2fcc0cc79ecf4cf77a32f45245020dc4e2b8cef0
sourceGateRunId=31432971654
decision=PASS_C6_AUTH_SMOKE_FINDINGS_ADJUDICATION_SOURCE_ZERO_WRITES_ONE_READ_NO_PII
```

## 3. Única lectura provider autorizada

Solo después del source PASS se emitió un request nuevo y no superpuesto:

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

La lectura recorrió los 228 usuarios en una sola página. No hubo segundo provider read.

## 4. Resultado terminal

```text
decision=STOP_RETRY_C6_AUTH_SMOKE_FINDINGS_ADJUDICATION
errorCode=AMBIGUOUS_ADJUDICATION_1
errorFingerprint=5a3ad62369651f48b197d362
```

Conteos reconciliados con el smoke previo:

```text
AuthPopulation=228
DuplicateProviderEmailGroups=5
UnknownEnabledRoles=4
AdminTenantOutliers=1
ShopperScopeOutliers=1
```

## 5. Cinco grupos de provider email duplicado

Los cinco grupos se identificaron únicamente por fingerprint. Ningún email fue exportado.

### Grupo A — defecto de duplicación con dos principals habilitados y scope de producto válido

```text
groupFp=1acdcb3782b7cf351056
members=6dee7f31c738218ce63a,b561d9c46660715e214f
roleFamily=ADMIN_OPERACIONES
enabled=2
claimLevelEffectiveAccess=2
internalCxorbiaEmail=false
classification=DEFECT_REAL_DUPLICATE_EFFECTIVE_ACCESS
```

### Grupo B — defecto de duplicación con dos principals habilitados y scope de producto válido

```text
groupFp=2c4d19f2b066835473d3
members=aa5cbada6c5388ee1d8b,f8405e17df357c121ccc
roleFamily=ADMIN_OPERACIONES
enabled=2
claimLevelEffectiveAccess=2
internalCxorbiaEmail=false
classification=DEFECT_REAL_DUPLICATE_EFFECTIVE_ACCESS
```

### Grupo C — defecto de duplicación con dos principals habilitados y scope de producto válido

```text
groupFp=54225792eeb65f6739c0
members=ce178298b2df136541d4,19937aedc77af3404bdc
roleFamily=ADMIN_OPERACIONES
enabled=2
claimLevelEffectiveAccess=2
internalCxorbiaEmail=false
classification=DEFECT_REAL_DUPLICATE_EFFECTIVE_ACCESS
```

### Grupo D — defecto de duplicación Cliente con dos principals habilitados y scope de producto válido

```text
groupFp=ae2f920fe6d9ce1fdd82
members=ca9e2f644334833ab572,360af509dcdcd1880f04
roleFamily=CLIENTE
enabled=2
claimLevelEffectiveAccess=2
targetProjectScoped=true
internalCxorbiaEmail=false
classification=DEFECT_REAL_DUPLICATE_EFFECTIVE_ACCESS
```

### Grupo E — único grupo ambiguo

```text
groupFp=fd891812eca020d27ee3
members=e1773a24c98d6bbe26c3,50d360f17c1fbdd69770
enabled=2
claimLevelEffectiveAccess=0
internalCxorbiaEmail=false
classification=AMBIGUOUS_MULTI_ENABLED_PROVIDER_IDENTITY_WITH_BLOCKED_MEMBER
```

El miembro `e177...` está fuera del contrato de roles y no tiene acceso TyA efectivo bajo `ROLE_NOT_ALLOWED`. El miembro `50d...` es Admin/Operaciones con tenant explícito no TyA, un proyecto no objetivo y por tanto sin acceso TyA bajo `TENANT_NOT_ALLOWED`.

El grupo sigue marcado ambiguo porque hay dos principals provider habilitados con el mismo provider email fingerprint y el bloque no estaba autorizado para seleccionar keeper, retirar acceso ni ampliar discriminadores. Esto activó `STOP_RETRY`.

## 6. Cuatro roles fuera de contrato

```text
085672af5c98475df375 -> SIN_ACCESO_EFECTIVO_ROLE_NOT_ALLOWED
2349f1c0aaa3c696f646 -> SIN_ACCESO_EFECTIVO_ROLE_NOT_ALLOWED
6972df2731188d5ba37b -> SIN_ACCESO_EFECTIVO_ROLE_NOT_ALLOWED
e1773a24c98d6bbe26c3 -> SIN_ACCESO_EFECTIVO_ROLE_NOT_ALLOWED
```

Los tres primeros no tienen role claim. `e177...` sí tiene role técnico, pero no pertenece a la familia permitida. Ninguno quedó relacionado con un perfil del plan shopper v4.

## 7. Admin/Operaciones fuera de tenant scope

```text
candidateFp=50d360f17c1fbdd69770
hasTenantClaim=true
projectCount=1
targetProjectScoped=false
classification=EXPECTED_CROSS_TENANT_NO_TYA_EFFECTIVE_ACCESS
```

Este candidato coincide con el grupo ambiguo `fd891...`; por eso no se cuenta como un defecto TyA separado.

## 8. Shopper fuera de target/shopper scope

```text
candidateFp=b04295748f3131adf337
tenantAllowed=true
projectCount=1
targetProjectScoped=false
shopperScopePresent=false
planRelation=null
classification=SIN_ACCESO_EFECTIVO_SHOPPER_ID_MISSING
```

No está relacionado con un perfil del plan v4 y el contrato del navegador lo rechaza por `SHOPPER_SCOPE_REQUIRED`.

## 9. Solapamientos

```text
duplicateEmail__unknownRole=1
duplicateEmail__adminTenant=1
duplicateEmail__shopperScope=0
unknownRole__adminTenant=0
unknownRole__shopperScope=0
adminTenant__shopperScope=0
```

Por tanto, los conteos iniciales no representan once defectos independientes.

## 10. Límite de interpretación

Los cuatro grupos A-D tienen **dos cuentas habilitadas con claims/scope que permitirían acceso a la superficie correspondiente**. La clasificación `DEFECT_REAL_DUPLICATE_EFFECTIVE_ACCESS` es de seguridad/claims, no una prueba de login canónico de ambas cuentas.

Los cinco grupos tienen `internalCxorbiaEmail=false`. El bloque no hizo sign-in probe ni exportó dominio/email, por lo que no se adjudica cuál cuenta es keeper ni si alguna corresponde a una identidad histórica/técnica previa al single-login. No usar antigüedad, orden de resultados ni heurística visual para decidir keeper.

## 11. STOP_RETRY y fail-close

```text
ambiguousCases=1
repairRequiredCases=4
noEffectiveAccessCases=5
providerReads=1
secondProviderRead=false
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
PREWRITE=false
Activation=false
newSmoke=false
deploys=0
merge=false
production=false
rawPIIExported=false
```

El request quedó consumido/deshabilitado con `allowedExecutions=0`. Los workflows temporales de source gate y adjudicación one-shot fueron retirados. No existe ejecución provider latente.

## 12. Siguiente bloque exacto

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE KEEPER + TARGET-SCOPE ADJUDICATION READ-ONLY FOCAL`.

Debe limitarse a los diez candidate fingerprints de los cinco grupos ya identificados. Debe resolver, sin PII, cuál principal de los cuatro grupos A-D es keeper y cuál es histórico/técnico/retirable, y cerrar la política del grupo E que no tiene acceso TyA efectivo. Usar únicamente discriminadores técnicos source-safe expresamente autorizados y relaciones existentes; no reabrir los 340 shoppers.

No debe ejecutar repair, nuevo smoke ni writes en el mismo bloque. Ante empate o falta de ancla reproducible: `STOP_RETRY` sin segundo provider read.

## 13. Clasificación

- **Reusable CXOrbia:** adjudicación por fingerprints, overlaps y alcance efectivo antes de repair.
- **Exclusivo cliente:** los cinco grupos/outliers Auth DEV TyA observados.
- **Claude/prototipo:** sin cambio frontend; 20/20 superficies Phase A siguen preservadas desde el smoke anterior.
- **Academia:** documentar diferencia entre principal habilitado, claims habilitantes y login canónico; troubleshooting por capa.
- **Sin impacto Claude:** no hubo provider writes, deploy ni producción.

## 14. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados. Producción continúa intacta.
