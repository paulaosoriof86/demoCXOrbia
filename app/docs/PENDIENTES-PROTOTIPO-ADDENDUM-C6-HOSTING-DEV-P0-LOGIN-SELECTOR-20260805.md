# Pendientes prototipo — Hosting DEV y P0 selector de Login

## Cerrado

- membresía Cliente reparada;
- snapshot, idempotencia, readback y rollback dry-run PASS;
- único Hosting DEV ejecutado;
- paridad de assets y HR viva PASS.

## P0 vigente

```text
FAIL_C6_UNIFIED_HUMAN_AUTH_CREDENTIAL_STEP
failedPrincipal=staff
```

Causa:

- contenedor V7.2: `.lg2-card`;
- selector Auth heredado: `.login-card`;
- resultado: formulario integrado ausente.

Archivos del root fix:

- `app/core/backend-browser-auth.js`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js`.

Delta:

```js
loginRoot.querySelector('.lg2-card, .login-card')
```

## Gates pendientes después del fix y de una nueva autorización de deploy

- paridad remota;
- Staff;
- Shopper con tres recargas y nueva pestaña;
- Cliente;
- dominio;
- Finanzas;
- Portal Cliente;
- Portal Shopper;
- Reservas;
- Laboratorio real controlado;
- validación humana y freeze canónico.

## Prohibición

No ejecutar un segundo deploy automático. El primero ya fue consumido.
