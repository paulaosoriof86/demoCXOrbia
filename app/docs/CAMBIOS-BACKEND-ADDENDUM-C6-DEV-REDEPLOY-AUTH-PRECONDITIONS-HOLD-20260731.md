# CAMBIOS-BACKEND — Corte 6 · autorización DEV recibida, precondiciones HOLD

**Fecha:** 2026-07-31  
**Estado:** `DEV_REDEPLOY_AUTHORIZED__PRECONDITIONS_FAILED__DEPLOYS_NOT_EXECUTED__AUTH_NOT_CONSUMED__NO_PRODUCTION`

## Autorización recibida
Paula autorizó un único bloque DEV condicionado a verificar previamente:
1. Google Sheets API habilitada en el proyecto existente `cxorbia-backend-dev`;
2. HR canónico restringido, manteniendo la service account existente como reader;
3. solo después de esas verificaciones: un redeploy del Cloud Run existente `cxorbia-live-hr-dev` y un redeploy del Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`.

Exclusiones explícitas preservadas: Firestore data writes, HR writes, Auth writes, Rules, Storage, Make/Gemini, pagos, nuevo proyecto/Hosting, merge y producción.

## Verificación ejecutada antes del deploy
Se ejecutó únicamente revalidación read-only.

### Google Cloud / Sheets API
`LIVE-HR-PROVIDER-CAPABILITY-PREFLIGHT-LATEST.json`, generado `2026-07-31T02:06:59.600Z`:
- Google Sheets API: `DISABLED`;
- `enabled=false`;
- service account sin `serviceusage.services.enable`;
- Cloud Run update/actAs/Cloud Build continúan disponibles;
- provider writes=0, deploys=0.

### HR sharing
Metadata real del archivo `HR Guatemala - Sincronizacion Google Sheets`:
- permiso `anyone=writer` todavía presente;
- owner autorizado preservado;
- `firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com` continúa como `reader`.

## Decisión
Las dos precondiciones expresas del bloque autorizado fallan. Por fail-closed:
- Cloud Run redeploy: **NO EJECUTADO**;
- Hosting DEV redeploy: **NO EJECUTADO**;
- autorización de redeploy: **NO CONSUMIDA**; queda retenida para ejecutarse una sola vez cuando ambas precondiciones pasen, sin ampliar alcance.

No se intentó habilitar la API ni modificar permisos del HR porque esas acciones provider no forman parte del alcance de redeploy autorizado y la identidad técnica disponible no puede habilitar la API.

## Siguiente gate exacto
`SHEETS API ENABLED + HR RESTRICTED (SERVICE ACCOUNT READER PRESERVED) → READ-ONLY REVALIDATION PASS → 1x CLOUD RUN DEV REDEPLOY → 1x HOSTING DEV REDEPLOY → READBACK/SMOKE`.

No pedir nueva autorización para esos dos redeploys si el alcance no cambia: la autorización vigente queda retenida y no consumida.

## Clasificación
- **Reusable CXOrbia:** precondition-first deploy; autorización retenida/no consumida cuando el gate falla.
- **Exclusivo TyA:** HR Cinépolis y destinos DEV existentes.
- **Claude/prototipo:** sin cambio UI en este bloque.
- **Academia:** gate de infraestructura antes de deploy y mínimo privilegio de fuente.
- **Sin impacto Claude:** provider preflight, sharing check y decisión de no deploy.

## Estado seguro
HR/Firestore/Auth/Rules/Storage/Make/Gemini/payments writes0; Cloud Run deploy0; Hosting deploy0; nuevo proyecto/Hosting0; merge=false; producción=false; PII exportada0.
