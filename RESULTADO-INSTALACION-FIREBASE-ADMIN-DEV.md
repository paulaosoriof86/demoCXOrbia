# RESULTADO-INSTALACION-FIREBASE-ADMIN-DEV.md

## Fecha

2026-06-28

## Resultado

Instalación local de `firebase-admin` completada dentro de `firebase/auth-dev-tools`.

## Salida visible resumida

- `npm.cmd install firebase-admin --no-package-lock --omit=dev` completó la instalación.
- PowerShell mostró `added 178 packages`.
- La verificación con Node mostró `firebase-admin OK`.

## Observaciones

`npm` mostró advertencias de dependencias. No bloquean este gate porque la herramienta es local, temporal y no se publica a Hosting ni producción.

## Impacto

- Se instaló la dependencia local necesaria para ejecutar el script de Auth DEV.
- No se crearon usuarios.
- No se asignaron claims.
- No se cargó seed.
- No se activó adapter.
- No se tocó producción.
- No se modificó `/app/modules`.

## Siguiente paso

Ejecutar `firebase/auth-dev-tools/create-dev-users-and-claims.cjs` solo después de contar con credencial local válida para Firebase Admin SDK en el proyecto DEV `cxorbia-backend-dev`.
