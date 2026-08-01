# CAMBIOS BACKEND — C6 entrada directa por perfiles y separación Auth técnica

**Fecha:** 2026-08-01  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `ROOT_FIX_FOCAL_APPLIED__AUTHORIZED_GATES_RERUN_IN_PROGRESS__NO_DEPLOY_CONFIRMED`

## 1. Motivo

La validación humana reprodujo un P0: el carril visible de Paula mostraba Usuario + Contraseña, aunque el contrato aprobado del prototipo era entrada directa mediante Administración / Coordinación, Portal del Cliente y Shopper / Evaluador.

La causa no estaba en `app/app.js`: ese archivo conservaba correctamente los botones y `CX.app.selectRole(...)`. La sustitución se originó en la integración de Auth protegida, que interceptaba `selectRole()` y `enter()` cuando `CX.BACKEND.enabled` y `devPreviewAuth.enabled` estaban activos.

## 2. Primera corrección y primer gate válido

Se separaron dos carriles:

- **humano:** perfiles directos y cero credenciales;
- **técnico E2E:** Firebase Auth real detrás de parámetros técnicos privados.

El primer workflow ejecutable pasó:

- autorización/destino;
- contratos estáticos y sintaxis;
- dominio canónico;
- Finanzas/Liquidaciones;
- portal Shopper;
- Reservas fail-closed;
- autenticación GCP;
- selección privada de credenciales existentes;
- servidor local.

Falló antes de cualquier deploy en:

`FAIL_C6_HUMAN_DIRECT_ROLE_ENTRY checkpoint=click_admin`

El botón estaba visible, pero `backend-browser-auth.js` interceptaba el clic y abría su paso integrado de credenciales. El fail-closed funcionó: `hostingDeployExecutions=0`, autorización no consumida, sin writes, sin merge y sin producción.

## 3. Root fix focal aplicado

### `app/adapters/tya-dev-entry-auth-gate-v1.js`

Modificado sin tocar módulos ni core:

- carril humano predeterminado conserva `app.js` como autoridad visual;
- en ese carril se desactivan antes de `DOMContentLoaded`:
  - `CX.BACKEND.enabled`;
  - `CX.BACKEND.devPreviewAuth.enabled`;
- esto impide que `backend-browser-auth.js` reemplace la entrada aprobada;
- también impide que `backend-firebase.js` envuelva mutaciones de `CX.data` en la visualización humana;
- HR viva y los adapters canónicos continúan como autoridad operacional del carril humano;
- el carril técnico explícito vuelve a habilitar backend/Auth y conserva el E2E real.

### `tools/qa/tya-c6-dev-entry-browser-smoke.mjs`

Modificado para exigir:

- admin, cliente y shopper visibles;
- ausencia de `cxDevEntryAuth` y `cxIntegratedAuthStep`;
- backend Firebase y Auth integrada deshabilitados en carril humano;
- clic directo en Administración activa la app;
- cero formulario de credenciales después del clic.

### `tools/qa/tya-c6-dev-entry-auth-gate.mjs`

Modificado para bloquear futuras regresiones:

- exige separación humana/técnica;
- exige bypass de Auth integrada en carril humano;
- exige backend Firebase deshabilitado solo para esa visualización;
- preserva los contratos de HR canónica y cero writes.

### Workflow autorizado

`.github/workflows/cxorbia-corte6-cumulative-human-visual-hosting.yml`:

- se corrigió una condición YAML que inicialmente producía ejecuciones sin jobs;
- el workflow válido ejecuta gates antes del deploy;
- solo permite un deploy al Hosting DEV existente si todo pasa;
- persiste evidencia source-safe y consume la autorización únicamente después del deploy PASS.

## 4. Autorización vigente

Autorización de Paula, ya registrada y no repetible para el mismo alcance:

> Ejecutar gates del root fix y, solo si todos pasan, un único redeploy del Hosting DEV existente `cxorbia-backend-dev`; sin proyectos/sitios nuevos, sin writes de datos, sin cambios Auth/Rules/Cloud Run, sin merge y sin producción.

Al fallar el primer gate humano antes del deploy:

- `consumed=false`;
- `hostingDeployExecutions=0`;
- la misma autorización continúa vigente para la corrección focal y rerun.

## 5. Baseline acumulativa preservada

No se reabren ni sustituyen:

- 14 periodos / 616 visitas;
- julio 44 = GT 34 + HN 10;
- 40 realizadas;
- 38 cuestionarios;
- 33 submitidas;
- 1 fuera de rango accionable;
- identidad/crosswalk Shopper;
- Finanzas, Movimientos, Liquidaciones y Beneficios;
- portal Shopper;
- Reportes;
- Reservas fail-closed.

## 6. Archivos tocados en este bloque

- `app/adapters/tya-dev-entry-auth-gate-v1.js`
- `tools/qa/tya-c6-dev-entry-browser-smoke.mjs`
- `tools/qa/tya-c6-dev-entry-auth-gate.mjs`
- `tools/qa/tya-c6-dev-users-real-e2e.mjs`
- `.github/workflows/cxorbia-corte6-cumulative-human-visual-hosting.yml`
- `backend/config/corte6-cumulative-human-visual-hosting-request.json`
- `backend/config/corte6-cumulative-human-visual-hosting-execute.json`
- documentos vigentes de índice, checkpoint, Claude, pendientes y P0;
- este addendum.

No se modificaron `app/modules/*` ni `app/core/*`.

## 7. Clasificación

- **Reusable CXOrbia:** separar navegación/selección humana de rol, autenticación técnica y autorización por claims.
- **Exclusivo TyA:** etiquetas de acceso y alcance del tenant/proyecto.
- **Claude/prototipo:** preservar `app.js` como autoridad de la entrada visual aprobada.
- **Academia:** explicar selector de perfil, Auth real y autorización como conceptos diferentes.
- **Sin impacto Claude:** credenciales privadas E2E, service account y consumo del gate.

## 8. Estado seguro

El rerun autorizado fue activado después del root fix focal. Este documento no declara todavía PASS, deploy ni consumo de autorización. El resultado final debe completarse únicamente con evidencia del workflow, paridad remota y smoke remoto.