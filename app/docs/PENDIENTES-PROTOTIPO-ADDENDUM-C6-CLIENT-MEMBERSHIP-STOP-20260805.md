# Pendientes prototipo — C6 Cliente membership STOP

## Bloqueo P0 operativo

`CLIENT_MEMBERSHIP_READBACK_MISMATCH`

Ruta afectada:

`tenants/tya/users/cxorbia-c6-client-tya-cinepolis-v1`

El usuario Auth Cliente existe, puede iniciar sesión y tiene claims canónicos. La membresía está ausente o no cumple el contrato v2.

## Solución requerida

1. autorización expresa para un único repair DEV;
2. snapshot del usuario y documento actual;
3. máximo `1` Firestore membership write;
4. `0` user creates, `0` password changes y `0` HR writes;
5. idempotencia;
6. readback exacto;
7. rollback dry-run;
8. después, retomar el único Hosting DEV aún no utilizado.

## Pendientes posteriores

- paridad remota;
- Staff;
- Shopper con tres recargas y nueva pestaña;
- Cliente;
- dominio, Finanzas, Portal Cliente, Portal Shopper y Reservas;
- Laboratorio real controlado;
- cleanup y validación humana;
- freeze `ACTIVE_CANONICAL_BASELINE`.

## P1/P2 preservados

- overlay A+B superseded aún cargado;
- exportación PDF de gráficas;
- presentación XLSX básica;
- cuatro rutas shopper por confirmar en el contrato Lab.

No ejecutar un segundo deploy automático ni modificar frontend para resolver la membresía.
