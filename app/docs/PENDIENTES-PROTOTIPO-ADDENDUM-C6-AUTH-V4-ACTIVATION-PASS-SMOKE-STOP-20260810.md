# PENDIENTES PROTOTIPO — ADDENDUM C6 AUTH V4 ACTIVATION PASS + SMOKE STOP

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_V4_ACTIVATED_DEV__READBACK_ROLLBACK_DRYRUN_PASS__SMOKE_STOP_CREDENTIAL_LIFECYCLE__NO_PRODUCTION`

## Cerrado y no reabrir

- freeze Auth v4: 340 filas, HOLD=0, digest `c0c31f...`;
- SKIP13 13/13;
- multi-Auth y duplicate pair adjudicado;
- lineage `ac93...`;
- response path `Config.signIn.hashConfig`;
- permiso `firebaseauth.configs.getHashConfig` de la identidad exacta;
- PREWRITE v4;
- snapshot cifrado roundtrip con 8 entradas de password;
- Activation Auth DEV;
- readback Auth=228;
- rollback dry-run.

## P0 técnico vivo del bloque

No hay P0 demostrado en Auth ni frontend. Existe un pendiente técnico de validación:

```text
POSTWRITE_SMOKE_HARNESS_CREDENTIAL_PATH_MISSING
```

El smoke multirol falló con `ENOENT` antes de su primera lectura Auth porque intentó usar el archivo de credencial temporal después de que el ejecutor lo había limpiado.

No inferir fallo de Admin/Operaciones, Shopper o Cliente a partir de este error.

## Pendiente exacto

1. corregir source-only el lifecycle de credencial del smoke;
2. gate offline de sintaxis/zero writes;
3. un único smoke acumulativo read-only sobre Auth DEV actual=228;
4. validar Admin/Operaciones, Shopper y Cliente;
5. confirmar claims, scopes, tenant/project isolation y cero PII;
6. después continuar la cadena de validación humana/cutover según Phase A.

## Prohibido

- reejecutar PREWRITE;
- reejecutar Activation Auth DEV;
- reconstruir las 340 identidades;
- reabrir SKIP13/multi-Auth/plan v3;
- crear nuevo Firebase;
- modificar frontend para esconder el pendiente;
- merge o producción sin autorización específica.

## P1/P2

Los pendientes visuales/documentales no bloqueantes existentes siguen acumulados y no sustituyen el cierre del smoke multirol.

## Estado seguro

```text
AuthExecuted=true
AuthUsersAfter=228
secondProviderAttempt=false
requestV3=consumed/disabled
latentWorkflow=false
realRollbackExecuted=false
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
Make=0
Gemini=0
payments=0
merge=false
production=false
```
