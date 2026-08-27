# PLAN-EJECUCION-USUARIOS-CLAIMS-DEV.md

## Objetivo

Ejecutar el gate autorizado por Paula para crear usuarios DEV ficticios y asignar custom claims en Firebase DEV `cxorbia-backend-dev`.

## Autorización recibida

```text
Autorizo crear usuarios DEV ficticios y asignar claims en Firebase DEV, sin usuarios reales, sin datos reales, sin activar adapter y sin tocar producción.
```

## Alcance permitido

- Crear o actualizar usuarios ficticios en Firebase Auth DEV.
- Asignar custom claims DEV.
- Mantener `CX.BACKEND.enabled=false`.
- No cargar seed.
- No escribir datos reales.
- No publicar Hosting.
- No tocar producción.
- No modificar `/app/modules`.

## Usuarios DEV ficticios

| Clave | Email ficticio | Rol | Claims |
|---|---|---|---|
| super | `super.dev@cxorbia-dev.example.com` | super | `role=super`, `tenantId=tya`, `projectIds=[tya-piloto]` |
| admin | `admin.tya.dev@cxorbia-dev.example.com` | admin | `role=admin`, `tenantId=tya`, `projectIds=[tya-piloto]` |
| ops | `ops.tya.dev@cxorbia-dev.example.com` | ops | `role=ops`, `tenantId=tya`, `projectIds=[tya-piloto]` |
| shopper | `shopper.eval01.dev@cxorbia-dev.example.com` | shopper | `role=shopper`, `tenantId=tya`, `projectIds=[tya-piloto]`, `shopperId=eval-01` |
| cliente | `cliente.tya.dev@cxorbia-dev.example.com` | cliente | `role=cliente`, `tenantId=tya`, `projectIds=[tya-piloto]` |
| externo-denegacion | `externo.otro.dev@cxorbia-dev.example.com` | admin de otro tenant | `role=admin`, `tenantId=otro-tenant`, `projectIds=[tya-piloto]` |

El usuario `externo-denegacion` sirve para pruebas negativas de tenant.

## Herramienta creada

```text
firebase/auth-dev-tools/create-dev-users-and-claims.cjs
firebase/auth-dev-tools/package.json
```

La herramienta usa Firebase Admin SDK desde entorno local seguro y requiere una variable de confirmación:

```text
CXORBIA_AUTH_DEV_APPROVED=YES_PAULA_20260628_AUTH_DEV
```

## Credenciales

El script no contiene credenciales y no sube contraseñas al repositorio.

Para ejecutarse, Firebase Admin SDK necesita credenciales locales de administración disponibles por Application Default Credentials o por `GOOGLE_APPLICATION_CREDENTIALS` en la máquina local. Si no existen, el script fallará sin tocar datos.

## Reporte local

El script genera un reporte local en:

```text
firebase/auth-dev-tools/output/
```

Ese reporte contiene el password DEV temporal. Está excluido por `.gitignore` y no debe subirse a GitHub.

## Criterio de cierre

El gate se considera completado cuando PowerShell muestre:

```text
== Usuarios DEV y claims finalizados ==
```

Después de recibir esa salida, registrar:

- `RESULTADO-USUARIOS-CLAIMS-DEV.md`
- actualización de `PENDIENTES-PROTOTIPO.md`
- actualización de `ESTADO-GATES-PR1.md`
- addendum para Claude

## Bloqueos posteriores

Aunque este gate termine correctamente, siguen bloqueados:

- seed ficticio en Firestore DEV
- activación del adapter
- Hosting deploy
- base buena T&A
- producción
- merge de PR #1
