# CAMBIOS-BACKEND — RC15 F4 G2-B RECOVERY — 2026-08-26

**Bloque:** `F4_G2B_RECOVERY_ONE_SHOT`  
**Estado actual:** `MECHANISM_REPAIR_3_PENDING_EXECUTION`  
**PHASE_A:** `98/100`  
**PRODUCTION_REAL_READINESS:** `76/100`

## Reparaciones previas preservadas

1. `1f636b79954ab0a5474f7f1ca16a7701c0f64edf`: reactivó focalmente el mismo workflow histórico bajo la autoridad F4 estructurada. El run `33027014684` terminó `skipped` antes de crear job por un `job if` frágil. Sin provider access ni lease consumption.
2. `3b4cd772bb36418cfacd6798fdfb25bba2e05175`: eliminó ese filtro redundante. El run `33027275374` creó job y la validación estructurada de F4 pasó, pero falló antes de autenticar GCP en `Prepare and validate exact source-fix release tree`.

## Causa exacta de reparación 3

El gate de source-fix buscaba el literal `g2b-synthetic/commands` en `backend/runtime/hr-live-service/server.mjs`. El source-fix no define allí el literal: `server.mjs` importa y delega mediante `isG2BSyntheticRuntimePath` y `maybeHandleG2BSyntheticRuntimeRequest`; la expresión de ruta vive correctamente en `backend/runtime/hr-live-service/g2b-synthetic-runtime.mjs`.

La evidencia del repo confirma que:
- `server.mjs` contiene el import y la delegación G2-B;
- `g2b-synthetic-runtime.mjs` contiene la ruta `/api|v1/.../g2b-synthetic/commands` y el gate sintético;
- Dockerfile copia ambos runtime files y el provider G2-B;
- `firebase.json` reescribe `/api/tenants/**` al servicio `cxorbia-live-hr-dev`;
- `.firebaserc` conserva `cxorbia-backend-dev` y target `cxorbia-dev`.

Por tanto el fallo del run `33027275374` se clasifica `MECHANISM_P0_SOURCE_ASSERTION_WRONG_FILE`, no `PRODUCT_P0`.

## Incidente de materialización y restauración

Durante la preparación de `REPAIR-3` se produjo una escritura accidental del archivo inexistente `__noop__` en el commit `39680648d300c2069085fc1ab6443463f64cf161`. Se detectó inmediatamente antes de continuar. No tocó workflow, source, provider, autorización ni lease.

Se restauró mediante el commit fast-forward `6c770487e89c7fe365b9ae86c840ae1dc1a03a50`, eliminando `__noop__`. El tree resultante quedó exactamente `6bab6850fec7823916c44cf29ecf13e074aacf22`, el mismo tree de `3b4cd772bb36418cfacd6798fdfb25bba2e05175`; por tanto el delta neto accidental es cero. No se usó force push ni rewrite de historia.

## Reparación 3

Se modifica únicamente el workflow existente para validar:
- en `server.mjs`: `isG2BSyntheticRuntimePath` y `maybeHandleG2BSyntheticRuntimeRequest`;
- en `g2b-synthetic-runtime.mjs`: el literal `g2b-synthetic/commands`.

No se modifica source funcional, runtime, adapters, Firebase config, autorización, lease ni execute artifact.

## Seguridad / budget intactos antes de repair-3

- provider mutation lease `F4-G2B-PROVIDER-LEASE-20260826-01`: `ISSUED_NOT_CONSUMED`;
- provider reads sensibles consumidos: 0;
- provider writes: 0;
- Cloud Build: 0;
- Cloud Run update: 0;
- Hosting deploy: 0;
- Firestore/Auth/Storage/HR externa/datos reales/credenciales/pagos/Rules/Make/Gemini/merge: 0;
- retry automático: 0.

## Clasificación

- **Reusable CXOrbia:** validar delegación/ruta en el archivo que realmente posee cada responsabilidad; fail-before-provider mantiene el lease intacto; restauración inmediata de drift accidental con verificación de tree idéntico.
- **Exclusivo cliente TyA:** ejecución G2-B en `cxorbia-backend-dev`.
- **Claude/prototipo:** sin cambio funcional frontend.
- **Academia:** sin impacto funcional.
- **Sin impacto Claude:** workflow/control-plane/evidence/docs y restauración `__noop__` net-zero.

## Siguiente exacto

Materializar `REPAIR-3` por tree/commit/fast-forward. Observar el run hasta preflight read-only. El lease solo puede consumirse inmediatamente antes del primer Cloud Build si todo lo anterior PASS. F4 solo cierra con `RECOVERY_PASS_FULL`; entonces `PRODUCTION_REAL_READINESS` sube a `81/100`.
