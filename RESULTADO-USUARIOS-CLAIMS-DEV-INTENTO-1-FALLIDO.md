# RESULTADO-USUARIOS-CLAIMS-DEV-INTENTO-1-FALLIDO.md

## Fecha

2026-06-28

## Gate autorizado

Usuarios DEV ficticios y claims en Firebase DEV, sin usuarios reales, sin datos reales, sin activar adapter y sin tocar producción.

## Resultado

Intento fallido antes de crear usuarios.

## Causa

PowerShell ejecutó el comando `node .\create-dev-users-and-claims.cjs` desde la raíz del repo:

```text
C:\Users\paula\OneDrive\Documentos\GitHub\demoCXOrbia
```

El script está ubicado en:

```text
firebase\auth-dev-tools\create-dev-users-and-claims.cjs
```

Por eso Node reportó:

```text
Error: Cannot find module 'C:\Users\paula\OneDrive\Documentos\GitHub\demoCXOrbia\create-dev-users-and-claims.cjs'
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

Ejecutar nuevamente desde la carpeta correcta:

```text
firebase\auth-dev-tools
```

O invocar el script con ruta absoluta desde el repo.
