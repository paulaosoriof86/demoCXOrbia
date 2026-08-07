# CAMBIOS BACKEND — Addendum C6 Multi-Auth Final Discriminator read-only

## Estado

`STOP_RETRY_C6_MULTI_AUTH_FINAL_DISCRIMINATOR_TENANT_ADJUDICATION_REQUIRED`

## Archivos creados/tocados

- `backend/contracts/c6-multi-auth-final-discriminator-readonly-v1.json`: contrato focal de atributos Auth/custom claims allowlisted, selectores prohibidos y regla de discriminador decisivo.
- `tools/qa/cxorbia-c6-multi-auth-final-discriminator-readonly-v1.mjs`: inspector read-only focal de los dos candidate fingerprints.
- `backend/config/c6-multi-auth-final-discriminator-readonly-request-v1.json`: request one-shot ejecutado, consumido y deshabilitado.
- `.github/workflows/cxorbia-c6-multi-auth-final-discriminator-readonly-once.yml`: workflow efímero de ejecución; retirado después del run.
- `app/docs/evidence/C6-MULTI-AUTH-FINAL-DISCRIMINATOR-READONLY-STOP-RETRY-20260807.json`: evidencia source-safe terminal.
- `app/docs/SOURCE-LOCK-C6-MULTI-AUTH-FINAL-DISCRIMINATOR-TENANT-ADJUDICATION-STOP-RETRY-20260807.md`: source lock vigente del caso.

## Resultado

Los dos candidatos conservan exactamente el mismo conjunto relevante de claims allowlisted observado:

```text
projectId
projectIds
role
shopperId
tenantId
```

Ambos mantienen tenant/proyecto/rol shopper, password provider y el mismo fingerprint del `shopperId`. Ninguno contiene marcador allowlisted de source/batch/migración/import; `decisiveMatchCount=0/0`.

Por tanto no existe base técnica autorizada para designar keeper o acceso a retirar. Se aplica STOP_RETRY y se requiere adjudicación explícita del tenant.

## Freeze/plan

Freeze Auth intacto: `340/340`, digest `6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b`, no ejecutado.

Overlay provisional preservado: `81 CREATE / 46 UPDATE / 80 NO_OP / 1 HOLD / 132 PRESERVE_NO_AUTH`, 340 filas únicas, no ejecutable.

## Evidencia terminal

```text
runId=31199988897
jobId=92937409808
artifactId=9002409950
artifactDigest=sha256:0387c7323cf16b50f8d0596fff7bb19bec4aba94e830b2d998761041f5d723e5
requestConsumeCommit=f587489c0d025ab47085a1bc7074e7345d891f0b
workflowRemovalCommit=55c9777698594815ef18bb380a0f0fad79f6f4b8
```

## Corrección pre-ejecución

Antes de crear el request ejecutable se corrigió un falso positivo del gate estático: la herramienta incluía la palabra `legacyCredentials` únicamente para exigir `scope.legacyCredentials=false`, pero el gate la trataba como indicador de lectura. Se corrigió en `f6c18173c028a3f04e08c16b027a211ce8cbc526`. No hubo provider read previo ni segundo intento.

## Seguridad

Cero Firestore/membership/HR/Storage/legacy reads; cero writes; cero deploy; cero merge; cero producción. La única lectura provider del bloque fue una página Auth, usando UID de los 110 usuarios únicamente para calcular candidate fingerprint y descartando atributos de no targets; se inspeccionaron atributos allowlisted solo de los dos targets.

## Clasificación

- **Reusable CXOrbia:** discriminador allowlisted, fail-close y prohibición de selectores débiles.
- **Exclusivo TyA:** fingerprints del perfil/candidatos y adjudicación final.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** caso de gobernanza de identidad y separación evidencia técnica/decisión de tenant.
- **Sin impacto Claude:** Login, `CX.data`, HR, módulos y portales preservados.
