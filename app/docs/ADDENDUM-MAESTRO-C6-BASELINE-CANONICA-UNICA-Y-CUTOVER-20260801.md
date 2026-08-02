# ADDENDUM MAESTRO — C6 baseline canónica única y carril de cutover

**Fecha:** 2026-08-01  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_RUNTIME_PASS_EXCEPT_CLIENT_CREDENTIAL__HOLD_NO_AUTH_WRITE_NO_DEPLOY_NO_PRODUCTION`

## 1. Propósito

Este addendum impide que CXOrbia/TyA vuelva a fragmentarse por módulo, etapa, fuente, carril de login o conversación. Solo puede existir una baseline acumulativa construida sobre el HEAD vivo de `docs-tya-v6-v71-audit`.

## 2. Baseline acumulativa comprobada

El HEAD vivo contiene y ha comprobado read-only:

- frontend aprobado vigente;
- entrada humana única `authenticated-human-canonical`;
- Firebase Auth/claims para Staff y Shopper;
- HR viva como autoridad operacional dinámica;
- Firestore protegido como overlay exacto;
- read model y máquina de estados canónicos;
- Dashboard, fases, detalle, histórico y comparativo;
- Portal Shopper con identidad exacta;
- Finanzas y Reservas canónicas;
- tres recargas y nueva pestaña;
- carril técnico Staff/Shopper aislado;
- ruta Cliente integrada Usuario + Contraseña.

Corte 6 no está congelado porque falta un principal Cliente autenticado con claims correctos.

## 3. Fuente viva observada

Revisión del gate vigente:

- 14 periodos, junio 2025–julio 2026;
- 616 visitas;
- 208 shoppers;
- agosto 2026 ausente.

Julio observado:

- 44 total;
- 43 realizadas;
- 41 cuestionarios;
- 37 submitidas;
- 1 fuera de rango;
- GT 34 / HN 10.

Estos valores son fotografía de fuente, no invariantes permanentes. Queda prohibido crear agosto por reloj, copiar julio o congelar KPIs de cortes anteriores.

## 4. Modelo financiero por proyecto

El modelo proviene exclusivamente de `projectConfig`:

- `directo/local_invoicing`: regalías solo si se configuran;
- `delegado/delegated_coordination`: regalías 0 y comisión de coordinación compartida;
- `regional/regional_coordination`: distribución regional configurable;
- `unconfigured`: fail-closed.

Cinépolis es delegado desde su configuración:

- Q60 GT / L200 HN al shopper;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca usado como ingreso;
- margen solo con comisión/distribución exactas.

## 5. Root fixes Auth prevalentes

### Click temprano

`tya-c6-unified-human-runtime-v1.js` impide que un clic antes del wrapper oficial use el handler directo.

PASS: `PASS_C6_HUMAN_LOGIN_IMMEDIATE_CLICK_GUARDED`.

### Shopper DEV

`app.js` ejecuta `pickShopperDev()` directamente para la tarjeta Shopper DEV. `tya-c6-shopper-auth-click-guard-v1.js`, cargado antes de `app.js`, intercepta únicamente esa tarjeta en la ruta protegida y abre Firebase Auth.

Queda prohibido eliminar este guard o reintroducir selección directa de Shopper en una ruta protegida.

### Carril técnico

`tya-dev-technical-auth-e2e-v1.js` usa:

- formulario `cxDevEntryAuth`;
- `CX_DEV_ENTRY_AUTH_GATE.mode='technical-auth-e2e-isolated'`;
- namespaces staff/shopper;
- ruta humana no afectada.

## 6. Gates PASS

- static cumulative contract;
- live HR dynamic canonical state;
- domain/finance/shopper/reservations;
- Auth humana Staff;
- Auth humana Shopper con identidad exacta y una visita propia;
- tres recargas y nueva pestaña;
- Auth técnica Staff/Shopper aislada;
- ruta Cliente integrada;
- cero credenciales/tokens expuestos;
- cero writes.

## 7. HOLD exacto de Cliente

La búsqueda read-only obtuvo:

- 4 registros candidatos;
- 3 usuarios Auth existentes;
- 0 cuentas con claims válidos `cliente/client` para tenant `tya` y proyecto `cinepolis`;
- 0 hashes válidos;
- 0 sign-ins Cliente.

Decisión:

`HOLD_C6_EXISTING_CLIENT_CREDENTIAL_NOT_FOUND`.

No se creó ni modificó ninguna cuenta. Auth writes, cambios y resets de contraseña permanecen en cero.

## 8. Operaciones prohibidas

Queda prohibido:

- crear otra plataforma, candidata, rama, PR, Firebase o Hosting;
- mantener carriles humanos paralelos;
- permitir `pickShopperDev()` en ruta protegida;
- crear/resetear credencial Cliente sin autorización;
- permitir que Auth/Firestore reemplace HR;
- deduplicar por nombre/correo/teléfono;
- aplicar regalías globales;
- inferir ingreso delegado desde honorarios del shopper;
- saltar el gate por urgencia;
- reutilizar autorización consumida;
- desplegar, abrir agosto/postulaciones, merge o producción sin gates y autorizaciones específicos.

## 9. Gate restante de Corte 6

Requiere autorización específica porque implica Auth write:

`SNAPSHOT AUTH CLIENT SCOPE → MATERIALIZE ONE CLIENT CREDENTIAL DEV → CLAIMS TENANT/PROJECT/ROLE → IDEMPOTENCY → CLIENT HUMAN AUTH → 3 RELOADS + NEW TAB → READBACK → ROLLBACK PROOF → CUMULATIVE EVIDENCE`.

Solo después de PASS Cliente y repetición acumulativa corresponde solicitar autorización fresca para un único deploy del Hosting DEV existente.

Después del deploy autorizado:

- paridad remota;
- mismo gate acumulativo;
- validación humana;
- `APROBADO → C6_BASELINE_CANONICA_ACUMULATIVA_FROZEN`.

## 10. Agosto y postulaciones

Después del freeze:

1. Paula agrega agosto a HR;
2. el runtime lo detecta;
3. se reconcilia platform-origin;
4. se habilitan disponibles;
5. se habilitan postulaciones;
6. gate multirol;
7. write plan y autorización;
8. readback, remote smoke y cutover.

## 11. Invariantes de producto

- último periodo = último periodo detectado, no mes del reloj;
- KPI = fase = detalle;
- Admin, Cliente y Shopper comparten periodo/read model según alcance;
- Shopper usa identidad exacta;
- cero duplicados técnicos;
- conflictos en review queue;
- modelos financieros por configuración;
- delegado/regional = regalías 0;
- ingreso de coordinación separado de obligaciones al shopper;
- margen no confirmado sin fuentes exactas;
- credencial ausente = HOLD, no permiso para inventarla.

## 12. Documentación obligatoria

Fuentes vivas de este bloque:

- `CAMBIOS-BACKEND-ADDENDUM-C6-AUTH-RUNTIME-Y-HOLD-CLIENTE-20260801.md`;
- `CORTE6-UNIFIED-AUTH-RUNTIME-READONLY-LATEST.json`;
- `CORTE6-EXISTING-CLIENT-CREDENTIAL-SELECTION-LATEST.json`;
- índice, checkpoint, Phase A, resumen Claude, pendientes, Academia y PR #7.

No se afirma éxito sin evidencia.

## 13. Clasificación

- **Reusable CXOrbia:** baseline acumulativa, guards Auth, modelo financiero configurable y gate multirol.
- **Exclusivo TyA:** tenant `tya`, proyecto `cinepolis`, Q60/L200 y credencial Cliente pendiente.
- **Claude/prototipo:** preservar UI; no reimplementar Auth o cálculo en módulos.
- **Academia:** principal autenticado, fuente viva, gate por rol y HOLD con cero mutación.
- **Sin impacto proveedor:** todo el bloque ejecutado fue read-only.

## 14. Estado seguro

Hosting deploys 0; Cloud Run 0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes 0; password changes/resets 0; nuevos proyectos/sites 0; merge=false; producción=false.
