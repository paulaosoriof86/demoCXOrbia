# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-13 10:02 -06:00  
**Estado:** `M9_ROLLBACK_PASS__HOSTING_ENTRY_SOURCE_PASS__PHASE_A_96`

## Resultado vigente

La primera tentativa M9 no certificó el milestone y el rollback autorizado quedó verificado. Producción volvió a la versión pre-cutover y no hubo una segunda promoción.

## Causa raíz source-only

La diferencia reproducible estaba en la configuración Hosting. La configuración canónica conservaba el redirect de `/` hacia `/index-backend-dev.html` y el rewrite `/api/tenants/**`, mientras la configuración de deploy usada en la tentativa los omitía.

Se corrigió `firebase.deploy.json` para mantener esas mismas reglas sin modificar los bytes runtime de `app/`.

Gate source-only: run `31718479981`, artifact `9188264814`, digest `sha256:ce405e543c48df991becf8f02d9ff66619a908e08b77ae327e8da3e72a326923`, decisión `PASS_M9_PRODUCTION_HOSTING_ENTRY_PARITY_SOURCE_GATE`.

El gate confirmó paridad de redirect raíz, rewrites API, fallback SPA, bootstrap backend y build/source-lock, con runtime app drift=0 y cero acceso o mutación de proveedor.

Evidencias: `app/docs/evidence/m9-production-cutover-rollback-20260813.json` y `app/docs/evidence/m9-production-hosting-entry-source-31718479981.json`.

## Seguridad

Provider reads/writes=0 y deploys=0 durante el cierre source-only. Cloud Run/Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos=0; merge=false.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=3/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=96% | RESTANTE=4%.**

## Clasificación

- **Reusable CXOrbia:** paridad entre configuración desplegable y entrypoint probado.
- **Exclusivo cliente:** target/version TyA.
- **Claude/prototipo:** cero cambios frontend.
- **Academia:** continuidad, causa raíz y rollback verificable.
- **Sin impacto Claude:** Firebase Hosting config, QA y evidencia.
