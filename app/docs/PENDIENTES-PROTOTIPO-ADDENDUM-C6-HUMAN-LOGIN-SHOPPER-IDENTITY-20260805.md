# PENDIENTES PROTOTIPO — Addendum C6 Login humano e identidad Shopper

**Fecha:** 2026-08-05

## P0 source corregido, no desplegado

El bridge ya reutiliza un solo formulario humano. La release DEV todavía no incluye este cambio porque el bloque prohibió deploy.

## Pendiente contractual crítico

Definir si el contrato canónico Shopper requiere:

1. Auth + claims + perfil Shopper; o
2. Auth + claims + perfil + membership en `tenants/tya/users`.

La colección de memberships contiene un documento Cliente y cero memberships Shopper. No debe crearse una población completa hasta confirmar el contrato.

## Pendientes cuantificados

- 21 registros de credencial sin usuario Auth;
- 24 credenciales sin sign-in compatible;
- 30 excepciones al patrón `nombre.apellido`;
- 28 excepciones al patrón `Nombre123*`;
- 252 perfiles Shopper sin mapeo de credencial;
- identidad de Paula ambigua entre una candidata Staff y una Shopper;
- 0 identidades full-ready si membership es obligatorio.

## Acción exacta

- inspeccionar contratos/rules/adapters para resolver membership canónica;
- aislar Paula sin hardcode;
- generar tabla dry-run por categoría, con claves técnicas y sin contraseñas;
- verificar idempotencia, colisiones y rollback;
- pedir autorización expresa antes de cualquier Auth o Firestore write.

## No pendientes frontend derivados

- no rediseñar Login;
- no modificar módulos;
- no duplicar campos;
- no mostrar credenciales de prueba;
- no resolver excepciones desde UI.

## Deuda no bloqueante preservada

PDF con gráficas y formato Excel continúan como P1/P2 documentado.
