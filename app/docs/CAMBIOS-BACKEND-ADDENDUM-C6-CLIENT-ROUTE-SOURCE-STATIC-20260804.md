# CAMBIOS BACKEND — C6 Client route source/static root fix

**Fecha:** 2026-08-04  
**Estado:** `PASS_C6_CLIENT_ROUTE_SOURCE_STATIC__RUNTIME_NOT_REEXECUTED__NO_PRODUCTION`  
**Repo/rama/PR:** `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft-open-no merge.

## 1. Autorización ejecutada

Bloque exclusivamente source-only para:

- navegar explícitamente a `cli_dashboard` en el gate Cliente;
- esperar un render estable;
- separar `clientModule`, `route`, `panorama` y `blocked`;
- conservar la etapa original del fallo antes de ejecutar rollback;
- ejecutar sintaxis y gate local/estático;
- cero credenciales, provider reads, Auth/Firestore writes, membership, deploy o runtime.

## 2. Causa raíz corregida

El gate anterior iniciaba sesión como Cliente pero no navegaba explícitamente al módulo `cli_dashboard`. Después evaluaba una condición compuesta basada parcialmente en copy visible:

`clientModule && panorama && !blocked`.

Esto permitía que una vista inicial distinta del Panorama produjera `CLIENT_PORTAL_INVALID`, aunque el módulo, Auth y datos estuvieran disponibles.

## 3. Archivos técnicos modificados

### `tools/qa/tya-c6-remote-domain-finance-portals-reservations-gate.mjs`

- ejecuta `window.CX.router.nav('cli_dashboard')`;
- espera simultáneamente:
  - `CX.session.view === 'cli_dashboard'`;
  - navegación `#nav-cli_dashboard` activa;
  - encabezado estable `#view .ph`;
  - vista renderizada;
- registra por separado:
  - `clientModule`;
  - `route` y `routeId`;
  - `panorama`;
  - `blocked`;
  - encabezado observado;
- reemplaza la aserción compuesta por errores específicos:
  - `CLIENT_MODULE_MISSING`;
  - `CLIENT_ROUTE_INVALID`;
  - `CLIENT_PANORAMA_NOT_RENDERED`;
  - `CLIENT_PORTAL_BLOCKED`.

### `tools/qa/cxorbia-c6-client-access-runtime-orchestrator.mjs`

- captura `failedStageBeforeRollback` antes de iniciar rollback;
- el reporte final conserva esa etapa original;
- `rollback_after_failure` deja de sobrescribir la causa observable.

### `tools/qa/tya-c6-client-route-source-static-gate.mjs`

Nuevo gate permanente, Node built-ins only, que verifica:

- sintaxis de gate, wrapper y orquestador;
- contrato real del router y módulo `cli_dashboard`;
- navegación explícita;
- marker estable;
- evidencia booleana separada;
- ausencia de la aserción compuesta anterior;
- preservación de la etapa original del fallo;
- cero ejecución de proveedor.

### `tools/qa/cxorbia-controlled-runners-contract-gate.mjs`

- incorpora el nuevo gate source/static como invariante permanente del carril controlado.

### `.github/cxorbia-gate-requests/request.json`

- solicitud deshabilitada usada únicamente para disparar el paso contractual existente;
- `allowedExecutions: 0`;
- `providerReads: false`;
- no se instaló Playwright;
- no se prepararon credenciales;
- no se ejecutó perfil runtime.

## 4. Ejecución y evidencia

Ejecución válida:

- commit: `5caca10137250d2a70308dd995262e368f981322`;
- run: `30936681878`;
- job: `92084479259`;
- `Validate controlled runner contract`: PASS;
- decisión: `PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT`;
- blockers: 0;
- warnings: 0.

El contrato solo puede quedar PASS si el gate interno obtiene:

`PASS_C6_CLIENT_ROUTE_SOURCE_STATIC`.

Pasos deliberadamente omitidos:

- instalación de tooling de navegador;
- preparación de credenciales DEV;
- ejecución de runtime;
- carga de artifact runtime;
- provider reads.

## 5. Estado seguro

- cambios funcionales en `app/`: 0;
- Auth writes: 0;
- membership writes: 0;
- Firestore writes: 0;
- provider reads: 0;
- credenciales utilizadas: 0;
- Hosting/Cloud Run deploys: 0;
- HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.

## 6. Clasificación

- **Reusable CXOrbia:** navegación explícita, marker estable, errores separados y etapa original preservada.
- **Exclusivo cliente:** la futura reejecución usará el Portal Cliente TyA/Cinépolis.
- **Cloud/prototipo:** sin impacto; Cloud continúa frontend-only con V6.
- **Academia:** documentar diferencia entre módulo registrado, ruta activa, render observable y copy.
- **Sin impacto frontend:** no se modificó `app/`.

## 7. Siguiente bloque exacto

El correctivo source-only está cerrado. No se reutilizó ninguna autorización runtime.

Pendiente, únicamente con nueva autorización expresa:

`SNAPSHOT CLIENTE → MEMBERSHIP IDEMPOTENTE → READBACK → RUNTIME MULTIROL CON GATE DE RUTA CORREGIDO → CONSERVAR SOLO CON PASS / ROLLBACK SI FAIL`.
