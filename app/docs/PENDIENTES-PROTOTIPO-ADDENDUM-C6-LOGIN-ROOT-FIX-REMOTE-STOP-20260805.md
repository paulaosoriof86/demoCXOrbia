# PENDIENTES PROTOTIPO — Addendum C6 Login root fix y STOP remoto

**Fecha:** 2026-08-05

## P0 de Login cerrado técnicamente

El defecto por selector `.login-card` quedó corregido, reconciliado, desplegado y validado remotamente.

PASS comprobados:

- paridad de Hosting DEV;
- Login Staff;
- Login Shopper;
- tres recargas y nueva pestaña;
- visita propia Shopper;
- Login Cliente con credencial existente;
- continuidad Cliente en recarga y nueva pestaña.

No reabrir el root fix del Login salvo evidencia nueva y reproducible.

## Pendiente vivo bloqueante para cierre del gate acumulativo

**Código:** `C6-CLIENT-ROUTE-WAIT-DIAGNOSTIC`

**Estado:** `HOLD_READONLY_DIAGNOSTIC_REQUIRED`

El gate remoto de dominio/Finanzas/portales/Reservas agotó el tiempo en `client_route_wait` después de que el router aceptó `cli_dashboard`.

Debe observarse por separado:

1. existencia de `#nav-cli_dashboard`;
2. clase `active` del elemento;
3. existencia de `#view`;
4. existencia de `#view .ph`;
5. longitud y muestra sanitizada de `#view.innerText`;
6. excepciones de render o consola;
7. tiempo exacto de cada transición.

## Criterio de decisión

- **Producto:** existe excepción, render vacío real, navegación inaccesible o Portal Cliente no visible para una sesión Cliente válida.
- **Harness:** la pantalla está renderizada y operativa, pero el predicado combinado usa una condición o timing no compatible con el shell actual.
- **Indeterminado:** evidencia insuficiente; no modificar nada y mantener STOP.

## Prohibiciones

- cero nuevo deploy;
- cero cambio de runtime antes del diagnóstico;
- cero cambios de credenciales, Auth o memberships;
- cero Firestore/Rules/Storage/HR writes;
- cero Make, Gemini o pagos;
- cero merge o producción.

## P1/P2 preservados

- P1: exportación PDF puede omitir gráficas en algunas rutas.
- P2: presentación de Excel continúa básica.
- P1: overlay A+B supersedido permanece cargado; no retirar sin gate de no pérdida.

Estos pendientes no causaron el STOP actual.
