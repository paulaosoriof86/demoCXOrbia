# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-22  
**Estado:** `V174_EMPALMADA_CONTROLLED_RUNNERS_BOOTSTRAPPED_R20_REMOTE_FIX_PENDING_NO_DEPLOY`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama obligatoria: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- HEAD previo al bootstrap: `b5f63459ab096689e364ab85ab3c89f2640bc25c`.
- No nueva rama, PR, `main` ni force push.
- No Hosting DEV, deploy, producción, imports ni writes reales.

## 2. V174 aplicada

- Package SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Commit funcional: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Commit documental inicial: `1703d36252cb957387fac6bcf348cf06ff22a5ef`.
- Corrección focalizada: `0acdc6772f2d4a7743dea0992a4279241dcb79d7`.
- Delta V174: seis módulos frontend exactos.
- Backend, adapters live, contratos, tools, overlays y `CX.data`: preservados.
- Honorario, boleto y combo conservan `0` confirmado y ausencia como `null`.

## 3. Gates antes del bootstrap

PASS:

- `tya-hr-header-variants-r20-gate.mjs`;
- `tya-live-hr-inplace-refresh-gate.mjs`;
- `tya-corte1-context-history-reports-gate.mjs`;
- `tya-corte1-report-frontend-runtime-gate.mjs`;
- `tya-corte2a-shopper-operation-canonical-gate.mjs`;
- verificador V174.

HOLD:

- `tya-project-period-kpi-history-gate-r20.mjs` por identidad de fuente observada como `public_gviz_csv_cache_busted`;
- `tya-corte1-m1-regression-lock.mjs` derivado del HOLD R20.

## 4. Diagnóstico R20 comprobado por Codex

Codex trabajó desde `b5f63459ab096689e364ab85ab3c89f2640bc25c` y creó localmente el commit no publicado:

`ec20ff49262a4c315995a278479931d6017ef798`

No se considera aplicado porque no existe push ni HEAD remoto.

Causa raíz comprobada:

`R20_INVENTORY_BUILDER_NOT_USING_CANONICAL_HEADER_VARIANT_RESOLVER`

El builder remoto usa lógica legacy propia para encabezados y filas; el contrato R20 ya define:

- `JULIO 26 = tab_scoped_compact`;
- `JULIO 26 HN = full_identity`;
- `contextualMissingAllowedIn`;
- `coalesce_equal_or_single_nonempty`.

Resultado local comprobado por Codex, aún no remoto:

- builder R20 PASS;
- `accessMode=public_gviz_gid_verified_inventory`;
- 14 periodos;
- 28 tabs;
- 616 visitas;
- GT 476;
- HN 140;
- 209 shoppers.

El gate de navegador no se ejecutó por límite del entorno Codex. No se falseó PASS.

## 5. Runners controlados autorizados

Paula autorizó el 2026-07-22 exclusivamente:

1. `CXORBIA_ATOMIC_APPLY_RUNNER`.
2. `CXORBIA_READONLY_POST_GATES_RUNNER`.

### 5.1 Archivos instalados

- `backend/contracts/cxorbia-controlled-runners-v1.json`;
- `tools/release/cxorbia-atomic-apply-runner.mjs`;
- `tools/release/cxorbia-readonly-post-gates-runner.mjs`;
- `tools/qa/cxorbia-controlled-runners-contract-gate.mjs`;
- `.github/workflows/cxorbia-atomic-apply-runner.yml`;
- `.github/workflows/cxorbia-readonly-post-gates-runner.yml`;
- `.github/cxorbia-gate-requests/request.json` en estado bootstrap `enabled:false`.

### 5.2 Commits de bootstrap

- `7b9191c404aeebf9bbf14e93ecdb8a050d35d57d` — contrato;
- `88daf642b813ad777896bd2c448850608312d6fb` — ejecutor atomic apply;
- `92b9d09d0fc3b3460b26b173af097c5e24e448c9` — ejecutor read-only gates;
- `8e996fbaee275b2ff2066a72250dc61d596c6679` — gate contractual;
- `1735735af7356711146a1443be6407d4c334de28` — request bootstrap desactivado;
- `0dc93edbb6d1bd7cfb916e67266e4d3231ce6318` — workflow atomic apply;
- `e30499a7f8d4dff51e566378026e4b0b05318df8` — workflow read-only gates;
- `ebbf61fcb35458b4d8e182779a384186e8a7821f` — addendum prevalente actualizado;
- `445491aa16f44901c62f9e82590a0e61ebd60bbd` — índice vigente actualizado.

### 5.3 Gate local de infraestructura

`PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT`

- blockers: 0;
- warnings: 0;
- deploy: false;
- merge: false;
- producción: false;
- data writes: false.

Los runners están instalados pero todavía no se consideran probados end-to-end sobre una solicitud funcional real.

## 6. Alcance de cada runner

### `CXORBIA_ATOMIC_APPLY_RUNNER`

- futura aplicación de deltas frontend auditados bajo `app/`;
- verificación de HEAD, candidate/package SHA y SHA actual/final por archivo;
- bytes transportados como Git blobs exactos dentro del runner;
- un solo commit funcional;
- request de control eliminado en el commit funcional;
- push no forzado a la rama viva;
- rutas backend/tools/.github y overlays protegidos fail-closed.

### `CXORBIA_READONLY_POST_GATES_RUNNER`

- Node 24 + Playwright 1.55.0 + Chromium efímero;
- contents read-only;
- servidor local temporal;
- artifacts y comentario sanitizado en PR #7;
- cero commit/push, deploy, merge, producción o writes reales.

Perfil inicial:

`V174_R20_M1_CORTE2A`.

## 7. Bootstrap único

Los commits secuenciales de instalación fueron una excepción de infraestructura expresamente autorizada porque los runners no existían. No aplicaron candidata ni delta funcional.

A partir del cierre del bootstrap:

- no Contents API secuencial para empalmes funcionales;
- no workflows genéricos;
- futuras candidatas GO usan checkout Git autenticado o `CXORBIA_ATOMIC_APPLY_RUNNER`;
- gates con navegador usan `CXORBIA_READONLY_POST_GATES_RUNNER`.

## 8. Phase A

- M1/Corte 1: preservado.
- V174/Corte 2A: empalmada; aceptación canónica PASS.
- R20/M1 compuesto: pendiente únicamente de reproducir la corrección del builder en remoto y ejecutar el perfil read-only completo.
- Hosting DEV: no autorizado todavía.
- Validación visual: posterior a todos los gates PASS y autorización separada.

## 9. Clasificación

- **Reusable CXOrbia:** carril atómico de aplicación y runner QA read-only reproducible.
- **Exclusivo cliente:** perfil inicial valida HR TyA GT/HN y Corte 2A.
- **Claude/prototipo:** futuras candidatas se empalman sin Codex; Claude sigue entregando frontend, no opera infraestructura.
- **Academia:** explicar integridad de fuente, ausencia distinta de cero, evidencia reproducible y separación aplicación/gates.
- **Sin impacto Claude:** GitHub Actions, Playwright efímero, artifacts, contrato de control y permisos del runner.

## 10. Siguiente bloque exacto

1. cerrar documentación restante del bootstrap y actualizar PR #7;
2. reproducir en remoto la corrección focalizada del builder R20 sin usar el commit local de Codex como evidencia aplicada;
3. activar un request read-only ligado al HEAD exacto;
4. ejecutar R20 + Corte 2A + M1 + verificador;
5. regenerar lock y documentar;
6. solo después decidir autorización de Hosting DEV.

## 11. Estado seguro

Cero Hosting DEV, deploy, merge, producción, imports, Firestore/Auth/Storage/HR writes, Make/Gemini, pagos y base vieja conectada.
