# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE6_AUTH_RBAC_RULES_PASS__HOSTING_DEV_REDEPLOY1OF1_VERIFIED_DIRECT_ENTRYPOINT__WAITING_HUMAN_AUTH_VISUAL__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Hosting DEV existente: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- URL visual DEV canónico: `https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis`.
- Hosting público final: `tya-plataforma`; no tocar todavía.
- Sandbox C4: no destino.
- No crear nuevo Firebase, Hosting, rama, PR o candidata por rutina.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes de empalme/carril, Academia, patrones y antidesvío;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CORTE6-AUTH-RBAC-HOSTING-DEV-PASS-PENDING-HUMAN-VISUAL-20260730.md`;
6. `CAMBIOS-BACKEND.md`;
7. `RESUMEN-PARA-CLAUDE.md`;
8. `PENDIENTES-PROTOTIPO.md`;
9. `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
10. `ACADEMIA-IMPACTO-CORTE6-AUTH-RBAC-20260730.md`;
11. `evidence/CORTE6-AUTH-CLAIMS-NORMALIZATION-LATEST.json`;
12. `evidence/CORTE6-AUTH-RBAC-READONLY-RECONCILIATION-LATEST.json` + `.md`;
13. `evidence/CORTE6-FIRESTORE-RULES-DEPLOY-LATEST.json`;
14. `evidence/CORTE6-HOSTING-IAM-DIAGNOSTIC-LATEST.json`;
15. `evidence/CORTE6-HOSTING-DEV-DEPLOY-LATEST.json`;
16. `backend/config/phase-a-hosting-dev-execution-request-v1.json`;
17. `evidence/R17N-FINAL-DEV-MATERIALIZATION-LATEST.json`;
18. `evidence/R17N-POST-MATERIALIZATION-READONLY-SMOKE-LATEST.json` + `.md`;
19. `evidence/CURRENT-HR-THROUGH-JULY-SOURCE-SAFE-LATEST.json`;
20. PR #7 y HEAD vivo.

## 3. Baseline no reabrir
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL: 1,406/1,406 Firestore data writes y 1,406/1,406 readback; mismatch 0.
- Materializado: 616 visitas, 572 controles de liquidación, 77 certificaciones y perfiles canónicos previstos.
- Corte 5 `CX.data`: proyecto padre `cinepolis`; 14 periodos; 616 visitas; `currentPeriodId=2026-07`; source=firestore; fallback=false.
- No repetir materialización ni reabrir snapshots históricos superados.

## 4. Fuente real vigente
- HR hasta julio 2026: 14 periodos / 616 visitas / 208 refs shopper.
- 208/208 refs listas →194 perfiles canónicos únicos.
- 77 certificaciones materializadas.
- 572 controles de liquidación.
- Agosto HN continúa HOLD por inconsistencia país/tab.

## 5. Corte 6 Auth/RBAC — PASS
Autorización consumida: máximo 5 claims Auth + deploy exclusivo de Firestore Rules.

Resultado:
- 5/5 custom-claim updates sobre usuarios existentes: 2 cliente + 3 shopper con vínculo exacto;
- scopes stale `tya`/`tya-piloto` → proyecto canónico `cinepolis`;
- cuarto shopper no vinculado: no tocado;
- usuarios nuevos/password changes/deletes: 0/0/0;
- readback: operadores ready7, clientes ready2, shoppers ready3, familias requeridas PASS.

## 6. Firestore Rules — PASS
- Regla canónica reconoce `status` para visitas disponibles y mantiene compatibilidad `estado` legacy.
- Firebase CLI quedó bloqueado solo por `firebaserules.rulesets.test`.
- Deploy se ejecutó por API oficial Firebase Rules sin ampliar IAM.
- Release readback + SHA exacto: PASS.
- Firestore **data** writes Corte 6: 0.

## 7. Hosting DEV — PASS técnico, 1/1 consumido
- Se reutilizó el mismo Hosting DEV existente; nuevo Firebase/Hosting: 0/0.
- Firebase CLI quedó bloqueado por permisos API Keys Viewer que el CLI consulta.
- Diagnóstico read-only confirmó permisos Hosting core y evitó cambios IAM.
- El único redeploy autorizado se ejecutó mediante API oficial Firebase Hosting.
- Release: `sites/cxorbia-backend-dev/releases/1785431702100000`.
- Version: `sites/cxorbia-backend-dev/versions/b00728c729452665`, `FINALIZED`.
- Remote proof/config/browser-auth/entrypoint explícito: PASS.
- `/` sirve `app/index.html` por precedencia de contenido estático exacto; no bloquea. El entrypoint DEV canónico es `/index-backend-dev.html`.
- Hosting deploy: **1/1**, autorización consumida; no redeploy adicional.

## 8. Gate vivo único
`HUMAN_AUTHENTICATED_VISUAL_VALIDATION_ADMIN_OPS_CLIENT_SHOPPER`.

Validar directamente en navegador con cuentas DEV existentes; nunca pegar credenciales/tokens en conversación.

Después de PASS visual:
`FREEZE CORTE6 → REFRESH HR → RESOLVER HOLD AGOSTO HN → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER`.

## 9. Claude / Academia
- Claude: no nueva candidata. Solo tarea focalizada si la visual autenticada demuestra P0 frontend reproducible.
- Academia: Auth real vs selector de rol; scopes tenant/proyecto; `shopperId`; mínimo privilegio; Rules/Hosting CLI vs API; contenido estático exacto vs rewrite.

## 10. Estado seguro
R17N histórico: 1,406 Firestore data writes ya ejecutados. Corte 6: Auth claim writes5; usuarios nuevos0; password changes0; deletes0; Firestore data writes0; Rules release1 verificada; Hosting DEV deploy1/1; Storage/HR/legacy writes0; pagos0; Make/Gemini0; merge=false; producción=false; PII/secrets crudos repo/artifacts0.
