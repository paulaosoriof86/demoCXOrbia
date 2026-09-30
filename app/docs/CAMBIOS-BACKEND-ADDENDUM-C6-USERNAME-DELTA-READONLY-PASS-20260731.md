# CAMBIOS-BACKEND — Corte 6 · username exacto desde handoff cifrado

**Fecha:** 2026-07-31  
**Estado:** `C6_USERNAME_DELTA_READONLY_PASS__88_EXACT_FILL_MISSING__NO_WRITE__NO_PRODUCTION`

## Gate ejecutado
Se reutilizó el mismo bundle cifrado que ya produjo el import Auth91/91. El contenido se descifró únicamente en memoria dentro del runner autorizado; la evidencia persistida no contiene usernames, hashes, passwords ni IDs personales.

Decisión: `READY_USERNAME_FILL_MISSING_EXACT_FOR_SEPARATE_FIRESTORE_AUTHORIZATION`.

## Resultado exacto
- registros shopper en bundle seguro: **109**;
- match canónico exacto por `legacyShopperId`: **88**;
- binding exacto Auth claim `shopperId` → perfil Firestore: **88/88**;
- perfiles con username ya presente: **0**;
- delta `fill missing username` exacto: **88**;
- conflictos de username existente: **0**;
- Auth users faltantes entre los 88: **0**;
- claim mismatch entre los 88: **0**;
- 21 registros del bundle sin perfil canónico exacto: **HOLD**, no se autovinculan.

## Password
Los 109 registros shopper del handoff aportan evidencia de hash, no contraseña legible. Firebase Auth tampoco permite recuperar el plaintext actual.

Por tanto:
- no se escribe `password/pass` en Firestore;
- no se inventa `Nombre123*` como valor vigente;
- la regla histórica puede usarse para reset controlado o para comprobar un patrón si existe una prueba criptográfica exacta, siempre bajo gate Auth separado.

## Seguridad
- Firestore writes0;
- Auth writes/password changes0;
- legacy/HR writes0;
- deploys0;
- PII0 / username values0 / password values0 / hashes0 en evidencia;
- producción=false; merge=false.

## Siguiente decisión de datos
El username de esos **88 perfiles** ya puede materializarse con un write plan idempotente `fill-missing-only`, pero **no se ejecuta sin autorización Firestore específica**.

Los teléfonos/email ya existentes se resolverán por el runtime protegido sin write. Los campos adicionales de la plataforma vigente que aún no están en Firestore (documento, banco/pago, otros datos aportados por shopper) requieren reconciliación segura del export vigente antes de formar su delta.
