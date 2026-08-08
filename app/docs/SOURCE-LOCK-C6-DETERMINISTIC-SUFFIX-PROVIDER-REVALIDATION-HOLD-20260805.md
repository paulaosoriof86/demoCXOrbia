# SOURCE LOCK — C6 Deterministic Suffix Provider Revalidation HOLD

**Fecha:** 2026-08-05  
**Estado:** `HOLD_C6_DETERMINISTIC_SUFFIX_PLAN_STOP_RETRY`

## Carril

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR: `#7`, draft/open/no merge;
- target source HEAD: `4e62267d8072609edfee47331c4851eff4a88089`;
- root fix source commit: `6160ef89b75bcdf9068c210810c528d3c6d13db1`;
- request commit: `62cbe347000d102870e2e36bcf8b3638a1cc77ab`.

## Ejecución única

```text
run=31066410847
job=92504941089
artifact=8953983093
artifactDigest=sha256:ba9a559832ee2d8003ae798ae8a40cbe7e6b7582587d32053c55f16af50b134a
sourceStatic=PASS_C6_DETERMINISTIC_SUFFIX_SOURCE_STATIC
provider=HOLD_C6_DETERMINISTIC_SUFFIX_PLAN_STOP_RETRY
```

La ejecución provider fue exactamente una. No existe autorización residual ni segundo intento.

## Resultado congelado

```text
profiles=340
authUsers=110
credentials=109
credentialCrosswalk=101 mapped / 8 unmapped
credentialCrosswalkParity=true
remaining source-safe surname holds=12
collision groups=65
active identities in collision groups=142
multi-Auth unresolved=1
plan rows=340
plan digest=a0fdc805de12f761feccd10b85d470be09156f4a5b6aff8fb0ca7f3ac4133bfb
readyForAuthRepair=false
```

El root fix de crosswalk queda validado provider. El HOLD ya no proviene de drift de credenciales.

## Bloqueadores congelados

1. doce perfiles activos continúan sin apellido técnico verificable mediante fuentes source-safe;
2. un perfil conserva empate multi-Auth después de puntuar claims, shopperId, email técnico, credencial, compatibilidad de contraseña y metadata;
3. la clasificación corregida produce `65/142`, distinta de la referencia anterior `64/141`, por lo que la diferencia requiere explicación source-only antes de congelar baseline.

## Plan no ejecutable

```text
CREATE_AUTH=81
UPDATE_AUTH=47
NO_OP=72
HOLD=13
PRESERVE_NO_AUTH=127
TOTAL=340
```

Las 13 filas HOLD corresponden a 12 apellidos sin evidencia y un empate multi-Auth. No se permite aplicar parcialmente las otras 327 filas.

## Estado seguro

Auth, contraseñas, memberships, Firestore, Rules, Storage, HR, Hosting, Cloud Run, Make, Gemini, pagos, merge y producción: `0/false`.

No se exportaron nombres, logins, emails, contraseñas ni UID crudos. El artifact y la evidencia persistida contienen únicamente agregados y fingerprints source-safe.

## Siguiente bloque exacto

```text
SOURCE-ONLY RESIDUAL IDENTITY ROOT-CAUSE CLASSIFICATION
→ explicar 12 surname HOLD fingerprints
→ explicar 1 multi-Auth tie fingerprint
→ reconciliar 65/142 versus 64/141
→ producir propuesta no operativa
→ STOP sin provider reads ni writes
```
