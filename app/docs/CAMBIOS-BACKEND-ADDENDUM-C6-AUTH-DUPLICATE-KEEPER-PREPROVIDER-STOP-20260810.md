# CAMBIOS-BACKEND — ADDENDUM C6 DUPLICATE KEEPER PRE-PROVIDER STOP

**Fecha:** 2026-08-10  
**Estado:** `STOP_RETRY_PRE_PROVIDER_SOURCE_GATE_FALSE_POSITIVE`

## Cambios realizados

- Se revisó el HEAD canónico, índice, checkpoint, source lock y PR #7 antes de actuar.
- Se inspeccionaron source-safe las evidencias históricas de Cliente, normalización de claims, import de credenciales staff y continuidad Auth.
- Se preparó transitoriamente un adjudicador focal para exactamente 5 grupos/10 candidate fingerprints, con máximo una llamada `listUsers(1000)`, cero PII y cero writes.
- Se preparó un source gate transitorio.
- Antes de emitir cualquier request provider se detectó que el gate comparaba de forma demasiado amplia los literales `creationTime`/`lastSignInTime` y por ello chocaba con los flags negativos de seguridad `creationTimeUsed:false` y `lastSignInTimeUsed:false`.
- Se aplicó `STOP_RETRY` y se retiraron herramienta y workflow transitorios.
- No se creó request provider ni workflow provider.

## Archivos creados y retirados

```text
CREATED_THEN_REMOVED tools/qa/cxorbia-c6-auth-duplicate-keeper-targetscope-adjudication-readonly-v1.mjs
  create=57e610901e524cf4e551bea031b9aba9c0634b6c
  remove=0850e078d8d9e6eea47eb2ac096b79c22a3b61f4

CREATED_THEN_REMOVED .github/workflows/cxorbia-c6-auth-duplicate-keeper-targetscope-source-gate-v1.yml
  create=b6e562fa548bb69bf11d1638f5f1dd48315fc318
  remove=b4c2840759b8fe8258ec7d8d071afbc0ae647803
```

## Seguridad

```text
providerReads=0
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreReads/Writes=0/0
HRReads/Writes=0/0
PREWRITE=false
Activation=false
newSmoke=false
deploys=0
merge=false
production=false
```

## Clasificación

- **Reusable CXOrbia:** corregir gates para distinguir selectores temporales reales de flags negativos de seguridad.
- **Exclusivo cliente:** los cinco pares TyA siguen pendientes.
- **Claude/prototipo:** sin cambio frontend.
- **Academia:** evidencia de fail-close pre-provider.
- **Sin impacto Claude:** no hubo provider ni deploy.
