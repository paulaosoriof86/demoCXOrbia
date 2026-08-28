# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-28  
**Estado:** `F9_IN_PROGRESS_WINDOW_OPEN__PHASE_A_100__PROD_READINESS_98`

## Estado canónico

F8 está `CLOSED_PASS_ZERO_RESIDUE`: backup/export + restore temporal aislado + 9/9 colecciones + cleanup + reconciliación del release exacto PASS; IAM temporal revocado y verificado; readiness `95 → 98`.

F8.5 está `CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`. La matriz `app/docs/MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json` conserva las autoridades M1/V161C/V174/V182/C6. Los root fixes C6 posteriores prevalecen sobre una restauración cruda de V182. P0 de linaje=0; no hubo cambio frontend, provider write ni deploy.

## F9 iniciado

`F9_POSTPRODUCTION_ACCEPTANCE_98_TO_100` está `IN_PROGRESS`.

El master plan congelado exige una ventana objetivo de 24 horas después del cutover. El run F8 terminal `33193514608` concluyó a `2026-08-28T17:19:06Z` (`11:19:06 -06:00`), por lo que F9 no puede cerrarse terminalmente antes de `2026-08-29T17:19:06Z` (`11:19:06 -06:00`). Production Real Readiness permanece `98/100`.

Evidencia inicial post-cutover ya válida:

- F8 backup/restore/reconciliation PASS;
- IAM temporal revocado con residuo cero verificado post-cutover;
- F8.5 linaje/source/release PASS;
- bounded load F8 24/24, 5xx=0, contract failures=0, p95=181.87 ms como baseline comparativa previa, no sustituto de F9.

Las lecturas HTTP directas intentadas desde la sesión actual no alcanzaron Hosting por fallo de resolución DNS del entorno. Clasificación: `SESSION_EXTERNAL_HTTP_TRANSPORT_GAP_NOT_PRODUCT_FAILURE`. No demuestra P0 ni caída del producto y no autoriza crear/revivir workflow, credencial, IAM, rama, PR o transporte alternativo.

Fresh readbacks todavía requeridos dentro de F9: Auth, HR, HR↔plataforma, shoppers, visitas, evidencias, liquidaciones/pagos, errores runtime, performance, drift y alertas/observabilidad.

Evidencia: `app/docs/evidence/RC15-F9-POSTPRODUCTION-ACCEPTANCE-WINDOW-LATEST.json`.

Detalle: `app/docs/CAMBIOS-BACKEND-ADDENDUM-F9-POSTPRODUCTION-WINDOW-OPEN-20260828.md`.

## Clasificación

- **Reusable CXOrbia:** aceptación postproducción temporal, read-only, fail-closed y sin convertir fallos de observabilidad en defectos de producto.
- **Exclusivo cliente:** release/provider TyA `cxorbia-backend-dev`.
- **Claude/prototipo:** sin cambio UI ni tarea correctiva.
- **Academia:** sin impacto funcional; warning P2 de profundidad continúa no bloqueante.
- **Sin impacto Claude:** sí.

## Siguiente bloque exacto

`F9_COLLECT_POSTCUTOVER_READONLY_OBSERVATIONS_AND_TERMINAL_ACCEPTANCE_NOT_BEFORE_2026-08-29T17:19:06Z`.
