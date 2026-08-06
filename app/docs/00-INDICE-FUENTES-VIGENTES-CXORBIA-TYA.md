# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO  
**Estado vivo:** `C6_EQUIVALENT_UNIVERSE_PROVIDER_V22_HOLD__65_65_EXACT_MATCH__12_SURNAME__1_MULTI_AUTH_TIE__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-SHOPPER-EQUIVALENT-UNIVERSE-PROVIDER-V22-HOLD-LATEST.json`;
3. `app/docs/SOURCE-LOCK-C6-EQUIVALENT-UNIVERSE-PROVIDER-READONLY-V22-20260806.md`;
4. `backend/config/corte6-shopper-equivalent-universe-provider-readonly-v22-request.json` — consumido HOLD/STOP_RETRY;
5. `backend/contracts/c6-shopper-deterministic-suffix-v1.json` — schema `v2.2`;
6. `tools/qa/cxorbia-c6-shopper-equivalent-universe.mjs`;
7. `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
8. `tools/qa/cxorbia-c6-shopper-login-collision-classification.mjs`;
9. `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-EQUIVALENT-UNIVERSE-PROVIDER-V22-HOLD-20260806.md`;
10. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-EQUIVALENT-UNIVERSE-PROVIDER-V22-HOLD-20260806.md`;
11. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-EQUIVALENT-UNIVERSE-PROVIDER-V22-HOLD-20260806.md`;
12. `app/docs/ACADEMIA-IMPACTO-C6-EQUIVALENT-UNIVERSE-PROVIDER-V22-HOLD-20260806.md`;
13. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-EQUIVALENT-UNIVERSE-PROVIDER-V22-HOLD-20260806.md`;
14. `app/docs/evidence/CORTE6-SHOPPER-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-LATEST.json` — integración source/static previa;
15. `app/docs/evidence/CORTE6-SHOPPER-DIAGNOSTIC-CONTRACT-V2-PROVIDER-REVALIDATION-HOLD-LATEST.json` — snapshot provider anterior;
16. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
17. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
18. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
19. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Ejecución provider vigente

```text
run=31104541809
job=92626188022
artifact=8968941587
artifactDigest=sha256:02e36c355b3f2d1c9d1e6f1be7fece93259251ddb0f981cdaac35f2262fcb264
requestCommit=9d26344f55809d95023a33aeb3111802adb15d26
sourceCommit=8fe5ad6dd185cce5ea3cdac06892f3144e8e5f0f
providerExecutionCount=1
secondAttempt=0
```

## 3. Resultado equivalente

```text
profiles=340
crosswalk=101/8 parity=true
metric=83=71+12 valid=true
referenceGroups=65
plannerGroups=65
added=0
removed=0
unchanged=65
exactMatch=true
```

El antiguo fingerprint añadido `ebbcc231fcf415cbaf77` está presente en referencia y planner. Queda cerrado como grupo equivalente normal, no como drift ni defecto de sufijo.

## 4. Residuales

```text
12 surnames=AUTHORITATIVE_SURNAME_SOURCE_ENRICHMENT_REQUIRED
1 multiAuth=SOURCE_SAFE_ACCOUNT_ADJUDICATION_REQUIRED
candidate fingerprints=9b2b7ca1bd72c1301d29 / 4e6d26551d11db444bd0
automatic inference/selection=false
```

## 5. Plan vigente

```text
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=13
PRESERVE_NO_AUTH=127
rows=340 unique
planDigest=acc93da842d1a5d3244327680f88539f0651cb101bae09dd231fd8b5008bea92
readyForAuthRepair=false
executable=false
partialExecutionAllowed=false
```

## 6. Falso positivo conocido

`hold_diagnostics_invalid` es un falso positivo del export validator: confundió la clave contractual `diagnostics.name` con identidad cruda. No hubo PII y no cambia el HOLD real. No autoriza rerun provider.

## 7. Estado seguro

```text
REQUEST_CONSUMED=true
PROVIDER_TRIGGER_FROZEN=true
PROVIDER_READS=1
PROVIDER_WRITES=0
AUTH/PASSWORD/MEMBERSHIP/FIRESTORE/RULES/STORAGE/HR_WRITES=0
HOSTING/CLOUD_RUN_DEPLOYS=0
MAKE/GEMINI/PAYMENTS=0
MERGE=false
PRODUCTION=false
```

## 8. Carril operativo vigente

No existe autorización residual. Siguiente bloque permitido solo con autorización expresa:

```text
NON-OPERATIONAL TENANT EVIDENCE/ADJUDICATION PREPARATION
→ 12 apellidos por profile fingerprints
→ 2 candidatos multi-Auth por candidate fingerprints
→ corregir source-only el falso positivo del validador sin provider rerun
→ cero selección, aplicación, writes o deploy
```

## 9. Prohibiciones

- nuevo provider read o segundo intento;
- inferir apellidos o seleccionar Auth automáticamente;
- aplicar parcialmente el plan 340;
- Auth/data/HR writes, deploy, Make, Gemini, pagos, merge o producción.
