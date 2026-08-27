# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-27  
**Estado:** `F8_EXTERNAL_HUMAN_OWNER_ROUTE_IDENTIFIED__EFFECTIVE_SETIAM_TEST_PENDING__PHASE_A_100__PROD_READINESS_95`

## 2026-08-27 — F8 · ruta humana Owner identificada; falta capability test efectivo

### Resultado

Se recibió evidencia visual directa de Google Cloud Console sobre el proyecto exacto `cxorbia-backend-dev`.

- La identidad humana actualmente utilizada en Google Cloud aparece vinculada al proyecto con rol `Propietario` / `Owner`.
- La documentación oficial de Google Cloud incluye `resourcemanager.projects.setIamPolicy` dentro de `roles/owner`.
- Esto resuelve la hipótesis de inexistencia de una ruta administrativa externa candidata.
- Todavía no se declara `iamSetPolicyCapabilityAvailable=true` en el lock canónico: antes debe ejecutarse `projects.testIamPermissions` con esa identidad para confirmar permiso efectivo y descartar restricciones/deny aplicables.
- No se concedió ningún rol, no se cambió IAM y no se ejecutó provider mutation.

### Estado seguro

PHASE_A=`100/100`; PRODUCTION_REAL_READINESS=`95/100`; release F6 intacto `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

Provider/IAM/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=`0`; deploy/rebuild/reimport/merge=`0`.

El intento temporal IAM anterior permanece consumido y no se reejecuta.

### Siguiente acción exacta

`F8_VERIFY_EXTERNAL_OWNER_EFFECTIVE_SET_IAM_CAPABILITY`.

Ejecutar únicamente un `projects.testIamPermissions` para `resourcemanager.projects.setIamPolicy` usando la identidad humana Owner. Este test es read-only/capability-only. No grant, no deploy, no cutover.

### Clasificación obligatoria

- **Reusable CXOrbia:** una asignación de rol IAM visible identifica una ruta candidata; el permiso efectivo se confirma siempre con `testIamPermissions` antes de mutar.
- **Exclusivo cliente:** identidad administrativa humana del proyecto `cxorbia-backend-dev`.
- **Claude/prototipo:** sin cambio UI; no nueva candidata, rediseño ni reauditoría frontend.
- **Academia:** sin impacto funcional.
- **Sin impacto Claude:** IAM/provider control-plane y evidencia de autorización.

## 2026-08-27 — F8 · búsqueda de ruta IAM-capable y cierre de descubrimiento interno

### Resultado

Se continuó exactamente desde `F8_REQUIRE_IAM_CAPABLE_PROVIDER_ROUTE` sin reabrir F7, R24, Corte 4, M3 ni el intento temporal IAM ya consumido.

- PHASE_A = `100/100`.
- PRODUCTION_REAL_READINESS = `95/100`.
- Release F6 permanece congelado: `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.
- F8 permanece `HOLD_PROVIDER_IAM_SET_CAPABILITY_UNAVAILABLE` para la ruta automatizada DEV existente.
- El intento single-use previo permanece consumido y sin replay.
- Provider/IAM/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes = `0`.
- Deploy/rebuild/reimport/merge = `0`.

### Evidencia causal preservada

La evidencia canónica `app/docs/evidence/RC15-F8-TEMP-SECRET-METADATA-VIEWER-ATTEMPT-LATEST.json` ya demuestra que la ruta `existing_dev` es válida para autenticación pero carece de `resourcemanager.projects.setIamPolicy`; por diseño fail-closed el grant temporal no se intentó y provider writes quedaron en cero.

Las rutas históricas `CXORBIA_GCP_PROJECT_CREATOR_JSON` y `GOOGLE_CLOUD_PROJECT_CREATOR_JSON` fueron revisadas como candidatas históricas de provider. Su existencia histórica no demuestra capacidad `setIamPolicy`, y no existe evidencia vigente de una ruta automatizada reutilizable con esa capacidad.

### Descubrimiento externo read-only realizado

Se agotaron los canales disponibles en esta sesión sin acceder a payloads de secretos ni ejecutar mutaciones. Posteriormente se identificó mediante evidencia visual una identidad humana `Owner` en el proyecto exacto; su permiso efectivo queda sujeto al capability test read-only del bloque superior.

### Frontera de autorización

No existe autorización vigente para grant IAM, deploy ni cutover. No repetir el intento consumido. Cualquier mutación posterior requiere autorización explícita separada en la conversación vigente.
