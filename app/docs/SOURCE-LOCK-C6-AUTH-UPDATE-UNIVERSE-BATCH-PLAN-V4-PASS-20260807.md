# SOURCE LOCK — C6 AUTH UPDATE-UNIVERSE BATCH REVALIDATION + PLAN V4 PASS

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_UPDATE_UNIVERSE_BATCH_PASS__PLAN_V4_340_HOLD0__36_ZERO_9_UNIQUE__ZERO_AUTH_WRITES__NO_PRODUCTION`

## 1. Carril

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: abierto, draft, sin merge;
- provider DEV: `cxorbia-backend-dev`;
- producción: intacta;
- Auth ejecutado: no;
- Auth/provider writes del bloque: 0.

## 2. Entrada congelada

Plan v3 canónico:

```text
rows=340
UPDATE_AUTH=45
HOLD=0
digest=7b92fa73946e74ec4058bcdcbcfca25fe90e0504db6b6b22e797fbad066bd749
```

Riesgo sistémico vigente antes del batch:

```text
SYSTEMIC_SUFFIXED_UPDATE_SHARED_BASELOGIN_ALIAS_RISK
expected current UPDATE risk universe=36
```

El método obligatorio fue clasificar las 45 `UPDATE_AUTH` completas como superconjunto del riesgo, usando solo anclas target-specific y sin usar `baseLogin` compartido como selector independiente.

## 3. Incidencias de harness previas al provider

Cuatro ejecuciones se cerraron antes de preparar credencial/provider. No consumieron el único provider attempt autorizado:

```text
31236133879 / 93048870363
PRE_PROVIDER_STATIC_GATE_EXPECTED_RISK_LITERAL_NOT_PRESENT_IN_TOOL
providerAttempts=0

31236248638 / 93049173290
PRE_PROVIDER_STATIC_RISK_EVIDENCE_SHAPE_GATE_MISMATCH
providerAttempts=0

31236374380 / 93049503508
PRE_PROVIDER_FILTERED_RISK_LIST_SHAPE_GATE_MISMATCH
providerAttempts=0

31236622306 / 93050144803
PRE_PROVIDER_CANONICAL_PLAN_V3_DOES_NOT_PERSIST_SUFFIX_APPLIED_METADATA
providerAttempts=0
```

La causa común fue el harness intentando usar metadatos auxiliares de membership del riesgo que no estaban congelados con forma suficiente. Se eliminó esa dependencia: dado que las 45 filas UPDATE se clasifican completas, el universo de 36 queda incluido por construcción.

## 4. Único provider attempt del bloque

```text
requestId=c6-auth-update-universe-batch-revalidation-20260807-05
runId=31236820249
jobId=93050768996
artifactId=9015681941
artifactDigest=sha256:6c1d93c58853c01682ce54bafab5f03d116a0586b9658d59323bfae7d3db3263
providerAttempts=1
secondProviderAttempt=false
```

Lecturas source-safe:

```text
authDirectoryPages=1
authUsers=110
shopperDocuments=340
hrDocuments=1
visitDocuments=616
certificationDocuments=77
liquidationDocuments=827
credentialRecords=109
credentialsMapped=101
credentialsUnmapped=8
```

No se leyó `passwordHash`, `passwordSalt` ni se hizo sign-in probe.

## 5. Clasificación batch completa

```text
rowsClassified=45
candidateCount0=36
candidateCount1=9
candidateCount>1=0
unresolvedReconstruction=0
crossRowAssociations=0
unresolved=0
```

Resultado rector:

```text
PASS_C6_AUTH_UPDATE_UNIVERSE_BATCH_REVALIDATION_PLAN_V4
```

Los 36 `candidateCount=0` se reclasifican `UPDATE_AUTH -> CREATE_AUTH`. Los 9 `candidateCount=1` conservan principal único target-specific y permanecen UPDATE tras recalcular flags; no existe multi-candidate ni HOLD.

No afirmar que los 36 `candidateCount=0` son una correspondencia uno-a-uno con las 36 filas del listado histórico de riesgo. La cobertura válida es el batch completo de 45 como superconjunto del riesgo sistémico versionado.

## 6. Plan v4 congelado

```text
rows=340
uniqueRows=340
CREATE_AUTH=118
UPDATE_AUTH=9
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132

emailChanges=2
passwordChanges=8
claimsChanges=1

expectedAuthUsersBefore=110
expectedAuthUsersAfter=228

digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
```

El digest fue revalidado offline sobre el artefacto exacto y coincide con las 340 filas.

Freeze rector: `backend/config/c6-shopper-auth-final-freeze-v4.json`.

Evidencia persistida: `app/docs/evidence/C6-AUTH-UPDATE-UNIVERSE-BATCH-REVALIDATION-PLAN-V4-PASS-20260807.json`.

## 7. Verifier terminal — falso positivo, sin rerun provider

La herramienta provider terminó y emitió PASS. El workflow global quedó `failure` únicamente en el verificador posterior porque su regex trató la llave numérica:

```text
subchangeCounts.email=2
```

como si fuera una exportación de correo crudo.

Clasificación:

```text
SOURCE_SAFE_VERIFIER_FALSE_POSITIVE_CHANGE_COUNT_EMAIL_KEY
```

Validación estructural offline del artefacto exacto:

```text
raw UID keys=0
raw shopperId keys=0
raw passwordHash keys=0
raw passwordSalt keys=0
non-boolean/non-count email value keys=0
sensitive strings=0
```

Por tanto el PASS del artefacto se acepta sin segundo provider attempt. No se reejecutó el provider.

## 8. Fail-close

- requests v1..v5: consumidos/deshabilitados;
- provider attempts efectivos: exactamente 1;
- second provider attempt: false;
- workflows one-shot v1..v5: retirados;
- Auth writes: 0;
- provider writes: 0;
- Firestore/HR/visitas/certificaciones/liquidaciones/Rules/Storage writes: 0;
- Cloud Build/Cloud Run/Hosting: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- production: false.

## 9. Estado de identidad y Phase A

Permanecen cerrados:

- SKIP13 `13/13`;
- multi-Auth adjudicado;
- lineage `ac93...`;
- causa raíz de alias cross-row del PREWRITE viejo.

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.

## 10. Siguiente bloque exacto

No repetir revalidación UPDATE ni volver a clasificar fila por fila.

El siguiente bloque, solo bajo autorización separada, debe preparar y ejecutar PREWRITE sobre **plan v4**: validar 118 CREATE / 9 UPDATE, revisar rollback exacto únicamente para los 8 password updates existentes, snapshot cifrado completo, principal uniqueness global, colisiones y población esperada 110->228. Solo con PREWRITE PASS podrá ejecutarse Auth DEV. El actual bloque no autorizó Auth writes.
