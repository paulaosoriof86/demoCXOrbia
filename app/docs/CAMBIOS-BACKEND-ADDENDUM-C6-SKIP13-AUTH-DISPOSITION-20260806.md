# CAMBIOS BACKEND — Addendum C6 SKIP 13 perfiles Auth

**Fecha:** 2026-08-06  
**Estado:** `PASS_C6_SKIP13_AUTH_DISPOSITION_SOURCE_ONLY`

## Cambios aplicados

1. Se registró la autorización expresa de Paula para omitir los 13 perfiles HOLD del repair Auth.
2. Se creó `backend/config/corte6-shopper-auth-skip13-disposition-v1.json` con los 13 fingerprints exactos y política `SKIP_AUTH_REPAIR_PRESERVE_HISTORY`.
3. Se creó `tools/qa/cxorbia-c6-shopper-auth-skip-disposition-source-only.mjs` para transformar exclusivamente las 13 filas HOLD en `PRESERVE_NO_AUTH` y validar conteos y digests.
4. Se creó evidencia PASS en `app/docs/evidence/CORTE6-SHOPPER-AUTH-SKIP13-SOURCE-ONLY-PASS-LATEST.json`.
5. El plan resultante conserva 340 filas únicas y queda con `HOLD=0`, `PRESERVE_NO_AUTH=140`.

## Preservación

No se borraron perfiles, visitas, certificaciones ni liquidaciones. No se realizaron cambios en Auth, Firestore, HR, Hosting, Rules, Storage, Cloud Run, Make, Gemini, pagos, merge o producción.

## Clasificación

- **Reusable CXOrbia:** overlay de disposición source-safe por fingerprint y gate de plan.
- **Exclusivo TyA:** lista de 13 fingerprints omitidos.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** patrón de separar preservación histórica de habilitación Auth.
- **Sin impacto Claude:** runtime visual y módulos intactos.

## Siguiente bloque

Corregir metadata/autodiscovery de HR viva y confirmar agosto GT/HN. Los 13 perfiles ya no bloquean el avance.
