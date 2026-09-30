# CAMBIOS BACKEND — C6 AUTH RUNTIME Y HOLD DE CLIENTE

**Fecha:** 2026-08-01  
**Estado:** `STAFF_SHOPPER_TECHNICAL_AUTH_PASS__CLIENT_ROUTE_PASS__NO_EXISTING_CLIENT_CREDENTIAL_FOUND__HOLD_NO_AUTH_WRITE`  
**Repo/rama/PR:** `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft-open-no merge.

## 1. Bloque ejecutado

Se ejecutó la secuencia read-only posterior al gate estático:

`STATIC CUMULATIVE → LIVE HR DYNAMIC → HUMAN STAFF AUTH → HUMAN SHOPPER AUTH → TECHNICAL AUTH ISOLATED → 3 RELOADS → NEW TAB → CLIENT ROUTE → EXISTING CLIENT CREDENTIAL LOOKUP`.

No se hizo deploy, merge, producción ni mutación de proveedor.

## 2. Root fixes aplicados

### Click temprano antes del wrapper oficial

La tarjeta de rol podía hacerse visible antes de que `backend-browser-auth.js` terminara de envolver `CX.app.selectRole`. Un clic inmediato podía entrar por el handler directo del prototipo.

Se agregó en `app/adapters/tya-c6-unified-human-runtime-v1.js` un guard de captura temporal que:

- intercepta el clic antes del handler directo;
- lo envía al bridge integrado de Auth;
- deja de intervenir cuando el wrapper oficial ya está activo;
- no almacena credenciales ni autentica por sí mismo.

Evidencia: `PASS_C6_HUMAN_LOGIN_IMMEDIATE_CLICK_GUARDED`.

### Bypass específico del Shopper DEV

`app/app.js` usa `pickShopperDev()` directamente para la tarjeta Shopper en acceso DEV, sin pasar por `CX.app.selectRole`. Por eso el wrapper oficial no podía proteger esa ruta.

Se creó `app/adapters/tya-c6-shopper-auth-click-guard-v1.js`, cargado antes de `app.js`, que:

- actúa únicamente en la ruta humana protegida;
- intercepta solo la tarjeta Shopper no autenticada;
- evita `pickShopperDev()`;
- abre el mismo formulario Usuario + Contraseña de Firebase Auth;
- no modifica `app.js`, módulos UI ni datos.

### Contrato del carril técnico

El adapter técnico renderizaba un formulario con ID distinto del contrato estable esperado por el E2E y no publicaba `CX_DEV_ENTRY_AUTH_GATE`.

`app/adapters/tya-dev-technical-auth-e2e-v1.js` ahora:

- usa `cxDevEntryAuth`;
- publica `mode:'technical-auth-e2e-isolated'`;
- conserva namespace técnico staff/shopper;
- declara ruta humana no afectada;
- mantiene cero writes.

## 3. Gates comprobados

### HR viva y dominio

- `PASS_C6_LIVE_HR_DYNAMIC_CANONICAL_STATE`.
- 14 periodos, junio 2025 a julio 2026.
- 616 visitas y 208 shoppers en la revisión observada.
- Julio observado: 44 total, 43 realizadas, 41 cuestionarios, 37 submitidas y 1 fuera de rango.
- Llaves completas y únicas; cero duplicados técnicos.

### Staff humano

- Principal real `coordinador`, namespace `staff`.
- 14 periodos y 616 visitas.
- Tres recargas estables.
- Nueva pestaña estable.
- Sin exposición de credenciales o tokens.

### Shopper humano

- Principal real `shopper`, namespace `shopper`.
- Identidad exacta con una visita propia comprobada.
- 14 periodos y 616 visitas preservados.
- Tres recargas estables.
- Nueva pestaña estable.
- Sin bypass al selector DEV.

### Carril técnico aislado

- `PASS_C6_REAL_USERS_END_TO_END_TECHNICAL_LANE_ISOLATED`.
- Staff y Shopper validados con Auth/claims.
- Ruta humana no reemplazada.
- Refresh y nueva pestaña preservados.

### Portal Cliente

- Ruta integrada Usuario + Contraseña: PASS.
- Búsqueda read-only de credencial existente: HOLD.

Resultado sanitizado:

- 4 registros candidatos de usuario examinados;
- 3 coincidencias con usuarios Auth existentes;
- 0 cuentas con claims válidos de Cliente para tenant `tya` y proyecto `cinepolis`;
- 0 hashes y 0 sign-ins de Cliente;
- 0 Auth writes, cambios o resets de contraseña.

Decisión acumulativa:

`HOLD_C6_EXISTING_CLIENT_CREDENTIAL_NOT_FOUND`.

## 4. Qué no está autorizado

No existe autorización para:

- crear una cuenta Cliente;
- cambiar claims;
- crear o resetear contraseña;
- escribir Auth/Firestore/HR;
- desplegar Hosting;
- merge o producción.

La materialización de una credencial Cliente requiere autorización específica y un gate separado con snapshot, idempotencia, readback y rollback.

## 5. Archivos creados o modificados

### Runtime y contratos

- `app/adapters/tya-c6-unified-human-runtime-v1.js`.
- `app/adapters/tya-c6-shopper-auth-click-guard-v1.js`.
- `app/adapters/tya-dev-technical-auth-e2e-v1.js`.
- `app/index-backend-dev.html`.

### QA

- `tools/qa/tya-c6-human-login-wrapper-diagnostic.mjs`.
- `tools/qa/tya-c6-unified-human-auth-browser-smoke.mjs`.
- `tools/qa/cxorbia-c6-existing-client-e2e-credential.mjs`.
- `tools/qa/tya-c6-client-auth-browser-smoke.mjs`.
- `tools/qa/tya-c6-unified-cumulative-runtime-gate.mjs`.

### Evidencia

- `CORTE6-HUMAN-LOGIN-WRAPPER-DIAGNOSTIC-LATEST.json`.
- `CORTE6-UNIFIED-HUMAN-AUTH-RUNTIME-LATEST.json`.
- `CORTE6-UNIFIED-AUTH-RUNTIME-READONLY-LATEST.json`.
- `CORTE6-EXISTING-CLIENT-CREDENTIAL-SELECTION-LATEST.json`.
- `CORTE6-CLIENT-AUTH-RUNTIME-LATEST.json`.

## 6. Siguiente bloque exacto

Con autorización específica:

`SNAPSHOT AUTH CLIENT SCOPE → MATERIALIZE ONE CLIENT CREDENTIAL IN DEV → CLAIMS TENANT/PROJECT/ROLE → IDEMPOTENCY CHECK → CLIENT AUTH HUMAN RUNTIME → 3 RELOADS + NEW TAB → READBACK → ROLLBACK PROOF → CUMULATIVE EVIDENCE`.

Sin esa autorización, el estado correcto permanece HOLD y no corresponde deployar.

## 7. Clasificación

- **Reusable CXOrbia:** guard de click temprano, protección Shopper, carril técnico estable y gate multirol.
- **Exclusivo TyA:** tenant `tya`, proyecto `cinepolis` y credencial Cliente pendiente.
- **Claude/prototipo:** no reintroducir `pickShopperDev()` en una ruta protegida; no mover Auth a módulos UI.
- **Academia:** diferencia entre ruta visible, principal autenticado y cobertura real por rol.
- **Sin impacto proveedor:** todo el bloque ejecutado fue read-only.
