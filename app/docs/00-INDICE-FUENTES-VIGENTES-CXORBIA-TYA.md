# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-31  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_P0_COMPOSITION_REGRESSION__PERMANENT_STABILITY_LOCK_ACTIVE__NO_DEPLOY__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- Backend DEV `cxorbia-backend-dev`; Hosting DEV site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final `tya-plataforma`; no tocar sin gate de producción.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes;
3. `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md` **prevalece para toda transición futura**;
4. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
5. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-CUMULATIVE-HOSTING-DEPLOY-PASS-20260731.md` como evidencia histórica del deploy previo;
7. `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-VISUAL-CUMULATIVE-ROOT-FIX-20260731.md`;
8. `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-VISUAL-NO-CREDENTIALS-ROOT-FIX-20260731.md`;
9. `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-FULL-VISUAL-REDEPLOY-PASS-20260731.md`;
10. `evidence/CORTE6-PROFILE-FULL-FIRESTORE-WRITE-LATEST.json`;
11. `evidence/CORTE6-HUMAN-FULL-VISUAL-REDEPLOY-LATEST.json`;
12. `evidence/CORTE6-CUMULATIVE-HUMAN-VISUAL-HOSTING-LATEST.json`;
13. `app/adapters/tya-dev-full-visual-bridge.js`;
14. `app/adapters/tya-live-source-inplace-apply.js`;
15. `app/adapters/tya-live-source-refresh-watch.js`;
16. `app/adapters/tya-financial-canonical-source-safe-adapter.js`;
17. root `RESUMEN-PARA-CLAUDE.md`, root `PENDIENTES-PROTOTIPO.md`, tracker/plan Phase A, Academia y PR#7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N 1,406/1,406; 616 visitas + 572 liquidaciones + 77 certificaciones.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo:120 Firestore docs/329 campos WRITE+READBACK PASS, mismatches0.
- Fuente financiera/pagos canónica source-safe previamente aprobada: preservar.

## 4. Human visual acumulativa — P0 reproducido
La validación humana posterior al deploy acumulativo NO congela Corte6. Se observaron regresiones estructurales:
- primer render JUL con 88 visitas y posterior estabilización en44;
- badge llegó a 1,232 visitas y546 shoppers;
- scroll/pantalla se mueve al refrescar;
- shoppers repetidos y perfil/histórico dividido;
- username/password/PII no asociados consistentemente;
- comparativo histórico incompleto;
- estados cambian entre primer render y refresh.

La HR viva sí responde; el problema es la composición/reaplicación del estado en browser.

## 5. Causa raíz confirmada
`tya-dev-full-visual-bridge.js` toma `CX.data.shoppers`, `CX.data._visitas` y `CX.data._posts` actuales como base de cada reapply. Como esos arreglos ya pueden estar enriquecidos, el overlay deja de ser idempotente y puede volver a anexar historia protegida sobre HR viva.

El watcher re-aplica el overlay después de un cambio HR. La solución permanente exige baseline HR inmutable por revisión + composer idempotente + exact technical crosswalk + preservación de estado UI.

## 6. Lock de estabilidad permanente
Queda activo `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`.

Ningún bloque, candidata, overlay o etapa posterior puede avanzar si no pasa una regression suite acumulativa que conserve simultáneamente HR, histórico, identidades, perfiles, portal Shopper, Beneficios, Finanzas y cortes previos.

## 7. Estado HR canónico verificado hoy
La HR canónica sigue siendo el archivo de30 tabs /28 mensuales, sin agosto 2026. `JULIO 26` contiene34 filas operativas y `JULIO 26 HN`10. La lectura actual muestra 44 visitas del periodo; cualquier conteo 88/1232 es duplicación de composición, no verdad de fuente.

## 8. 31 identity HOLD
Persisten31 perfiles sin vínculo canónico reproducible. No dedupe por nombre/teléfono/email ni creación silenciosa.

## 9. Gate vivo
`ROOT FIX IDEMPOTENTE + CROSSWALK TÉCNICO + PRESERVACIÓN UI STATE → REGRESSION GATE 3x REAPPLY + HISTÓRICO + SHOPPER + BENEFICIOS + FINANZAS → SOLO SI PASS: 1x DEV DEPLOY → HUMAN VISUAL → FREEZE C6 → AGOSTO`.

## 10. Estado seguro
No se autoriza ni ejecuta en este lock: Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes, Cloud Run/Hosting deploy, nuevos Firebase/Hosting, merge o producción.
