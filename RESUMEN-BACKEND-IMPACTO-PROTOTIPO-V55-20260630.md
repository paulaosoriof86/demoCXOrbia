# RESUMEN-BACKEND-IMPACTO-PROTOTIPO-V55-20260630

## Objetivo

Registrar el impacto backend del prototipo CXOrbia V55 sin aplicar cambios de UI ni modificar `/app/modules`.

Fuente revisada:

```text
Prototype development request CXOrbia V55.zip
CAMBIOS-PROTOTIPO.md
app/docs/RESUMEN-PARA-CHATGPT-BACKEND.md dentro del ZIP V55
app/docs/PENDIENTES-PROTOTIPO.md dentro del ZIP V55
```

## Decisión de implementación

No se importa el ZIP V55 completo en la rama backend porque contiene cambios amplios de frontend, módulos y estilos.

En esta rama solo corresponde:

1. Documentar el nuevo contrato que backend debe soportar.
2. Ajustar el preview DEV en el punto único permitido.
3. Continuar con la carga DEV de `shopperBenefits` ya autorizada.
4. No tocar `/app/modules`.
5. No publicar Hosting.
6. No hacer merge.
7. No activar adapter global.

## Contratos nuevos o reforzados por V55

### CX.data

Backend debe preservar la firma local actual y preparar estos métodos:

```text
data.project()
data.projects
data.visitas()
data.visitsForShopper(shopperId)
data.shoppersFor()
data.getShopper(id)
data.shopperStats(id)
data.shopperKpis(id)
data.assignVisit(visitaId, shopperId)
data.payVisits([visitaIds])
data.addClient({...})
data.clients
data.getMyBenefits({shopperId, projectId, periodId})
data.getShopperBenefitsAdmin({...})
data.getFinancialMovements({...})
data.getPaymentLots({...})
data.suggestReconciliations({...})
data.performOperationAction(actionType, entityType, entityId, payload)
```

### Eventos

Mantener/soportar:

```text
CX.bus.emit('visit-flow')
CX.bus.emit('fin')
CX.bus.emit('crm')
CX.automations.fire(evento, ctx)
```

### IA

V55 usa `CX.ai.ask(prompt, opts)` desde varios módulos. Backend debe proveer una ruta segura futura para no exponer API keys privadas en frontend.

Proveedores contemplados por el prototipo:

```text
Gemini
OpenAI/ChatGPT
Anthropic/Claude
Endpoint propio
```

## Colecciones/campos que el backend debe contemplar

### tenants

Campos mínimos:

```text
tenantId
brand.logo
brand.countries[]
theme
plan
modules
ai.provider
ai.model
ai.keySecretRef
make.webhookUrlSecretRef
```

No guardar keys privadas directamente en frontend.

### users

Campos mínimos:

```text
uid
tenantId
email
displayName
role
projectIds[]
countryScope[]
shopperId|null
status
createdAt
updatedAt
```

Roles:

```text
super
admin
ops
coordinador
aliado
shopper
cliente
```

`coordinador` y `aliado` requieren `scopeCountry`.

### visits

Campos reforzados:

```text
visitId/id
extId
tenantId
projectId
accountId/clientId
periodId
country
city
shopperId
shopperName
status
scheduledDate
performedDate
questionnaireDate
submittedDate
sourceSheet
sourceRowRef
importBatchId
gestionadoPor
createdAt
updatedAt
```

Regla P0: Mis Visitas y Mis Beneficios dependen de `shopperId`, no de nombre.

### shoppers

Campos reforzados:

```text
shopperId
name
nameKey
aliases[]
country
city
email
phone
status
bankDataEncrypted
ndaStatus
createdAt
updatedAt
```

### shopperBenefits

Ya modelado en `firebase/schema/cxorbia-finance-benefits-v2.json`.

Debe seguir separado de pagos reales:

```text
calculated benefit != paymentLot != financialMovement != reconciliation
```

### cxp/cxc

V55 exige CxC/CxP clickeables y editables. Propuesta de colección futura:

```text
tenants/{tenantId}/accountsReceivable/{id}
tenants/{tenantId}/accountsPayable/{id}
```

Campos:

```text
tenantId
projectId
country
currency
entityType
entityId
counterpartyName
shopperId|null
visitId|null
amount
balance
status
note
dueDate
createdAt
updatedAt
updatedBy
```

### CRM / Comercial

V55 vincula cuentas, propuestas, proyectos y tareas.

Colecciones candidatas:

```text
tenants/{tenantId}/accounts/{accountId}
tenants/{tenantId}/contacts/{contactId}
tenants/{tenantId}/proposals/{proposalId}
tenants/{tenantId}/crmTasks/{taskId}
tenants/{tenantId}/accountTimeline/{eventId}
```

### Academia / Manuales / Recursos

Colecciones candidatas:

```text
tenants/{tenantId}/manuals/{manualId}
tenants/{tenantId}/courses/{courseId}
tenants/{tenantId}/learningProgress/{progressId}
tenants/{tenantId}/projectResources/{resourceId}
```

Archivos pesados deben ir a Storage cuando esté habilitado.

## Cambios backend aplicados en esta sesión

### 1. Script de carga DEV de shopperBenefits

Archivo creado:

```text
firebase/client-write-tools/apply-finance-benefits-write-plan-dev.mjs
```

Función:

- Lee `finance-benefits-write-plan-dry-run.json`.
- Valida `finance-benefits-write-plan-validation.json`.
- Exige confirmación exacta.
- Usa Firebase DEV `cxorbia-backend-dev`.
- Autentica con Email/Password.
- Escribe solo `tenants/{tenantId}/shopperBenefits/{benefitId}`.
- No escribe pagos reales ni movimientos financieros.
- Genera reporte local.

### 2. Runbook de carga DEV

Archivo creado:

```text
RUNBOOK-APLICAR-BENEFICIOS-FINANCE-DEV-20260629.md
```

### 3. Preview backend DEV

Archivo actualizado:

```text
app/index-backend-dev.html
```

Cambios:

- Se removió BOM inicial.
- Se cargan los bridges backend existentes en el preview DEV:
  - `core/backend-finance-benefits.js`
  - `core/backend-operational-actions.js`
  - `core/backend-cxdata-finance-read.js`

No se modificaron módulos UI.

## Próximo orden técnico

1. Paula ejecuta el runbook PowerShell para cargar `shopperBenefits` en Firestore DEV.
2. ChatGPT valida el reporte pegado por Paula.
3. Crear verificación de lectura DEV de `shopperBenefits`.
4. Validar `getMyBenefits` por `shopperId`.
5. Validar admin por proyecto, país, período y estado.
6. Preparar conexión controlada solo en `index-backend-dev.html`.
7. Mantener `CX.BACKEND.enabled` principal desactivado.
8. Luego avanzar a acciones operativas persistibles.

## Riesgos

- El ZIP V55 trae cambios amplios en frontend; no debe aplicarse automáticamente en la rama backend.
- Cuando Claude entregue nuevo ZIP, se debe preservar `app/index-backend-dev.html` o reconstruirlo a partir del `app/index.html` actualizado más los scripts backend.
- Storage sigue pendiente por Blaze.
- IA real debe resolverse con seguridad de credenciales, no exponiendo keys privadas en frontend.
- `scopeCountry` requiere reglas Firestore y claims coherentes antes de activar usuarios coordinador/aliado.
