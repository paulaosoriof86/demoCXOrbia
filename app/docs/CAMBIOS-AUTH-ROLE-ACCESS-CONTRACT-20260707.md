# Cambios Auth role access contract

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para Auth, roles y accesos.

## Archivos creados

- `tools/contracts/cxorbia-auth-role-access-contract.mjs`
- `app/docs/AUTH-ROLE-ACCESS-CONTRACT-CXORBIA-20260707.md`
- `app/docs/CAMBIOS-AUTH-ROLE-ACCESS-CONTRACT-20260707.md`

## Reusable CXOrbia

- Roles base reusables.
- Permisos por ruta.
- Separacion admin, ops, finance, academia, shopper, client y technical reviewer.

## Exclusivo cliente

- Nada exclusivo del cliente actual.

## Claude/prototipo

- No cambia UI.
- Claude debe respetar rutas y estados por rol.

## Academia

- Impacta rol academy_admin y acceso a contenido.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports y sin datos sensibles.
