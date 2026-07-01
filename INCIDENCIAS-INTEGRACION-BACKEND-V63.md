# INCIDENCIAS-INTEGRACION-BACKEND-V63

Fecha: 2026-07-01
Base: V63 auditada como aplicable
Alcance: incidencias de backend/integración. No cargar a Claude como P0 de prototipo.

## Resumen

V63 puede aplicarse al prototipo, pero no resuelve la conexión backend real. Las siguientes tareas corresponden a ChatGPT/backend y deben avanzar por sprints técnicos.

## Incidencias backend vigentes

### 1. Persistencia real

- `CX.data` sigue dependiendo de capa local/mock en el prototipo.
- Backend debe conectar Firestore manteniendo la misma interfaz para no romper módulos.
- No se deben reescribir módulos UI para resolver persistencia.

### 2. Tenant/proyecto

- Todo debe quedar filtrado por `tenantId` y `projectId`.
- `currentProjectId` no debe depender de localStorage como fuente final.
- Firestore debe validar tenant, rol y proyecto.

### 3. Auth y roles

- La matriz visual de V63 no reemplaza seguridad real.
- Auth debe mapear superadmin, admin, ops, shopper, cliente y roles adicionales permitidos.
- Reglas Firestore deben impedir acceso cruzado.

### 4. HR y visitas

- HR real debe modelarse en Firestore por tenant, projectId y periodo.
- Las reglas TyA Q1/Q2 deben implementarse en lógica backend/adapter controlada.
- El frontend solo debe consumir estados normalizados.

### 5. Acciones operativas

- Acciones como asignar, reprogramar, marcar realizada, marcar cuestionario, submitir y liquidar requieren escritura controlada.
- Cada acción debe registrar `responsibilityLog`.
- Debe existir smoke test DEV antes de activar acciones en preview.

### 6. Release Management SaaS multi-tenant

Debe implementarse backend para:

- `releases`
- `releaseItems`
- `tenantReleases`
- `featureFlags`
- `tenantFeatureFlags`
- `migrations`
- `migrationRuns`
- `releaseNotifications`
- `releaseReadReceipts`
- `tenantChangelog`
- `rolloutPlans`
- `responsibilityLog`

Debe permitir rollout por tenant, pausa, rollback, lectura, confirmación, historial y notificación futura por Make/correo/WhatsApp.

### 7. Storage evidencias

- Evidencias foto/video/audio deben ir a Storage.
- Firestore debe guardar solo metadata y URL/control de acceso.
- No usar datos reales hasta autorización.

### 8. Make, WhatsApp y correo

- No exponer webhooks ni claves en frontend.
- Preparar capa segura con logs y estados: draft, queued, sent, read, failed.

### 9. Gemini/IA segura

- Las API keys no deben quedar en frontend.
- IA debe ejecutarse desde capa segura con `aiLogs` y control por tenant.

### 10. Migración TyA real

- No cargar base real hasta cerrar gates de Auth, Firestore, preview y smoke.
- La base vieja solo entra vía export limpio, deduplicado y validado.

## Gate inmediato

Antes de ampliar Firestore:

1. Confirmar V63 aplicada en GitHub o aplicarla preservando backend.
2. Validar preview backend V63.
3. Confirmar Auth DEV.
4. Confirmar tenant `tya` y projectId.
5. Confirmar conteos Firestore y no localStorage/demo.

## Restricciones

- No deploy.
- No Hosting.
- No producción.
- No datos reales.
- No Orbit.
- No Orbia.
- No secretos.
