# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_LIVE_HR_AUTOMONTH_AND_SHOPPER_DISPLAY_DEV_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV: `cxorbia-backend-dev`.
- Hosting DEV: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar sin gate de producción.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CAMBIOS-BACKEND-ADDENDUM-C6-LIVE-HR-SHOPPER-DISPLAY-DEV-PASS-20260731.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-CORRECCION-LECTURA-ABIERTA-HR-20260731.md`;
7. `ACADEMIA-IMPACTO-HR-LIVE-AUTOMONTH-PLATFORM-ORIGIN-20260731.md`;
8. `evidence/CORTE6-LIVE-HR-SHOPPER-DISPLAY-DEV-DEPLOY-LATEST.json`;
9. `evidence/LIVE-HR-PROVIDER-CAPABILITY-PREFLIGHT-LATEST.json`;
10. `backend/runtime/hr-live-service/server.mjs`;
11. `tools/hr-source/tya-live-provider-registry-identity-dev.mjs`;
12. `tools/hr-source/tya-enforce-live-tab-registry.mjs`;
13. `app/adapters/tya-live-source-inplace-apply.js`;
14. `app/adapters/tya-live-source-refresh-watch.js`;
15. `app/index-backend-dev.html`;
16. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A y PR #7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN.
- R17N FINAL 1,406/1,406; 616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 CX.data: cinepolis,14 periodos,616 visitas,currentPeriod `2026-07`,Firestore/fallback=false PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar.
- Firestore protegido: shoppers340/340 y visitas616/616 con nombre real; placeholders0.

## 4. Corte 6 DEV — PASS técnico remoto
Autorización one-shot `chat-20260731-c6-live-hr-shopper-display-dev-redeploy-01`: **consumida**.

- Cloud Run executions: `1`; revisión `cxorbia-live-hr-dev-00008-8mf`.
- Hosting executions: `1`; version `sites/cxorbia-backend-dev/versions/22e81c2b783f697a`; release `sites/cxorbia-backend-dev/releases/1785467713768000`.
- Decisión: `PASS_C6_LIVE_HR_AUTOMONTH_AND_SHOPPER_DISPLAY_DEV`.

## 5. HR viva / auto-month
- HR abierta/read-only es válida.
- Sheets API y lectura canónica: PASS.
- Remote: 14 periodos / 616 visitas / último `2026-07`.
- `tabRegistryAutoDiscovery=true`.
- `tabRegistryMode=live_provider_metadata_auto_refresh`.
- Una pestaña mensual nueva válida debe incorporarse automáticamente sin configuración mensual por chat.

## 6. Shopper para validación DEV
Human preview conserva auto-entry y `humanCredentialPrompt=false`.

Vista operacional DEV mínima:
- `208` identidades operativas detectadas;
- nombre operativo + shopperId + país/métricas;
- contacto, correo, DPI, banco, credenciales y observaciones privadas continúan excluidos.

El endpoint source-safe normal sigue enmascarado. No copiar PII sensible al repo.

## 7. Julio/agosto
Julio puede seguir ejecutándose mientras agosto existe como platform-origin antes de HR. HR aún no tiene tabs agosto. El source-of-truth exacto de las visitas agosto se conecta antes de cualquier Firestore delta; no clonar julio.

## 8. Gate vivo único
`HUMAN VISUAL ADMIN: NOMBRES SHOPPER + SHOPPER ROLE PICKER/MÓDULOS`.

Si PASS: `FREEZE CORTE 6 → FUENTE EXACTA AGOSTO PLATFORM-ORIGIN → DELTA-ONLY AUTORIZADO → READBACK/SMOKE → PREPROD/CUTOVER`.

## 9. Estado seguro
Producción no tocada. PR#7 draft/open/no merge. Firestore/HR/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; proyectos/Hosting nuevos0. Autorización de redeploy consumida; no reutilizar.
