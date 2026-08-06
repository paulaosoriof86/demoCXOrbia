# SOURCE LOCK — C6 provider read-only revalidation · diagnostic contract v2

**Fecha:** 2026-08-05  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**HEAD de entrada:** `3b8047358143adf2d03beb482fe3a68b7eed1e7b`  
**Source contract commit:** `ceb5646400c61631eb2d8d469343360647c45f65`

## Alcance autorizado

Una única ejecución provider read-only para:

1. validar crosswalk `101 mapped / 8 unmapped`;
2. calcular `preConsensusIncompleteActiveProfiles`, `completedByConsensus` y `remainingIncompleteActiveProfiles`;
3. comprobar `pre = completed + remaining`;
4. generar vectores source-safe por HOLD;
5. generar vector y margen multi-Auth sin UID, correo ni PII;
6. reconciliar los grupos mediante `shopper-visible-login-group-v1` y conjuntos de fingerprints;
7. regenerar exactamente 340 filas no superpuestas.

## Reconciliación de conjuntos

En la misma ejecución se genera una referencia read-only con el clasificador estable vigente y el namespace compartido. La comparación usa únicamente fingerprints de grupos con `verifiedLoginAgreement=true` y `activeCount>1`. El planner recibe esa referencia de forma efímera; no se escribe identidad cruda al repo.

## STOP_RETRY

Cualquier HOLD, drift 101/8, identidad métrica inválida, diferencia de conjuntos, empate multi-Auth, colisión de sufijo o login objetivo produce `STOP_RETRY`. No se autoriza segundo intento.

## Seguridad

```text
providerWrites=0
Auth/password/membership/Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
raw names/logins/emails/passwords/uids exported=false
```

El bloque termina después de publicar artifacts source-safe, consumir el request, congelar el trigger y documentar el resultado. No autoriza repair ni aplicación parcial.
