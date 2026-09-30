# CAMBIOS BACKEND — C6 runtime Cliente posterior al route fix

**Fecha:** 2026-08-04  
**Estado:** `FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK__CLIENT_ROUTE_WAIT_LIFECYCLE_RACE_PROVEN__NO_RETRY__NO_PRODUCTION`

## 1. Autorización consumida

Se ejecutó una sola vez la solicitud:

`c6-client-access-repair-runtime-20260804-routefix-01`.

Commit de autorización:

`f95adea1073633e7e6d638183ff4ec04bedaf979`.

Commit de evidencia:

`7924b1c83bc99e6fdf9a4d081e1bb6c11d24aefc`.

La solicitud quedó `consumed_fail`, deshabilitada y no puede reutilizarse.

## 2. Resultado probado

Decisión:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

Etapa externa:

`runtime_domain_finance_portals_reservations`.

Etapa interna exacta:

`client_route_wait`.

Error:

`page.waitForFunction: Timeout 30000ms exceeded`.

La ejecución había superado previamente snapshot, reparación temporal idempotente, readback, selección de credenciales, autoridad HR dinámica, paridad remota, runtime Staff/Shopper y runtime Cliente con tres recargas y nueva pestaña.

## 3. Rollback y estado seguro

Rollback:

`PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`.

Resultado:

- preestado restaurado: sí;
- membership temporal conservado: no;
- claims finales alterados: no;
- usuarios creados: 0;
- cambios o resets de contraseña: 0;
- Firestore de negocio: 0;
- HR/Rules/Storage: 0;
- Hosting/Cloud Run: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.

La escritura de membership observada pertenece únicamente a la restauración exacta del documento temporal autorizado.

## 4. Causa raíz source-level probada

El problema ya no es la antigua aserción compuesta. El timeout revela una carrera de ciclo de vida entre el helper de login y el router:

1. `openAndLogin()` considera listo el acceso cuando Auth, autoridad HR y `#app.on` están activos.
2. `CX.app.enter()` agrega `#app.on` antes de ejecutar `CX.router.mount()`.
3. `CX.router.mount()` puede quedar detrás del gate de confidencialidad mediante el callback `go`.
4. El gate llama inmediatamente `CX.router.nav('cli_dashboard')` y después espera simultáneamente ruta, nav activa, encabezado y texto.
5. `#nav-cli_dashboard` solo existe después de construir el rail; por tanto, `app.on` no prueba que el shell/router/rail estén listos.

El gate source/static previo validó la presencia de marcadores en el código, pero no el orden temporal real. Ese es el motivo por el que pudo obtener PASS estático y fallar en runtime.

## 5. Correctivo requerido antes de otro runtime

Debe ser source-only y verificable sin credenciales:

- separar `AUTH_READY` de `SHELL_READY`;
- esperar explícitamente que el router y el rail estén materializados antes de navegar;
- detectar y reportar por separado confidencialidad pendiente;
- no usar `app.on` como prueba de router listo;
- no esperar una condición compuesta que pierda qué booleano faltó;
- capturar un snapshot de timeout con `sessionRole`, `sessionView`, `routerAvailable`, `railBuilt`, `navItemPresent`, `navActive`, `pageHeader`, `viewRendered` y `confidentialityPending`;
- mantener `routeId + marker de render` como autoridad funcional y tratar el highlight del nav como evidencia UI separada;
- ejecutar sintaxis y gate de ciclo de vida local/estático;
- detenerse antes de cualquier nuevo runtime.

## 6. Candidata Cloud V6

Archivo recibido:

`Prototype development request V6.zip`.

SHA-256:

`0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`.

El ZIP fue materializado para preflight, pero la auditoría semántica y el empalme no se iniciaron porque `EXECUTION_LANE_READY` exige en la misma sesión:

- ZIP extraído;
- checkout autenticado;
- rama viva exacta.

El entorno local no puede resolver `github.com`; el conector permite lecturas/escrituras puntuales, pero no sustituye el checkout autenticado exigido ni autoriza una auditoría/empalme fragmentado archivo por archivo.

Decisión de candidata:

`NOT_AUDITED__EXECUTION_LANE_NOT_READY`.

No se declara GO ni HOLD visual/funcional y no se aplicó ningún delta.

## 7. Clasificación

- **Reusable CXOrbia:** separación Auth ready / shell ready, snapshot de timeout y gates sin condiciones compuestas.
- **Exclusivo cliente:** membership temporal TyA/Cinépolis.
- **Cloud/prototipo:** V6 recibida, no auditada por carril incompleto.
- **Academia:** documentar que DOM visible, shell montado, ruta y módulo son estados distintos.
- **Sin impacto frontend:** ningún archivo funcional `app/` fue modificado.

## 8. Siguiente bloque exacto

```text
SOURCE-ONLY CLIENT SHELL READINESS ROOT FIX
→ GATE LOCAL/ESTÁTICO DE CICLO DE VIDA
→ OBTENER CHECKOUT AUTENTICADO PARA EXECUTION_LANE_READY
→ AUDITORÍA FOCAL ACUMULATIVA CLOUD V6
→ APPLY_DELTA_DIRECTLY SOLO SI GO Y SIN P0
```

No corresponde reintentar runtime ni empalmar V6 antes de cerrar estos dos gates.
