# PLAN-VALIDACION-BULLETINS-V57.md

Plan de validación para el tablón/novedades V57 con backend Firestore.

## Alcance

Validar que el bridge `app/core/backend-bulletins.js` alimente `CX.notif` desde Firestore y persista estados leído/no leído sin tocar módulos UI.

## Precondiciones

- Ejecutar solo en DEV.
- Usar `app/index-backend-dev.html`.
- No publicar Hosting.
- No tocar producción.
- No usar datos reales.
- Auth DEV debe estar resuelto.

## Casos de prueba funcionales

1. Admin inicia sesión y ve novedades activas del tenant.
2. Shopper inicia sesión y ve solo novedades dirigidas a shopper o a su usuario.
3. Novedad con `actionRoute` aparece clicable y navega a la sección correspondiente.
4. Marcar una novedad como leída actualiza `bulletinReads`.
5. Marcar todas como leídas genera estados de lectura para el usuario.
6. Crear notificación desde el tablón admin genera documento en `bulletins`.
7. El badge del topbar refleja novedades sin leer.

## Casos de seguridad

1. Usuario de otro tenant no lee novedades TyA.
2. Shopper no crea novedades globales.
3. Shopper no actualiza lectura de otro usuario.
4. Admin no ve datos de otro tenant.

## Gate de aprobación

El gate se aprueba solo si:

- El preview muestra fuente `firestore`.
- Auth está OK.
- Tenant es `tya`.
- Las novedades aparecen desde Firestore.
- El estado leído/no leído persiste al recargar.
- No se modifica `app/index.html`.
- No se modifican módulos UI para backend.
