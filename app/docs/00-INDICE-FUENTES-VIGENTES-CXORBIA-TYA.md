# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `C6_DETERMINISTIC_SUFFIX_CROSSWALK_ROOTFIX_SOURCE_STATIC_PASS__PROVIDER_REVALIDATION_NOT_AUTHORIZED__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-SHOPPER-DETERMINISTIC-SUFFIX-CROSSWALK-ROOTFIX-SOURCE-STATIC-PASS-LATEST.json`;
3. `app/docs/SOURCE-LOCK-C6-DETERMINISTIC-SUFFIX-CROSSWALK-ROOTFIX-20260805.md`;
4. `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
5. `tools/qa/cxorbia-c6-shopper-deterministic-suffix-crosswalk-rootfix-source-only.mjs`;
6. `backend/config/corte6-shopper-deterministic-suffix-readonly-request.json`;
7. `.github/workflows/cxorbia-c6-shopper-deterministic-suffix-readonly.yml` — carril source-only consumido; debe prepararse antes del próximo provider gate;
8. `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-CROSSWALK-ROOTFIX-SOURCE-STATIC-PASS-20260805.md`;
9. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-CROSSWALK-ROOTFIX-SOURCE-STATIC-PASS-20260805.md`;
10. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-CROSSWALK-ROOTFIX-SOURCE-STATIC-PASS-20260805.md`;
11. `app/docs/ACADEMIA-IMPACTO-C6-CROSSWALK-ROOTFIX-SOURCE-STATIC-PASS-20260805.md`;
12. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-CROSSWALK-ROOTFIX-SOURCE-STATIC-PASS-20260805.md`;
13. `app/docs/DIAGNOSTICO-RAIZ-C6-DETERMINISTIC-SUFFIX-CREDENTIAL-CROSSWALK-HOLD-20260805.md` — diagnóstico histórico cerrado;
14. `app/docs/evidence/CORTE6-SHOPPER-DETERMINISTIC-SUFFIX-READONLY-HOLD-LATEST.json` — provider anterior, resultados provisionales;
15. `backend/contracts/c6-shopper-deterministic-suffix-v1.json`;
16. `app/docs/evidence/CORTE6-SHOPPER-LOGIN-COLLISION-CLASSIFICATION-HOLD-LATEST.json` — referencia estable anterior;
17. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
18. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
19. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
20. `app/docs/DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
21. `AGENTS.md`;
22. PR #7 y HEAD vivo.

Los documentos que presentaron `65/142` como baseline definitivo permanecen supersedidos. Esas cifras fueron observadas antes de corregir la pérdida de 13 anclajes.

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

## 3. Root fix source/static vigente

```text
run=31066003792
job=92503740935
requestCommit=8b1ee44906f6c46a751d97548cbc2542a3935ca2
sourceCommit=6160ef89b75bcdf9068c210810c528d3c6d13db1
sourceSha256=3200b8833b3af10a27e0493df992836f99d3e78668f2265269d2bd0c74640568
PASS_C6_DETERMINISTIC_SUFFIX_CROSSWALK_ROOTFIX_SOURCE_STATIC
providerReads=0
providerWrites=0
```

## 4. Correctivo prevalente

```text
link(source) preserves basis and linked object
linked-source TECH_KEYS propagate into relationIndex
expected crosswalk=101 mapped / 8 unmapped
credentialCrosswalkParity required for readyForAuthRepair
credential drift produces hard stop
plan schema=340 rows
suffix lengths=4/6/8
```

La referencia `101/8` es una precondición source del próximo gate. Aún no fue revalidada contra Firebase con el planner corregido.

## 5. Provider anterior — solo referencia provisional

```text
run=31064458045
job=92499147712
artifact=8953330337
provider=HOLD_C6_DETERMINISTIC_SUFFIX_CREDENTIAL_CROSSWALK_STOP_RETRY
observed mapped/unmapped=88/21
observed groups/identities=65/142
observed active surname holds=12
observed multi-Auth tie=1
```

No utilizar estos agregados como baseline ni como plan ejecutable.

## 6. Estado seguro

```text
SOURCE_ONLY_REQUEST_CONSUMED=true
PROVIDER_READS_THIS_ROOTFIX=0
AUTH/PASSWORD/MEMBERSHIP/FIRESTORE/RULES/STORAGE/HR_WRITES=0
HOSTING/CLOUD_RUN_DEPLOYS=0
MAKE/GEMINI/PAYMENTS=0
MERGE=false
PRODUCTION=false
```

## 7. Carril operativo vigente

```text
NUEVA AUTORIZACIÓN PROVIDER READ-ONLY ONE-SHOT
→ preparar request/workflow read-only sobre source commit vigente
→ comprobar paridad real 101/8
→ recalcular apellidos, colisiones, multi-Auth y plan 340
→ STOP_RETRY ante cualquier residual
→ cero writes y cero deploy
```

## 8. Prohibiciones vigentes

- ejecutar provider sin nueva autorización expresa;
- tratar `101/8` como revalidado provider antes de la lectura;
- tratar 65/142 como baseline final;
- aplicar parcialmente el plan;
- crear o modificar Auth, claims, emails o contraseñas;
- escribir memberships, Firestore, Rules, Storage o HR;
- inferir apellido por una sola posición visual;
- desplegar Hosting o Cloud Run;
- crear nueva rama o PR;
- Make, Gemini, pagos, merge o producción.
