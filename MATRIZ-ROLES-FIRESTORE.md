# MATRIZ-ROLES-FIRESTORE.md

## Objetivo

Documentar la matriz de permisos esperada para Firestore antes de publicar reglas y antes de activar `CX.BACKEND.enabled`.

## Roles base

| Rol | Uso esperado |
|---|---|
| `super` | Administración global de tenants y configuración base. |
| `admin` | Administración operativa y financiera del tenant. |
| `ops` | Operación diaria: visitas, shoppers, postulaciones, cuestionarios, documentos y certificaciones. |
| `shopper` | Portal de evaluador. Lee datos propios, visitas asignadas/postuladas y visitas disponibles de proyectos asignados. |
| `cliente` / `client` | Portal cliente. Solo proyectos autorizados y resultados operativos permitidos. |

## Claims esperados

Los usuarios autenticados deben tener claims o perfil equivalente:

```text
role: super | admin | ops | shopper | cliente
tenantId: tya
projectIds: [tya-piloto]
shopperId: eval-01   // solo para shopper
```

## Matriz resumida

| Colección | Super/Admin | Ops | Shopper | Cliente |
|---|---:|---:|---:|---:|
| `/tenants/{tenantId}` | leer | leer | leer tenant propio | leer tenant propio |
| `/users/{uid}` | leer/escribir | no | solo propio | solo propio |
| `/clients/{clientId}` | leer/escribir | leer | no | leer |
| `/shoppers/{shopperId}` | leer/escribir | leer/escribir | solo propio | no |
| `/notifications/{id}` | leer/escribir | leer/escribir | solo propias/rol | solo propias/rol |
| `/automations/{id}` | leer/escribir | no | no | no |
| `/auditLogs/{id}` | leer; crear log | crear log | crear log | crear log |
| `/projects/{projectId}` | leer/escribir | leer | leer si asignado | leer si asignado |
| `/visits/{visitId}` | leer/escribir | leer/escribir | propias o disponibles del proyecto asignado | leer proyecto asignado |
| `/postulations/{id}` | leer/escribir | leer/escribir | solo propias | no |
| `/questionnaires/{id}` | leer/escribir | leer/escribir | leer proyecto asignado | leer proyecto asignado |
| `/responses/{id}` | leer/escribir | leer/escribir | propias | leer proyecto asignado |
| `/liquidations/{id}` | leer/escribir | leer | propias | no |
| `/lots/{id}` | leer/escribir | leer | no | no |
| `/finance/{id}` | leer/escribir | no | no | no |
| `/documents/{id}` | leer/escribir | leer/escribir | leer proyecto asignado | leer proyecto asignado |
| `/certifications/{id}` | leer/escribir | leer/escribir | propias | no |

## Regla especial de visitas disponibles

Para que el shopper pueda postularse, puede leer visitas con:

```text
estado == disponible
projectId incluido en request.auth.token.projectIds
tenantId autorizado
```

Esto no le permite leer visitas asignadas a otros shoppers.

## Riesgos controlados

1. El cliente no debe leer finanzas, lotes, liquidaciones ni postulaciones internas.
2. El shopper no debe leer visitas de otros evaluadores, salvo visitas disponibles del proyecto asignado.
3. Operaciones financieras quedan reservadas para `admin` o `super`.
4. Storage sigue cerrado hasta activar Blaze y diseñar rutas privadas.
5. Estas reglas deben probarse en DEV antes de publicar.

## Pendiente para Fase Auth

Definir si los permisos se manejarán con custom claims, documentos `/users/{uid}`, o ambos. La regla actual está preparada principalmente para claims, por lo que la creación de usuarios reales debe incluir esa asignación.
