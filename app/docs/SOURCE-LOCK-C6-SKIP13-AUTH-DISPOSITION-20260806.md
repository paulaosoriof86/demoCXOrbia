# SOURCE LOCK — C6 disposición SKIP de 13 perfiles Shopper

**Fecha:** 2026-08-06  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** `C6_SKIP13_AUTH_DISPOSITION_SOURCE_ONLY_PASS__IDENTITY_HOLD_0__LIVE_HR_AUGUST_P0_REMAINS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Decisión expresa de Paula

Los 13 perfiles que permanecían HOLD se omiten del repair Auth para no bloquear el avance a producción. Paula podrá crear o reincorporar posteriormente un mystery shopper si resulta necesario.

La disposición aplicada es:

```text
SKIP_AUTH_REPAIR_PRESERVE_HISTORY
primary=HOLD -> PRESERVE_NO_AUTH
skipFromAuthRepair=true
doNotCreateAuth=true
doNotUpdateAuth=true
futureManualReactivationAllowed=true
```

## 2. Alcance exacto

- perfiles autorizados: `13`;
- perfiles encontrados en el plan: `13`;
- perfiles no encontrados: `0`;
- filas del plan: `340` únicas;
- HOLD antes: `13`;
- HOLD después: `0`;
- `PRESERVE_NO_AUTH` antes: `127`;
- `PRESERVE_NO_AUTH` después: `140`.

El plan conserva sin cambios:

```text
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
emailChanges=39
passwordChanges=14
claimsChanges=38
```

## 3. Trazabilidad criptográfica

```text
providerRun=31104541809
artifact=8968941587
artifactDigest=sha256:02e36c355b3f2d1c9d1e6f1be7fece93259251ddb0f981cdaac35f2262fcb264
planDigestBefore=acc93da842d1a5d3244327680f88539f0651cb101bae09dd231fd8b5008bea92
planDigestAfter=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
```

## 4. Archivos del bloque

- `backend/config/corte6-shopper-auth-skip13-disposition-v1.json`;
- `tools/qa/cxorbia-c6-shopper-auth-skip-disposition-source-only.mjs`;
- `app/docs/evidence/CORTE6-SHOPPER-AUTH-SKIP13-SOURCE-ONLY-PASS-LATEST.json`.

Commits:

```text
config=b73414a2aaac1aac5c1e12cb0e0adedabd8b2295
qa=f63cbeff69c1aec7036c021776421e4f4386bdee
evidence=f48f5dfdad09c6e0d849fcd8532da8fafe57023c
```

## 5. Preservación y límites

No se ejecutó hard delete. Se conservan perfiles históricos, visitas, certificaciones y liquidaciones. En este bloque tampoco se modificaron ni eliminaron cuentas Auth existentes. Cualquier deshabilitación o eliminación futura de cuentas proveedor requiere autorización separada, snapshot y readback.

Los 13 perfiles dejan de ser bloqueo para planificar Auth. Antes de un cutover se debe comprobar que ninguna identidad omitida reciba acceso efectivo por una cuenta preexistente.

## 6. Bloqueo operativo restante

El bloqueo principal vigente ya no es identidad Shopper. Permanece:

```text
LIVE_HR_PROVIDER_METADATA_AUTODISCOVERY_AND_AUGUST_GT_HN
```

Debe corregirse la lectura viva de metadata, autodetectar `AGOSTO 26` y `AGOSTO 26 HN`, reconstruir todos los periodos desde HR viva y validar una `sourceRevision` común.

## 7. Estado seguro

```text
providerReads=0
providerWrites=0
Auth/password/membership writes=0
Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

## 8. Siguiente bloque exacto

```text
LIVE HR PROVIDER METADATA/AUTODISCOVERY ROOT FIX
→ confirmar agosto GT/HN desde HR viva
→ probar cambio histórico desde HR viva
→ confirmar sourceRevision transversal
→ preparar repair Auth con plan de identidad HOLD=0
→ autorización separada para writes/deploy/cutover
```
