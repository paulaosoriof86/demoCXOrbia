# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-14 14:00 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_RESET2_CONSUMED__HISTORICAL_AUTH_REACHED__LEGAL_GATE_AWARE_HARNESS_PASS__SAME_CANDIDATE__GO_LIVE_35`

## Decisión vigente

No nueva candidata, rama ni PR. I1/I2 cerradas. I3 se termina en la misma candidata.

Plan rector: `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.

Locks I3 vigentes:
- `app/docs/SOURCE-LOCK-ITERATION3-STOP-RETRY-POST-CREDENTIAL-RECOVERY-ADMIN-LOGIN-POINTER-20260814.md` — histórico/cerrado;
- `app/docs/SOURCE-LOCK-ITERATION3-HARNESS-DURABILITY-PASS-20260814.md`;
- `app/docs/SOURCE-LOCK-ITERATION3-HISTORICAL-LEGAL-GATE-AWARE-HARNESS-PASS-20260814.md` — prevalente del subgate histórico.

**35% completado / 65% pendiente.**

## Cerrado y NO REPROCESAR

- Auth owner / exact identity / Staff membership.
- I1.
- I2: command boundary, provider ACK, no local fallback, Mis Visitas arrays/facets/ACK.
- I3 source: transport, Shopper membership wiring, provider, patcher ACK-aware.
- Root cause del overlay DEV: corregida.
- Harness durability: histórico antes de Admin y checkpoint sanitizado preservable.
- Harness histórico legal-gate-aware: identidad/HR/historia separadas del consentimiento legal, sin autoaceptación.

## Último provider run

`31835742956` / `94881540163`.

PASS internos:

- mismo Shopper histórico exacto;
- one exact reset autorizado;
- identity preservation;
- other identities 0;
- membership/crosswalk reconciliation;
- authenticated Shopper context;
- protected HR authority alcanzada.

STOP_RETRY: timeout esperando `#nav-aprendizaje`. Admin/new Shopper no fue ejecutado. Request `...-03` consumido/parked, sin retry.

## Causa source corregida

El E2E histórico asumía que Academia/Certificación debían existir inmediatamente después de Auth. Pero el producto puede retener `CX.router.mount()` mientras `CX.confidencialidad.pending(...)` esté activo.

El harness ahora:

1. certifica primero Auth exacto + identity + reviewQueue + HR authority + historia;
2. detecta el gate legal canónico;
3. si está pendiente, exige diálogo legal visible y difiere rutas sin autoaceptar;
4. si no está pendiente, Academia/Certificación siguen obligatorias;
5. preserva zero fuzzy / zero write APIs / no force-click.

## Pendiente I3 real

La credencial temporal del último reset volvió a ser eliminada correctamente en cleanup y no existe checkpoint histórico sanitizado. Por eso una siguiente ejecución real necesita gate expreso para un único reset adicional del mismo UID exacto.

Después debe cerrar en este orden:

1. exact recovery/reset;
2. Auth/identity/HR/history histórica real PASS con harness legal-gate-aware;
3. checkpoint sanitizado inmediato;
4. Admin create/update Shopper nuevo con provider ACK/readback;
5. Shopper nuevo login + reload/new-tab/segundo contexto;
6. si existe NDA pendiente, no autoaceptarlo; las rutas de workspace quedan para la aceptación humana legítima.

Si el checkpoint histórico llega a PASS y algo posterior falla, no repetir histórico/recovery.

## Seguridad

Después del último STOP_RETRY: solo source/docs, cero provider writes. No HR/Rules/Storage/Make/Gemini/pagos, deploy, merge ni producción.

## Reusable CXOrbia / no-code

Mantener tenant/project config, exact identity, RBAC, idempotencia, expectedVersion, audit, ACK, providers detrás de adapters y gates legales configurables separados de Auth.

## Academia

No declarar rutas Academia/Certificación PASS si están bloqueadas por NDA pendiente. No pedir a Claude que suprima o simule el consentimiento.

## Pendiente heredado no bloqueante

`app/modules/cliente-extra.js`: PDF/XLSX/PPTX, fuera del blocker actual salvo evidencia nueva.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_LEGAL_GATE_AWARE_HISTORICAL_CHECKPOINT_AND_ADMIN_NEW_SHOPPER_RESUME`.
