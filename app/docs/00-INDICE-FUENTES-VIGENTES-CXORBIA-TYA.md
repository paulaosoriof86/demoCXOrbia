# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `HUMAN_LOGIN_SINGLE_FORM_SOURCE_FIX_PASS__SHOPPER_IDENTITY_AUDIT_PASS_WITH_FINDINGS__NO_DEPLOY__IDENTITY_REPAIR_REQUIRED__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-HUMAN-LOGIN-SHOPPER-IDENTITY-AUDIT-LATEST.json`;
3. `backend/config/corte6-human-login-shopper-identity-audit.json`;
4. `.github/cxorbia-gate-requests/request.json`;
5. `app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-LOGIN-SHOPPER-IDENTITY-20260805.md`;
7. `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-HUMAN-LOGIN-SHOPPER-IDENTITY-20260805.md`;
8. `PENDIENTES-PROTOTIPO-ADDENDUM-C6-HUMAN-LOGIN-SHOPPER-IDENTITY-20260805.md`;
9. `ACADEMIA-IMPACTO-C6-HUMAN-LOGIN-SHOPPER-IDENTITY-20260805.md`;
10. `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
11. `app/docs/evidence/CORTE6-DEV-ROOT-ENTRYPOINT-DEPLOYED-FUNCTIONAL-PASS-QA-HYGIENE-HOLD-LATEST.json` — evidencia anterior del root DEV;
12. `MANIFEST-V7-2-P0F1-RESPONSIVE-20260804.json`;
13. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
14. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
15. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
16. `AGENTS.md`;
17. PR #7 y HEAD vivo.

Ante conflicto, mandan este índice, el checkpoint vigente, la evidencia observable más reciente y el lock de empalme directo.

## 2. Estado técnico verificado

- dominio raíz DEV: corregido y desplegado previamente;
- P0 Login humano: doble formulario demostrado;
- bridge single-form: aplicado en source, sin deploy;
- formulario canónico: `#loginForm`, `#lgUser`, `#lgPass`, `#lgSubmit`;
- overlay legado: ya no se crea desde el bridge y se elimina si otro wrapper intenta conservarlo;
- source/static acumulativo: PASS;
- auditoría read-only de identidad: PASS con hallazgos;
- perfiles Shopper Firestore: `340`;
- registros de credencial Shopper: `109`;
- usuarios Auth encontrados: `88`;
- sign-in compatible: `85`;
- patrón `nombre.apellido`: `79/109`;
- patrón `Nombre123*`: `81/109`;
- memberships Shopper: `0/109`;
- identidad Paula: dos candidatas, ninguna completamente lista;
- writes/deploy del bloque: `0`;
- merge: false;
- producción: intacta.

## 3. Evidencia source/static

```text
run=31041288528
job=92425994929
artifact=8944661204
digest=sha256:2eaade7708636d49e44eafb32416b9f54f66e496cf95ae4830dbd2c2a42c92b9
PASS_READONLY_POST_GATES
```

## 4. Evidencia identidad

```text
run=31041406837
job=92426382117
artifact=8944714638
digest=sha256:6c9451c7ef698e23e054dd9653db433472ff5c6ffa0a1c7f0b70758baad2abaf
PASS_C6_HUMAN_LOGIN_SHOPPER_IDENTITY_AUDIT_WITH_FINDINGS
```

## 5. Carril operativo

```text
DEFINIR CONTRATO CANÓNICO DE IDENTIDAD SHOPPER
→ ACLARAR MEMBERSHIP O CLAIMS+PERFIL
→ RESOLVER IDENTIDAD DUAL DE PAULA
→ PLAN IDÉMPOTENTE EN DRY-RUN
→ AUTORIZACIÓN EXPRESA ANTES DE CUALQUIER WRITE
```

## 6. Prohibiciones vigentes

- comunicar `nombre.apellido / Nombre123*` como regla universal;
- crear usuarios o cambiar/restablecer contraseñas sin autorización;
- escribir memberships en bloque sin contrato y dry-run;
- desplegar el bridge source-only actual;
- Firestore/Auth/HR/Rules/Storage writes;
- Cloud Run, Make, Gemini o pagos;
- merge o producción.
