# CAMBIOS-BACKEND — addendum Corte 6 · acceso automático del prototipo

**Fecha:** 2026-07-30  
**Estado:** `C6_PROTOTYPE_AUTOENTRY_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## Hallazgo reproducible
La validación humana demostró que el build DEV publicado todavía alteraba el prototipo: después de elegir `Administración / Coordinación`, backend/Auth agregaba `Usuario + Contraseña` y el formulario quedaba parcialmente fuera del viewport. El contrato aprobado del prototipo es perfil → `selectRole(...)` → `enter()` automático.

## Causa raíz y corrección
- `app/core/backend-config-preview-dev.js`: para la ruta humana DEV, `CX.BACKEND.enabled=false`, `humanVisualSourceSafe=true`, `devPreviewAuth.enabled=false`, `humanCredentialPrompt=false`.
- `app/core/backend-cxdata-readonly-corte4.js`: preserva HR source-safe read-only y bloquea mutaciones sin vaciar el dataset aprobado.
- `app/core/backend-preview-status.js`: rotula `HR source-safe · validación visual` y Auth validado por gate separado.
- `app/app.js`: no fue reescrito; conserva auto-entry del prototipo.
- No se tocó `app/modules/*`.

## Gate estático previo
`29b7f9404a9c2f144145fe24d5cf048f753c1e75` → `success · PREPARED_C6_PROTOTYPE_AUTO_ENTRY_NO_EXECUTE` con baseline `cinepolis`,14 periodos,616 visitas y provider writes0.

## Incidente de ejecución y solución de raíz
La primera ejecución autorizada quedó `FAIL_C6_PROTOTYPE_AUTO_ENTRY_HOSTING` antes de cualquier deploy porque el preparador emitía `PASS_READY_FOR_EXISTING_HOSTING_HUMAN_VISUAL_REDEPLOY`, mientras `cxorbia-existing-hosting-dev-direct-deploy.mjs` todavía exigía el nombre anterior `PASS_READY_FOR_SINGLE_EXISTING_HOSTING_DEPLOY`.

El check ocurre antes de la primera mutación Hosting; el request quedó `hostingDeployExecutions=0`, `consumed=false`. Se corrigió el contrato en `b9f5190babcc339735cda59291417df5aea6988f` y se reintentó con la misma autorización vigente, sin pedir una autorización adicional innecesaria.

## Redeploy autorizado — PASS
Request `corte6-prototype-autoentry-redeploy-20260730-03` quedó consumido una sola vez.

`PASS_EXISTING_HOSTING_DEV_PROTOTYPE_AUTO_ENTRY_SOURCE_SAFE_REMOTE_VERIFIED`

- versión `sites/cxorbia-backend-dev/versions/95a1e49e5064c456`;
- release `sites/cxorbia-backend-dev/releases/1785452689852000`;
- Hosting deploy executions=1;
- entrypoint remoto=true;
- prototypeAutoEntry=true;
- humanCredentialPrompt=false;
- sourceSafeVisual=true;
- proyecto `cinepolis`;
- periodos=14;
- visitas=616;
- Firebase Auth validado separadamente=true;
- preservedLegacyAuthUsers=91.

## Seguridad
En este redeploy: Auth writes0; Firestore data writes0; Rules0; nuevo Firebase0; nuevo Hosting0; Storage0; HR0; legacy0; pagos0; Functions0; Make/Gemini0; merge=false; producción=false; PII/secrets exportados=false.

## Qué se preserva
- Corte3 FROZEN `CXORBIA-TYA-CORTE3-V182-20260729`.
- R17N 1,406/1,406; no repetir.
- Corte5 Firestore/CX.data PASS.
- Auth import/readback91/91; no repetir ni resetear.
- claims5/5 + Rules PASS.
- HOLD:21 shopper sin vínculo exacto, demo1, ambiguos18/77.

## Clasificación
- **Reusable CXOrbia:** UX humana separada de gates provider; contrato de preflight/deploy alineado y fail-closed.
- **Exclusivo cliente:** HR TyA/Cinépolis y credenciales legacy.
- **Claude/prototipo:** no nueva candidata; preservar auto-entry; no reintroducir UI Auth técnica.
- **Academia:** explicar separación preview humano/provider y troubleshooting.
- **Sin impacto Claude:** Auth91, Rules, requests y evidencia provider.

## Gate vivo
`VALIDACIÓN VISUAL HUMANA DEL BUILD DEV AUTO-ENTRY/SOURCE-SAFE → SI APRUEBA: FREEZE CORTE6`.

Después: `REFRESH HR → RESOLVER AGOSTO HN → MATERIALIZAR SOLO DELTA AGOSTO → SMOKE → PREPROD/CUTOVER`.
