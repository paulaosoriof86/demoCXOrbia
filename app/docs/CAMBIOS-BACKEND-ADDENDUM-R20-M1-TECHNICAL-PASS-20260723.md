# CAMBIOS BACKEND — ADDENDUM R20/M1 TECHNICAL PASS

**Fecha:** 2026-07-23  
**Estado:** `FUNCTIONAL_GATES_PASS_SOURCE_LOCK_FINAL_PENDING_NO_DEPLOY`

## Cambios funcionales cerrados

- El builder `tools/hr-source/tya-build-live-hr-source-safe-r20-inventory.mjs` dejó de usar resolución legacy propia.
- Reutiliza las variantes declaradas en `backend/contracts/tya-hr-column-map-r20-v1.json`.
- Admite `full_identity` y `tab_scoped_compact` sin hardcode por mes.
- Usa país desde columna o nombre del tab según contrato.
- Conserva identidad por `hrRowId/sourceTab/sourceRow` cuando falta `ID CINEMA`.
- Respeta `contextualMissingAllowedIn`.
- Coalescea columnas submitidas solo cuando hay un único valor no vacío o valores iguales; conflictos quedan HOLD.
- `public_gviz_gid_verified_inventory` solo se publica después de validar 14 periodos, 28 tabs, 616 visitas y cache-busting por GID.

## Evidencia

Run read-only `30016360952`, artifact `8567304475`, digest `sha256:b7b65933e1f81002dfac8ca65a2b1415d57e1158b87e755e9bd7706253dede57`.

PASS funcional:

- header variants R20;
- builder inventario R20;
- source-safe binding R18A;
- HR in-place;
- contexto/histórico/reportes Corte 1;
- runtime de reportes;
- proyecto/periodo/KPI R20;
- Corte 2A canonical;
- M1 regression lock.

HOLD restante:

- verificador V174 por source lock anterior desactualizado.

## HR actual observada

- 14 periodos.
- 28 tabs.
- 616 visitas: 476 GT y 140 HN.
- 209 shoppers source-safe.
- Julio 2026: 44 visitas, 43 asignadas, 1 sin asignar, 29 realizadas, 28 cuestionarios y 20 submitidas.
- Cero pagos inferidos.

## Lectura viva preservada

No se modificaron:

- `backend/runtime/hr-live-service/server.mjs`;
- `app/adapters/tya-live-source-inplace-apply.js`;
- `CX.data`;
- módulos V174.

Gate live:

- sin reload;
- `fresh=1` omite TTL;
- snapshot se aplica en memoria;
- proyección y `sourceRevision` se actualizan.

## Infraestructura reusable

- `CXORBIA_READONLY_POST_GATES_RUNNER` quedó probado con Playwright/Chromium y telemetry de statuses.
- `CXORBIA_ATOMIC_APPLY_RUNNER` conserva la responsabilidad de futuros empalmes; su trigger/telemetry fue endurecido sin tocar la aplicación.

## Documentación tocada en este cierre

- índice vigente;
- checkpoint vigente;
- este addendum;
- addendum para Claude;
- addendum de pendientes;
- impacto Academia;
- tracker de Phase A;
- PR #7 después del cierre final.

## Clasificación

- **Reusable CXOrbia:** resolver contractual, inventario verificable y gates reproducibles.
- **Exclusivo cliente:** datos TyA/GT/HN observados.
- **Claude/prototipo:** cero cambio y cero nueva candidata.
- **Academia:** integridad de fuente y separación de estados.
- **Sin impacto Claude:** runner, Playwright, source lock y artifacts.

## Pendiente exacto

Regenerar source lock después de la documentación viva y reejecutar el perfil completo. Con verificador PASS, avanzar a Hosting DEV autorizado y validación visual.

## Estado seguro

Sin Hosting DEV nuevo, deploy productivo, merge, producción, imports, writes reales, Make/Gemini ni pagos.
