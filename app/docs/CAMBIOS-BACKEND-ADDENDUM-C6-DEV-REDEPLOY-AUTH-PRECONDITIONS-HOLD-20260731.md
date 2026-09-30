# CAMBIOS-BACKEND — Corte 6 · autorización DEV recibida, precondiciones HOLD

**Fecha:** 2026-07-31  
**Estado:** `DEV_REDEPLOY_AUTHORIZED__SHEETS_API_AND_HR_READER_PASS__CANONICAL_HR_PUBLIC_WRITE_P0_REMAINS__DEPLOYS_NOT_EXECUTED__AUTH_NOT_CONSUMED__NO_PRODUCTION`

## Autorización recibida
Paula autorizó un único bloque DEV condicionado a verificar previamente:
1. Google Sheets API habilitada en el proyecto existente `cxorbia-backend-dev`;
2. HR canónico restringido, manteniendo la service account existente como reader;
3. solo después de esas verificaciones: un redeploy del Cloud Run existente `cxorbia-live-hr-dev` y un redeploy del Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`.

Exclusiones explícitas preservadas: Firestore data writes, HR writes, Auth writes, Rules, Storage, Make/Gemini, pagos, nuevo proyecto/Hosting, merge y producción.

## Revalidación ejecutada después de `listo`
Se ejecutó únicamente revalidación read-only.

### Google Cloud / Sheets API — PASS
`LIVE-HR-PROVIDER-CAPABILITY-PREFLIGHT-LATEST.json`, generado `2026-07-31T02:26:46.862Z`:
- Google Sheets API: `ENABLED`;
- canonical HR accesible por la service account mediante Sheets API: HTTP 200;
- total tabs: 30;
- tabs mensuales: 28;
- último tab mensual: `JULIO 26 HN`;
- decisión: `PASS_SHEETS_API_AND_CANONICAL_HR_READER`.

Se corrigió el preflight para validar la HR con Sheets API directamente. Drive API no es requisito del runtime HR.

### HR sharing — P0 aún abierto
Metadata real del archivo canónico:
- permiso `anyone=writer` todavía presente;
- service account existente continúa como `reader`;
- por tanto el HR canónico todavía no está restringido.

Además se detectó otra hoja con el mismo título, pero con una sola pestaña `Hoja 1`, que sí está restringida. Esa copia no es la HR canónica. La fuente canónica es la de 30 tabs y 28 tabs mensuales.

Evidencia source-safe: `evidence/LIVE-HR-SHARING-REVALIDATION-LATEST.json`.

## Decisión
Una de las dos precondiciones ya pasó y una sigue fallando. Por fail-closed:
- Cloud Run redeploy: **NO EJECUTADO**;
- Hosting DEV redeploy: **NO EJECUTADO**;
- autorización de redeploy: **NO CONSUMIDA**; queda retenida para ejecutarse una sola vez cuando el HR canónico quede restringido, sin ampliar alcance.

## Siguiente gate exacto
`HR CANÓNICO DE 30 TABS RESTRICTED + SERVICE ACCOUNT READER PRESERVED → READ-ONLY REVALIDATION PASS → 1x CLOUD RUN DEV REDEPLOY → 1x HOSTING DEV REDEPLOY → READBACK/SMOKE`.

No pedir nueva autorización para esos dos redeploys si el alcance no cambia.

## Clasificación
- **Reusable CXOrbia:** precondition-first deploy; Sheets API direct-read gate; distinguir copias homónimas por identidad/estructura provider, no por título.
- **Exclusivo TyA:** HR Cinépolis y destinos DEV existentes.
- **Claude/prototipo:** sin cambio UI en este bloque.
- **Academia:** mínimo privilegio, fuente canónica por ID/estructura y no por nombre visual.
- **Sin impacto Claude:** provider preflight, sharing check y decisión de no deploy.

## Estado seguro
HR/Firestore/Auth/Rules/Storage/Make/Gemini/payments writes0; Cloud Run deploy0; Hosting deploy0; nuevo proyecto/Hosting0; merge=false; producción=false; PII exportada0. Histórico/Auth91 preservados.
