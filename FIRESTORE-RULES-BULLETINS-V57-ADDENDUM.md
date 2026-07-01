# FIRESTORE-RULES-BULLETINS-V57-ADDENDUM.md

Addendum documental para reglas Firestore del tablón de novedades V57.

Estado: preparado. No publicado en Firebase DEV.

## Objetivo

Preparar permisos para novedades y estados de lectura por tenant.

## Colecciones

- `tenants/{tenantId}/bulletins/{bulletinId}`
- `tenants/{tenantId}/bulletinReads/{readId}`

## Reglas esperadas

- Operadores del tenant crean, editan y desactivan novedades.
- Usuarios leen novedades dirigidas a su rol, usuario, proyecto, país o tenant.
- Cada usuario actualiza solo su propio estado de lectura.
- Admin, ops y coordinador pueden auditar lecturas según sus permisos.

## Validaciones antes de publicar

1. Admin TyA lee novedades del tenant.
2. Rol shopper lee solo novedades dirigidas a su perfil.
3. Usuario no lee novedades de otro usuario.
4. Usuario marca como leído solo su propio registro.
5. Usuario no operador no crea novedades globales.
6. Otro tenant no lee novedades de TyA.

## Restricciones

- No publicar reglas sin autorización expresa.
- No tocar producción.
- No usar datos reales para pruebas de reglas.
- No mezclar con `notifications` legacy hasta validar el bridge.
