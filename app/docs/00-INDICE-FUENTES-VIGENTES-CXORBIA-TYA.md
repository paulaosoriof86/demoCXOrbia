# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_CUMULATIVE_HOSTING_PASS__WAITING_HUMAN_VISUAL_CUMULATIVE__31_HOLD__NO_PRODUCTION`

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
5. `CAMBIOS-BACKEND-ADDENDUM-C6-CUMULATIVE-HOSTING-DEPLOY-PASS-20260731.md` **prevalece para el gate actual**;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-VISUAL-CUMULATIVE-ROOT-FIX-20260731.md`;
7. `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-VISUAL-NO-CREDENTIALS-ROOT-FIX-20260731.md`;
8. `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-FULL-VISUAL-REDEPLOY-PASS-20260731.md`;
9. `evidence/CORTE6-PROFILE-FULL-FIRESTORE-WRITE-LATEST.json`;
10. `evidence/CORTE6-HUMAN-FULL-VISUAL-REDEPLOY-LATEST.json`;
11. `evidence/CORTE6-CUMULATIVE-HUMAN-VISUAL-HOSTING-LATEST.json`;
12. `backend/config/corte6-cumulative-human-visual-hosting-request.json`;
13. `app/adapters/tya-dev-full-visual-bridge.js`;
14. `app/adapters/tya-live-source-refresh-watch.js`;
15. `app/adapters/tya-financial-canonical-source-safe-adapter.js`;
16. `.github/workflows/cxorbia-corte6-cumulative-human-visual-hosting.yml`;
17. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A, Academia y PR#7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N 1,406/1,406; 616 visitas + 572 liquidaciones + 77 certificaciones.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo:120 Firestore docs/329 campos WRITE+READBACK PASS, mismatches0.
- Fuente financiera/pagos canónica source-safe previamente aprobada: preservar.

## 4. Human visual anterior — FAIL acumulativo reproducido
La visual previa resolvió el login humano pero rompió composición: Dashboard JUL en0, watcher HR deshabilitado, listado Shopper contaminado por aliases/fixtures, perfiles parciales y Beneficios/Finanzas vacíos. Causa raíz: replace de `CX.data` + desalineación de period IDs + watcher desactivado.

## 5. Fix acumulativo — DESPLEGADO PASS
Autorización `chat-20260731-c6-cumulative-human-visual-hosting-01` consumida PASS.

Ejecutado exactamente:
- Hosting DEV redeploys: **1** sobre `cxorbia-backend-dev/cxorbia-dev`;
- Cloud Run redeploys: **0**;
- decisión `PASS_EXISTING_HOSTING_DEV_CUMULATIVE_HR_PROFILE_FINANCE_REMOTE_READY`.

Remote smoke confirmó:
- HR `fresh=1`/runtimeRead/sourceSafe activo;
- 616 visitas preservadas;
- auto-descubrimiento mensual activo;
- overlay protegido de perfil/histórico publicado;
- supresión de alias solo por identidad legacy exacta;
- asset financiero canónico preservado;
- full-profile sigue fail-closed401 sin sesión visual;
- credenciales Firebase humanas no requeridas.

El primer disparo del gate falló antes de provider mutation por un grep literal frágil; `hostingDeployExecutions` quedó0. Se corrigió el gate a un marcador semántico real y se reejecutó la misma autorización todavía no consumida. No hubo deploy duplicado.

## 6. Gate vivo
`UNA SOLA HUMAN VISUAL ACUMULATIVA → Dashboard HR/auto-mes → Shoppers identidad/perfil/credenciales/histórico → portal Shopper → Beneficios → Finanzas Admin → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

La sesión visual existente expira `2026-08-02T00:29:13Z`; no requiere otro Cloud Run ni otro Hosting para esta validación.

## 7. 31 identity HOLD
Persisten31 perfiles sin vínculo canónico reproducible. No dedupe por nombre/teléfono/email ni creación silenciosa.

## 8. Estado seguro
Durante este gate: Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0; Cloud Run deploys0; Hosting deploys1 autorizado; nuevos Firebase/Hosting0; PR#7 draft/open/no merge; producción no tocada.
