# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-27  
**Estado:** `F8_HOLD_PROVIDER_IAM_SET_CAPABILITY_UNAVAILABLE__EXTERNAL_ROUTE_REQUIRED__PHASE_A_100__PROD_READINESS_95`

## 2026-08-27 — F8 · búsqueda de ruta IAM-capable y cierre de descubrimiento interno

### Resultado

Se continuó exactamente desde `F8_REQUIRE_IAM_CAPABLE_PROVIDER_ROUTE` sin reabrir F7, R24, Corte 4, M3 ni el intento temporal IAM ya consumido.

- PHASE_A = `100/100`.
- PRODUCTION_REAL_READINESS = `95/100`.
- Release F6 permanece congelado: `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.
- F8 permanece `HOLD_PROVIDER_IAM_SET_CAPABILITY_UNAVAILABLE`.
- El intento single-use previo permanece consumido y sin replay.
- Provider/IAM/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes = `0`.
- Deploy/rebuild/reimport/merge = `0`.

### Evidencia causal preservada

La evidencia canónica `app/docs/evidence/RC15-F8-TEMP-SECRET-METADATA-VIEWER-ATTEMPT-LATEST.json` ya demuestra que la ruta `existing_dev` es válida para autenticación pero carece de `resourcemanager.projects.setIamPolicy`; por diseño fail-closed el grant temporal no se intentó y provider writes quedaron en cero.

Las rutas históricas `CXORBIA_GCP_PROJECT_CREATOR_JSON` y `GOOGLE_CLOUD_PROJECT_CREATOR_JSON` fueron revisadas como candidatas históricas de provider. Su existencia histórica no demuestra capacidad `setIamPolicy`, y no existe evidencia vigente de una ruta reutilizable con esa capacidad.

### Descubrimiento externo read-only realizado

Se agotaron los canales disponibles en esta sesión sin acceder a payloads de secretos ni ejecutar mutaciones:

- repositorio y workflows históricos/actuales: sin nueva ruta IAM-capable demostrada;
- catálogo de plugins/conectores disponible: sin integración Google Cloud/GCP/Firebase/IAM que permita administrar IAM del proyecto;
- Google Drive: existen referencias operativas/configuración de CXOrbia, pero no evidencia segura y suficiente de un principal con `resourcemanager.projects.setIamPolicy`;
- Gmail: existe un canal humano autenticado de Google Cloud en la cuenta conectada y notificaciones recientes de cuenta/facturación, pero no se encontró evidencia project-specific que pruebe que esa identidad tenga Owner/Project IAM Admin sobre `cxorbia-backend-dev`.

Conclusión: el descubrimiento interno queda cerrado. El único siguiente avance legítimo es identificar/probar una identidad administrativa externa ya existente sobre `cxorbia-backend-dev`. La primera prueba debe ser read-only/capability-only; no concede roles.

### Frontera de autorización

No existe autorización vigente para grant IAM, deploy ni cutover. No repetir el intento consumido. Si aparece una identidad administrativa candidata, primero se debe demostrar `resourcemanager.projects.setIamPolicy`; cualquier mutación posterior requiere autorización explícita separada en la conversación vigente.

### Archivos actualizados en este bloque

- `app/docs/CAMBIOS-BACKEND.md` — este cierre.
- `app/docs/RESUMEN-PARA-CLAUDE.md` — mirror F8, sin impacto UI.
- `app/docs/PENDIENTES-PROTOTIPO.md` — pendiente real F8 y borde externo.

### Clasificación obligatoria

- **Reusable CXOrbia:** separar Project Creator, runtime principal e IAM Policy Administrator; nunca inferir `setIamPolicy` por nombre de rol/ruta histórica sin capability check.
- **Exclusivo cliente:** acceso administrativo al proyecto Google Cloud `cxorbia-backend-dev`.
- **Claude/prototipo:** sin cambio UI; no crear nueva candidata ni reinterpretar warnings IAM como defecto visual.
- **Academia:** sin cambio funcional; mantener profundidad pendiente P2 sin convertirla en bloqueo F8.
- **Sin impacto Claude:** IAM/provider release-control, evidence y continuidad.

## Siguiente bloque exacto

`F8_REQUIRE_IAM_CAPABLE_PROVIDER_ROUTE` — lado externo/humano de Google Cloud.

Primera acción permitida cuando exista una identidad candidata: comprobar en modo read-only/capability-only si posee `resourcemanager.projects.setIamPolicy`. No grant, no deploy, no cutover en esa comprobación.
