# PLAN-STORAGE-V57.md

Storage V57 preparado documentalmente.

Estado: cerrado en reglas actuales. No publicar todavia.

Usos previstos:

- Logo tenant.
- Recursos proyecto.
- Manuales.
- Academia.
- Documentos.
- Evidencias visitas.

Rutas sugeridas:

- tenants/{tenantId}/brand/{fileId}
- tenants/{tenantId}/projects/{projectId}/resources/{fileId}
- tenants/{tenantId}/projects/{projectId}/manuals/{fileId}
- tenants/{tenantId}/projects/{projectId}/evidence/{visitId}/{fileId}
- tenants/{tenantId}/academy/{fileId}

Reglas esperadas:

- Separacion por tenant.
- Acceso por rol.
- Acceso por proyecto.
- Evidencia shopper solo para visita propia.
- Metadata en Firestore.
- Validacion de tipo y tamano.

Pendiente: crear reglas Storage reales y validar en DEV antes de cargar archivos reales.
