# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_STABLE_COMPOSER_CODE_PASS__LOCAL_REGRESSION_3X_PASS__PENDING_ONE_HOSTING_DEV_AUTH__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- Backend DEV `cxorbia-backend-dev`; Hosting DEV site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final `tya-plataforma`; no tocar sin gate de producción.

## 2. Lectura obligatoria vigente
1. este índice;
2. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`;
3. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
4. `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`;
5. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`;
6. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`;
7. `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md` — prevalece para toda transición futura;
8. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
9. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
10. `CAMBIOS-BACKEND-ADDENDUM-C6-STABLE-COMPOSER-ROOT-FIX-20260731.md`;
11. `evidence/CORTE6-STABLE-COMPOSER-REGRESSION-GATE-LATEST.json`;
12. `ACADEMIA-IMPACTO-C6-STABLE-COMPOSER-ROOT-FIX-20260731.md`;
13. `app/adapters/tya-cumulative-read-model.js`;
14. `app/adapters/tya-dev-full-visual-bridge.js`;
15. `app/adapters/tya-live-source-refresh-watch.js`;
16. `tools/qa/tya-cumulative-read-model-regression-gate.mjs`;
17. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker, PR#7 y HEAD vivo.

Los addenda anteriores de Corte6 permanecen como evidencia histórica; el checkpoint vigente manda para estado operativo actual.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N1,406/1,406;616 visitas +572 liquidaciones +77 certificaciones.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS, mismatches0.
- Finanzas/pagos canónicos source-safe preservados.

## 4. Regresión C6 y causa raíz
Visual reproducida:88→44 visitas, badge1,232/546, scroll movido, duplicados Shopper, perfil/histórico fragmentado y comparativo incompleto.

HR read-only verificada:30 tabs/28 mensuales, sin agosto 2026, julio=34 GT+10 HN. La causa fue un overlay no idempotente que reutilizaba arrays ya compuestos y podía anexar visitas Firestore sobre HR.

## 5. Root fix vigente
El nuevo composer:
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

La evidencia aclara que fue ejecución local de los mismos sources; no existe CI remoto ejecutado para este commit.

## 7. Lock de estabilidad permanente
Ningún bloque, candidata, overlay o etapa puede avanzar si no conserva simultáneamente HR, histórico, identidades, perfiles, portal Shopper, Beneficios, Finanzas y cortes previos.

## 8. 31 identity HOLD
Persisten31 perfiles sin vínculo canónico reproducible. No dedupe por nombre/teléfono/email ni creación silenciosa.

## 9. Gate vivo
El código está en GitHub, todavía no en Hosting DEV. La autorización Hosting anterior fue consumida.

Siguiente operación requiere autorización fresca para exactamente:
`1x redeploy del Hosting DEV existente cxorbia-backend-dev/cxorbia-dev`.

Cloud Run0. Después remote smoke + human visual3x refresh + validación completa. Solo PASS habilita freeze C6 y agosto.

## 10. Estado seguro
En el bloque actual: Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0; Cloud Run0; Hosting0; nuevos Firebase/Hosting0; merge=false; producción=false.
