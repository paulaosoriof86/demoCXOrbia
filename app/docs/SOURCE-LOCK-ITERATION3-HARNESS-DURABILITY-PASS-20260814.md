# SOURCE LOCK — ITERATION 3 HARNESS DURABILITY PASS — 2026-08-14

**Estado:** `LOCKED__I3_SOURCE_ONLY_HARNESS_DURABILITY_PASS__SUPERSEDED_FOR_HISTORICAL_WORKSPACE_GATE_BY_LEGAL_GATE_AWARE_LOCK`

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
   - login histórico real inmediatamente después del recovery;
   - genera checkpoint sanitizado antes de Admin/new Shopper;
   - si un paso posterior falla, el failure handler preserva en repo únicamente el checkpoint sanitizado del subgate histórico PASS y parquea el request;
   - después ejecuta Admin create/update, nuevo Shopper, reload/new-tab/segundo contexto;
   - no hay automatic retry.

## Por qué esto evita otro bucle de credencial

En el run anterior la contraseña recuperada fue correctamente eliminada en cleanup antes de que se ejecutara el E2E histórico, porque Admin falló primero. El orden quedó invertido para preservar el histórico antes de Admin.

El siguiente provider run demostró un segundo requisito del harness: el producto puede mantener el workspace sin montar mientras existe un gate legal de confidencialidad/NDA. Ese caso no invalida este lock; añade una especialización del subgate histórico.

## Lock sucesor prevalente para el subgate histórico

Desde el run `31835742956`, para la validación histórica prevalece:

`app/docs/SOURCE-LOCK-ITERATION3-HISTORICAL-LEGAL-GATE-AWARE-HARNESS-PASS-20260814.md`.

Ese lock conserva este orden durable y además separa Auth/identity/HR/history del gate legal humano, sin automatizar consentimiento.

## Estado seguro

Este source lock no ejecutó Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes, no desplegó, no hizo merge y no tocó producción.

## Gate siguiente actualizado

`PAULA_REVIEW_REQUIRED_FOR_I3_LEGAL_GATE_AWARE_HISTORICAL_CHECKPOINT_AND_ADMIN_NEW_SHOPPER_RESUME`.
