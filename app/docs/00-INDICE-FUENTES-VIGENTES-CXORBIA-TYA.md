# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-14 13:24 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__I1_PASS__I2_PASS__I3_CREDENTIAL_RECOVERY_PASS__ADMIN_LOGIN_POINTER_STOP_RETRY__GO_LIVE_35__PAULA_REVIEW_REQUIRED`

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
12. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
13. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, PR #7 y HEAD vivo.

## 2. Decisión vigente

I1 e I2 están cerradas y no se reprocesan. I3 continúa en la misma candidata `docs-tya-v6-v71-audit` / PR #7; no nueva candidata, rama, PR, Auth rebuild ni reauditoría general.

La autorización focalizada de Paula fue ejecutada una vez en run `31833696707`, job `94875097700`.

## 3. I3 — avance real y STOP_RETRY nuevo

PASS dentro del run:

- único principal Shopper histórico exacto resuelto;
- único credential recovery/reset autorizado ejecutado;
- UID/claims/shopperId/profile/historia preservados y otras identidades modificadas `0`;
- reconciliación exacta membership/crosswalk PASS;
- provider y proxy local PASS.

Nuevo blocker reproducible:

`I3_ADMIN_LOGIN_CLICK_BLOCKED_BY_CX_BACKEND_PREVIEW_STATUS_POINTER_INTERCEPTION`.

Playwright resolvió `#lgSubmit` visible/habilitado, pero `#cxBackendPreviewStatus` interceptó los eventos de puntero durante 30 s. El fallo ocurrió antes de crear el Shopper nuevo.

Causa source localizada en `app/core/backend-preview-status.js`: overlay DEV fixed/z-index alto sin `pointer-events:none`.

Corrección source-only ya aplicada en la misma candidata: overlay no interactivo + E2E que exige `pointer-events:none`. No se hizo provider retry.

## 4. Credencial histórica después del run

El password temporal recuperado se mantuvo únicamente en el boundary privado del runner y fue eliminado por cleanup. No fue expuesto ni persistido. Como el E2E histórico estaba después del paso Admin, quedó SKIPPED; por tanto el login histórico todavía no está certificado y la credencial temporal ya no puede recuperarse.

Cualquier nueva modificación de contraseña requiere autorización nueva expresa. El siguiente harness debe ejecutar y preservar evidencia sanitizada del login histórico inmediatamente después de establecer una credencial autorizada, antes del flujo Admin.

## 5. Seguridad

- un password update/reset exacto ejecutado sobre el único Shopper autorizado;
- otras identidades modificadas: `0`;
- reconciliación Firestore exacta PASS; conteo final no persistido, dentro de máximo 0–2 por código;
- Shopper nuevo: `NO`;
- HR/Rules/Storage/Make/Gemini/pagos: `0`;
- deploy: `0`; merge: `false`; producción: `false`;
- segundo intento automático: `NO`.

## 6. Porcentaje vigente

**GO-LIVE: 35% completado / 65% pendiente.**

I1 15 PASS / I2 20 PASS / I3 25 todavía no cerrado / I4 25 pendiente / I5 15 pendiente.

## 7. Siguiente acción exacta

`PAULA_REVIEW_REQUIRED_FOR_I3_POST_RECOVERY_LOGIN_AND_ADMIN_NEW_SHOPPER_RESUME`.

Primero se termina source-only la protección anti-repetición del harness; después, solo con gate nuevo, se reanuda I3 sin I1/I2 ni diagnóstico general.
