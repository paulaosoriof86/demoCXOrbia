# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `P0_PROVEN_C6_CREDENTIAL_CONTINUITY_GAP__AUTH_RULES_HOSTING_TECH_PASS__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Hosting DEV existente: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar todavía.
- Sandbox C4: no destino.
- No crear nuevo Firebase, Hosting, rama, PR o candidata por rutina.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes de empalme/carril, Academia, patrones y antidesvío;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CORTE6-P0-CONTINUIDAD-CREDENCIALES-LEGACY-A-FIREBASE-20260730.md`;
6. `CORTE6-AUTH-RBAC-HOSTING-DEV-PASS-PENDING-HUMAN-VISUAL-20260730.md` como evidencia histórica del PASS técnico previo al P0 de continuidad;
7. `CAMBIOS-BACKEND.md`;
8. `RESUMEN-PARA-CLAUDE.md`;
9. `PENDIENTES-PROTOTIPO.md`;
10. `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
11. `ACADEMIA-IMPACTO-CORTE6-AUTH-RBAC-20260730.md`;
12. `evidence/CORTE6-CREDENTIAL-CONTINUITY-READONLY-LATEST.json`;
13. `evidence/CORTE6-AUTH-CLAIMS-NORMALIZATION-LATEST.json`;
14. `evidence/CORTE6-AUTH-RBAC-READONLY-RECONCILIATION-LATEST.json` + `.md`;
15. `evidence/CORTE6-FIRESTORE-RULES-DEPLOY-LATEST.json`;
16. `evidence/CORTE6-HOSTING-IAM-DIAGNOSTIC-LATEST.json`;
17. `evidence/CORTE6-HOSTING-DEV-DEPLOY-LATEST.json`;
18. `backend/config/phase-a-hosting-dev-execution-request-v1.json`;
19. `evidence/R17N-FINAL-DEV-MATERIALIZATION-LATEST.json`;
20. `evidence/R17N-POST-MATERIALIZATION-READONLY-SMOKE-LATEST.json` + `.md`;
21. `evidence/CURRENT-HR-THROUGH-JULY-SOURCE-SAFE-LATEST.json`;
22. PR #7 y HEAD vivo.

## 3. Baseline no reabrir
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL: 1,406/1,406 Firestore data writes y readback; mismatch0.
- Materializado: 616 visitas, 572 controles de liquidación, 77 certificaciones y perfiles previstos.
- Corte 5 `CX.data`: proyecto `cinepolis`, 14 periodos, 616 visitas, `currentPeriodId=2026-07`, source=firestore, fallback=false.
- No repetir materialización ni reabrir snapshots superados.

## 4. Fuente real vigente
- HR hasta julio 2026: 14 periodos /616 visitas /208 refs shopper.
- 208/208 refs listas →194 perfiles canónicos únicos.
- 77 certificaciones materializadas.
- 572 controles de liquidación.
- Agosto HN continúa HOLD por inconsistencia país/tab.

## 5. Corte 6 Auth/RBAC/Rules — PASS técnico
- 5/5 claim updates autorizados: cliente2 + shopper3;
- scopes stale → `cinepolis`;
- cuarto shopper no vinculado: no tocado;
- usuarios nuevos/password changes/deletes: 0/0/0;
- readiness: operador7, cliente2, shopper3;
- Rules release/readback SHA exacto PASS;
- Firestore data writes Corte6: 0.

## 6. Hosting DEV — PASS técnico, 1/1 consumido
- mismo Hosting/Firebase existente;
- nuevo Firebase/Hosting: 0/0;
- release `sites/cxorbia-backend-dev/releases/1785431702100000`;
- version `sites/cxorbia-backend-dev/versions/b00728c729452665`, FINALIZED;
- entrypoint DEV explícito verificado;
- no redeploy adicional autorizado.

## 7. P0 vivo — continuidad de credenciales
La pantalla Firebase `Correo + Contraseña` no puede convertirse en el login final por defecto.

Inventario read-only actual:
- `tenants/tya/shoppers`: `user/username/login`=0; `pass/password`=0;
- `tenants/tya/users`: 0 docs;
- tenant profile: 0 claves login;
- Firebase Auth: 17 cuentas password, todas con identificador email.

Conclusión: la fuente de credenciales legacy no fue migrada al backend canónico. Las cuentas Auth actuales son técnicas DEV. No crear Gmail nuevo ni pedir a Paula que adopte esas cuentas.

Contrato objetivo: `Usuario + Contraseña` visible, Firebase Auth detrás de adapter, recuperación por export/import controlado de la fuente legacy, sin conectar la base vieja y sin exponer credenciales.

## 8. Gate vivo único
`EXPORT CREDENCIALES LEGACY CONTROLADO → INVENTARIO/HASH-TYPE → PLAN AUTH IMPORT IDEMPOTENTE → AUTORIZACIÓN ÚNICA → IMPORT/READBACK → LOGIN USUARIO+CONTRASEÑA → SMOKE → FREEZE CORTE6`.

Después:
`REFRESH HR → RESOLVER HOLD AGOSTO HN → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER`.

## 9. Claude / Academia
- Claude: no nueva candidata. Corrección focalizada de login/registro para preservar Usuario+Contraseña con Auth real detrás.
- Academia: usuario ≠ email obligatorio; Auth real, recuperación, scopes tenant/proyecto/rol, mínimo privilegio.

## 10. Estado seguro
R17N histórico: 1,406 Firestore data writes. Corte6: Auth claim writes5 ya autorizados; usuarios nuevos0; password changes0; Firestore data writes0; Rules release1; Hosting DEV1/1; inventario credential-continuity read-only provider writes0; Storage/HR/legacy0; pagos/Make/Gemini0; merge=false; producción=false; credenciales crudas repo/artifacts0.
