# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `LOGIN_ROOT_FIX_DEPLOYED__STAFF_SHOPPER_CLIENT_AUTH_PASS__REMOTE_SEMANTIC_CLIENT_ROUTE_WAIT_STOP_RETRY__NO_MORE_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-CANONICAL-HEAD-DEV-DEPLOY-GATES-FAILURE-LATEST.json`;
3. `CAMBIOS-BACKEND-ADDENDUM-C6-LOGIN-ROOT-FIX-REMOTE-STOP-20260805.md`;
4. `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-LOGIN-ROOT-FIX-REMOTE-STOP-20260805.md`;
5. `PENDIENTES-PROTOTIPO-ADDENDUM-C6-LOGIN-ROOT-FIX-REMOTE-STOP-20260805.md`;
6. `ACADEMIA-IMPACTO-C6-LOGIN-ROOT-FIX-REMOTE-STOP-20260805.md`;
7. `app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
8. `.github/cxorbia-gate-requests/request.json`;
9. `backend/config/corte6-live-domain-readonly-audit-request.json`;
10. `app/docs/evidence/CORTE6-LOGIN-SELECTOR-SOURCE-STATIC-HOLD-LATEST.json` — histórico del HOLD ya superado;
11. `AUDITORIA-P0-LOGIN-CONTAINER-SELECTOR-POST-HOSTING-DEV-20260805.md`;
12. `MANIFEST-V7-2-P0F1-RESPONSIVE-20260804.json`;
13. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
14. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
15. `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
16. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
17. `AGENTS.md`;
18. PR #7 y HEAD vivo.

Ante conflicto, mandan este índice, el checkpoint, el lock de empalme directo y la evidencia observable del último runner.

## 2. Estado técnico verificado

- V7.2-P0F1 empalmada: sí;
- selector acumulativo `.lg2-card, .login-card`: aplicado;
- dos blob pins activos: reconciliados;
- source/static posterior: PASS;
- contrato de Laboratorio: PASS;
- Hosting DEV acumulado: `2`;
- segundo Hosting DEV correctivo: release completa;
- paridad remota y HR viva: PASS;
- Login Staff: PASS;
- Login Shopper: PASS;
- tres recargas y nueva pestaña: PASS;
- visita propia Shopper: PASS;
- Login Cliente con credencial existente: PASS;
- Cliente recarga/nueva pestaña: PASS;
- Auth/claims/user/password writes del bloque: `0`;
- merge: false;
- producción: intacta.

## 3. STOP vigente

```text
FAIL_C6_REMOTE_GATES_AFTER_SINGLE_DEV_HOSTING_DEPLOY_STOP_RETRY
failedStage=remote_domain_finance_portals_reservations
semantic.failedStage=client_route_wait
errorCode=page.waitForFunction: Timeout 30000ms exceeded.
```

Estado parcial comprobado:

```text
clientModule=true
routerAvailable=true
requested=true
routeAfterRequest=cli_dashboard
```

La evidencia no aisló cuál condición visual faltó entre nav activa, encabezado `.ph` y contenido no vacío. No existe todavía causa raíz suficiente para tocar producto o harness.

## 4. Carril operativo

```text
DIAGNÓSTICO READ-ONLY FOCAL client_route_wait
→ CAPTURAR CADA SUBCONDICIÓN Y EXCEPCIONES
→ CLASIFICAR PRODUCTO VS HARNESS
→ DETENERSE SIN DEPLOY
```

## 5. Prohibiciones vigentes

- cualquier deploy adicional;
- reintento del request consumido;
- nueva candidata, rama o PR;
- cambios adicionales al Login;
- cambios de runtime o gate sin diagnóstico reproducible;
- cambios de credenciales, Auth, claims o memberships;
- Firestore/HR/Rules/Storage writes;
- Make, Gemini o pagos;
- merge o producción.
