# PENDIENTES-PROTOTIPO-V62.md

Fecha: 2026-07-01 13:30:03
Base vigente: Prototype development request CXOrbia V62.zip
Alcance: SOLO frontend/prototipo para Claude. No incluye backend real, reglas Firestore, Auth DEV, seeds, smoke tests, helpers locales, Hosting, Make real, correo real, WhatsApp real, Gemini backend, Storage real ni produccion.

## Avances reconocidos en V62

1. Se elimina app/modules/aprendizaje.js huerfano.
2. Se evita carga de modules/rutas.js que podia sobrescribir HR completa.
3. Liquidacion mejora: cuestionario enviado sin submit queda como pendiente_submitir.
4. Se agrega matriz de permisos y router con roleCanAccess.
5. Dashboard agrega confirmacion antes de eliminar visita.
6. UTF-8 se mantiene correcto.
7. V62 no incluye backend protegido, lo cual es correcto porque esos archivos son de ChatGPT/backend.

## Separacion correcta Claude vs backend

No se debe exigir a Claude como P0 de prototipo:

- Reemplazar mock/localStorage por Firestore real.
- Conectar Make/WhatsApp/correo real.
- Persistir importacion TyA real en base de datos.
- Resolver API keys seguras.
- Crear o incluir app/index-backend-dev.html.
- Crear o modificar app/core/backend*.js.
- Conectar Storage real.
- Resolver Auth/roles reales en Firebase.

Eso corresponde a ChatGPT/backend.

## Pendientes que SI siguen siendo de Claude/prototipo

1. Separar mejor modo demo vs modo cliente/piloto TyA.
2. Proyecto inicial configurable; evitar que retail sea la unica base operativa aparente.
3. No mezclar retail, banca o food como datos operativos dentro de TyA/Cinepolis.
4. Mantener TyA/Cinepolis como configuracion/tenant/proyecto, no como logica fija irreversible.
5. No mostrar notas tecnicas visibles en UI final.
6. Mantener UTF-8 real sin caracteres corruptos.
7. Permitir probar roles no estandar en la UI o documentar claramente su limitacion.
8. Configuracion visual y funcionalmente coherente: proyectos, paises, monedas, honorarios, reembolsos, franjas, quincenas, sucursales, escenarios, roles, plantillas, NDA, estados y periodos.
9. NDA/confidencialidad por rol/version con historial, aceptacion y reaceptacion.
10. Periodo dinamico en UI, sin junio/julio fijo como unica opcion operativa.
11. HR TyA visualmente correcta por GT/HN, quincena, franja, sucursal, shopper, estado, disponible desde, fechas, cuestionario, submitido, liquidacion, reembolsos y evidencias.
12. Reglas TyA Q1/Q2 reflejadas visualmente.
13. Dashboard/KPIs con drill debajo de KPIs o modal amplio; sin duplicados, sin mezclar monedas, sin liquidadas x100.
14. Postulaciones con todas las solicitudes, no solo pendientes.
15. Reservas/asignacion sin doble asignacion visual y con trazabilidad.
16. Flujo shopper completo.
17. Perfil shopper con visitas, certificaciones, beneficios, historial, documentos y NDA.
18. Beneficios y finanzas separando honorarios, reembolsos, pais, moneda, lote, fecha estimada y pagada.
19. Certificaciones y Academia profundas.
20. Responsables, Mi Dia, tablon y notificaciones con experiencia clara, aunque la entrega real sea backend.
21. Filtros y busquedas reales en todos los modulos.
22. Importador con UI de plantillas, mapeo editable, validaciones, errores por fila, preview y fallback honesto. La persistencia real es backend.
23. Portal cliente coherente por tenant/proyecto.
24. Soporte con bandeja viva o estado honesto.
25. Reportes configurables y descargables desde UI.
26. Integraciones, automatizaciones y marketing con estados honestos: no prometer conexion real si depende de backend.

## Regresiones prohibidas para Claude

- Tocar o eliminar backend protegido.
- Reintroducir datos demo/localStorage como si fueran backend real.
- Mezclar TyA con Banca/Restaurantes/Retail/Food como datos operativos.
- Romper UTF-8.
- Mostrar notas tecnicas en UI final.
- Perder modulos existentes.
- Crear botones sin accion visual clara o sin estado honesto.
- Ocultar errores reales con toasts genericos.
- Convertir a framework o redisenar arquitectura sin autorizacion.
- Usar datos reales.