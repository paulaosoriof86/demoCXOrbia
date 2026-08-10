# CAMBIOS-BACKEND — C6 AUTH DUPLICATE HUMAN OWNERSHIP DECISION CAPTURE

**Fecha:** 2026-08-10  
**Estado:** `PAULA_MINIMUM_OWNERSHIP_DECISION_REQUIRED`

## Hecho

- Se verificaron índice, checkpoint, source lock, evidencia vigente y PR #7/HEAD antes del bloque.
- Se mantuvo el universo en cuatro grupos/ocho fingerprints.
- Se construyó una matriz humana mínima source-safe con las disposiciones `KEEP_ONE_MEMBER`, `RETIRE_BOTH_IF_CANONICAL_EXTERNAL_EXISTS`, `PRESERVE_BOTH_PENDING_OWNER_MAPPING` y la variante Cliente `CANONICAL_EXTERNAL_KEEP_HISTORICAL_PAIR_NONCANONICAL_PENDING_RETIRE`.
- Para A–C se documentó que cualquier `KEEP_ONE_MEMBER` exige selección humana del fingerprint y que `RETIRE_BOTH_IF_CANONICAL_EXTERNAL_EXISTS` exige confirmación humana del principal canónico externo correspondiente.
- Para `ae2f...` se documentó que el Cliente canónico externo ya está validado y que puede aprobarse como único canónico, dejando ambos históricos como no canónicos pendientes de repair posterior.
- No se infirió keeper ni se ejecutó disposición.
- Source lock finalizado en commit `93e6b25fd05d0ecad5565e531e8840a4c382db02`.

## Archivos creados

- `app/docs/C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-MATRIX-20260810.md`;
- `app/docs/evidence/C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-MATRIX-20260810.json`;
- `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-CAPTURE-PENDING-PAULA-20260810.md`;
- este addendum;
- addenda de Claude, pendientes, Academia y tracker Phase A.

## Incidente de herramienta sin mutación

Una llamada posterior `update_file` contra el source lock utilizó por error el blob SHA del source lock anterior. GitHub devolvió HTTP 409 antes de cualquier commit. El source lock nuevo fue verificado después con `fetch_file` y finalizado correctamente. No hubo impacto en provider, Auth, datos, runtime, deploy ni producción.

## Seguridad

```text
providerReads=0
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreReads/Writes=0/0
HRReads/Writes=0/0
RulesWrites=0
StorageWrites=0
PREWRITE=false
Activation=false
newSmoke=false
Make=0
Gemini=0
payments=0
deploys=0
merge=false
production=false
rawPIIExported=false
```

## Clasificación

- **Reusable CXOrbia:** matriz de decisión humana de ownership/disposition.
- **Exclusivo cliente:** cuatro grupos históricos TyA.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** patrón de gobierno de identidades históricas y canónicas.
- **Sin impacto Claude:** evidencia/source lock/docs internas.
