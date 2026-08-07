# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_FINAL_PLAN_340_HOLD0__TARGET_ANCHOR_LINEAGE_SOURCE_ONLY_STOP_RETRY_EXACT_CONSENSUS_BASES_NOT_VERSIONED__PROVIDER_MINIMUM_CLASSIFIED__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-TARGET-ANCHOR-LINEAGE-ROOTFIX-SOURCE-ONLY-STOP-RETRY-20260807.md`;
- request ejecutable: ninguno;
- producción: intacta;
- Auth ejecutado: no;
- write boundary alcanzado: no.

## 2. Plan Auth final preservado

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
emailChanges=39
passwordChanges=14
claimsChanges=38
onePrimaryOperationPerProfile=true
rowsDigest=68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3
AuthExecuted=false
```

SKIP13 sigue cerrado `13/13`. Multi-Auth sigue adjudicado y cerrado:

```text
profile=7cc28c78de9bfda01d14
keeper=4e6d26551d11db444bd0
duplicateAccessToRetire=9b2b7ca1bd72c1301d29
retirementMode=DISABLE_ONLY_NO_DELETE
```

## 3. Último provider block consumido

El one-target resolver anterior terminó antes de Auth:

```text
runId=31221947755
jobId=93008217242
artifactId=9010690763
decision=STOP_RETRY_C6_AUTH_ONE_TARGET_RESOLVER_PASSWORD_SNAPSHOT_READONLY_TECHNICAL
blocker=TARGET_CREDENTIAL_LOGIN_ANCHOR_MISSING
shopperIndexQueries=1
shopperDocumentsRead=340
authDirectoryPages=0
hashConfigReads=0
writes=0
```

Su request está consumido y su workflow one-shot retirado.

## 4. Bloque actual — target anchor lineage source-only

Fuentes usadas: artefacto congelado `31104541809 / 8968941587`, plan digest `acc93da842d1a5d3244327680f88539f0651cb101bae09dd231fd8b5008bea92`, planner deterministic suffix, equivalent universe y evidencias versionadas. No se leyó provider.

Target congelado:

```text
profileFp=ac93d90d9e41512acdcd
baseLoginFp=493f2b26360648693c37
targetLoginFp=bd8d7019d612b4421366
sourceSafeSurnameBasis=multi_source_full_name_consensus
resolutionBases=deterministic_technical_suffix
suffixApplied=true
suffixLength=4
primary=UPDATE_AUTH
changes.email=true
changes.password=true
changes.claims=true
```

Existe un solo peer con el mismo `baseLoginFp`:

```text
profileFp=a8dd7db89a02ff180674
sourceSafeSurnameBasis=explicit_or_technical
resolutionBases=unique_technical_holder_preserves_unsuffixed_login
suffixApplied=false
```

## 5. Lineage demostrada y gap real

El planner forma `baseLogin = first + '.' + surname`. En `multi_source_full_name_consensus` acepta exactamente un apellido corroborado por >=2 bases distintas. Bases posibles del full-name consensus: `profile`, `hr`, `visit`, `certification`, `liquidation`; linked sources se resuelven por `direct_shopper_id` o `exact_technical_anchor`.

Se demostró:

```text
baseLoginLineageStructurallyDemonstrated=true
targetLoginLineageStructurallyDemonstrated=true
collisionGroupSize=2
targetIsSuffixedMember=true
suffixLength=4
```

No se puede recuperar source-only el set exacto de bases corroborantes porque:

- el row UPDATE_AUTH exportó `diagnostics=null`;
- group matrix conserva forma agregada, no memberVectors del target;
- member provenance fue delta-only y el grupo quedó unchanged;
- `baseLoginFp`/`targetLoginFp` son one-way.

Decisión:

```text
STOP_RETRY_C6_AUTH_TARGET_ANCHOR_LINEAGE_ROOT_FIX_SOURCE_ONLY_EXACT_CONSENSUS_BASES_NOT_VERSIONED
```

No se inventa si el consenso concreto fue `profile+hr`, `hr+visit`, etc.

## 6. Mínimo provider futuro — congelado, no autorizado

Contrato: `backend/contracts/c6-auth-target-anchor-lineage-provider-minimum-v1.json`.

Cadena:

1. resolver target técnico;
2. leer adaptativamente solo objetos target-linked de `hrImports`, `visits`, `certifications`, `liquidations`, con short-circuit al reproducir un único consenso >=2 bases y los fingerprints congelados;
3. Auth reads=0 hasta PASS de lineage;
4. luego máximo 1 página Auth y exigir `candidateCount=1`, asociación a otros rows=0;
5. solo después hash/salt/hashConfig y snapshot cifrado reversible.

No existe request ejecutable para ese bloque.

## 7. Seguridad del bloque actual

```text
providerReads=0
AuthReads=0
FirestoreReads=0
HRReads=0
providerWrites=0
AuthWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
CloudBuild=0
CloudRun=0
Hosting=0
Make=0
Gemini=0
payments=0
merge=false
production=false
```

Incidencia de herramienta: un `create_file` de evidencia devolvió HTTP 422 porque el archivo ya existía y requería SHA; fue no-op y no cambió repo lógico/provider.

## 8. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.

## 9. Siguiente bloque exacto

Requiere autorización separada para el provider read-only focal/adaptativo definido por `c6-auth-target-anchor-lineage-provider-minimum-v1.json`. No reabrir SKIP13, multi-Auth ni plan final 340/HOLD0.
