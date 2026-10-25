# PENDIENTES PROTOTIPO — C6 Login selector source/static HOLD

Fecha: 2026-08-05

## P0 source corregido

- Staff y Cliente ya tienen selector acumulativo `.lg2-card, .login-card` en los bridges autorizados.
- No abrir una nueva reparación del Login salvo regresión reproducible posterior al deploy.

## Pendiente bloqueante actual

- Reconciliar únicamente los dos blob pins anteriores en el manifiesto/build-lock activo.
- Reejecutar source/static.
- No ejecutar Hosting DEV mientras no exista PASS.

## Pendientes de validación, no de rediseño

- Staff inicia el paso integrado de credenciales.
- Shopper conserva sesión durante tres recargas y nueva pestaña.
- Cliente inicia el paso integrado y carga su scope.
- Dominio, Finanzas, Portal Cliente, Portal Shopper y Reservas mantienen la composición acumulativa.

## P1/P2 preservados

- Algunas rutas PDF pueden omitir gráficas.
- Formato XLSX continúa básico.

Estos pendientes no deben mezclarse con el P0 del Login ni bloquear la reconciliación focalizada del source lock.
