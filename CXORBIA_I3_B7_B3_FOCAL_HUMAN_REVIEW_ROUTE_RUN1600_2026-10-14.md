# CXOrbia Recovery I3 — revisión visual focal B7/B3 — RUN1600 (14-10-2026)

**Estado:** B7 notificación Shopper PASS técnico en DEV. Tarjetas B3 compactadas publicadas y rutas E2E PASS. Aceptación humana PENDING. VRM-134 velocidad P0 OPEN. Gate20/21 PENDING. I4 BLOCKED. Producción DO_NOT_TOUCH.

**URL DEV exacta:** https://cxorbia-backend-dev.web.app/
**Product source:** 525f6cd6dddc22a3a7ff1bc12b03b07a98b1561e
**Product tree:** 7aa467413c1ee19c3f0eeda233d7b9722f923886
**Runtime:** cxorbia-live-hr-dev-00293-vft
**Hosting:** sites/cxorbia-backend-dev/versions/258d18435b3c0128
**Ruleset:** projects/cxorbia-backend-dev/rulesets/e9070ca6-234c-4a16-acf2-5ab3372eadb3
**HR revision probada:** 2e3b2aaff2b1ac7a9323c9a69a16d2ad97beb25648c642e1464d72e36917ad70
**Fuente acumulativa:** https://github.com/paulaosoriof86/demoCXOrbia/blob/recovery/cxorbia-phase-a-20260831/CXORBIA_I3_B7_HUMAN_REVIEW_ROUTE_RUN1563_2026-10-14.md — `CXORBIA_I3_B7_HUMAN_REVIEW_ROUTE_RUN1563_2026-10-14.md`. Sus 11 puntos permanecen; este documento añade lo demostrado después sin invalidar las otras observaciones.

## Ruta focal de revisión
1. **Shopper**, login visible `paula.osorio`, tenant TyA/CIA, proyecto **Cinépolis**, país **Guatemala**, período **octubre 2026**. Abrir **Mi Día**: debe existir la notificación operacional exacta de la solicitud/decisión probada; comprobar que la campana no muestra una bandeja vacía por error.
2. Abrir **Tablón**: la misma notificación existente debe aparecer **una vez**, con información legible y sin etiquetas técnicas. No marcar como leída si se desea preservar la prueba; esa acción persiste.
3. Abrir **Mis Visitas → Activas**: comprobar tarjetas compactas, tipografía legible, título 16 px, menos relleno, acciones completas y progreso sin ocupar el alto anterior. No revisar todo el producto otra vez.
4. En **Admin / Gestión de Postulaciones / Dashboard**, solo observación: los 7 KPI, las asignaciones, decisiones de fecha vencida y cancelaciones se preservan conforme a RUN1563. No ejecutar cambios de estados reales, reprogramaciones, liberaciones o decisiones en HR.
5. **Velocidad:** si iniciar sesión, recargar, regresar a pestaña o esperar sincronización genera demora, conservar como VRM-134 P0 abierto y anotar percepción. RUN1600 registró readiness Shopper 6857/7884/7098 ms, Admin 8495 ms. No confundir diseño PASS con rendimiento PASS.

## Expectativa demostrada y límites
RUN1600: exactamente 1 notificación operacional esperada para shopper Paula, 1 en feed, 1 en Tablón, 1 en Mi Día; HR revision exacta; cero nuevos builds/deploys/test-initiated writes.
Los shoppers Julissa y Priscila no tenían evento de la misma categoría para ese período: el esperado fue 0, observado 0. Eso **no** prueba que toda clase de notificación de todos los shoppers pase.
No ejecutar pagos, transferencias, agendamientos reales ni modificar HR para esta revisión. Finanzas B8 y el resto de Shopper B1–B6 requieren sus propias pruebas y aceptación. Una aceptación humana focal no equivale a I3 GO ni autoriza producción.
