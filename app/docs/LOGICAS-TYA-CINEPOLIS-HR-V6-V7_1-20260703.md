# Logicas TyA Cinepolis HR viva

Fecha: 2026-07-03

La fuente viva fue confirmada nuevamente como Google Sheets y queda incorporada al plan documental del proyecto en `HR-FUENTE-VIVA-TYA-GOOGLE-SHEETS-20260703.md`.

V6 y V7.1 no sustituyen el trabajo previo de mapeo. Lo complementan:
- HR viva confirma estructura, tabs, columnas y logica operativa.
- V6 normaliza historico para migracion controlada.
- V7.1 complementa trazabilidad RTDB.

Fuente de verdad:
- Visitas: HR viva / HR V6.
- Fechas programadas y realizadas: HR viva / HR V6.
- Cuestionario completado: HR viva / HR V6; RTDB solo como candidato.
- Submitido: HR/TyA.
- Liquidaciones: HR base + Excel financiero externo.
- Shoppers: HR + RTDB con dedupe manual.
- Postulaciones y notificaciones: RTDB como trazabilidad.

Reglas preservadas:
- Cada fila HR representa una visita planificada u operativa.
- Sin shopper asignado: pendiente por asignar.
- Shopper asignado sin fecha programada: pendiente por agendar.
- Fecha programada sin realizada: agendada.
- Fecha realizada sin cuestionario: pendiente cuestionario.
- Cuestionario sin submitido: pendiente submitido TyA.
- Submitido habilita liquidacion candidata.
- Liquidado requiere cruce financiero antes de definitivo.

Reglas Cinepolis:
- Q1 y Q2 no son equivalentes ni independientes.
- Q2 depende de Q1 realizada y submitida cuando aplica.
- Si Q1 no esta realizada/submitida, Q2 queda bloqueada como pendiente por visita previa.
- Disponible desde debe ser dinamico.

Casos especiales:
- Julio 2026 existe con 44 filas y debe quedar como preparacion.
- Honduras normalmente tiene 10 visitas.
- JUNIO 26 HN tiene 11 filas y debe ir a revision.

Proyecto normal CXOrbia:
- Cinepolis debe crearse como proyecto normal.
- El proyecto debe tener fuente HR configurable.
- El link debe guardarse en configuracion privada, no en repo publico.
- El backend debe hacer preview antes de importar/sincronizar.

Respuesta a la duda de negocio:
- Si, el trabajo anterior y la plataforma actual si aclararon logicas.
- Lo que faltaba era reanclar la fuente viva y no perder el mapeo previo.
- El siguiente avance correcto es construir el conector dry-run/preview sobre la HR viva compartida.
