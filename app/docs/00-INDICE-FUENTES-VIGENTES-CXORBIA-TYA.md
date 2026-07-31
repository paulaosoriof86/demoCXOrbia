# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_HUMAN_VISUAL_FAIL_PARTIAL__CUMULATIVE_HR_PROFILE_FINANCE_FIX_PREPARED__HOSTING_GATE_WAITING_AUTH__31_HOLD__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- Backend DEV `cxorbia-backend-dev`; Hosting DEV site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final `tya-plataforma`; no tocar sin gate de producción.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-VISUAL-CUMULATIVE-ROOT-FIX-20260731.md` **prevalece para el gate actual**;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-VISUAL-NO-CREDENTIALS-ROOT-FIX-20260731.md`;
7. `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-FULL-VISUAL-REDEPLOY-PASS-20260731.md`;
8. `evidence/CORTE6-PROFILE-FULL-FIRESTORE-WRITE-LATEST.json`;
9. `evidence/CORTE6-HUMAN-FULL-VISUAL-REDEPLOY-LATEST.json`;
10. `backend/config/corte6-cumulative-human-visual-hosting-request.json`;
11. `app/adapters/tya-dev-full-visual-bridge.js`;
12. `app/adapters/tya-live-source-refresh-watch.js`;
13. `app/adapters/tya-financial-canonical-source-safe-adapter.js`;
14. `.github/workflows/cxorbia-corte6-cumulative-human-visual-hosting.yml`;
15. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A, Academia y PR#7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N 1,406/1,406; 616 visitas + 572 liquidaciones + 77 certificaciones.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo:120 Firestore docs/329 campos WRITE+READBACK PASS, mismatches0.
- Fuente financiera/pagos canónica source-safe previamente aprobada: preservar.

## 4. Human visual sin credenciales — acceso PASS, composición acumulativa FAIL
El gate sin credenciales resolvió el reproceso de login: auto-entry Admin y picker Shopper real funcionan. La validación humana posterior detectó un P0 distinto: la capa full visual reemplazaba fuentes aprobadas en vez de componerlas.

Evidencia visual:
- Dashboard JUL 2026 mostraba 0 visitas aunque el runtime conserva 616;
- watcher HR viva/auto-refresh estaba deshabilitado en `cxHumanFullVisual`;
- lista Shopper mezclaba perfiles reales con fixtures, aliases legacy y referencias técnicas;
- perfiles correctos podían mostrar campos/credenciales/histórico incompletos;
- Beneficios y Finanzas aparecían vacíos por la misma ruptura de contexto de periodo/visitas.

## 5. Fix acumulativo preparado — todavía NO desplegado
En rama viva, sin provider mutation:
- HR viva vuelve a ser la base de periodos/visitas/auto-mes;
- Firestore protegido se superpone por identidad técnica exacta `id/shopperId/legacyShopperId`;
- nunca dedupe por nombre/teléfono/email;
- aliases legacy se suprimen solo cuando existe vínculo exacto `legacyShopperId`;
- fixtures demo y referencias técnicas sin identidad operacional no se agregan como personas nuevas;
- histórico protegido se superpone por `visitId` exacto preservando `projectId/periodId` de HR;
- finanzas/pagos canónicos permanecen como autoridad para Finanzas/Beneficios;
- watcher HR `fresh=1`/poll/focus vuelve a estar activo en human full visual y reaplica el overlay después de cada refresh;
- `/app/modules/*` intacto.

Request `backend/config/corte6-cumulative-human-visual-hosting-request.json`: preparado, `enabled=false`, `consumed=false`, sin autorización.

## 6. Gate vivo
`AUTORIZACIÓN 1x HOSTING DEV EXISTENTE → STATIC + PROVIDER READ-ONLY PREFLIGHT → DEPLOY → REMOTE CUMULATIVE SMOKE → HUMAN VISUAL ÚNICA HR+SHOPPER+BENEFICIOS+FINANZAS → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

No se requiere Cloud Run nuevo: `cxorbia-live-hr-dev-00009-xs8` ya tiene endpoint full-profile PASS.

## 7. 31 identity HOLD
Persisten31 perfiles sin vínculo canónico reproducible. No dedupe por nombre/teléfono/email ni creación silenciosa.

## 8. Estado seguro
Desde la visual fallida no se ejecutó otro provider mutation: Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0; Cloud Run deploys0; Hosting deploys0; no merge; producción no tocada.
