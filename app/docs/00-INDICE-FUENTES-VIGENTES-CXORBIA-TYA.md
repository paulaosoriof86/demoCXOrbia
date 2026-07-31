# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_STABLE_COMPOSER_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_CUMULATIVE_VISUAL__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- Backend DEV `cxorbia-backend-dev`; Hosting DEV site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final `tya-plataforma`; no tocar sin gate de producción.

## 2. Lectura obligatoria vigente
1. este índice;
2. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md` o maestro vigente;
3. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
4. addendum maestro de Academia profunda/interactiva vigente;
5. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`;
6. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`;
7. `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md` — prevalece para toda transición futura;
8. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
9. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
10. `CAMBIOS-BACKEND-ADDENDUM-C6-STABLE-COMPOSER-ROOT-FIX-20260731.md`;
11. `CAMBIOS-BACKEND-ADDENDUM-C6-STABLE-COMPOSER-HOSTING-DEV-REMOTE-PASS-20260731.md`;
12. `evidence/CORTE6-STABLE-COMPOSER-REGRESSION-GATE-LATEST.json`;
13. `evidence/CORTE6-STABLE-CUMULATIVE-HUMAN-VISUAL-HOSTING-LATEST.json`;
14. `ACADEMIA-IMPACTO-C6-STABLE-COMPOSER-ROOT-FIX-20260731.md`;
15. `app/adapters/tya-cumulative-read-model.js`;
16. `app/adapters/tya-dev-full-visual-bridge.js`;
17. `app/adapters/tya-live-source-refresh-watch.js`;
18. `tools/qa/tya-cumulative-read-model-regression-gate.mjs`;
19. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker, PR#7 y HEAD vivo.

Los addenda anteriores de Corte6 permanecen como evidencia histórica; el checkpoint vigente manda para estado operativo actual.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N1,406/1,406;616 visitas +572 liquidaciones +77 certificaciones.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS, mismatches0.
- Finanzas/pagos canónicos source-safe preservados.

## 4. Regresión C6 y causa raíz
Visual reproducida antes del fix:88→44 visitas, badge1,232/546, scroll movido, duplicados Shopper, perfil/histórico fragmentado y comparativo incompleto.

HR read-only verificada:30 tabs/28 mensuales, sin agosto 2026, julio=34 GT+10 HN. La causa fue un overlay no idempotente que reutilizaba arrays ya compuestos y podía anexar visitas Firestore sobre HR.

## 5. Root fix vigente
El composer estable:
- usa HR inmutable por `sourceRevision`;
- no agrega protected visits;
- empata solo por evidencia técnica exacta;
- crea crosswalk Shopper técnico;
- preserva estados HR;
- deja perfil/credenciales como overlay;
- watcher no recompone si la revisión no cambió y preserva contexto visual cuando cambia.

## 6. Regression gate local PASS
`PASS_C6_STABLE_COMPOSER_3X_IDEMPOTENCE`:
- tres reaplicaciones =616 visitas/208 shoppers;
- duplicateVisitKeys0;
- duplicateShopperIds0;
- protectedVisitsAppended0;
- estado HR e identidad estable.

## 7. Hosting DEV + remote smoke — PASS
Autorización fresca `chat-20260731-c6-stable-cumulative-hosting-02` consumida correctamente.

Se ejecutó exactamente1 redeploy del Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`; Cloud Run0.

Decisión remota: `PASS_EXISTING_HOSTING_DEV_STABLE_C6_REMOTE_READY`.

Confirmado remotamente:
- composer/bridge/watcher/finance publicados exactamente como repo;
- 3x regression gate PASS sobre composer remoto;
- HR `fresh=1` preservada, 616 histórico y auto-month activo;
- protectedVisitAppendZero;
- full-profile fail-closed sin sesión visual;
- credenciales Firebase humanas no requeridas.

## 8. Lock de estabilidad permanente
Ningún bloque, candidata, overlay o etapa puede avanzar si no conserva simultáneamente HR, histórico, identidades, perfiles, portal Shopper, Beneficios, Finanzas y cortes previos.

## 9. 31 identity HOLD
Persisten31 perfiles sin vínculo canónico reproducible. No dedupe por nombre/teléfono/email ni creación silenciosa.

## 10. Gate vivo
El root fix YA está publicado en Hosting DEV y pasó remote smoke. La autorización de deploy está consumida y no puede reutilizarse.

Siguiente gate: validación humana acumulativa del mismo Hosting DEV con 3 refresh/focus cycles y revisión Dashboard/HR, Shoppers/perfil/credenciales/histórico, comparativo, Beneficios y Finanzas.

Solo PASS humano habilita `FREEZE C6 → AGOSTO`.

## 11. Estado seguro
En este bloque: Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0; Cloud Run0; Hosting1 autorizado y consumido; nuevos Firebase/Hosting0; merge=false; producción=false.
