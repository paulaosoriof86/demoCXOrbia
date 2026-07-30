# RESULTADO-USUARIOS-CLAIMS-DEV-INTENTO-6-FALLIDO.md

## Fecha

2026-06-28

## Resultado

Intento fallido antes de crear usuarios.

## Causa

La ruta real de `gcloud.cmd` ya fue encontrada, pero el flujo de login ADC sin navegador automático no fue completado correctamente. Google Cloud SDK pidió pegar la salida del comando remoto, pero se recibió una respuesta inválida o vacía.

Luego la verificación de credencial local indicó que no había Application Default Credentials disponibles.

## Impacto

- No se crearon usuarios.
- No se asignaron claims.
- No se cargó seed.
- No se activó adapter.
- No se tocó producción.
- No se modificaron módulos de la app.

## Corrección sugerida

Cambiar a método local con archivo de service account exclusivo de Firebase DEV, guardado fuera del repo y nunca subido a GitHub. Usar `GOOGLE_APPLICATION_CREDENTIALS` solo para ejecutar el script local autorizado.
