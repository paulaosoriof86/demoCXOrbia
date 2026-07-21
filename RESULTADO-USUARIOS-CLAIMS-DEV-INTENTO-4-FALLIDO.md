# RESULTADO-USUARIOS-CLAIMS-DEV-INTENTO-4-FALLIDO.md

## Fecha

2026-06-28

## Gate autorizado

Usuarios DEV ficticios y claims en Firebase DEV, sin usuarios reales, sin datos reales, sin activar adapter y sin tocar producción.

## Resultado

Intento fallido antes de crear usuarios.

## Causa

PowerShell bloqueó `npm.ps1` por política de ejecución de scripts:

```text
No se puede cargar el archivo C:\Program Files\nodejs\npm.ps1 porque la ejecución de scripts está deshabilitada en este sistema.
```

Por eso no se instaló `firebase-admin` y la verificación posterior falló con:

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

Usar `npm.cmd` en lugar de `npm`, igual que se hizo antes con `firebase.cmd` en lugar de `firebase`.
