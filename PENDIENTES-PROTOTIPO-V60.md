# CXOrbia - Pendientes Prototipo V60 para Claude

Fecha: 2026-07-01 04:43:49
Base vigente: Prototype development request CXOrbia V60.zip
Alcance: solo frontend/prototipo. No incluye backend, reglas, Auth, loaders, seeds, smoke tests, helpers locales, Hosting ni produccion.

## Estado V60

V60 se aplica como version visual mas reciente, pero auditoria detecta pendientes no cerrados:

- UTF-8 sospechoso: 1
- Banca aun presente: 13
- Restaurantes aun presente: 10
- localStorage aun presente: 28
- terminos tecnicos potenciales: 59

## P0 pendientes obligatorios

1. TyA/Cinepolis limpio: no mostrar Banca, Restaurantes, Retail u otros demos como datos operativos.
2. UTF-8 real sin caracteres corruptos, especialmente en pp/modules/aprendizaje.js si sigue vigente.
3. Ocultar avisos tecnicos visibles: demo, Firebase, backend, beta, nucleo, diagnostico, localStorage, firestore-dev.
4. Configuracion autoadministrable y funcional: proyectos, paises, monedas, honorarios, reembolsos, franjas, quincenas, sucursales, escenarios, roles, plantillas, NDA, estados y periodos.
5. NDA/confidencialidad por rol y version con historial, vista previa, aceptacion y reaceptacion.
6. Periodo dinamico, sin julio fijo, actualizando HR, dashboard, postulaciones, visitas, beneficios, certificaciones, finanzas y reportes.
7. HR viva TyA por GT/HN, quincena, franja, sucursal, shopper, estado, disponible desde, fechas, cuestionario, submitido, liquidacion, reembolsos y evidencias.
8. Reglas TyA: Q1 usa submitido Q2 anterior, Q2 usa Q1, Q2 restringe 16-fin, P x Agendar solo con shopper, P x visita previa si aplica, no fechas futuras.
9. Dashboard/KPIs correctos con drill debajo de KPIs o modal amplio; sin duplicados, sin mezclar monedas, sin liquidadas x100.
10. Postulaciones todas, no solo pendientes, con aprobar, rechazar, stand-by, ajuste, reprogramar, reasignar, historial y notificaciones.
11. Reservas/asignacion sin doble asignacion y con trazabilidad.
12. Flujo shopper completo: asignacion, instructivo, agendar, reprogramar, realizada, cuestionario, revision/submitido y beneficios.
13. Perfil shopper con visitas, certificaciones, beneficios, historial, documentos y NDA.
14. Mis beneficios y finanzas separando honorarios, reembolsos, pais, moneda, lote, fecha estimada y pagada.
15. Certificaciones y Academia profundas: cursos, lecciones, recursos, manuales, banco de preguntas, recertificacion y KPI con detalle.
16. Responsables, Mi Dia, tablon y notificaciones bidireccionales.
17. Filtros y busquedas reales en todos los modulos.
18. Importador generico CXOrbia con plantillas, mapeo editable, validaciones, errores por fila, preview y fallback honesto de IA.
19. Proyectos autoadministrables, no logica fija por cliente.
20. Portal cliente coherente por tenant/proyecto.
21. Soporte con bandeja viva.
22. Reportes configurables y descargables.
23. Integraciones, automatizaciones y marketing con estados honestos.

## Regresiones prohibidas

- Mezclar TyA con Banca/Restaurantes/demo.
- Mostrar notas tecnicas en UI final.
- Romper UTF-8.
- Perder modulos existentes.
- Mandar detalle KPI al final de pagina sin contexto.
- Botones sin accion ni explicacion honesta.
- Configuracion decorativa.
- Postulaciones solo pendientes.
- Mostrar localStorage/demo como fuente final.
- Rehacer arquitectura o convertir a framework.
- Datos reales.
- Tocar backend protegido.
- Reintroducir Python en README.
- Ocultar errores reales con toasts genericos.

## Pruebas que Claude debe entregar

Login/rol, Admin TyA, dashboard, cada KPI, HR, postulaciones, acciones, portal shopper, perfil shopper, beneficios, certificaciones, academia, Configuracion/NDA, importador, reportes, portal cliente, soporte, recursos, filtros, ausencia de etiquetas tecnicas, ausencia de Banca/Restaurantes dentro de TyA, UTF-8, responsive movil y preservacion de V60.

## Entrega esperada

Claude debe devolver ZIP/prototipo corregido, lista de archivos tocados, cambios por modulo, pendientes cerrados, pendientes restantes, confirmacion de que uso V60 o version mas reciente, confirmacion de que no toco backend protegido ni datos reales, y documentacion actualizada.