# RESULTADO-USUARIOS-CLAIMS-DEV-INTENTO-2-FALLIDO.md

## Fecha

2026-06-28

## Gate autorizado

Usuarios DEV ficticios y claims en Firebase DEV, sin usuarios reales, sin datos reales, sin activar adapter y sin tocar producción.

## Resultado

Intento fallido antes de crear usuarios.

## Causa

El script ya existe localmente en la carpeta correcta:

```text
firebase/auth-dev-tools/create-dev-users-and-claims.cjs
```

Pero Node no encontró la dependencia local:

```text
Error: Cannot find module 'firebase-admin'
code: 'MODULE_NOT_FOUND'
```

Esto indica que no se instaló `firebase-admin` dentro de `firebase/auth-dev-tools/node_modules` antes de ejecutar el script.

## Impacto

- No se crearon usuarios.
- No se asignaron claims.
- No se cargó seed.
- No se activó adapter.
- No se tocó producción.
- No se modificó `/app/modules`.

## Corrección

Ejecutar `npm install --no-package-lock --omit=dev` dentro de:

```text
firebase/auth-dev-tools
```

Después, volver a ejecutar:

```text
node .\create-dev-users-and-claims.cjs
```

Si luego falla por credenciales, resolver acceso local Firebase DEV sin subir credenciales al repositorio.
