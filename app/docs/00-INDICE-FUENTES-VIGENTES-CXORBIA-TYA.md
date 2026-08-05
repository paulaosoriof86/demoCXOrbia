# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `LOGIN_ROOT_FIX_DEPLOYED__AUTH_MULTIROLE_PASS__CLIENT_ROUTE_PRODUCT_PASS__HARNESS_NAV_ASSUMPTION_PROVEN__NO_MORE_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-CLIENT-ROUTE-WAIT-DIAGNOSTIC-LATEST.json`;
3. `.github/cxorbia-gate-requests/request.json`;
4. `CAMBIOS-BACKEND-ADDENDUM-C6-CLIENT-ROUTE-HARNESS-20260805.md`;
5. `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-CLIENT-ROUTE-HARNESS-20260805.md`;
6. `PENDIENTES-PROTOTIPO-ADDENDUM-C6-CLIENT-ROUTE-HARNESS-20260805.md`;
7. `ACADEMIA-IMPACTO-C6-CLIENT-ROUTE-HARNESS-20260805.md`;
8. `app/docs/evidence/CORTE6-CANONICAL-HEAD-DEV-DEPLOY-GATES-FAILURE-LATEST.json` — evidencia histórica del timeout ya clasificado;
9. `app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
10. `backend/config/corte6-live-domain-readonly-audit-request.json`;
11. `app/docs/evidence/CORTE6-LOGIN-SELECTOR-SOURCE-STATIC-HOLD-LATEST.json` — HOLD histórico superado;
12. `AUDITORIA-P0-LOGIN-CONTAINER-SELECTOR-POST-HOSTING-DEV-20260805.md`;
13. `MANIFEST-V7-2-P0F1-RESPONSIVE-20260804.json`;
14. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
15. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
16. `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
17. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
18. `AGENTS.md`;
19. PR #7 y HEAD vivo.

Ante conflicto, mandan este índice, el checkpoint, el lock de empalme directo y la evidencia observable del último runner.

## 2. Estado técnico verificado

- V7.2-P0F1 empalmada: sí;
- root fix Login y dos blob pins: PASS;
- source/static y Laboratorio: PASS;
- Hosting DEV acumulado: `2`;
- deploy adicional autorizado: `0`;
- paridad remota y HR viva: PASS;
- Login Staff, Shopper y Cliente: PASS;
- Shopper tres recargas, nueva pestaña y visita propia: PASS;
- Cliente recarga/nueva pestaña: PASS;
- Portal Cliente focal: ruta aceptada y contenido renderizado;
- excepción de render: ninguna;
- Auth/claims/password/membership writes del diagnóstico: `0`;
- merge: false;
- producción: intacta.

## 3. Clasificación vigente

```text
PASS_C6_CLIENT_ROUTE_WAIT_DIAGNOSTIC_CLASSIFIED
OWNER=HARNESS
CODE=HARNESS_NAV_ACTIVE_SUBCONDITION_MISMATCH
```

Observaciones:

```text
sessionView=cli_dashboard
navElementExists=false
navActive=false
viewExists=true
pageHeaderExists=true
viewTextLength=690
renderException=null
```

El timeout histórico no demuestra una regresión del Portal Cliente. El producto renderizó correctamente; el gate exigía un nodo de navegación que no existe en ese contexto de navegación directa.

## 4. Carril operativo

```text
CORREGIR SOLO EL PREDICADO DEL HARNESS
→ USAR session.view + #view + .ph + CONTENIDO + SIN EXCEPCIÓN
→ RERUN SEMÁNTICO READ-ONLY
→ CERO DEPLOY
→ VALIDACIÓN HUMANA
```

## 5. Prohibiciones vigentes

- cualquier deploy adicional;
- cambios de runtime, módulos o Login por `client_route_wait`;
- nueva candidata, rama o PR;
- cambios de credenciales, Auth, claims o memberships;
- Firestore/HR/Rules/Storage writes;
- Make, Gemini o pagos;
- merge o producción.
