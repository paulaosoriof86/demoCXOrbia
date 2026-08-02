# ADDENDUM MAESTRO — C6 baseline canónica única y carril de cutover

**Fecha:** 2026-08-02  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_AUTH_RUNTIME_ALL_ROLES_PASS__CLIENT_CREDENTIAL_MATERIALIZED__PENDING_FRESH_DEV_DEPLOY_AUTHORIZATION__NO_PRODUCTION`

## 1. Propósito

Este addendum impide que CXOrbia/TyA vuelva a fragmentarse por módulo, etapa, fuente, carril de login o conversación. Solo puede existir una baseline acumulativa construida sobre el HEAD vivo de `docs-tya-v6-v71-audit`.

## 2. Baseline acumulativa comprobada

El HEAD vivo contiene y ha comprobado:

- frontend aprobado vigente;
- entrada humana única `authenticated-human-canonical`;
- Firebase Auth/claims para Staff, Cliente y Shopper;
- HR viva como autoridad operacional dinámica;
- Firestore protegido como overlay exacto;
- read model y máquina de estados canónicos;
- Dashboard, fases, detalle, histórico y comparativo;
- Portal Shopper con identidad exacta;
- Portal Cliente con principal autenticado y alcance exclusivo;
- Finanzas y Reservas canónicas;
- tres recargas y nueva pestaña;
- carril técnico Staff/Shopper aislado;
- materialización, idempotencia, readback y rollback Cliente.

Decisión acumulativa local:

`PASS_C6_READONLY_AUTH_RUNTIME_ALL_ROLES`.

Corte 6 aún no está congelado porque falta deploy DEV fresco, gate remoto idéntico y validación humana acumulativa.

## 3. Fuente viva observada

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

Los valores son fotografía, no invariantes permanentes. Queda prohibido crear agosto por reloj, copiar julio o congelar KPIs de cortes anteriores.

## 4. Modelo financiero por proyecto

El modelo proviene exclusivamente de `projectConfig`:

- `directo/local_invoicing`: regalías solo si se configuran;
- `delegado/delegated_coordination`: regalías 0 y comisión de coordinación compartida;
- `regional/regional_coordination`: distribución regional configurable;
- `unconfigured`: fail-closed.

Cinépolis:

- Q60 GT / L200 HN al shopper;
- regalías 0;
- comisión y reparto configurables;
- honorario Shopper nunca usado como ingreso;
- margen solo con comisión/distribución exactas.

## 5. Root fixes Auth prevalentes

### Click temprano

`tya-c6-unified-human-runtime-v1.js` impide que un clic antes del wrapper oficial use el handler directo.

### Shopper DEV

`tya-c6-shopper-auth-click-guard-v1.js` impide que una ruta protegida ejecute `pickShopperDev()`.

### Cliente post-Auth

El mismo adapter completa `CX.app.enter()` únicamente después de una autenticación Cliente válida con namespace `staff`.

### Carril técnico

`tya-dev-technical-auth-e2e-v1.js` usa:

- formulario `cxDevEntryAuth`;
- `technical-auth-e2e-isolated`;
- namespaces staff/shopper;
- ruta humana no afectada.

## 6. Credencial Cliente materializada

Autorización específica ejecutada:

- snapshot previo con 0 cuentas Cliente válidas;
- una credencial Cliente DEV creada;
- 2 Auth writes: creación + claims;
- `role=cliente`;
- `authNamespace=staff`;
- `tenantId=tya`;
- alcance exclusivo `cinepolis`;
- sign-in PASS;
- segunda aplicación idempotente con 0 writes;
- readback PASS;
- password changes/resets 0;
- credenciales/tokens expuestos 0.

El primer intento fue revertido automáticamente porque Auth no completaba la transición visual. El rollback eliminó el usuario creado y restauró el preestado. Después del root fix, el segundo intento quedó PASS.

## 7. Gates PASS

- static cumulative contract;
- live HR dynamic canonical state;
- domain/finance/shopper/reservations;
- Auth humana Staff;
- Auth humana Shopper con identidad exacta;
- Auth humana Cliente con alcance exacto;
- tres recargas y nueva pestaña;
- Auth técnica Staff/Shopper aislada;
- idempotencia y readback Cliente;
- rollback exacto probado;
- cero exposición de secretos.

## 8. Operaciones prohibidas

Queda prohibido:

- crear otra plataforma, candidata, rama, PR, Firebase o Hosting;
- mantener carriles humanos paralelos;
- permitir `pickShopperDev()` en ruta protegida;
- mover Auth a módulos UI;
- permitir que Auth/Firestore reemplace HR;
- deduplicar por nombre/correo/teléfono;
- aplicar regalías globales;
- inferir ingreso delegado desde honorarios del shopper;
- saltar el gate por urgencia;
- reutilizar autorización consumida;
- desplegar, abrir agosto/postulaciones, merge o producción sin gates y autorizaciones específicos.

## 9. Gate restante de Corte 6

Solo con autorización fresca:

`UN ÚNICO DEPLOY HOSTING DEV EXISTENTE → PARIDAD REMOTA → AUTH STAFF/CLIENTE/SHOPPER → HR/DOMINIO/FINANZAS/PORTALES → 3 RELOADS + NEW TAB → EVIDENCIA → VALIDACIÓN HUMANA → APROBADO C6 → FREEZE`.

Después del deploy autorizado:

- comprobar que el build remoto corresponde exactamente al HEAD aprobado;
- ejecutar el mismo gate acumulativo;
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
- Cliente usa claims exactos de tenant/proyecto;
- autenticar no basta: debe completarse la entrada visual;
- cero duplicados técnicos;
- conflictos en review queue;
- modelos financieros por configuración;
- delegado/regional = regalías 0;
- ingreso de coordinación separado de obligaciones al shopper;
- margen no confirmado sin fuentes exactas.

## 12. Documentación obligatoria

Fuentes vivas de este bloque:

- `CAMBIOS-BACKEND-ADDENDUM-C6-CREDENCIAL-CLIENTE-MATERIALIZADA-20260802.md`;
- `CORTE6-CLIENT-AUTH-MATERIALIZATION-LATEST.json`;
- evidencias de snapshot, apply, idempotencia, readback, runtime y rollback;
- índice, checkpoint, Phase A, resumen Claude, pendientes, Academia y PR #7.

No se afirma éxito sin evidencia.

## 13. Clasificación

- **Reusable CXOrbia:** baseline acumulativa, guards Auth, materialización idempotente y gate multirol.
- **Exclusivo TyA:** tenant `tya`, proyecto `cinepolis` y credencial Cliente.
- **Claude/prototipo:** preservar UI y transición post-Auth; no reimplementar Auth o cálculo en módulos.
- **Academia:** principal autenticado, transición visual, snapshot, idempotencia, readback y rollback.
- **Sin impacto proveedor adicional:** fuera de los dos Auth writes autorizados, todos los demás contadores permanecen en cero.

## 14. Estado seguro

Credenciales Cliente creadas 1; Auth writes autorizados 2; password changes/resets 0; Hosting/Cloud Run deploys 0; Firestore/Rules/Storage/HR/Make/Gemini/pagos writes 0; nuevos proyectos/sites 0; merge=false; producción=false.
