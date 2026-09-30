# ADDENDUM PREVALENTE — I3 LIVE FIXTURE FORENSIC / ANTI-LOOP

**ID:** CXORBIA-I3-LIVE-FIXTURE-FORENSIC-20260919  
**Estado:** FROZEN_PREVALENT_UNTIL_I3_GO_OR_NEWER_EXPLICIT_SUPERSESSION  
**Iteración:** I3 — FUNCTIONAL CLOSURE  
**Producción:** DO_NOT_TOUCH

## 1. Alcance

Este addendum congela la auditoría forense de los Runs 251 y 254–258. No reabre I0–I2, Run 238, Gate 20, Gate 21, HR architecture ni Auth general. La product source certificada continúa siendo `751d01397bcd85903456e5cb78e3e5ce41161b17`, tree `3612496c2cbf4abdaed1404fcf69552817929fcf`, artifact SHA-256 `bc340a7c30657e4326b3dfa306bff5cbb016ce37abaaece0edf3f5adc91d9a16`.

## 2. Evidencia física

Run 238 (`35456396448`) certificó source/tree, full human acceptance antes del artifact, Gate 20, un solo build, un solo artifact y Gate 21 sobre ese mismo artifact.

Run 251 (`35466876728`) probó de forma aislada un Shopper recién creado: provider ACK, persistencia, password directo, claims, login visible, `backendAuth.context()`, membership y cleanup = PASS.

Runs de live fixtures, siempre sobre la misma product source/artifact y sin build/deploy:

- Run 254 `35467568326`: 6/10 PASS; primer fallo en `4_NOMBRE_COMPUESTO` con `selectedRole=""` antes de Firebase user.
- Run 255 `35468034782`: 3/10 PASS; el mismo síntoma apareció esta vez en `1_SHOPPER_GT`.
- Run 256 `35468357011`: 7/10 PASS; los cuatro Shoppers pasaron y el primer fallo fue `page.evaluate: Execution context was destroyed` al entrar al Admin.
- Run 257 `35468802173`: FAIL de preflight `RELEASE_COMPOSITION_FAILURE:ADMIN_ENSURE_COUNT:0`, antes de Auth y antes de writes.
- Run 258 `35468874734`: 7/10 PASS; los cuatro Shoppers volvieron a pasar y el primer fallo fue `auth/network-request-failed` dentro del Auth browser Admin. Cleanup = PASS.

Los siete casos físicamente probados en Run 258 son: Shopper GT, Shopper HN, nombre con tilde, nombre compuesto, histórico/KPIs, reserva y Cliente.

## 3. Causa raíz forense

**Causa raíz:** `LIVE_FIXTURE_HARNESS_BROWSER_AUTH_LIFECYCLE_AND_FAIL_FAST_MISCLASSIFICATION`.

No existe evidencia de cinco defectos sucesivos de producto. El lugar del primer fallo cambia entre runs mientras source/tree/artifact permanecen idénticos, y casos que fallan en un run pasan en otro. La suite monolítica aborta al primer error de browser/network, por lo que los casos posteriores no llegan a ejecutarse; además errores de Playwright/Firebase transitorios fueron reportados como `FUNCTIONAL_DEFECT`.

La aceptación canónica de Run 238 ya contiene el patrón probado para custom Auth: hasta 5 intentos acotados, tolerancia exclusiva a navegación/Firebase-not-ready/network transitorio, verificación de sesión persistida, rehidratación mediante navegación limpia y sólo después `ensureAuthenticated()`. El live-fixture harness no reutilizó integralmente ese patrón y volvió a crear una segunda semántica de lifecycle.

## 4. Regla anti-loop congelada

1. No modificar `app/`, `backend/`, Firebase productivo ni la product source por los fallos 254–258.
2. Reutilizar en el mismo harness/live-fixture job el patrón custom-auth ya probado en Run 238; no crear otra implementación de Auth.
3. `auth/network-request-failed`, navegación o execution-context destruido durante custom Auth sólo pueden reintentarse de forma acotada dentro del mismo caso.
4. Si después de 5 intentos el Admin no logra sesión persistida, clasificar `ENVIRONMENT_FAILURE` y detenerse; no tocar producto.
5. Sólo un defecto reproducible después de contexto Admin autenticado, con owner funcional exacto, autoriza cambio de producto.
6. No crear workflow paralelo, candidata paralela, overlay, materializador ni rebuild.
7. Ejecutar una sola suite completa después de esta corrección de control. Criterio: 10/10 PASS + cleanup/readback de ausencia.

## 5. Pendiente exacto

Quedan por cerrar únicamente:
- `5_PERFIL_ADMIN`
- `7_DISPONIBILIDAD_ASIGNACION`
- `8_POSTULACION`

Todo lo demás permanece PASS según la evidencia indicada. Producción permanece `DO_NOT_TOUCH`.
