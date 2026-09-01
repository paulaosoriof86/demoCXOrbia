# SOURCE LOCK — C6 AUTH DIGEST PASS + PHASE 2 PREWRITE SYSTEMIC UPDATE RISK STOP_RETRY

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_ROOTFIX_DIGEST_CANONICALIZATION_PASS__PLAN_V3_340_HOLD0__PHASE2_PREWRITE_STOP_UPDATE_CANDIDATE_DRIFT__SYSTEMIC_SUFFIX_COLLISION_RISK_36__ZERO_AUTH_WRITES__NO_PRODUCTION`

## 1. Carril

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: abierto, draft, sin merge;
- target provider: `cxorbia-backend-dev`;
- producción: intacta;
- Auth ejecutado: no;
- write boundary alcanzado: no.

## 2. FASE 1 — canonicalización digest

Se canonicalizó exclusivamente la anotación digest-bearing a:

```text
TARGET_SPECIFIC_EXISTING_AUTH_CANDIDATE_COUNT_0_AFTER_LINEAGE_PASS
```

El primer harness source-only del bloque (`runId=31234567894`, `jobId=93044626041`) falló antes de materialización porque faltaba instalar `firebase-admin` para ejecutar el self-test del activation tool. Fue clasificado `SOURCE_ONLY_HARNESS_MISSING_FIREBASE_ADMIN_DEPENDENCY`; providerReads=0, providerWrites=0, AuthWrites=0. El request v1 fue consumido y su workflow retirado.

El request source-only corregido v2 cerró PASS:

```text
runId=31234681163
jobId=93044913507
artifactId=9014970238
artifactDigest=sha256:3a91b60612b67198b1109eaae53deb66720d1614d673e361cc657822f9317395
decision=PASS_C6_AUTH_PRINCIPAL_UNIQUENESS_ROOTFIX_SOURCE_ONLY
providerReads=0
providerWrites=0
AuthWrites=0
```

Plan v3 canónico:

```text
rows=340
uniqueRows=340
CREATE_AUTH=82
UPDATE_AUTH=45
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
emailChanges=38
passwordChanges=13
claimsChanges=37
expectedAuthUsersBefore=110
expectedAuthUsersAfter=192
digest=7b92fa73946e74ec4058bcdcbcfca25fe90e0504db6b6b22e797fbad066bd749
```

`ac93d90d9e41512acdcd` quedó materializado source-only como `CREATE_AUTH`; el peer `a8dd7db89a02ff180674` permaneció `UPDATE_AUTH`.

## 3. FASE 2 — único provider attempt

Request nuevo/no solapado:

```text
requestId=c6-auth-principal-uniqueness-activation-dev-phase2-20260807-01
requestCommit=d27723b2d5eb1506d8e11acdd1ac97d18cc98422
runId=31234830218
jobId=93045302944
artifactId=9015012896
artifactDigest=sha256:a282b089e7bbdd1760e1d426fe837b9992857e3951e3efa837719ab9917dd68f
workflowConclusion=success
```

Pasaron: request gate, source artifact gate, activation v2 self-test y static no-loop gate. La credencial DEV fue preparada privadamente y se consumió un único PREWRITE provider attempt.

Decisión terminal:

```text
STOP_RETRY_C6_AUTH_ACTIVATION_DEV_V2_PREWRITE
blocker=UPDATE_AUTH_AUTH_CANDIDATE_DRIFT:19f2a621b1b350db911b:0
prewritePass=false
writeBoundaryEntered=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWriteCalls=0
```

No se inspeccionó ni ejecutó la fase de writes.

## 4. Hallazgo antibucles — riesgo sistémico

La fila `19f2a621b1b350db911b` pertenece a un grupo de dos perfiles con el mismo `baseLoginFp=bff198e33dfa528bdaec`; es el miembro suffixado y su peer `04639cf5545a0941e5d5` conserva el login base como `NO_OP`.

La revisión source-only de los artefactos congelados demuestra que el patrón no es aislado:

```text
oldSuffixAppliedUpdateRowsSharingBaseLoginWithOneUnsuffixedPeer=37
alreadyReclassified=ac93d90d9e41512acdcd
remainingCurrentUPDATE_AUTHInSameRiskClass=36
peerPrimaryNO_OP=32
peerPrimaryUPDATE_AUTH=4
```

Clasificación:

```text
SYSTEMIC_SUFFIXED_UPDATE_SHARED_BASELOGIN_ALIAS_RISK
```

Esto no prueba que las 36 carezcan de Auth propio. Sí prueba que continuar fila por fila sería un bucle metodológico. No se autoriza otro provider attempt en este bloque.

Evidencia source-safe: `app/docs/evidence/C6-AUTH-ACTIVATION-V2-PREWRITE-SYSTEMIC-SUFFIX-COLLISION-RISK-20260807.json`.

## 5. Fail-close

- source request v1: consumido/deshabilitado;
- source request v2: consumido/deshabilitado;
- source workflows: retirados;
- phase2 request: consumido/deshabilitado;
- phase2 workflow: retirado;
- provider attempts FASE 2: exactamente 1;
- second provider attempt: false;
- Auth writes: 0;
- Firestore/HR/Rules/Storage writes: 0;
- deploy/merge/production: 0/false.

## 6. Siguiente método obligatorio

No repetir PREWRITE fila por fila. El siguiente bloque debe ser una **revalidación batch de los 45 `UPDATE_AUTH` actuales**, con énfasis en las 36 filas suffixadas de riesgo:

1. resolver las 45 filas con anclas target-specific;
2. clasificar candidateCount `0/1/>1` para todas antes de modificar el plan;
3. `baseLogin` compartido solo como señal de colisión, nunca selector;
4. enforce global principal/candidate uniqueness;
5. reconstruir las 340 filas una sola vez a partir del universo completo;
6. recalcular counts, subchanges, expected population y digest una sola vez;
7. no ejecutar Auth hasta congelar el plan resultante y pasar PREWRITE completo.

No reabrir SKIP13, multi-Auth, lineage de `ac93...` ni el password target bajo el plan viejo.

## 7. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
