# MODELO-BACKEND-SETUP-INTELIGENTE-20260629

## Objetivo

Preparar el backend para el pendiente #162: set-up inteligente del tenant/proyecto sin depender de respuestas simuladas ni de configuración local.

## Qué debe hacer el set-up inteligente

El set-up debe guiar a una consultora o administrador para crear una operación nueva con base en:

- tipo de negocio;
- países;
- moneda;
- clientes/cuentas;
- proyectos;
- HR o plantilla operativa;
- cuestionarios;
- reglas de visitas;
- evidencias;
- roles y permisos;
- integraciones;
- automatizaciones;
- legal/consentimientos;
- finanzas;
- reportes;
- academia/manuales.

## Principio clave

La IA puede sugerir configuración, pero no debe aplicarla directamente sin revisión humana y sin write-plan.

## Flujo propuesto

1. Crear `setupSession`.
2. Capturar inputs manuales o documentos cargados.
3. Generar análisis preliminar.
4. Crear recomendaciones.
5. El usuario revisa y aprueba/rechaza cada recomendación.
6. Se genera write-plan.
7. Se valida write-plan.
8. Solo con autorización se escribe en DEV.

## Colecciones propuestas

```text
tenants/{tenantId}/setupSessions/{sessionId}
tenants/{tenantId}/setupSources/{sourceId}
tenants/{tenantId}/setupRecommendations/{recommendationId}
tenants/{tenantId}/setupDecisions/{decisionId}
tenants/{tenantId}/setupWritePlans/{writePlanId}
tenants/{tenantId}/setupTasks/{taskId}
tenants/{tenantId}/setupAuditLogs/{auditId}
```

## Reglas

- Toda recomendación debe indicar fuente.
- Toda recomendación debe indicar confianza.
- Toda recomendación debe ser revisable.
- Nada se aplica automáticamente.
- Las credenciales e integraciones quedan como pendientes, no activas.
- Las reglas legales bloqueantes quedan inactivas hasta revisión jurídica.
- Las automatizaciones quedan inactivas hasta validación.
- El set-up no debe crear datos reales de producción.

## Relación con modelos ya creados

El set-up inteligente puede proponer datos para:

```text
tenantConfig
projectConfig
integrationCatalog / tenantIntegrations
automationRules
legalDocuments / legalAcceptanceRequirements
aiUsagePolicies
fileAssets
reportDefinitions
operationActions
shopperBenefits / financialMovements
```

## Pendiente para Claude

Cuando trabaje el módulo set-up, debe mostrar claramente:

- análisis IA;
- fuentes usadas;
- recomendaciones;
- confianza;
- decisión del usuario;
- preview antes de aplicar;
- errores;
- pendientes;
- write-plan.

No debe decir que el set-up quedó configurado si solo generó sugerencias.
