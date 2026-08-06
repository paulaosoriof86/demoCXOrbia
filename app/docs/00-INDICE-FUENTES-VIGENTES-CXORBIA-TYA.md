# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `C6_DIAGNOSTIC_CONTRACT_ROOTFIX_SOURCE_STATIC_PASS__PROVIDER_REVALIDATION_NOT_AUTHORIZED__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-SHOPPER-DIAGNOSTIC-CONTRACT-ROOTFIX-SOURCE-STATIC-PASS-LATEST.json`;
3. `app/docs/SOURCE-LOCK-C6-DIAGNOSTIC-CONTRACT-ROOTFIX-SOURCE-ONLY-20260805.md`;
4. `backend/config/corte6-shopper-deterministic-suffix-readonly-request.json` — consumido;
5. `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
6. `tools/qa/cxorbia-c6-shopper-login-collision-classification.mjs`;
7. `backend/contracts/c6-shopper-deterministic-suffix-v1.json` — schema `v2`;
8. `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-DIAGNOSTIC-CONTRACT-ROOTFIX-SOURCE-STATIC-PASS-20260805.md`;
9. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-DIAGNOSTIC-CONTRACT-ROOTFIX-SOURCE-STATIC-PASS-20260805.md`;
10. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-DIAGNOSTIC-CONTRACT-ROOTFIX-SOURCE-STATIC-PASS-20260805.md`;
11. `app/docs/ACADEMIA-IMPACTO-C6-DIAGNOSTIC-CONTRACT-ROOTFIX-SOURCE-STATIC-PASS-20260805.md`;
12. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-DIAGNOSTIC-CONTRACT-ROOTFIX-SOURCE-STATIC-PASS-20260805.md`;
13. `app/docs/evidence/CORTE6-RESIDUAL-IDENTITY-ROOT-CAUSE-SOURCE-ONLY-LATEST.json`;
14. `app/docs/DIAGNOSTICO-RAIZ-C6-RESIDUAL-IDENTITY-SOURCE-ONLY-20260805.md`;
15. `app/docs/evidence/CORTE6-SHOPPER-DETERMINISTIC-SUFFIX-PROVIDER-REVALIDATION-HOLD-LATEST.json` — provider anterior, histórico provisional;
16. `app/docs/evidence/CORTE6-SHOPPER-LOGIN-COLLISION-CLASSIFICATION-HOLD-LATEST.json` — referencia histórica;
17. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
18. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
19. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
20. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Contrato Shopper preservado

```text
Login normal: nombre.apellido
Excepción solo ante colisión activa: nombre.apellido.<sufijo técnico no PII>
Sufijo: sha256(tenantId + NUL + shopperId), 4/6/8
Contraseña: Nombre123*
Namespace: shopper
Membership required: false
```

La política no fue materializada.

## 3. Contrato diagnóstico v2

```text
preConsensusIncompleteActiveProfiles
completedByConsensus
remainingIncompleteActiveProfiles
pre = completed + remaining
HOLD vectors = booleans/counts/bases only
multi-Auth vectors = ordinal/signals/score/margin, no UID/email/PII
group namespace = shopper-visible-login-group-v1
collision policy = fingerprint_set_membership_not_rigid_aggregate_equality
```

Los gates rígidos de `64` grupos y `83` incompletos fueron eliminados. El plan 340 y la política 4/6/8 se preservaron.

## 4. Ejecución vigente

```text
run=31068501624
job=92511329808
requestCommit=1de9606ef6d78fec7802913c96ee50bb1deba441
sourceCommit=ceb5646400c61631eb2d8d469343360647c45f65
workflowFreezeCommit=6f34e8955dea6e51b3d9f3d12ebeda50e5bfb5d9
providerReads=0
```

## 5. Estado seguro

```text
REQUEST_CONSUMED=true
SOURCE_ONLY_TRIGGER_FROZEN=true
PROVIDER_READS/WRITES=0
AUTH/PASSWORD/MEMBERSHIP/FIRESTORE/RULES/STORAGE/HR_WRITES=0
HOSTING/CLOUD_RUN_DEPLOYS=0
MAKE/GEMINI/PAYMENTS=0
MERGE=false
PRODUCTION=false
```

## 6. Carril operativo vigente

```text
NUEVA AUTORIZACIÓN PROVIDER READ-ONLY ONE-SHOT
→ validar 101/8
→ calcular pre/completed/remaining
→ generar vectores source-safe
→ reconciliar fingerprints estables
→ regenerar plan 340
→ STOP_RETRY ante cualquier HOLD
→ cero writes/deploy
```

## 7. Prohibiciones

- reactivar el request consumido sin nueva autorización;
- ejecutar provider read, Auth repair o aplicación parcial;
- exportar identidad cruda;
- inferir apellidos o seleccionar multi-Auth por orden/antigüedad;
- desplegar, fusionar o tocar producción.
