# CASOS-PRUEBA-FIRESTORE.md

## Objetivo

Definir casos de prueba para validar `firestore.rules` antes de publicar reglas, cargar datos piloto o activar el adapter.

## Estado

Estos casos son de validación. No implican deploy, no crean usuarios y no cargan datos reales.

## Claims base para pruebas

### Admin T&A

```json
{
  "role": "admin",
  "tenantId": "tya",
  "projectIds": ["tya-piloto"]
}
```

### Ops T&A

```json
{
  "role": "ops",
  "tenantId": "tya",
  "projectIds": ["tya-piloto"]
}
```

### Shopper T&A

```json
{
  "role": "shopper",
  "tenantId": "tya",
  "projectIds": ["tya-piloto"],
  "shopperId": "eval-01"
}
```

### Cliente T&A

```json
{
  "role": "cliente",
  "tenantId": "tya",
  "projectIds": ["tya-piloto"]
}
```

### Usuario de otro tenant

```json
{
  "role": "admin",
  "tenantId": "otro-tenant",
  "projectIds": ["tya-piloto"]
}
```

### Shopper sin proyecto asignado

```json
{
  "role": "shopper",
  "tenantId": "tya",
  "projectIds": [],
  "shopperId": "eval-01"
}
```

## Casos esperados

| Caso | Rol | Ruta | Acción | Resultado esperado |
|---|---|---|---|---|
| 1 | sin auth | `/tenants/tya` | read | deny |
| 2 | admin tya | `/tenants/tya` | read | allow |
| 3 | otro tenant | `/tenants/tya` | read | deny |
| 4 | admin tya | `/tenants/tya/projects/tya-piloto` | read/write | allow |
| 5 | ops tya | `/tenants/tya/projects/tya-piloto/visits/tya-piloto-v01` | read/write | allow |
| 6 | ops tya | `/tenants/tya/projects/tya-piloto/finance/m01` | read/write | deny |
| 7 | shopper eval-01 | `/tenants/tya/shoppers/eval-01` | read | allow |
| 8 | shopper eval-01 | `/tenants/tya/shoppers/eval-02` | read | deny |
| 9 | shopper eval-01 | visita propia con `shopperId=eval-01` | read/update | allow |
| 10 | shopper eval-01 | visita de otro shopper | read/update | deny |
| 11 | shopper eval-01 | visita disponible con `estado=disponible` y proyecto asignado | read | allow |
| 12 | shopper sin proyecto | visita disponible con `estado=disponible` | read | deny |
| 13 | shopper eval-01 | postulación propia con `shopperId=eval-01` | create | allow |
| 14 | shopper eval-01 | postulación de otro shopper | create | deny |
| 15 | cliente tya | proyecto asignado | read | allow |
| 16 | cliente tya | finance | read/write | deny |
| 17 | cliente tya | postulations | read/write | deny |
| 18 | cliente tya | responses del proyecto asignado | read | allow |
| 19 | admin tya | automations | read/write | allow |
| 20 | ops tya | automations | read/write | deny |
| 21 | admin tya | auditLogs | read | allow |
| 22 | cualquier auth tya | auditLogs | create | allow |
| 23 | cualquier auth tya | auditLogs | update/delete | deny |

## Casos P0 obligatorios antes de publicar reglas

```text
1. sin auth no puede leer tenant
2. otro tenant no puede leer tenant tya
3. shopper no puede leer shopper de otro evaluador
4. shopper sí puede leer visita disponible de proyecto asignado
5. shopper sin proyecto no puede leer visita disponible
6. cliente no puede leer finance ni postulations
7. ops no puede leer finance
8. auditLogs no permite update/delete
```

## Validación posterior

Después de ejecutar estos casos:

1. Registrar resultados en `PENDIENTES-PROTOTIPO.md` si aparece un problema que afecte frontend.
2. Registrar ajustes de reglas en `CAMBIOS-BACKEND.md`.
3. Mantener `CX.BACKEND.enabled = false` hasta completar la validación.
4. No cargar base buena real todavía.

## Criterio de avance

Solo avanzar a escritura del seed ficticio si los casos P0/P1 de reglas pasan correctamente en DEV o Rules Playground.
