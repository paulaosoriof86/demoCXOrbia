# SOURCE LOCK — I3.2 DEV DEPLOY/PARITY PASS · RUNTIME BLOCKER FOCAL · DIAGNOSTICS SOURCE PASS

**Fecha:** 2026-08-17 13:25 -06:00  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `I3_2_DEV_DEPLOY_PASS__REMOTE_PARITY_PASS__STAFF_RUNTIME_FAIL_FOCAL__ONE_SHOT_CONSUMED__GRANULAR_DIAGNOSTICS_SOURCE_PASS__NO_REPROCESS`

## 1. Decisión prevalente

I3.2 NO se reinicia ni se declara PASS integral. El primer intento autorizado produjo avance real y quedó consumido:

- source/request preflight: PASS;
- Firebase Hosting DEV deploy exacto: PASS, una sola vez;
- root/direct remote parity: PASS;
- authenticated Staff runtime: FAIL focal en validación de shell/routing;
- cero Auth/Firestore/HR/Rules/Storage/Make/Gemini/payment writes;
- merge=false; producción=false.

No se autoriza rerun automático. El siguiente paso es únicamente diagnosticar de forma granular el mismo fallo runtime y después pedir un gate distinto si hace falta una nueva ejecución autenticada/deploy.

## 2. Ejecución I3.2 consumida

Request:
`i3-2-authority-compat-dev-deploy-20260817-01`.

Target source HEAD desplegado:
`245614e34bba033078342a43cecf489cbbaf7608`.

Request commit:
`ecafe08e48ab29b632e83f14fc51045a3977c3f9`.

Workflow existente reutilizado:
`.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml`.

Run/job:
- run `32058831910`;
- job `95475132736`;
- artifact `9297383869`;
- digest `sha256:621ed03757b029e48e803858e85895f1c8548618ff4353e44a85552aea80180c`.

## 3. PASS demostrados

### Hosting DEV

Firebase Hosting completó un único deploy del artefacto autorizado. No Cloud Run, no producción.

### Paridad remota

`PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY`:

- `/` responde redirect 302 a `/index-backend-dev.html`;
- entrypoint final responde 200;
- root y direct entry son byte-equivalentes para el gate;
- remote body hash `952319a9a2cac7e61eff01f21c67f8e079de695e3bbc67767c4023c47f8271a7`.

Por tanto RC-01 source-vs-build quedó cerrado para este intento: el runtime probado sí recibió el source autorizado. No volver a culpar un build antiguo sin drift nuevo reproducible.

## 4. FAIL focal observado

La selección de la credencial Staff canónica pasó sin writes y el login llegó suficientemente lejos para que `waitReady()` observara simultáneamente:

- Auth Staff autenticado;
- membership verificada;
- protected HR authority aplicada;
- frontend handoff `entered`;
- `CX.data.projects.length === authority.periods > 0`;
- `CX.data._visitas.length === authority.hrVisits > 0`;
- `currentProjectId` y `currentPeriodId` presentes;
- `CX_BACKEND_LAST_STATE.empty !== true`;
- `CX_CORTE4_READONLY.empty !== true`;
- `#app.on=true` y login oculto.

Luego el harness falló en una aserción agrupada `staff_first_VISIBLE_SHELL_OR_SOURCE_BLOCK`, que mezclaba cinco causas posibles: empty shell, backend empty, texto `Sin proyectos disponibles`, texto `Sin periodos disponibles` o bloque de fuente de datos.

Esa evidencia NO permite escoger una de las cinco causas sin inventar. Por ello no se aplicó un parche producto a ciegas.

## 5. Hallazgo de arquitectura relevante

`CX.app.enter()` puede dejar visible `#app` y oculto login antes de que `CX.router.mount()` se ejecute cuando `CX.confidencialidad.pending(...)` abre el gate legal. El handoff Staff anterior consideraba `entered` con app visible/login oculto, sin comprobar que el router/shell estuviera efectivamente montado.

La interacción humana V0.4 ya fue realizada por Paula, pero el receipt provider durable sigue pendiente I3.7. La doble presentación observada hace del estado legal una hipótesis fuerte para el bloqueo de routing, NO una causa declarada todavía. Se mantiene fail-closed y jamás se autoacepta.

## 6. Corrección focal de diagnóstico — source-only

Se modificó únicamente:

`tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs`.

Commit:
`58b39f0cff760a37cb00a0f4d4e2adabcea5c24e`.

Cambios:

- la aserción agrupada se separó en códigos exactos para empty shell, backend empty, proyectos, periodos y source block;
- se registran flags de router/shell y presencia de selectores proyecto/periodo;
- se registra estado legal sanitizado: loaded/pending/provider authority/error/modal visible, sin contenido sensible;
- el último snapshot sanitizado se preserva en evidencia de fallo;
- no se aceptan términos ni se muta producto.

Source-only preflight posterior:
- request `i3-2-runtime-granular-diagnostics-source-preflight-20260817-01`;
- run `32060010492`;
- job `95478920028`;
- `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT`;
- provider calls 0;
- Hosting/Cloud Run deploys 0;
- Auth/Firestore/HR/Rules/Storage/Make/Gemini/payment writes 0.

El request source-only quedó consumido/disabled. No se rerun.

## 7. Trabajo congelado — NO REPROCESAR

Se mantienen íntegros:

- I1 PASS / I2 PASS;
- Historical Shopper run `31906391682` PASS; reset histórico único consumido; `passwordResets=0`;
- TARGET_B Admin sign-in PASS `32049054855`;
- HR viva 15 periodos / 660 visitas, no reimportar;
- Shopper portal V2 / exact identity contract / cumulative read model V2 / protected HR authority V2 / state semantics V2;
- Finance V2 + source-safe/historical payments;
- materialización/deploy legal V0.4 previos;
- request08 consumido.

## 8. Progreso

- I1 `15/15 PASS`.
- I2 `20/20 PASS`.
- I3 formal `0/25` hasta I3.11 integral.
- I3.1 `PASS`.
- I3.2: **deploy PASS + parity PASS + runtime FAIL focal**; permanece abierta.
- I4 `0/25`.
- I5 `0/15`.

**GO-LIVE formal: 35% / 65%.** No se infla el porcentaje por un subgate parcial, pero el deploy/paridad PASS no se repiten.

## 9. Siguiente acción exacta

`I3.2B_GRANULAR_AUTHENTICATED_STAFF_RUNTIME_RECHECK_AFTER_DIAGNOSTICS_SOURCE_PASS`.

Debe ser una ejecución nueva y explícitamente gated porque el one-shot anterior quedó consumido/STOP_RETRY. Su única finalidad es identificar el blocker exacto con el harness granular y, si pasa, continuar I3.3→I3.7 sin reabrir Auth/Shopper/HR/Finance. Si vuelve a fallar, solo se corrige el código focal de la causa exacta demostrada.

## 10. Clasificación

- **Reusable CXOrbia:** same-build parity, harness granular, STOP_RETRY y separación entre app visible vs router realmente montado.
- **Exclusivo cliente:** TyA DEV y V0.4 receipt pendiente.
- **Claude/prototipo:** sin cambios en módulos/core; no esconder el blocker con UI.
- **Academia:** documentar que un handoff no se considera listo solo por shell visible; debe probar navegación efectiva y gates previos.
- **Sin impacto Claude:** tooling/gates/documentación; sí obliga a no revertir la separación de autoridades ya aplicada.
