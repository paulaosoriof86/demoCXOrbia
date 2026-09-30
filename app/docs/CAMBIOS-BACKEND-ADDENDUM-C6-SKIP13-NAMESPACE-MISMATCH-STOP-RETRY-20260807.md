# CAMBIOS BACKEND — C6 SKIP13 namespace mismatch STOP_RETRY

## Ejecutado

- Se consumió una única autorización SKIP13 read-only mediante `backend/contracts/c6-skip13-auth-access-adjudication-v1.json` y el workflow source-safe existente.
- Request commit: `313597f561315ff9f8c75c5a7be741a8cbac5d70`.
- Run/job: `31188368926` / `92898589212`.
- Artifact: `8997714548`, digest `sha256:9dd0cee0aa205071fa82afb22f69d0cdf29b54d9d8d4b2f6462c58c22fd1e30d`.
- Terminal: `HOLD_C6_SKIP13_ADJUDICATION_TECHNICAL_ERROR` por `all_skip13_profile_ids_resolved:0`.

## Lecturas

```text
shopperIdIndexBaseline=340
profileIdIndexQueries=1
authListPages=0
membershipPointReads=0
membershipFieldQueries=0
hrReads=0
```

No se alcanzaron Auth, claims ni memberships. Writes: 0.

## Causa raíz

Los fingerprints SKIP13 son `profileFp` del plan: `fp('deterministic-suffix-plan-profile', profile.id)`. El adjudicador intentó resolverlos con `stableMemberFingerprint(profileId)` / `shopper-collision-member-v1`. Es un cruce de namespaces semánticamente distintos.

El contrato no declara explícitamente `profileFingerprintNamespace`, lo que permitió el defecto.

## Fail-close

Request consumido/deshabilitado en `3966dac8a42404f35245c474f975f696c9cb9f0e`; `allowedExecutions=0`; cero segundo provider attempt. El run posterior `31188638266` saltó provider por request no ejecutable.

## Bloque siguiente

Root-fix source-only del namespace + contrato + self-test cross-namespace. Ninguna nueva lectura provider antes de ese PASS.

## Clasificación

- Reusable CXOrbia: namespace contracts.
- Exclusivo TyA: SKIP13.
- Claude/prototipo: sin cambios.
- Academia: trazabilidad criptográfica.
- Sin impacto Claude: UI preservada.
