# CAMBIOS-BACKEND — ADDENDUM C6 AUTH DUPLICATE KEEPER ONE-READ STOP

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_DUPLICATE_KEEPER_ONE_READ_STOP_4_ANCHOR_AMBIGUITIES__FD891_POLICY_CLOSED__AUTH_DEV_228_PRESERVED__NO_SECOND_READ__ZERO_WRITES__NO_PRODUCTION`

## Qué se hizo

- Se preservó Auth DEV=228 y el digest v4 `c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4`.
- Se restauró el adjudicador focal para exactamente cinco grupos/diez fingerprints.
- Se corrigió exclusivamente el falso positivo temporal del source gate.
- Pasaron `node --check`, self-test, frozen-universe, lineage, zero-writes y zero-PII.
- Solo después del PASS source-only se emitió un request one-shot nuevo y se realizó una sola lectura provider.
- El resultado fue STOP_RETRY: cuatro grupos de acceso siguen sin keeper único; `fd891...` cerró política técnica sin acceso TyA efectivo.
- Se consumió/deshabilitó el request y se retiraron los workflows temporales.

## Archivos

```text
CREATED tools/qa/cxorbia-c6-auth-duplicate-keeper-targetscope-adjudication-readonly-v1.mjs
  commit=ed7ba0d61dc2c52594bfdbf6361ed5c3e141d300

CREATED_THEN_REMOVED .github/workflows/cxorbia-c6-auth-duplicate-keeper-targetscope-source-gate-rootfix-v2.yml
  create=72478e582dd917f287f16d6447b3b5f14b8ad26f
  remove=220067139b3b1540f53a0c38429d56093b832d85

CREATED_THEN_REMOVED .github/workflows/cxorbia-c6-auth-duplicate-keeper-targetscope-one-read-focal-v2.yml
  create=dd84d2f9bc0eb9fe2689237ec7e24d9f508334a0
  remove=3c22b00e54191b0a032f4808b20a1fec81f592f1

CREATED_AND_CONSUMED backend/config/c6-auth-duplicate-keeper-targetscope-one-read-request-v2.json
  create=f186b5a440b8c3db5fd2c747daeb7a37c6e0901b
  consume=0320dfee318fd52aa4cc3b5eb78bb5b71336dc3c

CREATED app/docs/evidence/C6-AUTH-DUPLICATE-KEEPER-ONE-READ-FOCAL-STOP-RETRY-20260810.json
CREATED app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-KEEPER-ONE-READ-FOCAL-STOP-RETRY-20260810.md
```

## Evidencia técnica

```text
sourceGateRunId=31441607796
sourceGateJobId=93627306098
sourceGate=PASS_C6_AUTH_DUPLICATE_KEEPER_TARGET_SCOPE_SOURCE_ROOTFIX_ZERO_WRITES_ONE_READ_NO_PII
providerRunId=31441779926
providerJobId=93627815703
artifactId=9083100724
artifactDigest=sha256:8c3a2026027e678deb1aa0dfc828c45cdf1a251b9cee1617eaa9feb10c82eba2
providerReads=1
secondProviderRead=false
resolvedAccessGroups=0
ambiguousAccessGroups=4
blockedPolicyClosed=1
errorCode=KEEPER_ANCHOR_INSUFFICIENT_4
```

## Impacto Phase A

Corte 6 Auth/RBAC avanza porque el problema se redujo: ya no hay defecto de harness pendiente y `fd891...` quedó técnicamente cerrado para TyA. Quedan cuatro duplicados con acceso potencial que no pueden repararse sin keeper reproducible.

## Seguridad

Cero Auth/IAM/Firestore/HR/Rules/Storage writes, cero PREWRITE/Activation/smoke, cero Make/Gemini/pagos/deploy/merge/producción. No se exportaron UID, email, shopperId, nombres, claims crudos ni credenciales.

## Clasificación

- **Reusable CXOrbia:** keeper fail-close cuando los discriminadores técnicos autorizados son equivalentes/no únicos.
- **Exclusivo cliente:** cinco pares TyA; cuatro pendientes y política `fd891...` cerrada.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** incorporar troubleshooting de keeper proof vs acceso efectivo.
- **Sin impacto Claude:** read-only Auth + gates + docs.
