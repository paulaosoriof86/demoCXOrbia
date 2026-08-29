# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-29  
**Estado:** `F10_CONTINUOUS_POSTPRODUCTION_MONITORING__LIVE_ADMIN_SHOPPER_DYNAMIC_HR_QA`

## Estado canónico

F8 está `CLOSED_PASS_ZERO_RESIDUE`: backup/export + restore temporal aislado + 9/9 colecciones + cleanup + reconciliación del release exacto PASS; IAM temporal revocado y verificado; readiness `95 → 98`.

F8.5 está `CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`; P0 de linaje=0 y no hubo cambio frontend, provider write ni deploy.

F9 está `POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY`. El master plan define la ventana de 24 horas como **objetivo**, no como mínimo obligatorio. La regla `not-before` añadida al abrir F9 fue una sobre-restricción documental y quedó corregida sin cambiar el master plan.

Con instrucción explícita vigente de Paula para cerrar F9 hoy, `PRODUCTION_REAL_READINESS` avanzó `98 → 100` usando la evidencia ya certificada del release: F5 lifecycle PASS/residuo cero; F7 integral readiness sin P0; F8 backup/restore/reconciliation PASS; IAM zero-residue; bounded-load F8 24/24 GET, 5xx=0, contract failures=0, p95=181.87 ms; F8.5 source/release/lineage PASS.

No se afirma que hayan transcurrido 24 horas. El monitoreo continuo de Auth, HR, sync, shoppers, visitas, evidencias, liquidaciones/pagos, errores, performance, drift y alertas pasa a F10.

Evidencia terminal: `app/docs/evidence/RC15-F9-POSTPRODUCTION-ACCEPTANCE-LATEST.json`.

Continuity overlay: `backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json`.

Detalle: `app/docs/CAMBIOS-BACKEND-ADDENDUM-F9-ACCELERATED-POSTPRODUCTION-ACCEPTANCE-20260828.md`.

## F10 — prueba viva dinámica Admin + Shopper del 29/08/2026

Por instrucción expresa de Paula se ejecutó QA read-only contra el Hosting real `https://cxorbia-backend-dev.web.app` con Chromium/Playwright, sin usar el total histórico como sustituto de los KPIs actuales.

La lectura viva más reciente (`run 33257681796`, artefacto `9716340234`, generado 2026-08-29T14:31:14.521Z) confirma: 15 periodos, 660 visitas, 216 shoppers, rango 2025-06→2026-08, septiembre 2026 aún ausente y cero llaves duplicadas. El periodo operativo actual es `2026-08` con 44 visitas: GT 34/HN 10; asignadas 44; sin asignar 0; sin agendar 3 (GT 2/HN 1); agendadas 10 (GT 7/HN 3); realizadas 31 (GT 25/HN 6); pendientes de realizar 13 (GT 9/HN 4); cuestionario pendiente 0; sin submitir 1 (GT 1/HN 0); liquidadas 0; fuera de rango 5 (GT 2/HN 3); postulaciones pendientes 0. El test compara los KPIs canónicos contra `periodOperationalSummary` y capturó la tira visual de KPIs del Dashboard.

Admin autenticó como `admin/staff` y navegó PASS en Dashboard, Fuente HR, Proyectos, Periodos, Histórico, Visitas, Postulaciones, Reservas, Shoppers, Finanzas, Liquidaciones, Documentos y Academia; las rutas críticas no presentaron excepción ni mensaje fatal. Shopper autenticó con principal exacto checkpoint-backed y token efímero, sin reset/cambio de contraseña, con 6 visitas propias, histórico completo, certificación visible y la misma autoridad HR viva (15/660/216, latest 2026-08). Navegó PASS en Mi Perfil, Mis Visitas, Visitas Disponibles, Reservas, Beneficios, Mis Reportes, Certificación, Academia y Documentos. El gate legal pendiente permaneció visible y no fue aceptado automáticamente.

El resultado global del runner quedó `HOLD_F10_CLIENT_FOLLOWUP_ADMIN_SHOPPER_PASS` exclusivamente porque el follow-up Cliente del mismo arnés no alcanzó estado ready dentro de 90 s. Esto no invalida la evidencia Admin/Shopper ya terminal de este run; el Client queda separado para diagnóstico focal y no se clasifica todavía como defecto de producto.

Cambios de mecanismo realizados, sin tocar módulos UI: `tools/qa/tya-f10-live-admin-shopper-functional-readonly.mjs` y el wrapper dinámico F10 fueron ajustados para usar el login canónico, principal Shopper exacto con token efímero, readiness apropiado por rol y para que el follow-up Cliente no impida completar Admin/Shopper. Requests one-shot F10 usados únicamente para esta prueba; sin replay automático.

Hallazgo P1 para Claude/prototipo: `Periodos` e `Histórico` renderizan encabezado `Cinépolis JUN` aunque el periodo operativo vivo es agosto 2026. El código usa el nombre de programa (`data.programs().name`) en el encabezado, no el periodo actual. No implica que los datos HR estén congelados, pero el rótulo puede inducir a interpretar un mes obsoleto y debe revisarse desde frontend sin parche backend.

## Seguridad del bloque

F9 provider/business/Auth/Firestore/HR/Storage/Rules/payment writes=0; Make/Gemini=0; deploy/rebuild/reimport/merge=0; nueva rama/PR/workflow=0; legacy DB access=false.

F10 live QA: dataWrites=false; providerWrites=false; Auth writes=0; password changes/resets=0; Firestore/HR/Storage/Rules/payment writes=0; Make/Gemini=0; deploy/merge/production=0; credenciales/tokens expuestos=false.

## Clasificación

- **Reusable CXOrbia:** prueba browser provider-backed contra Hosting real, KPIs de periodo actual derivados de HR viva, paridad Admin↔Shopper y separación de fallas del arnés por rol.
- **Exclusivo cliente:** cifras actuales TyA/Cinépolis/GT-HN y ausencia esperada de septiembre porque aún no existe en HR.
- **Claude/prototipo:** revisar rótulo de programa `Cinépolis JUN` en `app/modules/periodos.js` y `app/modules/historico.js`; no tocar desde backend.
- **Academia:** sin cambio funcional por este bloque; navegación Admin/Shopper de Academia renderizó sin fatal.
- **Sin impacto Claude:** cambios del arnés y requests F10; excepto el hallazgo visual anterior.

## Siguiente bloque exacto

`F10_CLIENT_FOLLOWUP_DIAGNOSIS_AND_CONTINUOUS_DYNAMIC_HR_SECTION_RECONCILIATION`, preservando release 100/100 y sin reabrir F5-F9.
