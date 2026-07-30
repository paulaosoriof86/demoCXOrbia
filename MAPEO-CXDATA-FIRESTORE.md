# MAPEO-CXDATA-FIRESTORE.md

## Objetivo

Documentar cómo se mapea la interfaz actual de `CX.data` hacia Firestore sin modificar `/app/modules` ni reescribir `/app/core/data.js`.

Este documento no activa el backend, no escribe datos y no cambia la interfaz pública.

## Principio obligatorio

Los módulos deben seguir usando `CX.data` igual que hoy. Firestore debe ser un adapter interno y no una dependencia directa del frontend.

## Aclaración de jerarquía comercial

En CXOrbia, `projectId` se refiere a un proyecto operativo configurado dentro de la plataforma, no a un proyecto Firebase ni a un cliente/tenant.

La jerarquía canónica es:

```text
Tenant = consultora cliente de CXOrbia
Cuenta / cliente final = marca, cuenta comercial o cliente administrado por la consultora
Proyecto = campaña, ronda o programa operativo configurado en la plataforma
Visita = unidad operativa dentro de un proyecto
```

Ejemplo T&A:

```text
Tenant: T&A Consultores
Cuenta: Cinépolis
Proyecto: Cinépolis Guatemala Junio 2026 Q1
Visitas: sucursales/escenarios de esa ronda
```

Para no romper el prototipo ni el adapter inicial, los proyectos siguen viviendo en:

```text
/tenants/{tenantId}/projects/{projectId}
```

Cada proyecto debe llevar `accountId`/`clientId` como campo para agruparlo bajo una cuenta. Las cuentas se documentan en la colección compatible ya existente:

```text
/tenants/{tenantId}/clients/{accountId}
```

En la UI y en negocio se puede llamar "Cuenta"; técnicamente se conserva `clients` porque ya existe en reglas y evita publicar reglas nuevas solo por nomenclatura.

## Estado actual de `CX.data`

`CX.data` expone datos principales:

```text
projects
shoppers
_visitas
_posts
currentProjectId
```

Y métodos principales:

```text
project()
setProject(id)
addProject(cfg)
projectsFor(role)
visitas()
posts()
shoppersFor()
setVisitState(id, estado, dateField, dateVal)
assignVisit(visitId, shopperId)
payVisits(ids, fechaPago)
kpis()
phaseFlow(c)
```

## Mapeo de colecciones

| CX.data / negocio | Firestore previsto |
|---|---|
| tenant / consultora | `/tenants/{tenantId}` |
| cuenta / cliente final | `/tenants/{tenantId}/clients/{accountId}` |
| `projects` / proyectos de plataforma | `/tenants/{tenantId}/projects/{projectId}` |
| `shoppers` | `/tenants/{tenantId}/shoppers/{shopperId}` |
| `_visitas` | `/tenants/{tenantId}/projects/{projectId}/visits/{visitId}` |
| `_posts` | `/tenants/{tenantId}/projects/{projectId}/postulations/{postulationId}` |
| cuestionarios | `/tenants/{tenantId}/projects/{projectId}/questionnaires/{questionnaireId}` |
| respuestas | `/tenants/{tenantId}/projects/{projectId}/responses/{responseId}` |
| liquidaciones | `/tenants/{tenantId}/projects/{projectId}/liquidations/{liquidationId}` |
| lotes | `/tenants/{tenantId}/projects/{projectId}/lots/{lotId}` |
| finanzas | `/tenants/{tenantId}/projects/{projectId}/finance/{movementId}` |
| documentos | `/tenants/{tenantId}/projects/{projectId}/documents/{documentId}` |
| certificaciones | `/tenants/{tenantId}/projects/{projectId}/certifications/{certificationId}` |

## Campos mínimos de agrupación

Cada proyecto debe incluir, como mínimo:

```text
tenantId
accountId o clientId
accountName o clientName
projectId / id
name
countries
status
```

Cada visita, postulación, respuesta o movimiento derivado debe conservar:

```text
tenantId
projectId
accountId o clientId cuando aplique
shopperId cuando aplique
```

Esto permite que una consultora tenga varias cuentas y que cada cuenta tenga uno o más proyectos, sin cambiar la interfaz actual de `CX.data`.

## Lectura inicial del adapter

El adapter actual lee:

```text
projects
shoppers
visits
postulations
```

Luego aplica esos datos sobre:

```text
CX.data.projects
CX.data.shoppers
CX.data._visitas
CX.data._posts
CX.data.currentProjectId
```

Y emite eventos:

```text
project
shoppers
visit-flow
backend-ready
```

## Métodos envueltos para persistencia

El adapter envuelve métodos existentes sin cambiar la firma:

| Método CX.data | Persistencia prevista |
|---|---|
| `addProject(cfg)` | escribe proyecto |
| `setVisitState(id, estado, dateField, dateVal)` | escribe visita |
| `assignVisit(visitId, shopperId)` | escribe visita |
| `payVisits(ids, fechaPago)` | escribe visitas pagadas |
| `addShopper(cfg)` | escribe shopper si el método existe |
| `updateShopper(id, patch)` | escribe shopper si el método existe |

## Riesgos identificados

### 1. Métodos no existentes en data.js actual

El adapter ya contempla que `addShopper` y `updateShopper` pueden no existir y solo los envuelve si son funciones.

### 2. Carga asincrónica

Los módulos actuales pueden asumir datos disponibles de forma inmediata. Por eso el adapter aplica datos y emite eventos, pero si algún módulo no re-renderiza deberá documentarse en `PENDIENTES-PROTOTIPO.md` para que Claude lo ajuste. No se debe parchar el módulo desde el PR backend.

### 3. Finanzas generadas por `payVisits`

`payVisits` actualmente también puede generar egresos en `CX.finStore`. El adapter actual persiste visitas, pero todavía no persiste movimientos financieros generados por `CX.finStore`.

Pendiente: definir adapter separado para `CX.finStore` o persistencia financiera equivalente, sin tocar UI.

### 4. HR writeBack

`setVisitState` y `assignVisit` llaman `CX.hr.writeBack` si existe. El adapter no debe sustituir esta lógica hasta definir si HR sigue como fuente operativa o pasa a importación/sincronización controlada.

### 5. Subcolecciones no leídas todavía

El adapter inicial no lee todavía:

```text
clients/accounts
questionnaires
responses
liquidations
lots
finance
documents
certifications
notifications
automations
auditLogs
```

Se deben agregar por fases después de validar proyectos, shoppers, visitas y postulaciones.

## Criterio de compatibilidad

Una activación DEV será aceptable solo si:

```text
CX.data.project() sigue funcionando
CX.data.visitas() sigue filtrando por currentProjectId
CX.data.posts() sigue filtrando por currentProjectId
CX.data.shoppersFor() sigue filtrando por países del proyecto
CX.data.kpis() no rompe
CX.data.phaseFlow(c) no rompe
los módulos renderizan sin conocer Firestore
```

## Estado

```text
Adapter creado: sí
Adapter activo: no
CX.BACKEND.enabled: false
Firestore escrito: no
Datos reales: no
Producción: no tocada
Jerarquía comercial aclarada: tenant > cuenta/cliente final > proyecto > visita
```