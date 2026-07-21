# RESULTADO-USUARIOS-CLAIMS-DEV-INTENTO-5-FALLIDO.md

## Fecha

2026-06-28

## Resultado

Intento fallido antes de crear usuarios.

## Causa

La instalación local de Firebase Admin ya funcionaba, pero la autenticación local de Google Cloud SDK no quedó configurada correctamente. El flujo de autenticación indicó que la respuesta ingresada no era válida y luego el script no encontró credenciales locales válidas.

## Impacto

- No se crearon usuarios.
- No se asignaron claims.
- No se cargó seed.
- No se activó adapter.
- No se tocó producción.
- No se modificaron módulos de la app.

## Corrección sugerida

Repetir el login local usando el flujo sin navegador automático y pegar en PowerShell la URL completa de respuesta que genera Google, no solo un código suelto. Luego verificar el token antes de ejecutar el script.
