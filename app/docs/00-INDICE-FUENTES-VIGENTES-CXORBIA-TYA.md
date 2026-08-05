# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `LOGIN_SELECTOR_SOURCE_FIX_APPLIED__LAB_CONTRACT_PASS__SOURCE_STATIC_HOLD_MANIFEST_BLOB_PINS_STALE__STOP_RETRY__NO_SECOND_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-LOGIN-SELECTOR-SOURCE-STATIC-HOLD-LATEST.json`;
3. `CAMBIOS-BACKEND-ADDENDUM-C6-LOGIN-SELECTOR-SOURCE-STATIC-HOLD-20260805.md`;
4. `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-LOGIN-SELECTOR-SOURCE-STATIC-HOLD-20260805.md`;
5. `PENDIENTES-PROTOTIPO-ADDENDUM-C6-LOGIN-SELECTOR-SOURCE-STATIC-HOLD-20260805.md`;
6. `ACADEMIA-IMPACTO-C6-LOGIN-SELECTOR-SOURCE-STATIC-HOLD-20260805.md`;
7. `AUDITORIA-P0-LOGIN-CONTAINER-SELECTOR-POST-HOSTING-DEV-20260805.md`;
8. `app/docs/evidence/CORTE6-CANONICAL-HEAD-DEV-DEPLOY-GATES-FAILURE-LATEST.json`;
9. `app/docs/evidence/CORTE6-CANONICAL-HEAD-SOURCE-LOCK-LATEST.json`;
10. `MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
11. `MANIFEST-V7-2-P0F1-RESPONSIVE-20260804.json`;
12. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
13. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
14. `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
15. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
16. `AGENTS.md`;
17. PR #7 y HEAD vivo.

Ante conflicto, mandan este índice, el checkpoint, el lock de empalme directo y la evidencia observable de los runners.

## 2. Estado técnico verificado

- V7.2-P0F1 empalmada: sí;
- membresía Cliente: reparada y readback exacto;
- membership writes acumulados: `1`;
- Auth/claims/user/password writes: `0`;
- Hosting DEV acumulado: `1`;
- paridad remota y HR viva del deploy anterior: PASS;
- selector acumulativo `.lg2-card, .login-card`: aplicado en los dos bridges autorizados;
- Lab source contract posterior al fix: PASS;
- source/static acumulativo posterior al fix: HOLD por dos blob pins antiguos del manifiesto;
- segundo deploy: `0`;
- merge: false;
- producción: intacta.

## 3. HOLD vigente

```text
HOLD_READONLY_POST_GATES
FAIL_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE
ROOT_CAUSE=ACTIVE_COMPOSITION_MANIFEST_STILL_PINS_PRE_FIX_AUTH_BRIDGE_BLOBS
```

El gate encontró exactamente dos mismatches y corresponden a los dos archivos modificados de forma autorizada:

- `app/core/backend-browser-auth.js`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js`.

No se detectó un tercer archivo runtime distinto, secreto, ruta faltante, script duplicado ni fallo del contrato de Laboratorio.

## 4. Carril operativo

```text
RECONCILIAR SOLO DOS BLOB PINS DEL MANIFIESTO/BUILD-LOCK
→ NUEVO GATE SOURCE/STATIC
→ SOLO CON PASS: SEGUNDO HOSTING DEV CORRECTIVO
→ PARIDAD
→ STAFF
→ SHOPPER 3 RECARGAS + NUEVA PESTAÑA
→ CLIENTE
→ DOMINIO/FINANZAS/PORTALES/RESERVAS
→ VALIDACIÓN HUMANA
```

## 5. Prohibiciones vigentes

- segundo deploy mientras el source/static siga en HOLD;
- reintento automático del request consumido;
- nueva candidata, rama o PR;
- cambios adicionales al Login o a módulos;
- cambios de credenciales, Auth, claims o memberships;
- Firestore/HR/Rules/Storage writes;
- merge o producción.
