# CXOrbia I3 — Ruta de revisión humana B7 · RUN1563 (14-10-2026)
Estado: DEV técnico PASS; **aceptación visual humana pendiente**. Producción DO_NOT_TOUCH.
URL: https://cxorbia-backend-dev.web.app/
Exact source: `08ad5e2751db46cc5ced00a71bbe6f121517714f`. Hosting: `sites/cxorbia-backend-dev/versions/fa11db76f67ff585`. Runtime: `cxorbia-live-hr-dev-00291-hnn`.
Control HR: `2e3b2aaff2b1ac7a9323c9a69a16d2ad97beb25648c642e1464d72e36917ad70`; Cinépolis, octubre 2026, GT/HN. No hardcodear estos conteos como arquitectura.

## Recorrido completo B7 (incluye correcciones anteriores)
1. Entrar como Admin/Coordinación, elegir proyecto Cinépolis y período octubre 2026. Confirmar identidad, país, navegación y branding.
2. Dashboard Operativo: KPIs GT/HN, flujo de etapas, comparación histórica entre meses, tablas/acciones por visita, selección individual y masiva; los modales deben abrir directamente sin obligar a navegar a otra pantalla.
3. WhatsApp en Dashboard, ficha Shopper y Postulaciones: abrir borrador manual `wa.me` únicamente con número internacional válido, contacto exacto y texto; no afirmar envío automático. Revisar acciones masivas y rechazo de contacto no válido.
4. Gestión de Postulaciones: los **7 KPI** octubre del RUN1563 son postulaciones pendientes 0, asignaciones vigentes 41, reprogramaciones pendientes 1, cancelaciones pendientes 1, agendamientos activos 18, aprobadas 0, todas 0. Badge lateral pendiente 0. No confundir 0 postulaciones con 0 visitas asignadas.
5. Tarjetas de 41 asignaciones agrupadas por sucursal: origen HR/plataforma, shopper correcto, país y estado, botones por fila «Pedir acción», «Agenda/Revisar fecha», «Reasignar», «Cancelar» y «Más». Verificar permisos y contraste.
6. Reprogramación pendiente exacta: fecha propuesta vencida 10-10-2026, fecha anterior 15-10-2026. «Autorizar» debe estar deshabilitado/ausente; explicar el motivo, mostrar «Pedir nueva fecha» y «Conservar anterior». No enviar decisiones reales para probar: el E2E con fixtures y ACK ya pasó.
7. Cancelación pendiente: abrir la solicitud y motivo; comprobar opciones de aprobar/rechazar, estatus correctos y notificación. No ejecutar la decisión sobre un registro real.
8. Agendamientos: abrir las 18 visitas pendientes de realizar. Distinguirlas de **25 agendadas acumuladas** (19 GT, 6 HN) y **7 realizadas** de la misma HR.
9. Reservas y Asignación: revisar 3 disponibles GT, 0 HN, elegibilidad y cortes; **el flujo futuro de publicación de noviembre y la estética de esta sección no están aceptados por el PASS B7**, conservar HF-20261012-18.
10. Estilo B7: tipografía, contraste, tarjetas/tabla con jerarquía, diferenciación de botones, íconos contextuales, modales y diseño premium. Ver escritorio y móvil; E2E automático 390/320 PASS no sustituye la aceptación humana.
11. Correspondencia transversal Shopper: identidad, agendamiento, notificaciones y fechas en Mi Día/Mis Visitas/Mi Perfil; las aprobaciones completas de B1-B6 y Finanzas B8 quedan para sus propios checkpoints.

## Límites de evidencia
RUN1563 verificó un único artefacto DEV, 41 clics, 34 rutas Admin, 12 Shopper y 10 Cliente, 0 hallazgos automáticos; no certificó WhatsApp remoto ni aceptación visual humana. Se conservan íntegros los 274 hallazgos y 21 dominios del ledger/matriz. Gate20/21 e I4 siguen BLOCKED; no reabrir PASS sin drift.
