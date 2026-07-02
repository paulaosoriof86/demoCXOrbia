# CXOrbia - Rules V58 seed piloto

## 2026-07-01 03:36:03 - Rules V58 preparadas para seed piloto parcial
- ARCHIVO: firestore.rules
- TIPO: modificado
- QUE CAMBIO: se prepararon reglas para cubrir el modelo minimo V58 usado por el seed piloto:
  - tenant root create/update para admin del tenant;
  - tenants/{tenantId}/shopperStats/{shopperId};
  - projects/{projectId}/periods/{periodId};
  - projects/{projectId}/hrImports/{importId};
  - projects/{projectId}/branches/{branchId};
  - projects/{projectId}/applications/{applicationId};
  - projects/{projectId}/notifications/{notificationId};
  - projects/{projectId}/responsibilityLog/{logId}.
- POR QUE: el intento de carga V58 ya valido Auth DEV, pero Firestore devolvio PERMISSION_DENIED para tenant root, periods, applications y shopperStats.
- IMPACTO EN FRONTEND: ninguno. No se tocaron /app/modules ni UI.
- ESTADO: preparado en repo, sin publicar reglas.
- RESTRICCIONES: no deploy, no produccion, no Orbit, no datos reales.
- PENDIENTE: con autorizacion explicita, publicar solo Firestore rules DEV y reintentar seed piloto V58.