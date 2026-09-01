# CAMBIOS-BACKEND — ADDENDUM C6 AUTH DIGEST PASS + PHASE2 SYSTEMIC UPDATE RISK

**Fecha:** 2026-08-07

## Clasificación

- Reusable CXOrbia: principal uniqueness global; target-specific Auth resolution; batch revalidation contract; rollback saltless exact semantics.
- Exclusivo cliente: fingerprints y población TyA/Cinépolis.
- Claude/prototipo: sin cambios frontend.
- Academia: trazabilidad del defecto y gate antibucles.
- Sin impacto Claude: ejecución Auth DEV bloqueada antes del write boundary.

## Cambios source

- `tools/qa/cxorbia-c6-auth-principal-uniqueness-rootfix-source-only.mjs`: canonicalización de `rootCauseReclassification` a `TARGET_SPECIFIC_EXISTING_AUTH_CANDIDATE_COUNT_0_AFTER_LINEAGE_PASS` y self-test correspondiente.
- `backend/config/c6-shopper-auth-final-freeze-v3.json`: alineación de `transform.basis` con la anotación canónica; digest esperado permanece `7b92fa...749`.
- workflows one-shot source-only v1/v2 y phase2: creados para el bloque y retirados al cerrar cada carril.
- requests source-only v1/v2 y phase2: consumidos/deshabilitados.
- evidencia sistémica: `app/docs/evidence/C6-AUTH-ACTIVATION-V2-PREWRITE-SYSTEMIC-SUFFIX-COLLISION-RISK-20260807.json`.
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-DIGEST-PASS-PHASE2-PREWRITE-SYSTEMIC-UPDATE-RISK-STOP-RETRY-20260807.md`.

## Ejecuciones

### Source harness v1

`31234567894 / 93044626041` — fallo antes de materialización por `firebase-admin` ausente para el self-test del activation tool. ProviderReads=0; writes=0. No se ocultó ni reutilizó el request.

### Source phase v2 PASS

`31234681163 / 93044913507 / artifact 9014970238 / sha256:3a91b606...7395`.

Plan canónico v3:

```text
340 unique
CREATE 82
UPDATE 45
NO_OP 81
HOLD 0
PRESERVE 132
email 38
password 13
claims 37
expectedAuth 110 -> 192
digest 7b92fa73946e74ec4058bcdcbcfca25fe90e0504db6b6b22e797fbad066bd749
```

### Phase2 PREWRITE STOP

`31234830218 / 93045302944 / artifact 9015012896 / sha256:a282b089...d68f`.

```text
decision=STOP_RETRY_C6_AUTH_ACTIVATION_DEV_V2_PREWRITE
blocker=UPDATE_AUTH_AUTH_CANDIDATE_DRIFT:19f2a621b1b350db911b:0
prewritePass=false
writeBoundaryEntered=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWriteCalls=0
```

## Causa sistémica adicional

La revisión source-only posterior al STOP encontró 36 `UPDATE_AUTH` actuales dentro del mismo patrón estructural de miembro suffixado + peer no suffixado con `baseLogin` compartido. 32 peers son `NO_OP` y 4 son `UPDATE_AUTH`. No se afirma que los 36 carezcan de Auth propio; se clasifica que una estrategia fila por fila sería insegura y propensa a bucle.

## Seguridad

Cero Auth/Firestore/HR/Rules/Storage writes, cero deploy, cero merge y cero producción. El único provider attempt del phase2 terminó antes del write boundary. No hubo segundo provider attempt.
