# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-14 12:05 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_STOP_RETRY_HISTORICAL_CREDENTIAL_H0_S0__SAME_CANDIDATE__GO_LIVE_35`

## Decisión vigente

No nueva candidata, rama ni PR. I1/I2 permanecen cerradas y no se reprocesan. I3 fue ejecutada una vez hasta provider-read y se detuvo fail-closed antes de writes.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.

I3 lock: `app/docs/SOURCE-LOCK-ITERATION3-STOP-RETRY-HISTORICAL-SHOPPER-CREDENTIAL-20260814.md`.

**35% completado / 65% pendiente.**

## Cerrado y NO REPROCESAR

- Exact Write V2 / Admin principal / Staff membership.
- Firebase Auth owner y namespaces.
- exact identity; cero similarity matching.
- HR live/protected overlay + cumulative read model.
- I1 source contracts.
- I2 `CX.data` canonical command boundary, no local fallback, provider ACK, shopper store provider-only, Mis Visitas arrays/facets/ACK y firewall fail-closed.
- Source I3 preparado: HTTP command transport, Shopper membership wiring, Shopper provider, E2E y patcher ACK-aware.

## I3 — STOP_RETRY actual

Run `31826443230`, job `94851603411`.

Blocker:

`HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194`.

Se confirmó una identidad Shopper histórica exacta con claims/perfil/historia (`V1/D1`) y 616 visitas exactas. No existe una contraseña plaintext reconstruible desde las fuentes aprobadas para certificar el login (`H0/S0`).

La importación Auth histórica usó password hash SHA256 con `importUsers`; el password plano no quedó almacenado en repo/evidencia. No reconstruir Auth ni escoger otro Shopper por similitud.

## Writes I3 realmente ejecutados

- Auth: `0`
- Firestore: `0`
- password changes/resets: `0`
- deletes: `0`
- identidades existentes modificadas: `0`
- Shopper nuevo creado: `NO`
- HR/Rules/Storage/Make/Gemini/pagos: `0`
- deploy: `0`
- merge/producción: `false`

No hubo segundo intento automático. El provider lane está PARKED.

## Pendiente inmediato

`PAULA_REVIEW_REQUIRED_FOR_I3_HISTORICAL_SHOPPER_CREDENTIAL_RECOVERY`

Ruta focalizada recomendada:

1. autorizar un único recovery/reset de password exclusivamente para el único Shopper histórico exacto ya resuelto;
2. mantener el mismo uid, claims, shopperId, profile, membership e historia;
3. generar la credencial temporal/operativa solo en boundary privado, sin repo/browser logs;
4. reanudar la misma I3 desde el punto bloqueado;
5. certificar login histórico, Admin create/update Shopper nuevo, provider readback, login nuevo, reload/new-tab y segundo contexto;
6. cerrar I3 solo si todo pasa; entonces GO-LIVE sube a 60%.

No se reinicia I3 y no se repiten I1/I2.

## Flujos restantes después de I3

I4: HR bidireccional + Phase A E2E + Finance, incluidos Postulaciones complejas, cuestionario/evidencias/Reservas/sync según provider/gate.

I5: exact build + preprod + go-live.

## Reusable CXOrbia / no-code

Mantener tenantId/projectId, source adapters, RBAC, idempotencia, expectedVersion, audit, ACK y protected-data boundary. Cinépolis es configuración, no arquitectura global.

## Academia

No declarar login/alta Shopper real como activo hasta cerrar I3. Mis Visitas multi-registro sí permanece cerrado en source desde I2.

## Pendiente frontend heredado no bloqueante

`app/modules/cliente-extra.js`: PDF/XLSX/PPTX, fuera del blocker forense actual salvo evidencia nueva.
