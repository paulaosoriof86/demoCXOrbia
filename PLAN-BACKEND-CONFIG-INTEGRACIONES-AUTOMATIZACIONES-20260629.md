# PLAN-BACKEND-CONFIG-INTEGRACIONES-AUTOMATIZACIONES-20260629

## Objetivo

Preparar el backend para soportar el centro de Configuración, Integraciones & Add-ons y Automatizaciones del prototipo V53 sin tocar los módulos frontend.

## Archivo de schema creado

```text
firebase/schema/cxorbia-firestore-config-integrations-automation-v1.json
```

## Decisión

V53 muestra una consola visual amplia, pero backend debe convertirla en configuración real, persistente, auditable y segura.

## Colecciones propuestas

```text
tenants/{tenantId}/config/main
tenants/{tenantId}/projects/{projectId}/config/main
globalCatalog/integrations/items/{integrationId}
tenants/{tenantId}/integrations/{integrationId}
tenants/{tenantId}/automationRules/{ruleId}
tenants/{tenantId}/automationRuns/{runId}
tenants/{tenantId}/config/ai
tenants/{tenantId}/configAuditLogs/{auditId}
```

## Principios

- El catálogo puede vivir en frontend o global catalog, pero el estado real debe vivir en backend.
- Las credenciales no deben exponerse al frontend.
- Los cambios de configuración deben tener auditoría.
- Las integraciones deben distinguir `draft`, `configured`, `validated`, `active`, `failed`, `revoked`, `disabled`.
- Las automatizaciones deben generar runs persistentes.
- Las pruebas de conexión deben validar respuesta real, no solo toast.
- IA debe usar `secretRef`, no API key visible para producción.

## Trabajo backend posterior

### Bloque 1 — Lectura de configuración

Implementar adaptadores read-only para:

- tenant config;
- project config;
- integration states;
- automation rules;
- ai config sanitizada.

### Bloque 2 — Escritura DEV controlada

Agregar scripts DEV con gates para escribir configuración inicial ficticia sin producción.

### Bloque 3 — Reglas Firestore

Extender reglas DEV para:

- tenant config;
- project config;
- integrations;
- automation rules;
- automation runs;
- audit logs.

### Bloque 4 — Secretos

Definir estrategia de secretos:

- no guardar API keys en documentos públicos;
- usar secretRef;
- considerar Cloud Functions/Make/Secret Manager para ejecución real;
- frontend solo ve estado sanitizado.

### Bloque 5 — Bridge frontend futuro

No tocar módulos ahora. Cuando se autorice frontend, Claude debe cambiar llamadas localStorage a métodos de interfaz estable:

- `CX.data.getTenantConfig()`;
- `CX.data.saveTenantConfig(patch)`;
- `CX.data.getProjectConfig(projectId)`;
- `CX.data.saveProjectConfig(projectId, patch)`;
- `CX.data.getIntegrations()`;
- `CX.data.saveIntegrationConfig(integrationId, patch)`;
- `CX.data.testIntegration(integrationId)`;
- `CX.data.getAutomationRules()`;
- `CX.data.saveAutomationRule(ruleId, patch)`;
- `CX.data.testAutomationRule(ruleId, payload)`.

## Restricciones

- No modificar `/app/modules`.
- No modificar `/app/core` salvo punto único futuro de conexión autorizado.
- No escribir Firestore sin autorización.
- No publicar reglas sin autorización.
- No tocar producción.
- No activar adapter global.
