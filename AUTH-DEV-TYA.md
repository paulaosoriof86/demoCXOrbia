# AUTH-DEV-TYA.md

## Objetivo

Definir cómo probar Auth en DEV para el tenant `tya` sin tocar producción, sin crear usuarios reales todavía y sin activar el adapter Firestore.

## Estado actual

- Firebase DEV: `cxorbia-backend-dev`
- Auth Email/Password: activado
- Firestore: creado
- Storage: pendiente por Blaze
- Adapter: `CX.BACKEND.enabled = false`
- Producción: `tya-plataforma.web.app` no se toca
- Datos reales: no se cargan todavía

## Estrategia

La plataforma seguirá siendo multi-tenant. Los permisos se basan en claims o en una combinación de claims + documento de usuario.

Para la primera prueba DEV, las reglas Firestore esperan principalmente estos claims:

```text
role
tenantId
projectIds
shopperId
```

## Usuarios DEV sugeridos

Estos usuarios son solo de prueba. No usar contraseñas reales ni datos personales reales.

| Rol | Propósito | Claims esperados |
|---|---|---|
| super | Validar administración global | `role=super` |
| admin | Validar administración de T&A | `role=admin`, `tenantId=tya`, `projectIds=[tya-piloto]` |
| ops | Validar operación diaria | `role=ops`, `tenantId=tya`, `projectIds=[tya-piloto]` |
| shopper | Validar portal evaluador | `role=shopper`, `tenantId=tya`, `projectIds=[tya-piloto]`, `shopperId=eval-01` |
| cliente | Validar portal cliente | `role=cliente`, `tenantId=tya`, `projectIds=[tya-piloto]` |

## Documento de usuario recomendado

Además de claims, crear documento espejo en:

```text
/tenants/tya/users/{uid}
```

Campos mínimos:

```json
{
  "uid": "firebase-uid",
  "email": "usuario-dev@example.com",
  "displayName": "Usuario DEV",
  "role": "admin",
  "tenantId": "tya",
  "projectIds": ["tya-piloto"],
  "status": "active",
  "createdFor": "dev-auth-test"
}
```

Para shopper:

```json
{
  "uid": "firebase-uid",
  "email": "shopper-dev@example.com",
  "displayName": "Evaluador DEV",
  "role": "shopper",
  "tenantId": "tya",
  "projectIds": ["tya-piloto"],
  "shopperId": "eval-01",
  "status": "active",
  "createdFor": "dev-auth-test"
}
```

## Validación por rol

Antes de activar `CX.BACKEND.enabled`, validar manualmente o con Rules Playground:

### Admin

Debe poder:

- leer tenant `tya`
- leer/escribir proyectos
- leer/escribir shoppers
- leer/escribir visitas
- leer/escribir finanzas

### Ops

Debe poder:

- leer tenant `tya`
- leer proyectos asignados
- leer/escribir visitas
- leer/escribir postulaciones
- leer/escribir cuestionarios
- leer/escribir documentos

No debe poder:

- leer/escribir finanzas
- administrar automations

### Shopper

Debe poder:

- leer su shopper propio
- leer visitas propias/asignadas
- crear postulaciones propias
- crear respuestas propias
- leer liquidaciones propias

No debe poder:

- leer otros shoppers
- leer visitas de otros evaluadores
- leer finanzas
- leer lotes

### Cliente

Debe poder:

- leer tenant propio
- leer proyectos asignados
- leer visitas/resultados del proyecto asignado
- leer cuestionarios/respuestas del proyecto asignado

No debe poder:

- leer finanzas
- leer liquidaciones
- leer lotes
- leer postulaciones internas
- editar operación

## Restricciones

- No crear usuarios reales todavía.
- No usar correos personales ni datos sensibles en DEV.
- No subir credenciales al repositorio.
- No usar service account en el navegador.
- No activar producción.
- No publicar reglas sin validación previa.
- No hacer deploy a `tya-plataforma.web.app`.

## Pendiente técnico

Definir la forma segura de asignar custom claims:

1. Manual controlado por Firebase Admin SDK en entorno local seguro.
2. Cloud Function administrativa protegida.
3. Proceso temporal de bootstrap solo para DEV.

No implementar claims desde frontend.
