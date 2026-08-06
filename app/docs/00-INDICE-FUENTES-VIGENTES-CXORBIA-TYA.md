# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `C6_DIAGNOSTIC_V2_PROVIDER_HOLD__12_SURNAME_ZERO_EVIDENCE__1_MULTI_AUTH_EXACT_TIE__GROUP_SET_PLUS1__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-SHOPPER-DIAGNOSTIC-CONTRACT-V2-PROVIDER-REVALIDATION-HOLD-LATEST.json`;
3. `app/docs/SOURCE-LOCK-C6-DIAGNOSTIC-CONTRACT-V2-PROVIDER-REVALIDATION-20260805.md`;
4. `backend/config/corte6-shopper-deterministic-suffix-readonly-request.json` — consumido STOP_RETRY;
5. `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-DIAGNOSTIC-V2-PROVIDER-HOLD-20260805.md`;
6. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-DIAGNOSTIC-V2-PROVIDER-HOLD-20260805.md`;
7. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-DIAGNOSTIC-V2-PROVIDER-HOLD-20260805.md`;
8. `app/docs/ACADEMIA-IMPACTO-C6-DIAGNOSTIC-V2-PROVIDER-HOLD-20260805.md`;
9. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-DIAGNOSTIC-V2-PROVIDER-HOLD-20260805.md`;
10. `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
11. `tools/qa/cxorbia-c6-shopper-login-collision-classification.mjs`;
12. `backend/contracts/c6-shopper-deterministic-suffix-v1.json` — schema `v2`;
13. `app/docs/evidence/CORTE6-SHOPPER-DIAGNOSTIC-CONTRACT-ROOTFIX-SOURCE-STATIC-PASS-LATEST.json`;
14. `app/docs/DIAGNOSTICO-RAIZ-C6-RESIDUAL-IDENTITY-SOURCE-ONLY-20260805.md`;
15. `app/docs/evidence/CORTE6-SHOPPER-DETERMINISTIC-SUFFIX-PROVIDER-REVALIDATION-HOLD-LATEST.json` — histórico anterior;
16. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
17. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
18. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
19. `AGENTS.md`;
20. PR #7 y HEAD vivo.

## 2. Contrato y resultado provider

```text
crosswalk=101/8 PASS
preConsensus=83
completedByConsensus=71
remaining=12
metricIdentityValid=true
referenceGroups=64
currentGroups=65
setDelta=+1/-0
multiAuth=1 exact tie
planRows=340 unique
HOLD=13
```

## 3. Clasificación residual

- 12 perfiles: primer nombre y semilla completos; apellido con cero candidatos y cero bases permitidas;
- multi-Auth: dos candidatos, score `5016/5016`, margen `0`, señales idénticas;
- grupo añadido `ebbcc231fcf415cbaf77`: dos activos, un keeper, un sufijo 4; procedencia de miembros no exportada y diferencia sin explicación suficiente.

## 4. Plan vigente

```text
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=13
PRESERVE_NO_AUTH=127
readyForAuthRepair=false
partialExecutionAllowed=false
```

## 5. Estado seguro

```text
REQUEST_CONSUMED=true
PROVIDER_TRIGGER_FROZEN=true
PROVIDER_REVALIDATION_EXECUTIONS=1
SECOND_ATTEMPT=0
AUTH/PASSWORD/MEMBERSHIP/FIRESTORE/RULES/STORAGE/HR_WRITES=0
HOSTING/CLOUD_RUN_DEPLOYS=0
MAKE/GEMINI/PAYMENTS=0
MERGE=false
PRODUCTION=false
```

## 6. Carril operativo vigente

```text
SOURCE-ONLY GROUP PROVENANCE + RESIDUAL IDENTITY CLASSIFICATION
→ artifacts source-safe del run 31069282511
→ clasificar grupo añadido
→ diseñar vector mínimo pre/post consenso
→ clasificar salida no operativa de 12 apellidos y multi-Auth
→ STOP antes de provider read, repair o deploy
```

## 7. Prohibiciones

- reactivar el request o ejecutar segundo intento;
- nueva consulta provider sin autorización;
- inferir apellidos o elegir Auth por orden/antigüedad;
- aplicar parcialmente el plan 340;
- escribir Auth, datos, HR, reglas o storage;
- deploy, Make, Gemini, pagos, merge o producción.
