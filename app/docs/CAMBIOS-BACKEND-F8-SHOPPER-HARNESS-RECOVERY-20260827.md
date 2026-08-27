# CAMBIOS BACKEND — F8 Shopper harness recovery

**Fecha:** 2026-08-27  
**MASTER_PLAN:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1` / `1.1.0` / `FROZEN`  
**Fase:** `F8_CUTOVER`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100` — sin incremento por este subbloque.

## Causa raíz cerrada

El intento F8 multirol `33107287460` se detuvo antes de ejecutar la batería por `HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194`. La identidad exacta sí estaba presente (`V1/D1`, historia y relaciones pobladas), pero el selector genérico no pudo obtener una contraseña actual (`H0/S0`).

La evidencia histórica `ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json` demuestra que el Shopper exacto había pasado login humano después de una recuperación one-shot. Esa recuperación generó una contraseña aleatoria y la eliminó con el material privado temporal. Por diseño, esa contraseña no puede rederivarse posteriormente. La falla F8 se clasifica como `CREDENTIAL_LIFECYCLE_HARNESS_GAP`, no como defecto actual de identidad, Auth, HR o runtime del producto.

## Cambios aplicados directamente en la rama viva

- `tools/qa/tya-f8-checkpoint-backed-shopper-runtime-readonly.mjs`: prueba read-only que combina el checkpoint humano terminal con readback fresco del principal exacto y runtime browser actual; no contiene APIs de password reset/update ni writes de negocio.
- `.github/workflows/cxorbia-phase-a-live-hr-runtime-predeploy.yml`: reutiliza el workflow existente; instala tooling transitorio y ejecuta la prueba F8 exacta. No se creó workflow, rama ni PR nuevo.
- `app/docs/evidence/RC15-F8-SHOPPER-HARNESS-RECOVERY-LATEST.json`: receipt sanitizado del diagnóstico y PASS.
- `.github/cxorbia-gate-requests/request.json`: request fallido retirado, `enabled=false`, consumido y `replayAllowed=false`; no se reejecuta.

Commits de reparación: `7bb5b00c445225b3a27e30c4854c958358a3438c`, `7b5f79037350f45c1e1b231cc8f5be1ec57fe981`, `5acd2ec585b9cc8af7818fbccb4730cfec1da055`.

## Evidencia de ejecución

Run `33109500671`, job `98648250969`: `SUCCESS` completo. Artifact `9661931005`, digest `sha256:b008dfde2bc1f45d1fce5c1e23334c9a9ccfd55b6d1404a9288ac2d83451c091`.

PASS actual: identidad exacta, claims, perfil, membership, crosswalk, usuario habilitado, 6 visitas propias y runtime browser autenticado; HR viva 15 períodos / 30 hojas / 660 visitas / 214 shoppers; cero claves duplicadas; sourceRef canónico; app visible, login oculto, sin identity lock ni bloqueo de datos. El gate de confidencialidad está soportado, pendiente y visible; no se automatizó su aceptación.

## Seguridad

Provider reads permitidos; provider writes=0; Auth writes=0; password updates=0; password resets=0; Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=0; deploys=0; rebuilds=0; reimports=0; merge=false; credenciales/tokens expuestos=false.

## Clasificación obligatoria

- **Reusable CXOrbia:** patrón `terminal human-password checkpoint + fresh exact-principal/runtime readback` para credenciales deliberadamente efímeras.
- **Exclusivo cliente:** TyA/cinepolis, fingerprints y conteos 15/30/660/214 y 6 visitas propias del principal probado.
- **Claude/prototipo:** sin cambios de UI, `/app/modules` o `/app/core`; mantener gate legal visible y humano.
- **Academia:** manuales/cursos deben dejar claro que la recuperación de credenciales es efímera y la aceptación legal/confidencialidad nunca es efecto automático de smoke tests.
- **Sin impacto Claude:** harness QA, workflow predeploy y control-plane.

## Pendiente real

F8 no está cerrado y readiness sigue 95/100. Continúan: readback fresco IAM/secrets/cuotas; carga/cuotas/failure injection acotada; backup/export y restore verificable antes de mutación; assessment/smoke fresco Staff/Admin y Client; deployment exacto del manifest y readbacks solo tras autorización de mutación; alert/runbook P2; profundidad Academia P2.

**Siguiente exacto:** `F8_CONTINUE_READONLY_PRECHECKS_NO_PROVIDER_MUTATION`.
