# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-13 11:18 -06:00
**Estado:** `DEV_TECHNICAL_QUALIFICATION_100__VISUAL_ACCEPTANCE_PENDING__REAL_TYA_CUTOVER_NOT_EXECUTED`

## Corrección de estado 2026-08-13

Por corrección explícita de Paula, M9/M10 se reclasifican correctamente como cierre de **calificación técnica del entorno DEV limpio** (`cxorbia-backend-dev` / target Hosting `cxorbia-dev`). No constituyen reemplazo del hosting/plataforma vigente de TyA.

La plataforma actual de TyA no ha sido reemplazada. El cutover real no se ha ejecutado.

Evidencia de aclaración: `app/docs/evidence/dev-visual-acceptance-clarification-20260813.json`.

## Evidencia técnica DEV preservada

M9 y M10 siguen siendo PASS válidos dentro de DEV. M10: run `31721769360`, job `94520228757`, artifact `9189626304`, digest `sha256:646c380fdbc53e081fc689335c825c97304ee9354e2913086007897f90edb6f2`.

Build DEV `ecc725866acc3eb8`; release DEV `1786638785456000`; version DEV `cd1e5b7d42cb846b`, `FINALIZED`.

El smoke técnico DEV confirmó Admin canónico, membership, tenant `tya`, proyecto `cinepolis`, 15 periodos, 660 visitas, 197 perfiles protegidos, 211 shoppers de autoridad, histórico 2025-06→2026-08, duplicados=0 y siete rutas. Esto no sustituye la aceptación visual de Paula ni el E2E sintético compartido previo al cutover real.

## Próximo bloque

Ejecutar aceptación visual DEV con Paula observando: tenant/módulos, flujos con datos sintéticos aislados y reconciliación read-only de HR viva, shoppers y visitas disponibles. El cutover real TyA permanece bloqueado hasta ese PASS y un gate posterior separado.

## Seguridad

Esta corrección documental no ejecutó deploy, provider write, HR/Auth/Firestore/Rules/Storage write, Make, Gemini, pagos, merge ni cutover real.

## Clasificación

- **Reusable CXOrbia:** separación verificable DEV/pre-go-live vs cutover real y aceptación visual previa.
- **Exclusivo cliente:** TyA/Cinépolis, shoppers, HR y visitas disponibles.
- **Claude/prototipo:** hallazgos visuales futuros se documentan, no se parchean desde backend.
- **Academia:** se validará visibilidad/ruta por rol en aceptación visual.
- **Sin impacto Claude:** esta corrección documental.
