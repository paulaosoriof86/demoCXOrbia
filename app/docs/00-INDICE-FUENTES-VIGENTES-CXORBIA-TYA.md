# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `STOP_RETRY_CLIENT_MEMBERSHIP_WRITE_AUTH_REQUIRED__NO_HOSTING_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `CAMBIOS-BACKEND-ADDENDUM-C6-PREDEPLOY-CLIENT-MEMBERSHIP-STOP-20260805.md`;
3. `PENDIENTES-PROTOTIPO-ADDENDUM-C6-CLIENT-MEMBERSHIP-STOP-20260805.md`;
4. `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-CLIENT-MEMBERSHIP-STOP-20260805.md`;
5. `ACADEMIA-IMPACTO-C6-PREDEPLOY-MEMBERSHIP-STOP-20260805.md`;
6. `app/docs/evidence/CORTE6-CANONICAL-HEAD-DEV-DEPLOY-GATES-FAILURE-LATEST.json`;
7. `app/docs/evidence/CORTE6-CANONICAL-HEAD-SOURCE-LOCK-LATEST.json`;
8. `DIRECT-GITHUB-RUNNER-INDEPENDENCE-20260805.md`;
9. `AUDITORIA-RECONCILIACION-LOCK-CANONICO-V7-2-P0F1-20260805.md`;
10. `MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`;
11. `MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-HISTORICAL-20260804.json`;
12. `MANIFEST-V7-2-P0F1-RESPONSIVE-20260804.json`;
13. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
14. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
15. `AGENTS.md`;
16. PR #7 y HEAD vivo.

Ante conflicto, mandan este índice, el checkpoint, el lock de empalme directo y la evidencia observable de los runners.

## 2. Estado técnico verificado

- V7.2-P0F1 empalmada: sí;
- composición Phase A y Lab: PASS;
- Auth Cliente y claims: PASS;
- membresía Cliente v2: FAIL exacto;
- Hosting DEV intentado: no;
- Hosting DEV ejecutado: no;
- provider/data writes del bloque: cero;
- producción: intacta.

Bloqueo exacto:

```text
client_auth_materialization__readback__CLIENT_MEMBERSHIP_READBACK_MISMATCH
```

Ruta:

```text
tenants/tya/users/cxorbia-c6-client-tya-cinepolis-v1
```

## 3. Causas raíz cerradas durante el predeploy

- autoridad A+B obsoleta sustituida por composición Phase A activa;
- conteo HR congelado `616` sustituido por autoridad dinámica, que actualmente devuelve `660`;
- alias heredado de decisión Cliente reconciliado con el contrato canónico;
- diagnóstico de etapa sanitizado añadido.

Ninguno de estos correctivos ejecutó Hosting, Auth, Firestore, HR, merge o producción.

## 4. Carril operativo

```text
CHATGPT AUDITA Y PREPARA
→ RUNNER ATÓMICO APLICA CORRECTIVOS SOURCE-ONLY
→ PREFLIGHT FAIL-CLOSED
→ SOLO CON PASS SE PERMITE EL ÚNICO HOSTING DEV
```

Codex continúa opcional. Paula no usa terminal o PowerShell.

## 5. Siguiente autorización requerida

Un único repair DEV de la membresía Cliente:

- snapshot previo;
- máximo `1` Firestore membership write;
- `0` Auth user creates;
- `0` password changes;
- idempotencia;
- readback;
- rollback dry-run;
- después retomar el único Hosting DEV aún no consumido.

## 6. Prohibiciones vigentes

- ejecutar el write sin autorización expresa;
- omitir snapshot, idempotencia o rollback dry-run;
- nuevo usuario Cliente;
- cambio de contraseña;
- nueva candidata, rama o PR;
- segundo deploy automático;
- merge o producción.
