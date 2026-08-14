# SOURCE LOCK — ITERATION 3 HARNESS DURABILITY PASS — 2026-08-14

**Estado:** `LOCKED__I3_SOURCE_ONLY_HARNESS_DURABILITY_PASS__PROVIDER_GATE_REQUIRED`

## Propósito

Cerrar source-only la causa que desperdició la primera credencial recuperada y evitar repetirla en el próximo provider run.

## Cambios cerrados

1. `app/core/backend-preview-status.js`
   - el panel diagnóstico DEV es no interactivo: `pointer-events:none`, `aria-hidden=true`, `user-select:none`;
   - no puede bloquear login humano ni E2E.

2. `tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs`
   - valida que el overlay DEV sea no interactivo antes de click real;
   - no usa `force:true`;
   - el flujo Admin/new Shopper ya no depende de conservar la contraseña del Shopper histórico.

3. `backend/runtime/cxorbia-shopper-command-provider-v1.mjs`
   - preserva lineage exacto de recovery sin ampliar identidades ni fuzzy matching;
   - acepta únicamente continuaciones autorizadas de los blockers documentados;
   - mantiene budgets y gates.

4. `.github/workflows/cxorbia-c6-staff-repair-bootstrap-exact-write-v2.yml`
   - checkout del SHA exacto del evento;
   - recovery exacto;
   - **login histórico real inmediatamente después del recovery**;
   - genera checkpoint sanitizado antes de Admin/new Shopper;
   - si un paso posterior falla, el failure handler preserva en repo únicamente el checkpoint sanitizado del subgate histórico PASS y parquea el request;
   - después ejecuta Admin create/update, nuevo Shopper, reload/new-tab/segundo contexto;
   - no hay automatic retry.

## Por qué esto evita otro bucle de credencial

En el run anterior la contraseña recuperada fue correctamente eliminada en cleanup antes de que se ejecutara el E2E histórico, porque Admin falló primero. Ahora el orden se invierte y el resultado histórico sanitizado queda preservable antes del flujo Admin.

Si Admin/new Shopper falla después de que el histórico pase, un run futuro podrá continuar únicamente desde Admin/new Shopper sin requerir otra contraseña histórica.

## Estado seguro

Este source lock no ejecutó Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes, no desplegó, no hizo merge y no tocó producción. La autorización anterior permanece consumida/parked.

## Gate siguiente

`PAULA_REVIEW_REQUIRED_FOR_I3_DURABLE_HISTORICAL_LOGIN_AND_ADMIN_NEW_SHOPPER_RESUME`.

El nuevo gate, si Paula lo autoriza, debe permitir exactamente un nuevo password reset del mismo principal histórico exacto porque la credencial aleatoria del run anterior fue destruida en cleanup; después el harness recién cerrado certificará y preservará primero el login histórico y seguirá con Admin/new Shopper. Cero otras identidades, fuzzy matching, providers prohibidos, deploy, merge o producción.
