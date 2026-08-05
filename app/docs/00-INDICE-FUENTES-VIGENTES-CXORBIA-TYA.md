# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `DEV_ROOT_ENTRYPOINT_SOURCE_FIX_APPLIED__SOURCE_STATIC_PASS__HOSTING_PREDEPLOY_HOLD_WORKFLOW_HEREDOC__STOP_RETRY__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-DEV-ROOT-ENTRYPOINT-PREDEPLOY-STOP-RETRY-LATEST.json`;
3. `backend/config/corte6-dev-root-entrypoint-hosting-execute.json`;
4. `.github/cxorbia-gate-requests/request.json`;
5. `app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-DEV-ROOT-ENTRYPOINT-STOP-RETRY-20260805.md`;
7. `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-DEV-ROOT-ENTRYPOINT-STOP-RETRY-20260805.md`;
8. `PENDIENTES-PROTOTIPO-ADDENDUM-C6-DEV-ROOT-ENTRYPOINT-STOP-RETRY-20260805.md`;
9. `ACADEMIA-IMPACTO-C6-DEV-ROOT-ENTRYPOINT-STOP-RETRY-20260805.md`;
10. `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
11. `app/docs/evidence/CORTE6-REMOTE-DOMAIN-SEMANTIC-CLIENT-PREDICATE-PASS-LATEST.json` — PASS técnico anterior sobre el entrypoint explícito;
12. `app/docs/evidence/CORTE6-CLIENT-ROUTE-WAIT-DIAGNOSTIC-LATEST.json`;
13. `MANIFEST-V7-2-P0F1-RESPONSIVE-20260804.json`;
14. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
15. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
16. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
17. `AGENTS.md`;
18. PR #7 y HEAD vivo.

Ante conflicto, mandan este índice, el checkpoint, el lock de empalme directo y la evidencia observable del último runner.

## 2. Estado técnico verificado

- P0 root DEV demostrado: `/` servía el shell demo mientras los gates usaban `/index-backend-dev.html`;
- corrección source-only del redirect raíz: aplicada;
- módulos, diseño, Login, Auth y negocio modificados por este P0: no;
- gate permanente de paridad source: agregado;
- gate permanente de paridad remota: agregado;
- source/static, composición y Laboratorio: PASS;
- Hosting DEV de este bloque: `0`;
- deploy intentado: false;
- root remoto corregido: false;
- root runtime acumulativo: no ejecutado;
- STOP_RETRY: aplicado;
- Hosting DEV acumulado: `2`;
- writes del bloque: `0`;
- merge: false;
- producción: intacta.

## 3. Source/static PASS

```text
run=31035432458
job=92406210890
artifact=8942354869
digest=sha256:d0b75352b58f2723a57bafaae8e9e77b2aef016a2a7c7d5ecc48a45c779d979f
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
PASS_C6_DEV_ROOT_ENTRYPOINT_SOURCE_PARITY
```

## 4. HOLD predeploy

```text
run=31035653127
job=92406957537
artifact=8942474073
digest=sha256:bf3014ddc059b86ae2dde18d397b266b8e5c9f5db92bcf7a3fee13246f30060f
failedStage=predeploy_workflow_shell_parse
errorCode=BASH_HEREDOC_TERMINATOR_INDENTATION_INVALID
deployAttempted=false
hostingDeploysThisBlock=0
```

## 5. Carril operativo

```text
CORREGIR SOLO INDENTACIÓN HEREDOC DEL WORKFLOW
→ REPINAR SOLO ESE BLOB
→ SOURCE/STATIC
→ NUEVA AUTORIZACIÓN EXPRESA
→ UNA ÚNICA EJECUCIÓN HOSTING DEV
→ PARIDAD Y GATES DESDE /
→ VALIDACIÓN HUMANA
```

## 6. Prohibiciones vigentes

- reintentar el request consumido;
- ejecutar un deploy sin nueva autorización;
- modificar módulos, diseño, Login, Auth o negocio por este hallazgo;
- nueva candidata, rama o PR;
- Firestore/Auth/HR/Rules/Storage writes;
- Cloud Run, Make, Gemini o pagos;
- merge o producción.
