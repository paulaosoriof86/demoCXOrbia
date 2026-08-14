# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-14 12:15 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__ITERATION_2_CANONICAL_PERSISTENCE_PASS__ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE_STOP_RETRY_CREDENTIAL_H0_S0__GO_LIVE_35__PAULA_REVIEW_REQUIRED`

## 1. Lectura obligatoria y prevalente

1. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`
2. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
3. `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`
4. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`
5. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`
6. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
7. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
8. `AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`
9. `ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`
10. `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`
11. `SOURCE-LOCK-ITERATION3-STOP-RETRY-HISTORICAL-SHOPPER-CREDENTIAL-20260814.md`
12. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
13. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, PR #7 y HEAD vivo.

## 2. Decisión vigente

`ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION` e `ITERATION_2_CANONICAL_PERSISTENCE_PASS` están cerradas y no se reprocesan.

`ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE` está en STOP_RETRY focalizado, no en PASS. Toda continuidad permanece en `docs-tya-v6-v71-audit` / PR #7. No nueva candidata, rama, PR, Auth rebuild ni reauditoría general.

## 3. I3 — STOP_RETRY focalizado

Run `31826443230`, job `94851603411`.

Blocker reproducible:

`HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194`.

Existe una identidad Shopper histórica exacta con claims, perfil e historia protegida. El bloqueo no es identidad ni fuzzy matching: la contraseña plaintext necesaria para certificar el login humano no es reconstruible desde las fuentes aprobadas retenidas. La importación histórica Auth conservó el hash SHA256 en Firebase, no el password plano.

I3 provider writes: Auth `0`, Firestore `0`; password changes/resets `0`; Shopper nuevo `NO`; HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción `0`/false.

El provider lane quedó PARKED y no se hizo segundo intento automático.

## 4. Source I3 que se preserva

No rehacer: command HTTP transport, Shopper membership wiring, Shopper command provider, E2E I3, source patcher y patch ACK-aware preparado para `modules/shoppers.js`/entrypoint. Se reutilizan Auth, exact identity, command boundary y todos los cierres I1/I2.

## 5. Porcentaje vigente

**GO-LIVE: 35% completado / 65% pendiente.**

I1 15 PASS / I2 20 PASS / I3 25 STOP_RETRY / I4 25 pendiente / I5 15 pendiente.

I3 no suma porcentaje hasta cerrar su gate real.

## 6. Siguiente acción exacta

`PAULA_REVIEW_REQUIRED_FOR_I3_HISTORICAL_SHOPPER_CREDENTIAL_RECOVERY`

La ruta focalizada es autorizar un único recovery/reset de contraseña para el único principal Shopper histórico exacto ya resuelto, preservando uid/claims/shopperId/profile/history y cero fuzzy matching; después reanudar la misma I3 desde el punto bloqueado, no desde cero.

## 7. Gates

No provider retry sin nueva autorización de Paula. HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción permanecen bloqueados.
