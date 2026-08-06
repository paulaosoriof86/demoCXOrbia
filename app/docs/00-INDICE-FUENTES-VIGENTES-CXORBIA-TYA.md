# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `C6_CROSSWALK_PARITY_PASS__PROVIDER_REVALIDATION_HOLD_12_SURNAME_1_MULTI_AUTH_65_142__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-SHOPPER-DETERMINISTIC-SUFFIX-PROVIDER-REVALIDATION-HOLD-LATEST.json`;
3. `app/docs/SOURCE-LOCK-C6-DETERMINISTIC-SUFFIX-PROVIDER-REVALIDATION-HOLD-20260805.md`;
4. `backend/config/corte6-shopper-deterministic-suffix-readonly-request.json`;
5. `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
6. `.github/workflows/cxorbia-c6-shopper-deterministic-suffix-readonly.yml` — trigger congelado después del one-shot;
7. `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-PROVIDER-REVALIDATION-HOLD-20260805.md`;
8. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-PROVIDER-REVALIDATION-HOLD-20260805.md`;
9. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-PROVIDER-REVALIDATION-HOLD-20260805.md`;
10. `app/docs/ACADEMIA-IMPACTO-C6-PROVIDER-REVALIDATION-HOLD-20260805.md`;
11. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-PROVIDER-REVALIDATION-HOLD-20260805.md`;
12. `app/docs/evidence/CORTE6-SHOPPER-DETERMINISTIC-SUFFIX-CROSSWALK-ROOTFIX-SOURCE-STATIC-PASS-LATEST.json` — root fix source/static;
13. `app/docs/SOURCE-LOCK-C6-DETERMINISTIC-SUFFIX-CROSSWALK-ROOTFIX-20260805.md`;
14. `backend/contracts/c6-shopper-deterministic-suffix-v1.json`;
15. `app/docs/evidence/CORTE6-SHOPPER-DETERMINISTIC-SUFFIX-READONLY-HOLD-LATEST.json` — provider pre-rootfix, histórico supersedido;
16. `app/docs/evidence/CORTE6-SHOPPER-LOGIN-COLLISION-CLASSIFICATION-HOLD-LATEST.json` — referencia anterior 64/141;
17. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
18. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
19. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
20. `app/docs/DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
21. `AGENTS.md`;
22. PR #7 y HEAD vivo.

## 2. Contrato vigente

```text
Login normal Shopper: nombre.apellido
Excepción autorizada solo ante colisión activa: nombre.apellido.<sufijo técnico no PII>
Sufijo: sha256(tenantId + NUL + shopperId), 4/6/8
Contraseña: Nombre123*
Namespace: shopper
Membership required: false
Authority: Firebase Auth + exact claims + exact shopperId profile
```

La política no fue materializada.

## 3. Ejecución vigente

```text
run=31066410847
job=92504941089
artifact=8953983093
artifactDigest=sha256:ba9a559832ee2d8003ae798ae8a40cbe7e6b7582587d32053c55f16af50b134a
sourceStatic=PASS_C6_DETERMINISTIC_SUFFIX_SOURCE_STATIC
provider=HOLD_C6_DETERMINISTIC_SUFFIX_PLAN_STOP_RETRY
```

## 4. Resultado congelado

```text
crosswalk=101 mapped / 8 unmapped
crosswalkParity=true
remaining active source-safe surname holds=12
collision groups=65
active identities=142
multi-Auth unresolved=1
plan rows=340
plan HOLD rows=13
readyForAuthRepair=false
```

El drift de crosswalk queda cerrado. El baseline de colisiones aún no queda congelado porque `65/142` difiere de `64/141` y requiere clasificación source-only.

## 5. Estado seguro

```text
REQUEST_CONSUMED=true
PROVIDER_EXECUTIONS=1
PROVIDER_SECOND_ATTEMPT=0
PROVIDER_WRITES=0
AUTH/PASSWORD/MEMBERSHIP/FIRESTORE/RULES/STORAGE/HR_WRITES=0
HOSTING/CLOUD_RUN_DEPLOYS=0
MAKE/GEMINI/PAYMENTS=0
MERGE=false
PRODUCTION=false
```

## 6. Carril operativo vigente

```text
SOURCE-ONLY RESIDUAL IDENTITY ROOT-CAUSE CLASSIFICATION
→ 12 technical_surname_unresolved fingerprints
→ 1 multi_auth_tie_residual fingerprint
→ reconcile 65/142 versus 64/141
→ no provider reads
→ no writes or deploy
```

## 7. Prohibiciones vigentes

- reejecutar el provider request consumido;
- aplicar parcialmente las 327 filas sin HOLD;
- tratar `65/142` o `64/141` como baseline final antes de reconciliar;
- inferir apellido por posición visual única;
- crear o modificar Auth, claims, email o contraseña;
- escribir memberships, Firestore, Rules, Storage o HR;
- desplegar Hosting o Cloud Run;
- crear rama o PR nuevos;
- Make, Gemini, pagos, merge o producción.
