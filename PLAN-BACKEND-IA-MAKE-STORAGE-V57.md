# PLAN-BACKEND-IA-MAKE-STORAGE-V57.md

## Objetivo

Preparar la fase posterior al gate Firestore: Storage, IA y Make para CXOrbia V57.

## Estado

Preparado documentalmente. No deploy. No producción.

## IA

V57 ya contiene `CX.ai` en frontend con proveedores múltiples. Para producción comercial, la configuración privada de IA no debe quedar expuesta en navegador.

Ruta backend recomendada:

1. Configuración por tenant en Firestore: proveedor, modelo, estado, límites y permisos.
2. Configuración privada fuera del repositorio.
3. Función o servicio seguro para ejecutar solicitudes.
4. Auditoría por usuario, módulo, tenant y costo estimado.
5. Fallback claro si IA no está configurada.

Colecciones sugeridas:

- `tenants/{tenantId}/aiSettings/{providerId}`
- `tenants/{tenantId}/aiLogs/{logId}`

## Make

Las automatizaciones deben tener configuración viva por tenant.

Ruta backend recomendada:

1. Plantillas en Firestore.
2. Configuración externa protegida por tenant.
3. Logs de disparo.
4. Estado por automatización: activa, pausada, error, pendiente.
5. Reintentos controlados.

Colecciones sugeridas:

- `tenants/{tenantId}/automations/{automationId}`
- `tenants/{tenantId}/integrationSettings/{integrationId}`
- `tenants/{tenantId}/automationLogs/{logId}`

## Storage

V57 usa logos, recursos, documentos, manuales y evidencias. No basta localStorage/base64 para producción.

Ruta backend recomendada:

1. Storage paths segmentados por tenant y proyecto.
2. Metadata en Firestore.
3. Reglas por rol, proyecto, país y usuario.
4. Validación de tipo y tamaño.
5. Auditoría de carga, lectura y eliminación.

Rutas sugeridas:

- `tenants/{tenantId}/brand/{fileId}`
- `tenants/{tenantId}/projects/{projectId}/resources/{fileId}`
- `tenants/{tenantId}/projects/{projectId}/evidence/{visitId}/{fileId}`
- `tenants/{tenantId}/academy/{fileId}`

## Gate previo

No avanzar a carga real de archivos, IA real o integraciones reales hasta:

1. Auth OK.
2. Fuente Firestore.
3. Tenant `tya`.
4. Reglas validadas.
5. Preview backend funcional.
6. Sin datos demo confundidos con reales.

## Restricciones

- No guardar configuración privada en repo.
- No exponer configuración privada en frontend productivo.
- No subir evidencias reales hasta tener reglas Storage.
- No publicar producción sin validación DEV.
