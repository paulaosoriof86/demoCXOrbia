# SOURCE LOCK — C6 ACCUMULATIVE MULTIROLE SMOKE READ-ONLY · IDENTITY/SCOPE STOP_RETRY

**Fecha:** 2026-08-10  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `C6_SMOKE_READONLY_STOP_IDENTITY_SCOPE_FINDINGS__AUTH_DEV_228_PRESERVED__ZERO_WRITES__NO_SECOND_SMOKE__NO_PRODUCTION`

## 1. Baseline que NO se reabre

Auth DEV ya estaba materializado y validado antes de este bloque:

```text
AuthExecuted=true
AuthUsersAfter=228
PlanV4Digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
Prewrite=PASS
Readback=PASS
RollbackDryRun=PASS
RealRollbackExecuted=false
```

Este bloque no reejecutó PREWRITE ni Activation y produjo `AuthWrites=0`.

## 2. Rootfix del lifecycle de credencial — PASS source-only

Se creó un smoke dedicado que no reutiliza el archivo privado eliminado por la Activation anterior. El workflow carga una credencial DEV efímera nueva exclusivamente para el smoke y la elimina al terminar.

Gate previo:

```text
sourceGateCommit=51dd4fb37a45caaf949392418dbbbc58a8823ac0
sourceGateRunId=31424489260
decision=PASS_C6_SMOKE_READONLY_CREDENTIAL_LIFECYCLE_SOURCE_ZERO_WRITES_NO_PII
```

Validó sintaxis, trigger request-only, cero tokens de write/redeploy/re-PREWRITE, freeze Auth=228, digest rector y ausencia de secretos/PII literales.

## 3. Único smoke provider autorizado

```text
requestId=c6-accumulative-multirole-smoke-readonly-20260810-01
requestCommit=b577d8fcefc57c6743cf2dd3689c51a22e691a5b
runId=31424532292
jobId=93572980396
artifactId=9076650610
artifactDigest=sha256:78844e2fd0a0ce6137543f14802a91522377926ab04bb4cb8ce5bd7789f0545c
providerSmokeAttempts=1
secondSmokeProviderAttempt=false
freshEphemeralCredentialLoaded=true
providerReads=1
```

La credencial efímera quedó disponible y el smoke sí alcanzó la lectura Auth; por tanto el defecto anterior `ENOENT` quedó cerrado.

## 4. Resultado terminal

```text
decision=STOP_RETRY_C6_ACCUMULATIVE_MULTIROLE_SMOKE_READONLY
errorCode=DUPLICATE_PROVIDER_EMAILS
errorFingerprint=ce53ab4ec34141e4e696e3c7
```

La lectura source-safe confirmó:

```text
AuthPopulation=228
Enabled=227
Disabled=1
DuplicateProviderEmailGroups=5
UnknownEnabledRoles=4
```

Superficies por rol observadas en la misma y única lectura:

```text
AdminOperaciones.enabled=11
AdminOperaciones.tenantAllowed=10
AdminOperaciones.namespaceCompatible=11

Shopper.enabled=209
Shopper.tenantAllowed=209
Shopper.projectScoped=209
Shopper.targetScoped=208
Shopper.shopperScopePresent=208
Shopper.namespaceCompatible=209
Shopper.duplicateShopperScopes=0

Cliente.enabled=3
Cliente.tenantAllowed=3
Cliente.projectScoped=3
Cliente.targetScoped=3
Cliente.namespaceCompatible=3
```

La matriz Phase A source-side obtuvo `20/20` superficies presentes.

## 5. Límite de interpretación

El gate se detuvo en `DUPLICATE_PROVIDER_EMAILS`. Las demás cifras son observaciones source-safe del mismo snapshot, no adjudicaciones individuales.

No está autorizado inferir todavía:

- cuáles son los cinco grupos de email duplicado;
- si corresponden a alias históricos, cuentas deshabilitadas, identidades técnicas o accesos activos distintos;
- cuáles son los cuatro roles habilitados fuera de la familia permitida;
- cuál es el único Admin/Operaciones fuera del scope tenant esperado;
- cuál es el único Shopper sin scope objetivo completo.

No se exportó email, UID, shopperId, claims crudos ni otra PII.

## 6. STOP_RETRY y fail-close

Se respetó el contrato ante el primer fallo lógico:

```text
secondSmokeProviderAttempt=false
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
deploys=0
merge=false
production=false
```

Se retiraron el workflow one-shot y el source-gate workflow. El request quedó `consumed=true`, `enabled=false`, `allowedExecutions=0`. No existe ejecución provider latente.

## 7. Diagnóstico de causa raíz actualizado

El bucle de lifecycle de credencial quedó resuelto. El bloqueo ya no es el harness ni HashConfig ni PREWRITE.

El primer hallazgo real del smoke runtime es un **conjunto de inconsistencias de identidad/scope en Auth DEV que requiere adjudicación read-only antes de cualquier corrección o nuevo smoke**.

No reabrir el universo de 340 perfiles ni reconstruir el plan completo. La adjudicación debe limitarse a los grupos/outliers ya detectados por este snapshot.

## 8. Siguiente bloque exacto

Solo bajo autorización nueva:

`C6 AUTH READ-ONLY SMOKE FINDINGS ADJUDICATION`

Debe usar un único read-only provider pass source-safe para adjudicar exclusivamente:

1. los 5 grupos de provider email duplicado;
2. los 4 usuarios habilitados con rol fuera de la familia permitida;
3. el 1 Admin/Operaciones sin tenant scope esperado;
4. el 1 Shopper sin scope objetivo/shopperId completo.

Debe correlacionar únicamente con los fingerprints/claims/lineage ya cerrados, sin exportar PII y sin reconstruir identidad. Clasificar cada caso entre esperado/histórico/técnico/no-acceso o defecto real de acceso. Cero writes. Solo después de cerrar esa adjudicación podrá decidirse si hace falta un repair focal o un nuevo smoke.

## 9. Clasificación

- **Reusable CXOrbia:** smoke read-only con credencial efímera independiente, source gate previo y salida source-safe.
- **Exclusivo cliente:** población Auth TyA/Cinépolis de 228 y outliers detectados.
- **Claude/prototipo:** 20/20 superficies source-side presentes; sin cambio frontend.
- **Academia:** diferenciar harness corregido de hallazgos reales runtime y mantener adjudicación por capas.
- **Sin impacto Claude:** no hubo deploy ni writes fuera de lectura Auth.

## 10. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados. Producción continúa intacta.
