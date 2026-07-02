# RESULTADO-AUTH-IMPORT-CLI-DEV-INTENTO-1-FALLIDO.md

## Fecha

2026-06-28

## Resultado

Intento fallido antes de crear usuarios.

## Causa

PowerShell intentó ejecutar el script alternativo:

```text
firebase/auth-dev-tools/auth-import-dev-users.cjs
```

pero el archivo aún no existía en la copia local de Paula. El error visible fue:

```text
Cannot find module '...auth-import-dev-users.cjs'
```

## Impacto

- No se crearon usuarios.
- No se asignaron claims/customAttributes.
- No se cargó seed.
- No se activó adapter.
- No se tocó producción.
- No se modificaron módulos de la app.

## Corrección

Traer explícitamente desde GitHub el archivo `firebase/auth-dev-tools/auth-import-dev-users.cjs` y el plan alternativo antes de ejecutarlo.
