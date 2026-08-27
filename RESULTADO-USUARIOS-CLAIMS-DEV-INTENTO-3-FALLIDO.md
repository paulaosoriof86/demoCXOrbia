# RESULTADO-USUARIOS-CLAIMS-DEV-INTENTO-3-FALLIDO.md

## Fecha

2026-06-28

## Gate autorizado

Usuarios DEV ficticios y claims en Firebase DEV, sin usuarios reales, sin datos reales, sin activar adapter y sin tocar producción.

## Resultado

Intento fallido antes de crear usuarios.

## Causa

Se volvió a ejecutar el script sin que existiera la dependencia local `firebase-admin` dentro de `firebase/auth-dev-tools/node_modules`.

Salida visible:

```text
Error: Cannot find module 'firebase-admin'
code: 'MODULE_NOT_FOUND'
```

## Impacto

- No se crearon usuarios.
- No se asignaron claims.
- No se cargó seed.
- No se activó adapter.
- No se tocó producción.
- No se modificó `/app/modules`.

## Corrección

Ejecutar un bloque que primero instale y verifique `firebase-admin`, y solo después ejecute el script.
