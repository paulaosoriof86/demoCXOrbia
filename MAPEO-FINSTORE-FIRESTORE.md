# MAPEO-FINSTORE-FIRESTORE.md

## Objetivo

Documentar cómo se integrará la persistencia financiera vinculada a `CX.finStore` y a pagos generados desde `CX.data.payVisits()`.

Este documento no cambia código, no activa backend y no escribe datos.

## Contexto

`CX.data.payVisits(ids, fechaPago)` marca visitas como liquidadas y puede generar egresos consolidados por país mediante:

```text
CX.finStore.addMov(...)
```

El adapter Firestore actual persiste visitas, pero todavía no persiste movimientos financieros generados por `CX.finStore`.

## Ruta Firestore propuesta

Los movimientos financieros deben vivir bajo el proyecto y tenant correspondiente:

```text
/tenants/{tenantId}/projects/{projectId}/finance/{movementId}
```

## Campos mínimos del movimiento

```text
id
tipo
cat
pais
monto
currency
desc
estado
origen
fecha
projectId
tenantId
createdAt
updatedAt
createdBy
```

## Campos recomendados para trazabilidad

```text
sourceModule
sourceAction
visitIds
lotId
shopperIds
paymentDate
periodo
quincena
metadata
```

## Relación con liquidaciones y lotes

Cuando una visita pasa a `liquidada`, debería existir trazabilidad entre:

```text
visit
liquidation
lot
finance movement
```

Propuesta de rutas:

```text
/tenants/{tenantId}/projects/{projectId}/visits/{visitId}
/tenants/{tenantId}/projects/{projectId}/liquidations/{liquidationId}
/tenants/{tenantId}/projects/{projectId}/lots/{lotId}
/tenants/{tenantId}/projects/{projectId}/finance/{movementId}
```

## Fase 1 — sin tocar UI

1. Mantener `CX.data.payVisits()` igual.
2. Crear wrapper backend para persistir movimientos si `CX.finStore.addMov()` existe.
3. No modificar módulos de finanzas.
4. No cambiar nombres de campos usados por UI.
5. Documentar cualquier inconsistencia en `PENDIENTES-PROTOTIPO.md`.

## Fase 2 — lectura financiera

Agregar lectura Firestore de:

```text
finance
liquidations
lots
```

pero solo después de validar:

```text
projects
shoppers
visits
postulations
```

## Riesgos

### R1 — Doble egreso

Si `payVisits()` se ejecuta dos veces sobre el mismo lote, podría duplicar movimientos.

Mitigación: usar `lotId` o clave natural de lote como idempotencia.

### R2 — Finanzas multi-país

El pago puede agruparse por país. El movimiento debe conservar:

```text
pais
currency
monto
```

### R3 — Acceso por rol

`finance` debe quedar restringido a `admin`/`super`. Ops no debe leer finanzas y cliente/shopper tampoco.

### R4 — Datos bancarios

No persistir datos bancarios en claro. Si se agregan en fases posteriores, deben cifrarse o separarse en colección privada con reglas más estrictas.

## Criterio de avance

No implementar persistencia financiera real hasta que:

```text
reglas Firestore pasen validación real
seed ficticio esté cargado con autorización
adapter básico esté validado
CX.BACKEND.enabled siga controlado por DEV
Paula autorice la siguiente fase
```

## Estado

```text
Persistencia financiera: diseñada, no implementada
Datos reales: no
Producción: no tocada
```
