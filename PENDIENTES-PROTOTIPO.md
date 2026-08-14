# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-14 13:24 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_RECOVERY_PASS__POINTER_ROOT_FIXED__HARNESS_DURABILITY_PASS__SAME_CANDIDATE__GO_LIVE_35`

## Decisión vigente

No nueva candidata, rama ni PR. I1/I2 cerradas. I3 se termina en la misma candidata.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.

Locks I3 vigentes:
- `app/docs/SOURCE-LOCK-ITERATION3-STOP-RETRY-POST-CREDENTIAL-RECOVERY-ADMIN-LOGIN-POINTER-20260814.md`;
- `app/docs/SOURCE-LOCK-ITERATION3-HARNESS-DURABILITY-PASS-20260814.md`.

**35% completado / 65% pendiente.**

## Cerrado y NO REPROCESAR

- Auth owner / exact identity / Staff membership.
- I1.
- I2: command boundary, provider ACK, no local fallback, Mis Visitas arrays/facets/ACK.
- I3 source: transport, Shopper membership wiring, provider, E2E y patcher ACK-aware.
- Root cause del overlay DEV que bloqueó Admin: corregida con `pointer-events:none`; E2E lo valida con click real.
- Harness durability: histórico se prueba inmediatamente después de recovery y su checkpoint sanitizado puede sobrevivir a un fallo posterior.

## Último provider run

`31833696707` / `94875097700`.

PASS: one exact historical recovery/reset, identity preservation, other identities 0, membership/crosswalk reconciliation.

STOP_RETRY posterior: overlay DEV interceptó `#lgSubmit`; Shopper nuevo no se creó. Request consumido/parked, no retry.

## Pendiente I3 real

La contraseña temporal del recovery anterior fue destruida en cleanup antes de que se ejecutara el login histórico; no está expuesta ni disponible. Se requiere gate nuevo expreso para un único reset adicional del mismo UID exacto.

Después, el harness ya endurecido debe cerrar en este orden:

1. exact recovery;
2. historical Shopper login/history + Academia/Certificación real;
3. checkpoint sanitizado;
4. Admin create/update Shopper nuevo con provider ACK/readback;
5. Shopper nuevo login + reload/new-tab/segundo contexto.

Si el histórico pasa y algo posterior falla, no repetir histórico/recovery: continuar desde el checkpoint preservado.

## Seguridad

Desde el STOP_RETRY: solo source/docs, cero provider writes. No HR/Rules/Storage/Make/Gemini/pagos, deploy, merge ni producción.

## Reusable CXOrbia / no-code

Mantener tenant/project config, exact identity, RBAC, idempotencia, expectedVersion, audit, ACK y providers detrás de adapters. Cinépolis sigue configuración, no hardcode global.

## Academia

No declarar alta/login Shopper real como activo hasta I3 PASS. Mis Visitas multi-registro sí permanece cerrado desde I2.

## Pendiente heredado no bloqueante

`app/modules/cliente-extra.js`: PDF/XLSX/PPTX, fuera del blocker actual salvo evidencia nueva.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_DURABLE_HISTORICAL_LOGIN_AND_ADMIN_NEW_SHOPPER_RESUME`.
