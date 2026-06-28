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

## Casos esperados

| Caso | Rol | Ruta | Acción | Resultado esperado |
|---|---|---|---|---|
| 1 | sin auth | `/tenants/tya` | read | deny |
| 2 | admin tya | `/tenants/tya` | read | allow |
| 3 | otro tenant | `/tenants/tya` | read | deny |
| 4 | admin tya | `/tenants/tya/projects/tya-piloto` | read/write | allow |
| 5 | ops tya | `/tenants/tya/projects/tya-piloto/visits/v01` | read/write | allow |
| 6 | ops tya | `/tenants/tya/projects/tya-piloto/finance/m01` | read/write | deny |
| 7 | shopper eval-01 | `/tenants/tya/shoppers/eval-01` | read | allow |
| 8 | shopper eval-01 | `/tenants/tya/shoppers/eval-02` | read | deny |
| 9 | shopper eval-01 | visita propia con `shopperId=eval-01` | read/update | allow |
| 10 | shopper eval-01 | visita de otro shopper | read/update | deny |
| 11 | shopper eval-01 | postulación propia con `shopperId=eval-01` | create | allow |
| 12 | shopper eval-01 | postulación de otro shopper | create | deny |
| 13 | cliente tya | proyecto asignado | read | allow |
| 14 | cliente tya | finance | read/write | deny |
| 15 | cliente tya | postulations | read/write | deny |
| 16 | cliente tya | responses del proyecto asignado | read | allow |
| 17 | admin tya | automations | read/write | allow |
| 18 | ops tya | automations | read/write | deny |
| 19 | admin tya | auditLogs | read | allow |
| 20 | cualquier auth tya | auditLogs | create | allow |
| 21 | cualquier auth tya | auditLogs | update/delete | deny |

## Validación posterior

Después de ejecutar estos casos:

1. Registrar resultados en `PENDIENTES-PROTOTIPO.md` si aparece un problema que afecte frontend.
2. Registrar ajustes de reglas en `CAMBIOS-BACKEND.md`.
3. Mantener `CX.BACKEND.enabled = false` hasta completar la validación.
4. No cargar base buena real todavía.

## Criterio de avance

Solo avanzar a seed ficticio si los casos P0/P1 de reglas pasan correctamente.
