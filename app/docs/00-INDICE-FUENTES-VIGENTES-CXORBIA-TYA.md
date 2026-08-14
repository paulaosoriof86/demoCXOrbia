# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-14 13:24 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_RECOVERY_PASS__ADMIN_POINTER_ROOT_FIXED__HARNESS_DURABILITY_PASS__GO_LIVE_35__PROVIDER_GATE_REQUIRED`

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
11. `SOURCE-LOCK-ITERATION3-STOP-RETRY-POST-CREDENTIAL-RECOVERY-ADMIN-LOGIN-POINTER-20260814.md`
12. `SOURCE-LOCK-ITERATION3-HARNESS-DURABILITY-PASS-20260814.md`
13. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
14. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, PR #7 y HEAD vivo.

## 2. Decisión vigente

I1 e I2 están cerradas y no se reprocesan. I3 continúa en la misma candidata `docs-tya-v6-v71-audit` / PR #7.

El run `31833696707` ejecutó PASS el único recovery/reset histórico autorizado y la reconciliación exacta, pero se detuvo antes del alta Shopper nuevo porque `#cxBackendPreviewStatus` interceptó el click Admin. No hubo retry automático.

## 3. Causa nueva ya corregida source-only

La causa fue `app/core/backend-preview-status.js`: panel DEV fixed/z-index alto sin `pointer-events:none`.

Ya quedó corregido sin provider retry:

- overlay no interactivo;
- E2E verifica `pointer-events:none` y no usa force-click;
- Admin/new-Shopper E2E quedó desacoplado del password histórico.

## 4. Harness durability — PASS source-only

Se corrigió el orden del workflow existente:

`exact recovery → historical Shopper real login/history E2E → sanitized checkpoint → Admin create/update → new Shopper login/reload/new-tab/second context`.

Si un paso posterior al histórico falla, el failure handler puede preservar únicamente evidencia sanitizada del subgate histórico PASS y parkear el request. Así no se pierde otra vez el progreso histórico ni se requiere repetir recovery por un fallo posterior de Admin.

Source lock: `SOURCE-LOCK-ITERATION3-HARNESS-DURABILITY-PASS-20260814.md`.

## 5. Credencial histórica del run ya consumido

La contraseña temporal del run `31833696707` fue destruida correctamente en cleanup y no fue expuesta/persistida. Como el histórico no alcanzó a probarse en ese run, su login sigue pendiente. Establecer otra contraseña requiere autorización nueva expresa sobre el mismo principal exacto.

## 6. Seguridad

Desde el STOP_RETRY hasta este cierre source-only no hubo nuevos provider writes. En el run previo hubo exactamente un password update/reset del principal histórico autorizado; otras identidades `0`; Shopper nuevo `NO`; HR/Rules/Storage/Make/Gemini/pagos `0`; deploy `0`; merge/producción false.

## 7. Porcentaje

**GO-LIVE: 35% completado / 65% pendiente.** I3 no suma sus 25 puntos hasta PASS completo.

## 8. Siguiente gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_DURABLE_HISTORICAL_LOGIN_AND_ADMIN_NEW_SHOPPER_RESUME`.

No se solicita ni autoriza nueva candidata, Auth rebuild, HR/Make/Storage/pagos, deploy, merge o producción.
