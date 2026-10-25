# SOURCE LOCK — ITERATION 3 HISTORICAL SHOPPER LEGAL-GATE-AWARE HARNESS PASS — 2026-08-14

**Estado:** `HISTORICAL_SOURCE_LOCK__SUPERSEDED_FOR_CURRENT_CONTINUATION_BY_PREPROVIDER_SELFTEST_LOCK`

## Contexto exacto preservado

Provider run `31835742956`, job `94881540163`, sobre la misma candidata `docs-tya-v6-v71-audit` / PR #7.

El run pasó:

- checkout del SHA exacto autorizado;
- gate de Paula;
- source preflight / patch same-candidate;
- service account DEV privada;
- resolución del mismo único Shopper histórico exacto;
- un credential reset exacto autorizado;
- preservación de UID/claims/shopperId/profile/history y otras identidades `0`;
- reconciliación exacta de membership/crosswalk;
- arranque del proxy del source exacto;
- contexto Firebase Shopper autenticado y protected HR authority alcanzados.

El E2E histórico luego agotó timeout esperando `#nav-aprendizaje`, por lo que el checkpoint histórico no llegó a materializarse y Admin/new Shopper quedó SKIPPED.

## Causa de contrato del harness

`tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs` exigía de forma incondicional que Academia y Certificación ya estuvieran visibles antes de cerrar el subgate de identidad + HR + historia.

El producto permite que `CX.app.enter()` difiera `CX.router.mount()` cuando `CX.confidencialidad.pending(CX.session.role)` está activo. Por tanto, una primera entrada con NDA/confidencialidad pendiente puede ser una sesión Auth/HR/historia válida y, al mismo tiempo, no tener todavía los nodos de navegación montados.

## Corrección source-only preservada

El harness fue corregido para:

1. validar primero Auth exacto + identity + reviewQueue + HR authority + historia;
2. consultar después `CX.confidencialidad.pending('shopper')`;
3. si está pendiente, exigir contrato y diálogo legal visible, preservar el principal y marcar `workspaceState=legal-gate-pending`;
4. diferir Academia/Certificación sin declararlas PASS;
5. si no está pendiente, mantener Academia/Certificación obligatorias;
6. jamás aceptar/firmar/guardar NDA automáticamente;
7. cero force-click y cero write APIs.

Gate source histórico: `PASS_I3_HISTORICAL_LEGAL_GATE_AWARE_SOURCE`.

## Estado posterior que prevalece

Un intento posterior, request `cxorbia-i3-shopper-persistence-20260814-04`, run `31852717413`, se detuvo **antes de provider credentials** por una dependencia mecánica del source self-test con Playwright. Ese incidente no invalida este fix legal-gate-aware, pero sí lo supera como estado operativo actual.

**Lock operativo más reciente y prevalente:**

`app/docs/SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-FAIL-CLOSED-20260814.md`.

No usar este documento para autorizar un rerun ni para inferir que request `...-04` ejecutó reset: no lo hizo.
