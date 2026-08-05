# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `DEV_ROOT_REDIRECT_DEPLOYED__REMOTE_PARITY_PASS__MULTIROLE_FUNCTIONAL_PASS__POSTDEPLOY_REPOSITORY_HYGIENE_HOLD__STOP_RETRY__NO_SECOND_DEPLOY__HUMAN_VALIDATION_PENDING__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-DEV-ROOT-ENTRYPOINT-DEPLOYED-FUNCTIONAL-PASS-QA-HYGIENE-HOLD-LATEST.json`;
3. `backend/config/corte6-dev-root-entrypoint-hosting-execute.json`;
4. `.github/cxorbia-gate-requests/request.json`;
5. `app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-DEV-ROOT-DEPLOY-FUNCTIONAL-PASS-QA-HYGIENE-HOLD-20260805.md`;
7. `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-DEV-ROOT-DEPLOY-FUNCTIONAL-PASS-QA-HYGIENE-HOLD-20260805.md`;
8. `PENDIENTES-PROTOTIPO-ADDENDUM-C6-DEV-ROOT-DEPLOY-FUNCTIONAL-PASS-QA-HYGIENE-HOLD-20260805.md`;
9. `ACADEMIA-IMPACTO-C6-DEV-ROOT-DEPLOY-FUNCTIONAL-PASS-QA-HYGIENE-HOLD-20260805.md`;
10. `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
11. `app/docs/evidence/CORTE6-DEV-ROOT-ENTRYPOINT-PREDEPLOY-STOP-RETRY-LATEST.json` — evidencia histórica previa al correctivo heredoc;
12. `app/docs/evidence/CORTE6-REMOTE-DOMAIN-SEMANTIC-CLIENT-PREDICATE-PASS-LATEST.json`;
13. `MANIFEST-V7-2-P0F1-RESPONSIVE-20260804.json`;
14. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
15. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
16. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
17. `AGENTS.md`;
18. PR #7 y HEAD vivo.

Ante conflicto, mandan este índice, el checkpoint vigente, la evidencia observable más reciente y el lock de empalme directo.

## 2. Estado técnico verificado

- corrección heredoc-only: aplicada en dos terminadores, sin cambio de lógica;
- workflow repinado: únicamente su blob;
- source/static, composición, Laboratorio y paridad source: PASS;
- único Hosting DEV autorizado: ejecutado y publicado correctamente;
- dominio raíz `/`: redirect `302` vivo hacia `/index-backend-dev.html`;
- paridad remota raíz/canónica: PASS exacto;
- Staff desde `/`: PASS, recargas y nueva pestaña;
- Shopper desde `/`: PASS, identidad, histórico, certificación, tres recargas y nueva pestaña;
- Cliente y Portal Cliente desde `/`: PASS;
- Portal Shopper: PASS;
- Finanzas: PASS, modelo delegado, regalías `0`, sin valores inventados;
- Reservas: PASS, fuente protegida y mutaciones deshabilitadas;
- HOLD final: solo higiene del harness por archivo efímero `gha-creds-*.json` observado antes del cleanup de la acción Auth;
- delta rastreado del repositorio durante el gate: ninguno;
- producto/runtime remoto fallido: no;
- STOP_RETRY: aplicado;
- Hosting DEV acumulado: `3`;
- Hosting DEV de este bloque: `1`;
- deploy adicional autorizado: `0`;
- Cloud Run y writes: `0`;
- merge: false;
- producción: intacta.

## 3. Evidencia source/static

```text
run=31037730522
job=92414066321
artifact=8943265325
digest=sha256:2b7a3619d45054ef0c296b396172df01001063d53f247852aef082373a313ff0
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
PASS_C6_DEV_ROOT_ENTRYPOINT_SOURCE_PARITY
```

## 4. Evidencia Hosting y runtime raíz

```text
run=31037828442
job=92414393948
artifact=8943383623
digest=sha256:6c275fa95d9b729ffefa2e17c660b8a25c02df916a5c57740b538e902b00d3f5
HOSTING_DEPLOY_SUCCEEDED=true
PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY
PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_SHOPPER_RUNTIME_CLIENT_ROUTE_READY
PASS_PHASE_A_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS_DYNAMIC
```

```text
FINAL_AUTOMATION_HOLD=REPOSITORY_CHANGED_BY_ROOT_RUNTIME_GATE
CLASSIFICATION=QA_WORKFLOW_HYGIENE_ONLY
TRACKED_DELTA=0
SECOND_DEPLOY=0
```

## 5. Carril operativo

```text
VALIDACIÓN HUMANA SOBRE LA RELEASE DEV EXISTENTE
→ STAFF
→ SHOPPER: 3 RECARGAS + NUEVA PESTAÑA
→ CLIENTE Y PORTAL CLIENTE
→ PORTAL SHOPPER
→ FINANZAS
→ RESERVAS
→ DOCUMENTAR RESULTADO
→ CERO REDEPLOY
```

## 6. Prohibiciones vigentes

- reintentar el request consumido;
- realizar un segundo deploy;
- modificar módulos, diseño, Login, Auth o negocio por el HOLD de higiene;
- nueva candidata, rama o PR;
- Firestore/Auth/HR/Rules/Storage writes;
- Cloud Run, Make, Gemini o pagos;
- merge o producción sin autorización expresa.
