# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `C6_RESIDUAL_IDENTITY_ROOT_CAUSE_SOURCE_ONLY_PASS__12_INSUFFICIENT__1_MULTI_AUTH_CONFIRMED__METRIC_GATE_DEFECTS_IDENTIFIED__NO_PROVIDER_READS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-RESIDUAL-IDENTITY-ROOT-CAUSE-SOURCE-ONLY-LATEST.json`;
3. `app/docs/DIAGNOSTICO-RAIZ-C6-RESIDUAL-IDENTITY-SOURCE-ONLY-20260805.md`;
4. `app/docs/SOURCE-LOCK-C6-RESIDUAL-IDENTITY-ROOT-CAUSE-SOURCE-ONLY-20260805.md`;
5. `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-RESIDUAL-IDENTITY-ROOT-CAUSE-SOURCE-ONLY-20260805.md`;
6. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-RESIDUAL-IDENTITY-ROOT-CAUSE-SOURCE-ONLY-20260805.md`;
7. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-RESIDUAL-IDENTITY-ROOT-CAUSE-SOURCE-ONLY-20260805.md`;
8. `app/docs/ACADEMIA-IMPACTO-C6-RESIDUAL-IDENTITY-ROOT-CAUSE-SOURCE-ONLY-20260805.md`;
9. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-RESIDUAL-IDENTITY-ROOT-CAUSE-SOURCE-ONLY-20260805.md`;
10. `app/docs/evidence/CORTE6-SHOPPER-DETERMINISTIC-SUFFIX-PROVIDER-REVALIDATION-HOLD-LATEST.json` — provider anterior, fuente de los 13 HOLD;
11. `app/docs/evidence/CORTE6-SHOPPER-LOGIN-COLLISION-CLASSIFICATION-HOLD-LATEST.json` — clasificador estable anterior;
12. `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
13. `tools/qa/cxorbia-c6-shopper-login-collision-classification.mjs`;
14. `backend/contracts/c6-shopper-deterministic-suffix-v1.json`;
15. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
16. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
17. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
18. `app/docs/DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
19. `AGENTS.md`;
20. PR #7 y HEAD vivo.

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

## 3. Clasificación residual vigente

```text
12 technical_surname_unresolved = NO_C6_OR_INSUFFICIENT_EVIDENCE
1 multi_auth_tie_residual = C6_CONFIRMED
83 = 71 completed by consensus + 12 remaining
64/141 vs 65/142 = model change + rigid aggregate gate defect
readyForAuthRepair=false
partialExecutionAllowed=false
```

Los 12 fingerprints no prueban una colisión, alias ni múltiples identidades. El artifact tampoco permite afirmar que falte específicamente apellido, porque la etiqueta se deriva de `complete=false` sin exportar las dimensiones separadas.

El multi-Auth conserva STOP_RETRY: no existe discriminador técnico único.

## 4. Reconciliación agregada

La población provider y el crosswalk son estables:

```text
profiles=340
authUsers=110
credentials=109
mapped/unmapped=101/8
visits=616
certifications=77
liquidations=827
```

El clasificador estable usó apellido explícito o login técnico. El planner nuevo añadió consenso entre múltiples fuentes para 71 perfiles. Por ello `64/141` y `65/142` no pueden compararse mediante una igualdad agregada rígida.

Además, los fingerprints de grupo usan namespaces diferentes entre versiones; no existe un join source-safe para identificar el movimiento exacto entre los grupos de tamaño 5, 4 y 2.

## 5. Estado seguro

```text
PROVIDER_READS_THIS_BLOCK=0
PROVIDER_WRITES=0
AUTH/PASSWORD/MEMBERSHIP/FIRESTORE/RULES/STORAGE/HR_WRITES=0
HOSTING/CLOUD_RUN_DEPLOYS=0
MAKE/GEMINI/PAYMENTS=0
MERGE=false
PRODUCTION=false
```

## 6. Carril operativo vigente

```text
SOURCE-ONLY DIAGNOSTIC-CONTRACT ROOT FIX
→ split pre-consensus/completed/remaining metrics
→ add source-safe diagnostic vectors per HOLD
→ add source-safe multi-Auth signal vector
→ replace rigid 64 gate with stable fingerprint-set reconciliation
→ source/static only
→ STOP before provider read
```

## 7. Prohibiciones vigentes

- reejecutar el provider request consumido;
- inferir apellidos para los 12 fingerprints;
- seleccionar una cuenta multi-Auth por antigüedad u orden;
- tratar `64/141` o `65/142` como baseline final;
- aplicar parcialmente el plan 340;
- crear o modificar Auth, claims, email o contraseña;
- escribir memberships, Firestore, Rules, Storage o HR;
- desplegar Hosting o Cloud Run;
- crear rama o PR nuevos;
- Make, Gemini, pagos, merge o producción.
