# CAMBIOS BACKEND — Addendum Corte 5 CX.data period model

Fecha: 2026-07-30

## Decisión
`P0_C5_CXDATA_PERIOD_MODEL_MISMATCH` corregido técnicamente.  
Estado: `CORTE5_TECHNICAL_PASS__OPERATIONAL_VISUAL_PENDING`.

## Archivos tocados

### `app/core/backend-firebase.js`
Tipo: modificado.  
Commit: `96cb7601559a76595d6203724a4bcf2d0b35b390`.

Cambio exacto:
- `CX.data.periods` deja de derivarse de documentos raíz `tenants/{tenantId}/projects`;
- se leen periodos desde `tenants/{tenantId}/projects/{projectId}/periods` para cada proyecto activo;
- los documentos canónicos de periodo se normalizan conservando `periodId/key/label/year/month/countries/state`;
- `currentPeriodId` solo se conserva si pertenece a los periodos canónicos; de lo contrario usa el periodo `active` o el último canónico;
- interfaz pública `CX.data` preservada;
- módulos UI no tocados.

Motivo: el smoke post-materialización demostraba 30 periodos derivados de project docs y `currentPeriodId=cinepolis` aunque Firestore tenía 14 periodos canónicos bajo el proyecto padre.

### `tools/qa/tya-r17n-post-materialization-readonly-smoke-v2.mjs`
Tipo: modificado solo como instrumentación QA.  
Commit: `21ce464772bfe6543b3672ad4b6d7deafd564adc`.

Cambio exacto:
- el snapshot Firestore que el gate ya había leído del proveedor ahora incluye también los 14 `periodDocs` cuando ejecuta el adapter en memoria.

Motivo: el primer re-smoke post-fix `30544254033` devolvió `periods=0` porque el fake Firestore entregaba visits/postulations/applications pero omitía periods. El bloque proveedor del mismo gate sí había validado `periods.size=14`. No fue una regresión runtime ni requirió tocar datos.

### `.github/cxorbia-firebase-requests/r17n-post-materialization-readonly.json`
Tipo: request read-only reejecutado y consumido.

Resultado final:
- run `30544595440`;
- artifact `8760141578`;
- digest `sha256:337c4e8b07786effea5c326c77dfb31f9edc2fa49e09d7e46e18fa4c8dacbc98`;
- request `enabled=false`, `consumed=true`.

### Evidencia
- `app/docs/evidence/R17N-POST-MATERIALIZATION-READONLY-SMOKE-LATEST.json` actualizado a PASS;
- `app/docs/evidence/R17N-POST-MATERIALIZATION-READONLY-SMOKE-LATEST.md` creado.

## Resultado final
Provider:
- 1,406/1,406 rutas presentes;
- missing/auth drift/production drift 0/0/0;
- 14 periodos;
- 616 visitas;
- 572 controles de liquidación;
- 77 certificaciones;
- payments/lots 0/0.

CX.data:
- source=firestore;
- fallback=false;
- projects=1;
- periods=14;
- visits=616;
- currentProjectId=cinepolis;
- currentPeriodId=2026-07;
- IDs de periodos exactos contra subcolección canónica;
- read-only/writeMode disabled;
- blockers=0.

## Impacto Phase A
Corte 5 supera el P0 técnico de modelo proyecto/periodo. Falta validación visual/operativa con el backend canónico antes de freeze.

## Clasificación
- **Reusable CXOrbia:** separación proyecto/periodo en adapter, selección de currentPeriod canónico, smoke consumidor contra snapshot proveedor real.
- **Exclusivo cliente:** proyecto `cinepolis`, 14 periodos y conteos TyA.
- **Claude/prototipo:** sin cambio requerido ahora; solo si validación visual demuestra P0 reproducible.
- **Academia:** enseñar proyecto padre vs periodos y diferencia entre readback y consumidor runtime.
- **Sin impacto Claude:** request/gate/evidencia.

## Estado seguro
Durante fix/re-smoke: Firestore/Auth/Storage/HR/legacy writes=0; deletes/pagos=0; deploy=0; merge=false; producción=false; PII cruda repo/artifact=0.

## Siguiente bloque exacto
Binding DEV read-only al backend canónico + un único Hosting DEV controlado + validación visual/operativa; requiere autorización expresa.
