# CHECKPOINT OPERATIVO CXORBIA–TYA — F10 LIVE DYNAMIC HR — 2026-08-29

## Estado seguro

- Phase A: `100/100`.
- Production Real Readiness: `100/100`.
- F9: `POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY`.
- F10: `CONTINUOUS_POSTPRODUCTION_MONITORING`.
- Release congelado: `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.
- Source funcional desplegado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.
- No deploy/rebuild/reimport/merge/provider write realizado en este bloque.

## Prueba viva ejecutada

Run GitHub Actions `33257681796`, artefacto `9716340234`, request one-shot `f10-live-admin-shopper-current-hr-20260829-05`, QA contra `https://cxorbia-backend-dev.web.app` con Chromium/Playwright.

La prueba leyó la autoridad HR viva y la UI real; no reutilizó 616 como total actual ni snapshots como sustituto de la fuente dinámica.

### Autoridad viva actual

- periodos: `15`;
- visitas: `660`;
- shoppers: `216`;
- primer periodo: `2025-06`;
- último periodo: `2026-08`;
- septiembre 2026: `NO PRESENTE`, coherente con que aún no fue ingresado en HR;
- duplicateVisitKeys: `0`;
- duplicateShopperIds: `0`.

### Dashboard Admin — agosto 2026 leído en vivo

- Total visitas: `44` — GT `34`, HN `10`.
- Asignadas: `44` — GT `34`, HN `10`.
- Sin asignar: `0`.
- Sin agendar: `3` — GT `2`, HN `1`.
- Agendadas: `10` — GT `7`, HN `3`.
- Realizadas: `31` — GT `25`, HN `6`.
- Pendientes de realizar: `13` — GT `9`, HN `4`.
- Cuestionario pendiente: `0`.
- Sin submitir: `1` — GT `1`, HN `0`.
- Liquidadas: `0`.
- Fuera de rango: `5` — GT `2`, HN `3`.
- Postulaciones pendientes: `0`.

Operational summary del mismo periodo: scheduled `39`, questionnaireCompleted `31`, submitted `30`, liquidationCandidates `30`, paymentConfirmed `0`. No confundir estos campos de ciclo con buckets visuales cuando semánticamente no son idénticos.

El navegador comprobó paridad KPI contra `periodOperationalSummary` para total, asignadas, realizadas, cuestionario pendiente, sin submitir y fuera de rango y capturó screenshot de los KPI reales.

## Admin

Autenticación real `admin/staff`, tenant `tya`, proyecto `cinepolis`, periodo `cinepolis-2026-08`.

PASS de navegación/render sin fatal: Dashboard, Fuente HR, Proyectos, Periodos, Histórico, Visitas, Postulaciones, Reservas, Shoppers, Finanzas, Liquidaciones, Documentos y Academia.

## Shopper

Autenticación exacta checkpoint-backed mediante token efímero; no password reset/change. `ownVisits=6`, histórico completo, certificación visible, misma autoridad HR viva `15/660/216`, latest `2026-08`.

PASS de navegación/render sin fatal: Mi Perfil, Mis Visitas, Visitas Disponibles, Reservas, Beneficios, Mis Reportes, Certificación, Academia y Documentos.

Gate legal: pendiente y visible; aceptación automática=false.

## Hallazgos

1. `P1 Claude/prototipo`: Periodos e Histórico muestran encabezado `Cinépolis JUN` aunque el periodo vivo es agosto. El código toma `data.programs().name`; no es prueba de HR congelada, pero sí rótulo contextual potencialmente obsoleto/confuso. No parchar desde backend.
2. `F10 Client follow-up`: el Cliente del mismo arnés no llegó a runtime ready en 90 s. Admin/Shopper sí terminaron. Clasificación de Cliente todavía no adjudicada entre harness/product; requiere diagnóstico focal separado.

## Seguridad

Runner read-only: data/provider/Auth/Firestore/HR/Storage/Rules/payment writes=0; password changes/resets=0; Make/Gemini=0; deploy=0; merge=false; producción mutada=false; secretos/tokens expuestos=false.

## Siguiente bloque exacto

`F10_CLIENT_FOLLOWUP_DIAGNOSIS_AND_CONTINUOUS_DYNAMIC_HR_SECTION_RECONCILIATION`.

La política F10 queda reforzada: la frescura se valida por periodo/estado/sección sobre HR viva y UI real; un total global no es evidencia suficiente de sincronización operativa.
