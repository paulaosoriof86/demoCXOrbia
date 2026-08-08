# CAMBIOS BACKEND — C6 entrada directa por perfiles y separación Auth técnica

**Fecha:** 2026-08-01  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `PASS_C6_HUMAN_DIRECT_ROLE_ENTRY_AND_ISOLATED_AUTH_EXISTING_HOSTING_DEV__PENDING_HUMAN_VISUAL`

## 1. Motivo

La validación humana reprodujo un P0: el carril visible de Paula mostraba Usuario + Contraseña, aunque el contrato aprobado del prototipo era entrada directa mediante Administración / Coordinación, Portal del Cliente y Shopper / Evaluador.

La causa no estaba en `app/app.js`: ese archivo conservaba correctamente los botones y `CX.app.selectRole(...)`. La sustitución se originó en la integración de Auth protegida, que interceptaba `selectRole()` y `enter()` cuando `CX.BACKEND.enabled` y `devPreviewAuth.enabled` estaban activos.

## 2. Primera corrección y gate fail-closed

Se separaron dos carriles:
- **humano:** perfiles directos y cero credenciales;
- **técnico E2E:** Firebase Auth real detrás de parámetros técnicos privados.

El primer workflow ejecutable pasó autorización, contratos estáticos, dominio, Finanzas, portal Shopper, Reservas, GCP, selección privada de credenciales y servidor local. Falló antes del deploy en:

`FAIL_C6_HUMAN_DIRECT_ROLE_ENTRY checkpoint=click_admin`

El botón estaba visible, pero `backend-browser-auth.js` interceptaba el clic y abría su paso integrado de credenciales. El fail-closed funcionó:
- `hostingDeployExecutions=0`;
- autorización no consumida;
- sin writes;
- sin merge;
- sin producción.

## 3. Root fix focal aplicado

### `app/adapters/tya-dev-entry-auth-gate-v1.js`

Sin tocar módulos ni core:
- el carril humano conserva `app.js` como autoridad visual;
- antes de `DOMContentLoaded` desactiva únicamente para esa visualización:
  - `CX.BACKEND.enabled`;
  - `CX.BACKEND.devPreviewAuth.enabled`;
- impide que `backend-browser-auth.js` reemplace la entrada aprobada;
- impide que `backend-firebase.js` envuelva mutaciones de `CX.data` en el carril humano;
- HR viva y adapters canónicos permanecen como autoridad operacional;
- el carril técnico explícito reactiva backend/Auth y conserva E2E real.

### `tools/qa/tya-c6-dev-entry-browser-smoke.mjs`

Ahora exige:
- admin, cliente y shopper visibles;
- ausencia de `cxDevEntryAuth` y `cxIntegratedAuthStep`;
- backend Firebase/Auth integrada deshabilitados en carril humano;
- clic directo en Administración activa la app;
- cero formulario de credenciales después del clic.

### `tools/qa/tya-c6-dev-entry-auth-gate.mjs`

Bloquea futuras regresiones:
- exige separación humana/técnica;
- exige bypass de Auth integrada en carril humano;
- exige backend Firebase deshabilitado solo para esa visualización;
- preserva HR canónica y cero writes.

### `.github/workflows/cxorbia-corte6-cumulative-human-visual-hosting.yml`

- se corrigió una condición YAML que inicialmente producía ejecuciones sin jobs;
- ejecutó gates antes del deploy;
- permitió un único deploy al Hosting DEV existente;
- persistió evidencia source-safe;
- consumió la autorización únicamente después de PASS remoto.

## 4. Resultado autoritativo

`PASS_C6_HUMAN_DIRECT_ROLE_ENTRY_AND_ISOLATED_AUTH_EXISTING_HOSTING_DEV`.

Evidencia:
`app/docs/evidence/CORTE6-DIRECT-ROLE-ENTRY-HOSTING-LATEST.json`.

### Carril humano
- modo `native-direct-role-entry`;
- Administración visible;
- Cliente visible;
- Shopper visible;
- Usuario + Contraseña ausente;
- browser local PASS;
- browser remoto PASS.

### Carril técnico
- Auth aislada: true;
- staff local/remoto PASS;
- shopper local/remoto PASS;
- staff: 616 visitas, refresh y nueva pestaña preservados;
- shopper: 616 visitas, 1 visita propia, refresh y nueva pestaña preservados.

### Baseline canónica
- 14 periodos;
- 616 visitas;
- julio 44 = GT 34 + HN 10;
- 40 realizadas;
- 38 cuestionarios;
- 33 submitidas;
- 1 fuera de rango accionable.

## 5. Deploy, consumo y seguridad

- Hosting DEV existente: `cxorbia-backend-dev/cxorbia-dev`.
- Deploy ejecutado: exactamente 1.
- Autorización: `consumed_pass`.
- Usuarios creados: 0.
- Auth writes: 0.
- Cambios de contraseña: 0.
- Firestore/Rules/Cloud Run/HR writes: 0.
- Proyectos Firebase nuevos: 0.
- Sitios Hosting nuevos: 0.
- Credenciales/tokens expuestos: no.
- Merge=false.
- Producción=false.

## 6. Archivos tocados

- `app/adapters/tya-dev-entry-auth-gate-v1.js`
- `tools/qa/tya-c6-dev-entry-browser-smoke.mjs`
- `tools/qa/tya-c6-dev-entry-auth-gate.mjs`
- `tools/qa/tya-c6-dev-users-real-e2e.mjs`
- `.github/workflows/cxorbia-corte6-cumulative-human-visual-hosting.yml`
- `backend/config/corte6-cumulative-human-visual-hosting-request.json`
- `backend/config/corte6-cumulative-human-visual-hosting-execute.json`
- `app/docs/evidence/CORTE6-DIRECT-ROLE-ENTRY-HOSTING-LATEST.json`
- índice, checkpoint, Claude, pendientes, tracker, Academia y este addendum.

No se modificaron `app/modules/*` ni `app/core/*`.

## 7. Clasificación

- **Reusable CXOrbia:** separación entre selector humano, autenticación y autorización; gates independientes.
- **Exclusivo TyA:** etiquetas de perfiles y alcance del tenant/proyecto.
- **Claude/prototipo:** preservar `app.js` y no insertar Auth visible.
- **Academia:** diferenciar selección de perfil, Auth real, claims y fuente operacional.
- **Sin impacto Claude:** credenciales privadas E2E, service account y consumo de autorización.

## 8. Pendiente real y siguiente bloque

Pendiente:
`VALIDACIÓN HUMANA ACUMULATIVA DEL BUILD PUBLICADO → APROBADO C6 → FREEZE`.

Después:
`FUENTE EXACTA AGOSTO → DISPONIBLES → POSTULACIONES → GATE MULTIROL → AUTORIZACIÓN DE WRITES/CUTOVER → PRODUCCIÓN`.

## 9. Estado seguro

DEV técnicamente PASS. Producción intacta. La autorización de redeploy quedó consumida y no habilita nuevas mutaciones.