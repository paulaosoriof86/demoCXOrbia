# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-14 13:24 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_RECOVERY_PASS__ADMIN_LOGIN_POINTER_STOP_RETRY__SAME_CANDIDATE__GO_LIVE_35`

## Decisión vigente

No nueva candidata, rama ni PR. I1/I2 permanecen cerradas. I3 se reanuda focalizadamente dentro de la misma candidata.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.

Último I3 lock: `app/docs/SOURCE-LOCK-ITERATION3-STOP-RETRY-POST-CREDENTIAL-RECOVERY-ADMIN-LOGIN-POINTER-20260814.md`.

**35% completado / 65% pendiente.**

## Cerrado y NO REPROCESAR

- Exact Write V2 / Admin principal / Staff membership.
- Firebase Auth owner y namespaces.
- exact identity; cero similarity matching.
- HR live/protected overlay + cumulative read model.
- I1 source contracts.
- I2 `CX.data` command boundary, no local fallback, provider ACK, shopper store provider-only, Mis Visitas arrays/facets/ACK y firewall fail-closed.
- I3 HTTP transport, Shopper membership wiring, provider, E2E y patcher ACK-aware.

## I3 — último run

Run `31833696707`, job `94875097700`.

PASS:

- exact historical Shopper candidate;
- one exact credential recovery/reset;
- UID/claims/shopperId/profile/history preservation;
- other identities modified `0`;
- exact membership/crosswalk reconciliation;
- provider/proxy startup.

STOP_RETRY posterior:

`I3_ADMIN_LOGIN_CLICK_BLOCKED_BY_CX_BACKEND_PREVIEW_STATUS_POINTER_INTERCEPTION`.

El overlay diagnóstico DEV `#cxBackendPreviewStatus` tapaba el click de `#lgSubmit`. El Shopper nuevo no llegó a crearse.

## Corrección source-only ya aplicada

`app/core/backend-preview-status.js`: overlay no interactivo mediante `pointer-events:none`, `aria-hidden=true`, `user-select:none`.

`tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs`: antes del click de login verifica que el overlay tenga `pointer-events:none`; no se usa `force:true`.

## Credencial histórica pendiente de certificación

El password temporal del recovery fue privado y eliminado al cerrar el runner. El E2E histórico quedó SKIPPED al fallar antes el paso Admin. La identidad histórica está preservada, pero su login posterior todavía no está certificado.

No existe retry automático ni se autoriza otro reset por inferencia. Un nuevo password update requiere gate nuevo expreso.

## Pendiente inmediato I3

1. endurecer source-only el orden del harness para validar login histórico inmediatamente después de una nueva credencial autorizada;
2. conservar evidencia sanitizada de ese PASS aunque falle posteriormente Admin;
3. con gate nuevo: establecer una nueva credencial exacta una sola vez;
4. certificar login histórico;
5. Admin create/update Shopper nuevo con provider ACK/readback;
6. Shopper nuevo login + reload/new-tab/segundo contexto;
7. cerrar I3 solo si todo pasa; entonces GO-LIVE sube a 60%.

## Seguridad último run

- historical password update/reset: `1` exacto;
- otras identidades: `0`;
- Shopper nuevo: `NO`;
- HR/Rules/Storage/Make/Gemini/pagos: `0`;
- deploy `0`; merge/producción false;
- segundo intento automático: `NO`.

## Reusable CXOrbia / no-code

Mantener tenantId/projectId, provider adapters, RBAC, idempotencia, expectedVersion, audit, ACK y exact identity. Cinépolis es configuración, no arquitectura global.

## Academia

No declarar login/alta Shopper real como activo hasta cerrar I3. Mis Visitas multi-registro sí permanece cerrado desde I2.

## Pendiente frontend heredado no bloqueante

`app/modules/cliente-extra.js`: PDF/XLSX/PPTX, fuera del blocker actual salvo evidencia nueva.
