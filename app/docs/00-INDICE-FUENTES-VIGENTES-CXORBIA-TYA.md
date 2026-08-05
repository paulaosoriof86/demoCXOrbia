# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `SHOPPER_IDENTITY_CANONICAL_CONTRACT_SOURCE_PREPARED__SOURCE_STATIC_MANIFEST_PIN_HOLD__STOP_RETRY__NO_PROVIDER_READS__NO_AUTH_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-SHOPPER-IDENTITY-CANONICALIZATION-SOURCE-STATIC-HOLD-LATEST.json`;
3. `.github/cxorbia-gate-requests/request.json`;
4. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
5. `tools/qa/cxorbia-c6-shopper-identity-canonical-plan.mjs`;
6. `tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs`;
7. `app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
8. `CAMBIOS-BACKEND-ADDENDUM-C6-SHOPPER-IDENTITY-SOURCE-STATIC-HOLD-20260805.md`;
9. `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-SHOPPER-IDENTITY-SOURCE-STATIC-HOLD-20260805.md`;
10. `PENDIENTES-PROTOTIPO-ADDENDUM-C6-SHOPPER-IDENTITY-SOURCE-STATIC-HOLD-20260805.md`;
11. `ACADEMIA-IMPACTO-C6-SHOPPER-IDENTITY-SOURCE-STATIC-HOLD-20260805.md`;
12. `PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-SHOPPER-IDENTITY-SOURCE-STATIC-HOLD-20260805.md`;
13. `app/docs/evidence/CORTE6-HUMAN-LOGIN-SHOPPER-IDENTITY-AUDIT-LATEST.json` — baseline anterior;
14. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
15. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
16. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
17. `AGENTS.md`;
18. PR #7 y HEAD vivo.

Ante conflicto, prevalecen este índice, el checkpoint vigente, la evidencia observable más reciente y el lock de ejecución directa.

## 2. Contrato vigente

```text
Tenant: TyA
Shopper visible login: nombre.apellido
Shopper password: Nombre123*
Namespace: shopper
Membership required: false
Authority: Firebase Auth + claims + exact shopperId profile
Paula Staff/Shopper: separate technical principals
```

Este contrato ya no está pendiente de definición. Las excepciones existentes son deuda de materialización, no formatos alternativos aceptados.

## 3. Estado técnico verificado

- contrato canónico creado;
- planificador de censo de los 340 perfiles creado;
- auditor corregido source-only;
- frontend y `CX.data` preservados;
- laboratorio source-only: PASS;
- source/static acumulativo: HOLD por un único pin desactualizado;
- censo provider: no ejecutado;
- Auth writes: `0`;
- password changes: `0`;
- membership writes: `0`;
- Hosting DEV del bloque: `0`;
- merge: false;
- producción: intacta.

## 4. Evidencia del HOLD

```text
run=31052425207
job=92462414462
artifact=8948908689
digest=sha256:fe1373b49c0aef22c03d8d476c1c2c6c9503d49607d7131d121d15bfbc8ab184
HOLD_READONLY_POST_GATES
```

```text
V6_ADDITIONAL_CRITICAL_BLOB_MISMATCH
path=tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs
expected=8fe4b0c5050d9fe9ba6c3120ef81a75b00bb8535
actual=80622606ce3635f0d53997a41932b6ced5dc25d4
```

## 5. Carril operativo vigente

```text
RECONCILIAR SOLO EL PIN DEL AUDITOR EN EL MANIFIESTO ACTIVO
→ NUEVO SOURCE/STATIC BAJO AUTORIZACIÓN EXPRESA
→ SOLO CON PASS, CENSO READ-ONLY DE LOS 340 PERFILES
→ SOLO CON CLASIFICACIÓN COMPLETA Y CERO COLISIONES, REPAIR AUTH DEV
→ READBACK N/N Y LOGIN REAL
→ SOLO CON PASS, UN HOSTING DEV Y GATES REMOTOS
→ VALIDACIÓN HUMANA
→ PRODUCCIÓN REQUIERE AUTORIZACIÓN SEPARADA
```

## 6. Prohibiciones vigentes

- reintentar automáticamente el gate fallido;
- ejecutar provider reads con el pin desactualizado;
- crear o modificar Auth antes del censo PASS;
- escribir memberships Shopper;
- desplegar Hosting DEV en este estado;
- crear nueva rama, PR, candidata o workflow transportador;
- Firestore/Rules/Storage/HR writes;
- Cloud Run, Make, Gemini o pagos;
- merge o producción.
