# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `HOSTING_DEV_DEPLOYED__REMOTE_PARITY_PASS__P0_LOGIN_CONTAINER_SELECTOR_MISMATCH__STOP_RETRY__NO_SECOND_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `CAMBIOS-BACKEND-ADDENDUM-C6-MEMBERSHIP-PASS-HOSTING-DEV-P0-LOGIN-SELECTOR-20260805.md`;
3. `PENDIENTES-PROTOTIPO-ADDENDUM-C6-HOSTING-DEV-P0-LOGIN-SELECTOR-20260805.md`;
4. `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-HOSTING-DEV-P0-LOGIN-SELECTOR-20260805.md`;
5. `ACADEMIA-IMPACTO-C6-HOSTING-DEV-P0-LOGIN-SELECTOR-20260805.md`;
6. `app/docs/evidence/CORTE6-PHASE-A-RUNTIME-HOLD-AFTER-ACCESS-PASS-LATEST.json`;
7. `app/docs/evidence/CORTE6-CANONICAL-HEAD-DEV-DEPLOY-GATES-FAILURE-LATEST.json`;
8. `app/docs/evidence/CORTE6-CANONICAL-HEAD-SOURCE-LOCK-LATEST.json`;
9. `MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
10. `MANIFEST-V7-2-P0F1-RESPONSIVE-20260804.json`;
11. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
12. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
13. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
14. `AGENTS.md`;
15. PR #7 y HEAD vivo.

Ante conflicto, mandan este índice, el checkpoint, el lock de empalme directo y la evidencia observable de los runners.

## 2. Estado técnico verificado

- V7.2-P0F1 empalmada: sí;
- composición Phase A y Lab source/static: PASS;
- membresía Cliente: reparada y readback exacto;
- membership writes: `1`;
- Auth/claims/user/password writes: `0`;
- Hosting DEV: desplegado una vez;
- paridad remota y HR viva: PASS;
- segundo deploy: `0`;
- merge: false;
- producción: intacta.

## 3. P0 vigente

```text
FAIL_C6_UNIFIED_HUMAN_AUTH_CREDENTIAL_STEP
failedPrincipal=staff
```

Causa reproducible:

- V7.2 monta el Login en `.lg2-card`;
- `app/core/backend-browser-auth.js` busca `.login-card`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js` busca `.login-card`;
- el formulario `#cxIntegratedAuthStep` no se crea.

Correctivo source-only exacto:

```js
loginRoot.querySelector('.lg2-card, .login-card')
```

## 4. Carril operativo

```text
P0_PROVEN
→ AUTORIZACIÓN NUEVA
→ FIX SOURCE-ONLY EN DOS ARCHIVOS
→ GATES SOURCE/STATIC
→ SEGUNDO HOSTING DEV DE CORRECCIÓN
→ GATES REMOTOS ACUMULATIVOS
→ VALIDACIÓN HUMANA
```

Codex continúa opcional. Paula no usa terminal o PowerShell.

## 5. Prohibiciones vigentes

- segundo deploy sin autorización expresa;
- nueva candidata, rama o PR;
- rediseño del Login;
- cambios de credenciales, Auth, claims o membresías;
- Firestore/HR/Rules/Storage writes;
- merge o producción.
