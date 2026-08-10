# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_DUPLICATE_KEEPER_SOURCE_GATE_STOP_PRE_PROVIDER_FALSE_POSITIVE__AUTH_DEV_228_PRESERVED__ZERO_PROVIDER_READS__NO_REQUEST__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-KEEPER-SOURCE-GATE-PREPROVIDER-STOP-RETRY-20260810.md`;
- evidencia vigente: `app/docs/evidence/C6-AUTH-DUPLICATE-KEEPER-SOURCE-GATE-PREPROVIDER-STOP-RETRY-20260810.json`;
- freeze rector: `backend/config/c6-shopper-auth-final-freeze-v4.json`;
- digest rector: `c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4`;
- producción: intacta.

## 2. Baseline Auth protegido — no reabrir

```text
rows=340
CREATE_AUTH=118
UPDATE_AUTH=9
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
PREWRITE repeated=false
Activation repeated=false
```

```text
SKIP13=closed 13/13
multiAuthProfile=7cc28c78de9bfda01d14
keeper=4e6d26551d11db444bd0
duplicateAccessRetired=9b2b7ca1bd72c1301d29
targetLineage(ac93)=closed
HashConfig=closed PASS
SmokeCredentialLifecycle=closed PASS
```

No reconstruir las 340 identidades.

## 3. Hallazgo previo que sigue vigente

La adjudicación anterior confirmó cinco grupos de provider email duplicado. Cuatro grupos tienen dos principals habilitados con claims/scope habilitantes; el quinto tiene dos principals habilitados sin acceso TyA efectivo.

```text
1acdcb3782b7cf351056 -> 6dee7f31c738218ce63a / b561d9c46660715e214f
2c4d19f2b066835473d3 -> aa5cbada6c5388ee1d8b / f8405e17df357c121ccc
54225792eeb65f6739c0 -> ce178298b2df136541d4 / 19937aedc77af3404bdc
ae2f920fe6d9ce1fdd82 -> ca9e2f644334833ab572 / 360af509dcdcd1880f04
fd891812eca020d27ee3 -> e1773a24c98d6bbe26c3 / 50d360f17c1fbdd69770
```

Source lock histórico inmediato: `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.md`.

## 4. Bloque actual — detenido pre-provider

Se preparó source-only un adjudicador focal y su gate, pero el gate contenía una aserción textual demasiado amplia:

```text
!tool.includes('creationTime') && !tool.includes('lastSignInTime')
```

La herramienta solo declaraba los flags negativos:

```text
creationTimeUsed:false
lastSignInTimeUsed:false
```

Por tanto la comprobación habría producido un falso positivo aunque esos metadatos no fueran usados como selectores.

```text
classification=PRE_PROVIDER_SOURCE_GATE_FALSE_POSITIVE_TEMPORAL_SAFETY_FLAG_MATCH
toolCommit=57e610901e524cf4e551bea031b9aba9c0634b6c
sourceGateCommit=b6e562fa548bb69bf11d1638f5f1dd48315fc318
sourceGatePass=false
providerRequestEmitted=false
providerWorkflowCreated=false
providerReadsCurrentBlock=0
```

## 5. Lineage source-safe preparado, no adjudicado

Antes del stop se confirmó únicamente desde evidencia existente:

- Cliente: fingerprint UID canónico con readback + password sign-in PASS;
- Cliente histórico: dos hashes técnicos de principals normalizados;
- staff importado: `super=1`, `coordinador=2`, namespace `staff`, identificador interno namespaced;
- continuidad post-import: `namespace none=17`, `staff=3`.

No se aplicó esta información a ningún candidate porque no se alcanzó provider.

## 6. Fail-close

```text
sourceGateRemovalCommit=b4c2840759b8fe8258ec7d8d071afbc0ae647803
toolRemovalCommit=0850e078d8d9e6eea47eb2ac096b79c22a3b61f4
providerReads=0
secondProviderRead=false
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreReads/Writes=0/0
HRReads/Writes=0/0
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

No existe request provider ni workflow provider de este bloque.

## 7. Próximo bloque exacto

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE KEEPER SOURCE-GATE FALSE-POSITIVE ROOTFIX → ONE READ FOCAL`

Corregir exclusivamente la aserción temporal source-only para bloquear acceso real a `user.metadata.creationTime`/`lastSignInTime` sin bloquear flags negativos. Solo con PASS podrá emitirse un request nuevo/no superpuesto para máximo una lectura provider de los mismos diez candidate fingerprints. Ante empate o fallo: `STOP_RETRY`, sin segundo provider read.

Cero repair, PREWRITE, Activation, nuevo smoke, Auth/IAM/Firestore/HR/Rules/Storage writes, Make, Gemini, pagos, deploy, merge o producción.

## 8. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma, Academia y las 20/20 superficies Phase A source-side permanecen preservadas.

## 9. Cierre

- **Qué se hizo:** preparación source-only focal y revisión de lineage ya existente.
- **Avance Phase A:** Auth DEV 228 permanece PASS; no hubo retroceso funcional.
- **Qué se preservó:** cero provider reads/writes, frontend y producción.
- **Claude/Academia:** addenda actualizados; sin parche frontend.
- **Pendiente real:** corregir una aserción de gate y adjudicar los cinco pares.
- **Estado seguro:** archivos transitorios retirados; ningún request provider emitido.
- **Bloqueo comprobado:** falso positivo source-gate pre-provider, no problema de Auth.
