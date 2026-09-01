# SOURCE LOCK — C6 AUTH DUPLICATE KEEPER + TARGET-SCOPE · PRE-PROVIDER SOURCE-GATE STOP_RETRY

**Fecha:** 2026-08-10  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `C6_AUTH_DUPLICATE_KEEPER_SOURCE_GATE_STOP_PRE_PROVIDER_FALSE_POSITIVE__AUTH_DEV_228_PRESERVED__ZERO_PROVIDER_READS__NO_REQUEST__NO_PRODUCTION`

## 1. Baseline protegido

Este bloque partió de Auth DEV ya activado y validado:

```text
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
PlanV4Digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
PREWRITE repeated=false
Activation repeated=false
```

No se reabrió el universo de 340 identidades ni se ejecutó ningún provider read.

## 2. Universo focal autorizado

Se congeló exclusivamente el universo ya adjudicado de cinco grupos / diez candidate fingerprints:

```text
1acdcb3782b7cf351056 -> 6dee7f31c738218ce63a / b561d9c46660715e214f
2c4d19f2b066835473d3 -> aa5cbada6c5388ee1d8b / f8405e17df357c121ccc
54225792eeb65f6739c0 -> ce178298b2df136541d4 / 19937aedc77af3404bdc
ae2f920fe6d9ce1fdd82 -> ca9e2f644334833ab572 / 360af509dcdcd1880f04
fd891812eca020d27ee3 -> e1773a24c98d6bbe26c3 / 50d360f17c1fbdd69770
```

No se amplió el universo.

## 3. Lineage source-safe revisado antes de provider

Se verificaron únicamente fuentes ya existentes en el repo. Se identificaron anclas potencialmente útiles para una futura adjudicación, sin ejecutar provider:

- `CORTE6-CLIENT-AUTH-READBACK-LATEST.json`: existe un fingerprint UID canónico de Cliente con claims exactos y password sign-in PASS;
- `CORTE6-AUTH-CLAIMS-NORMALIZATION-LATEST.json`: existen dos hashes técnicos históricos de principals Cliente normalizados;
- `CORTE6-CREDENTIAL-IMPORT-LATEST.json`: el import canónico de staff fue 3 principals (`super=1`, `coordinador=2`) bajo namespace `staff` e identificador Firebase interno namespaced;
- `CORTE6-CREDENTIAL-CONTINUITY-READONLY-LATEST.json`: en el snapshot posterior al import había `namespace none=17`, `staff=3`, confirmando la separación entre población original y staff namespaced importado.

Estas anclas NO adjudican todavía ningún keeper de los cinco pares; solo forman parte del próximo discriminador source-safe permitido.

## 4. Bloqueo pre-provider reproducible

Se prepararon transitoriamente:

```text
toolCommit=57e610901e524cf4e551bea031b9aba9c0634b6c
sourceGateCommit=b6e562fa548bb69bf11d1638f5f1dd48315fc318
```

El gate source-only contenía una comprobación demasiado amplia:

```text
!tool.includes('creationTime') && !tool.includes('lastSignInTime')
```

La herramienta no usa metadatos temporales para adjudicar, pero sí declaraba los flags de seguridad:

```text
creationTimeUsed:false
lastSignInTimeUsed:false
```

Por tanto, el propio gate habría rechazado esos flags seguros. Se clasifica como:

```text
PRE_PROVIDER_SOURCE_GATE_FALSE_POSITIVE_TEMPORAL_SAFETY_FLAG_MATCH
```

No es evidencia de problema en Firebase, Auth, claims, los diez candidates ni lineage. Es un defecto de la aserción estática del harness.

## 5. STOP_RETRY y fail-close

Por la regla explícita de la autorización actual, se detuvo el bloque antes de provider. No se emitió request de adjudicación ni workflow provider.

```text
sourceGatePass=false
sourceGatePassStatusPublished=false
providerRequestEmitted=false
providerWorkflowCreated=false
providerReadsCurrentBlock=0
secondProviderRead=false
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreReads=0
FirestoreWrites=0
HRReads=0
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

Los dos archivos transitorios fueron retirados:

```text
sourceGateRemovalCommit=b4c2840759b8fe8258ec7d8d071afbc0ae647803
toolRemovalCommit=0850e078d8d9e6eea47eb2ac096b79c22a3b61f4
```

No existe ejecución provider latente derivada de este bloque.

## 6. Causa raíz y corrección exacta futura

La siguiente versión source-only debe cambiar únicamente la prueba temporal para detectar **uso real como selector** —por ejemplo acceso a `user.metadata.creationTime`/`lastSignInTime`— sin considerar como infracción los flags negativos `creationTimeUsed:false` y `lastSignInTimeUsed:false`.

La herramienta debe seguir preservando:

- 5 grupos / 10 candidates exactos;
- máximo una llamada `listUsers(1000)`;
- fail-close si existe segunda página;
- cero PII cruda;
- cero Firestore/membership/provider writes;
- lineage Cliente y staff ya existente;
- STOP_RETRY ante keeper no demostrable.

## 7. Siguiente bloque exacto

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE KEEPER SOURCE-GATE FALSE-POSITIVE ROOTFIX → ONE READ FOCAL`

Corregir exclusivamente la aserción estática temporal; validar offline/source-only. Solo con PASS podrá emitirse un request nuevo y no superpuesto para máximo una lectura provider de los mismos diez candidate fingerprints. No repair, PREWRITE, Activation, nuevo smoke, writes, deploy, merge ni producción.

## 8. Clasificación

- **Reusable CXOrbia:** gate estático debe distinguir uso de metadatos de simples flags de seguridad negativos.
- **Exclusivo cliente:** cinco pares Auth DEV TyA/Cinépolis permanecen pendientes de keeper/target-scope.
- **Claude/prototipo:** sin cambios frontend ni en `CX.data`.
- **Academia:** documentar fail-close pre-provider y diferencia entre selector prohibido y declaración de seguridad.
- **Sin impacto Claude:** cero provider read/write y cero deploy.

## 9. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y las 20/20 superficies Phase A source-side permanecen preservadas. Producción continúa intacta.
