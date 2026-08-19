# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4A-VISIBLE-SMOKE-RETRY1-DOCUMENT-SELECTOR-HOLD-23`

## Backend/probado
I1/I2/I3 frozen. La Shopper DEV dedicada sigue exacta. Retry1 visible con Service Worker bloqueado pasó Firebase Auth, contexto Shopper, membership, entrada a app y composición HR viva 15/660.

## Frontend / Claude
No hay P0 frontend reproducible. Documentos sí llegó a renderizar `Recursos del proyecto`; el HOLD fue Playwright eligiendo `div[data-doc]` en lugar del botón visible. No modificar `/app/modules/documentos.js` por este hallazgo.

Pendiente visible I4-A: abrir/verificar documentos con control estable, disponibles + control de postulación sin submit, panel de notificaciones provider-backed, presentación de certificación nueva.

## Preflight fail-closed posterior
El primer transporte de Retry2 se detuvo **antes de cualquier acceso provider/Auth** porque el verifier v5 detectó que este documento no contenía literalmente la frontera canónica. Resultado: `FAIL_SOURCE_TRUTH_SYNC` con único error `FRONTIER:RESUMEN-PARA-CLAUDE.md`. El circuit breaker funcionó; no hubo password update, login ni provider/Firestore access en ese intento. Se corrige la fuente y el mismo gate Retry2 continúa autorizado, sin contabilizar una ejecución provider.

## Siguiente bloque exacto
`NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY2__STABLE_SURFACE_SELECTORS__NO_SW`

Misma Shopper sintética/no histórica; Service Worker bloqueado; controles visibles estables; máximo 1 password update efímero + 1 login; cero Auth create/claims/delete, Firestore/HR/Make/Gemini/pagos writes, deploy, merge o producción.

## Academia
Aún no actualizar manuales/cursos por este HOLD de harness. Actualizar al cerrar comportamiento visible real.
