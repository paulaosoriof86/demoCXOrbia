# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `SHOPPER_IDENTITY_RESOLUTION_SOURCE_STATIC_PASS__READONLY_REVIEW_COMPLETE__RESOLVER_OVERHOLD_PROVEN__STOP_RETRY__NO_AUTH_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-SHOPPER-IDENTITY-SOURCE-SAFE-RESOLUTION-HOLD-LATEST.json`;
3. `backend/config/corte6-human-login-shopper-identity-audit.json`;
4. `.github/cxorbia-gate-requests/request.json`;
5. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
6. `tools/qa/cxorbia-c6-shopper-identity-resolution-review.mjs`;
7. `tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs`;
8. `tools/qa/cxorbia-c6-shopper-identity-canonical-plan.mjs`;
9. `app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
10. `CAMBIOS-BACKEND-ADDENDUM-C6-SHOPPER-IDENTITY-RESOLUTION-HOLD-20260805.md`;
11. `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-SHOPPER-IDENTITY-RESOLUTION-HOLD-20260805.md`;
12. `PENDIENTES-PROTOTIPO-ADDENDUM-C6-SHOPPER-IDENTITY-RESOLUTION-HOLD-20260805.md`;
13. `ACADEMIA-IMPACTO-C6-SHOPPER-IDENTITY-RESOLUTION-HOLD-20260805.md`;
14. `PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-SHOPPER-IDENTITY-RESOLUTION-HOLD-20260805.md`;
15. `app/docs/evidence/CORTE6-SHOPPER-IDENTITY-CANONICAL-CENSUS-HOLD-LATEST.json` — censo anterior;
16. `app/docs/evidence/CORTE6-HUMAN-LOGIN-SHOPPER-IDENTITY-AUDIT-LATEST.json` — baseline histórico;
17. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
18. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
19. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
20. `AGENTS.md`;
21. PR #7 y HEAD vivo.

Ante conflicto, prevalecen este índice, el checkpoint vigente, la evidencia observable de la revisión y el lock de ejecución directa.

## 2. Contrato vigente

```text
Tenant: TyA
Shopper visible login: nombre.apellido
Shopper password: Nombre123*
Namespace: shopper
Membership required: false
Authority: Firebase Auth + exact claims + exact shopperId profile
Paula Staff/Shopper: separate technical principals
```

Las excepciones existentes son deuda de materialización, no formatos alternativos aceptados.

## 3. Source/static vigente

```text
run=31055889684
job=92473179280
artifact=8950210279
digest=sha256:7d78d480b15b836ab98ded284a2bfca2b0ebe2517531c36825bc77159de915dd
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

## 4. Revisión source-safe vigente

```text
run=31056005286
job=92473531087
artifact=8950260575
digest=sha256:28bcefd758c53efa4357d0d4766488662c3b0701ce2ccfce551816c92d7edb88
HOLD_C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW
```

```text
PROFILES=340
CREDENTIALS=109
MAPPED=101
UNMAPPED=8
MISSING_AUTH=21 = 13 mapped + 8 unmapped
LOGIN_EXCEPTIONS_CURRENT_SCOPE=16
PASSWORD_EXCEPTIONS_CURRENT_SCOPE=18
PLAN_ROWS=340
CREATE_AUTH=22
UPDATE_AUTH=8
NO_OP=73
HOLD=110
PRESERVE_NO_AUTH=127
```

## 5. Causa raíz vigente

```text
RESOLVER_CANONICAL_NAME_BASIS_TOO_RESTRICTIVE
```

El resolver enlazó identidades por `shopperId` y claves técnicas, pero después no utilizó el nombre completo o login técnico del perfil exacto ya enlazado. Esto creó 109 falsos holds de nombre incompleto y ocultó la matriz real de colisiones de `nombre.apellido`.

## 6. Estado seguro

```text
AUTH_WRITES=0
PASSWORD_CHANGES=0
PASSWORD_RESETS=0
MEMBERSHIP_WRITES=0
FIRESTORE/Rules/Storage/HR_WRITES=0
HOSTING_DEPLOYS=0
CLOUD_RUN=0
MAKE/GEMINI/PAYMENTS=0
MERGE=false
PRODUCTION=false
```

## 7. Carril operativo vigente

```text
FIX SOURCE-ONLY DEL RESOLVER
→ usar nombre completo/login técnico solo después de shopperId binding
→ resumen técnico source-safe de 2 candidatas Shopper de Paula
→ baseline por conjuntos, no igualdad 30/28
→ recalcular colisiones reales
→ plan primario único por perfil
→ repin resolver y dispatcher
→ source/static
→ nueva revisión read-only autorizada
→ STOP antes de Auth/password write o deploy
```

## 8. Prohibiciones vigentes

- reintentar automáticamente el request consumido;
- crear o modificar Auth;
- cambiar o restablecer contraseñas;
- escribir memberships;
- deduplicar por nombre visual;
- desplegar Hosting DEV;
- crear nueva rama, PR o candidata;
- Firestore/Rules/Storage/HR writes;
- Cloud Run, Make, Gemini o pagos;
- merge o producción.
