# CAMBIOS-BACKEND — Corrección metodológica: HR abierta para lectura

**Fecha:** 2026-07-31  
**Estado:** `ROOT_CAUSE_CORRECTED__OPEN_READ_IS_VALID__PUBLIC_WRITE_SEPARATE_FROM_DEV_READ__REDEPLOY_AUTH_NOT_CONSUMED__NO_PRODUCTION`

## Hallazgo
Se estaba mezclando indebidamente la capacidad de **leer** la HR viva con la política de **edición** del archivo.

La HR de TyA ha sido consumida históricamente mediante lectura pública/source-safe cuando correspondía. El builder vivo conserva explícitamente dos caminos read-only:
1. Google Sheets API con service account;
2. fallback Google Visualization CSV público por pestaña.

Por tanto, **lectura abierta no es un defecto ni un requisito a eliminar para que DEV funcione**.

## Evidencia técnica vigente
- `tools/hr-source/tya-build-live-hr-source-safe-r20.mjs` declara como fallback `public_gviz_csv_cache_busted` y no requiere que la HR quede restringida para leerla.
- Google Sheets API ya está `ENABLED`.
- La service account canónica puede leer la HR real por Sheets API: HTTP 200.
- HR canónica: 30 tabs / 28 mensuales / último `JULIO 26 HN`.
- `backend/runtime/hr-live-service/server.mjs` mantiene lectura viva `fresh=1`, auto-descubrimiento mensual y fallback fail-closed.

## Corrección de clasificación
La presencia reportada por Drive de `anyone=writer` es una cuestión distinta:
- **no bloquea la lectura viva DEV**;
- **no debe usarse como precondición de los redeploys DEV read-only**;
- sí debe revisarse como hardening/cutover de producción si realmente representa edición pública no deseada.

La intención operativa confirmada es conservar lectura abierta de la HR. No se debe convertir por error ese requisito de lectura en `Restricted`.

## Autorización de redeploy
La autorización previa para 1x Cloud Run DEV + 1x Hosting DEV fue emitida con una condición adicional de `HR restringido` sugerida por ChatGPT. Esa condición queda identificada como metodológicamente incorrecta para la capacidad de lectura.

No obstante, la autorización previa no se amplía por inferencia: sigue **no consumida** y no se ejecuta hasta que Paula confirme expresamente el gate corregido sin exigir `Restricted`.

## Gate técnico correcto DEV
`SHEETS API ENABLED + HR CANÓNICA READABLE + SERVICE ACCOUNT READER + NO HR/FIRESTORE/AUTH/RULES WRITES → 1x CLOUD RUN DEV REDEPLOY → 1x HOSTING DEV REDEPLOY → READBACK/SMOKE`.

El estado de sharing de escritura se separa y se vuelve a evaluar antes de producción/cutover, sin bloquear esta validación DEV.

## Clasificación
- **Reusable CXOrbia:** separar capacidad de lectura de política de edición; no introducir gates de seguridad que cambien el contrato operativo sin necesidad.
- **Exclusivo TyA:** HR canónica Cinépolis de 30 tabs y su modo histórico de lectura abierta.
- **Claude/prototipo:** sin cambios de módulos/UI.
- **Academia:** diferenciar `public read`, `public write`, provider auth y mínimo privilegio.
- **Sin impacto Claude:** corrección de gate DEV y documentación.

## Estado seguro
No Cloud Run deploy, Hosting deploy, HR write, Firestore write, Auth write, Rules, Storage, Make/Gemini, pagos, merge ni producción. Histórico/Auth91 preservados.
