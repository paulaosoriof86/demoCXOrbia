# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `DETERMINISTIC_SUFFIX_SOURCE_STATIC_PASS__PROVIDER_HOLD_CREDENTIAL_CROSSWALK_DRIFT_13__RESULTS_PROVISIONAL__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/DIAGNOSTICO-RAIZ-C6-DETERMINISTIC-SUFFIX-CREDENTIAL-CROSSWALK-HOLD-20260805.md`;
3. `app/docs/evidence/CORTE6-SHOPPER-DETERMINISTIC-SUFFIX-READONLY-HOLD-LATEST.json`;
4. `backend/config/corte6-shopper-deterministic-suffix-readonly-request.json`;
5. `backend/contracts/c6-shopper-deterministic-suffix-v1.json`;
6. `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
7. `.github/workflows/cxorbia-c6-shopper-deterministic-suffix-readonly.yml`;
8. `SOURCE-LOCK-C6-DETERMINISTIC-SUFFIX-READONLY-20260805.md`;
9. `CAMBIOS-BACKEND-ADDENDUM-C6-DETERMINISTIC-SUFFIX-CROSSWALK-ROOT-CAUSE-20260805.md`;
10. `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-DETERMINISTIC-SUFFIX-CROSSWALK-ROOT-CAUSE-20260805.md`;
11. `PENDIENTES-PROTOTIPO-ADDENDUM-C6-DETERMINISTIC-SUFFIX-CROSSWALK-ROOT-CAUSE-20260805.md`;
12. `ACADEMIA-IMPACTO-C6-DETERMINISTIC-SUFFIX-CROSSWALK-ROOT-CAUSE-20260805.md`;
13. `PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-DETERMINISTIC-SUFFIX-CROSSWALK-ROOT-CAUSE-20260805.md`;
14. `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
15. `app/docs/evidence/CORTE6-SHOPPER-LOGIN-COLLISION-CLASSIFICATION-HOLD-LATEST.json` — referencia estable anterior;
16. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
17. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
18. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
19. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
20. `AGENTS.md`;
21. PR #7 y HEAD vivo.

Los documentos iniciales del mismo bloque que presentaron `65/142` como baseline definitivo quedan corregidos por las fuentes 1–13 de este índice.

## 2. Contrato vigente

```text
Login normal Shopper: nombre.apellido
Excepción autorizada: nombre.apellido.<sufijo técnico no PII>
Sufijo: sha256(tenantId + NUL + shopperId), 4/6/8
Contraseña: Nombre123*
Namespace: shopper
Membership required: false
Authority: Firebase Auth + exact claims + exact shopperId profile
```

La política determinística pasó source/static. No fue materializada.

## 3. Ejecución vigente

```text
sourceStatic=PASS_C6_DETERMINISTIC_SUFFIX_SOURCE_STATIC
run=31064458045
job=92499147712
artifact=8953330337
digest=sha256:dc98e359ec09ee04cf0b9ba49acb4062a789707fe4e34cfadbf977dce10e2c39
provider=HOLD_C6_DETERMINISTIC_SUFFIX_CREDENTIAL_CROSSWALK_STOP_RETRY
```

## 4. Causa raíz prevalente

```text
stable credential crosswalk=101 mapped / 8 unmapped
deterministic planner=88 mapped / 21 unmapped
drift=13
cause=linked-source TECH_KEYS were not propagated into relationIndex
```

El clasificador estable amplía el crosswalk con llaves técnicas de cada fuente enlazada. El planner nuevo no lo hizo; por eso perdió 13 anclajes antes de completar apellidos y puntuar Auth.

## 5. Resultados provider provisionales

```text
71 surname completions observed
12 active surname holds observed
65 collision groups observed
142 active identities observed
90 suffixes of length 4 observed
1 multi-Auth tie observed
340 diagnostic plan rows
```

Estas cifras no reemplazan la referencia estable 64/141 y 101/8 hasta corregir el crosswalk y ejecutar una nueva lectura expresamente autorizada.

## 6. Estado seguro

```text
REQUEST_CONSUMED=true
PROVIDER_EXECUTIONS=1
PROVIDER_SECOND_ATTEMPT=0
AUTH/PASSWORD/MEMBERSHIP/FIRESTORE/RULES/STORAGE/HR_WRITES=0
HOSTING/CLOUD_RUN_DEPLOYS=0
MAKE/GEMINI/PAYMENTS=0
MERGE=false
PRODUCTION=false
```

## 7. Carril operativo vigente

```text
SOURCE-ONLY CROSSWALK ROOT FIX
→ propagar TECH_KEYS de fuentes enlazadas a relationIndex
→ fixture y gate de paridad 101/8
→ hard stop ante credential drift
→ verificar plan 340 y política 4/6/8
→ STOP sin provider reads
→ nueva autorización read-only solo después de PASS
```

## 8. Prohibiciones vigentes

- ejecutar nuevamente provider con la autorización consumida;
- tratar 65/142 o el plan observado como baseline final;
- crear o modificar Auth, claims, emails o contraseñas;
- escribir memberships, Firestore, Rules, Storage o HR;
- inferir apellido por una sola posición visual;
- aplicar parcialmente el plan;
- desplegar Hosting o Cloud Run;
- crear nueva rama, PR o candidata;
- Make, Gemini, pagos, merge o producción.
