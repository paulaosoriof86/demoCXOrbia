# CXOrbia - Pendientes prototipo V58 para Claude

Fecha: 2026-07-01
Base vigente de prototipo: `Prototype development request CXOrbia V58.zip`
Alcance de este archivo: SOLO frontend/prototipo para Claude. No incluye tareas de backend.

## 0. Regla de alcance para Claude

Claude debe corregir y mejorar el prototipo V58 sin revertir avances existentes y sin tocar tareas de backend.

No modificar, reescribir ni revertir:

- Reglas Firestore.
- Scripts Firebase.
- Seeds, loaders, validators o herramientas de carga.
- Helpers locales ignorados como `app/core/backend-dev-auth.local.js`.
- Archivos de salida local ignorados.
- `app/index-backend-dev.html` como punto de preview backend.
- Configuración o documentación técnica de backend salvo que se indique expresamente.

Si Claude detecta que una funcionalidad requiere backend, debe dejar la interfaz preparada con mensaje honesto y documentar la necesidad, pero no debe inventar datos ni simular que ya está conectado.

## 1. Avances V58 que deben preservarse

No perder ni degradar:

- PWA y service worker.
- Login white-label con logo, países y marca CXOrbia.
- Roles `super`, `admin`, `ops`, `shopper`, `cliente`, `coordinador` y `aliado` cuando apliquen.
- Alcance por país para roles coordinador/aliado.
- Manuales ampliados y `core/manuales-data.js`.
- Academia más profunda.
- Recursos del proyecto y visor/generación IA.
- IA multi-proveedor en `CX.ai`.
- Integraciones con estados honestos.
- Finanzas con CxC/CxP y pago por shopper.
- CRM 360 con propuestas, proyectos, cuentas y tareas.
- Importador con SheetJS y refinamiento.
- Documentación interna nueva en `app/docs`.
- NDA/confidencialidad por rol y versión incorporado en V58.
- Navegación modular aprobada.
- Separación visual admin/shopper/cliente.

## 2. P0 - Correcciones críticas del prototipo V58

### P0.1 TyA/Cinépolis no debe mostrar demos de otros clientes

Corregir el prototipo para que, cuando el tenant/proyecto visible sea TyA/Cinépolis:

- No aparezcan proyectos demo como Banca, Restaurantes u otros sectores ajenos.
- No aparezca tema visual de banca o datos de Cliente Banca.
- No se mezclen datos de demo con TyA.
- Los demos solo pueden existir como plantillas o sandbox separado, nunca visibles como datos operativos TyA.
- El selector de proyecto debe iniciar en TyA/Cinépolis cuando se esté revisando TyA.

### P0.2 Quitar avisos técnicos visibles en la UI final

Eliminar u ocultar en vistas finales etiquetas como:

- demo
- Firebase
- backend
- beta
- núcleo
- diagnóstico
- localStorage
- firestore-dev
- mensajes internos de implementación

Estas etiquetas pueden existir solo en preview técnico, no en la experiencia final para cliente, admin o shopper.

### P0.3 UTF-8 real sin caracteres corruptos

Revisar todo V58 y corregir desde origen cualquier símbolo roto como `Ã©`, `â€`, caracteres de control o iconos corruptos.

Pendiente específico acumulado:

- `app/modules/aprendizaje.js` tenía un posible carácter corrupto en fallback de ícono. Revisar si sigue vigente y corregirlo sin reemplazar manualmente uno por uno; la causa debe ser codificación UTF-8.

Mantener `<meta charset="UTF-8">` en HTML y guardar todos los archivos en UTF-8 sin BOM.

### P0.4 README y preview local sin Python

Corregir cualquier instrucción visible o README que recomiende usar Python para levantar preview. Para este proyecto se está evitando `python` y `python -m http.server`.

El README debe orientar a preview con Node o el método aprobado del proyecto.

### P0.5 NDA/confidencialidad completo por rol y versión

El módulo de Configuración/NDA no debe volver a un textarea único básico.

Debe quedar como editor funcional por rol y versión:

- Texto por rol: shopper, admin, ops, coordinador, aliado, cliente y super cuando aplique.
- Versionado visible.
- Estado vigente/inactivo.
- Historial/auditoría visible para admin.
- Vista previa antes de publicar.
- Flujo de aceptación para shopper/usuario según rol.
- Reaceptación si cambia la versión.
- Copia exportable/imprimible para revisión legal.
- Mensajes claros cuando falte configurar NDA de un rol.

Preservar y mejorar el uso visual de `CX.confidencialidad.text`, `setText`, `version` y `auditLog` si ya están en V58.

### P0.6 Configuración debe funcionar como centro autoadministrable

Configuración no debe ser solo decorativa. Debe permitir administrar, por tenant/proyecto:

- Proyectos.
- Países.
- Monedas.
- Honorarios y reembolsos por país.
- Franjas WK/WKND.
- Quincenas.
- Sucursales.
- Escenarios.
- Roles y permisos visibles.
- Plantillas de notificaciones.
- NDA por rol.
- Estados operativos.
- Parámetros de fecha y periodos.

Cada opción debe tener crear, editar, eliminar/desactivar y validación visual de campos requeridos.

### P0.7 Periodo dinámico, no julio fijo

Eliminar dependencias visuales rígidas a julio o a un periodo hardcodeado.

El periodo debe:

- Cambiar desde selector de periodo.
- Actualizar HR, dashboard, postulaciones, visitas, beneficios, certificaciones y finanzas.
- Mostrar el periodo activo en encabezados y filtros.
- Permitir histórico mensual.
- No mezclar datos de meses diferentes.

### P0.8 HR viva por proyecto/país/quincena

La HR debe ser la fuente visual de verdad para TyA/Cinépolis.

Corregir:

- `Disponible desde` dinámico según reglas Q1/Q2 y visita previa.
- Separación GT/HN.
- Separación por quincena 1/2.
- Franja WK/WKND.
- Estado correcto: pendiente por asignar, pendiente por agendar, agendada, realizada, cuestionario, submitido, liquidada, fuera de rango, visita previa pendiente.
- Conteos sin duplicados.
- Visitas clicables con detalle.
- Filtros por país, periodo, quincena, estado, sucursal y shopper.
- Write-back visual sin duplicar filas.
- Casos de fecha futura no permitidos para visita realizada o cuestionario marcado.

### P0.9 Dashboard operativo con KPIs reales y drill accionable

Corregir lógica y detalle de KPIs:

- Totales por país y global sin duplicar.
- Asignadas, agendadas, realizadas, cuestionario marcado, submitidas, sin submitir, liquidadas y pendientes de pago.
- No sumar monedas ni mezclar GTQ/HNL.
- No multiplicar liquidadas por 100 ni aplicar cálculos financieros erróneos.
- `Sin submitir` debe ser cuestionario marcado/presente sin fecha submitido.
- Drill de KPI debe abrir debajo de KPIs o en modal amplio, no mandar al final de la página sin contexto.
- Cada visita en el drill debe ser clicable.
- Flujo por fases por país y quincena.
- Comparativo histórico real al cambiar de mes.
- Ranking shoppers con top 5, promedio de días a cuestionario y criterios visibles.
- Certificaciones KPI debe abrir detalle.

### P0.10 Postulaciones y asignaciones completas

Postulaciones debe mostrar todas, no solo pendientes, y permitir agrupar por:

- Sucursal.
- Shopper.
- Estado.
- País.
- Quincena.
- Proyecto/periodo.

Acciones requeridas:

- Aprobar.
- Rechazar.
- Stand-by.
- Solicitar ajuste.
- Reprogramar.
- Reasignar con buscador.
- Marcar atendida/gestionada cuando corresponda.
- Ver historial de cambios.
- Ver relación con HR y visita.
- Generar notificación visible para admin y shopper.

Evitar duplicaciones entre postulaciones, reservas y visitas aprobadas.

### P0.11 Flujo shopper completo y estable

El portal shopper debe conservar el flujo aprobado:

1. Postulación/asignación.
2. Instructivo.
3. Agendar con control de franja.
4. Reprogramar si aplica.
5. Confirmar fecha si admin lo solicita.
6. Marcar realizada con validación de rango.
7. Acceso/redirección a cuestionario o cuestionario interno según proyecto.
8. Marcar cuestionario realizado.
9. Estado revisión/submitido.
10. Beneficios/pagos visibles.

Corregir:

- Botones que no hacen nada o solo muestran toast.
- Botones desactivados incorrectamente.
- Estado que no sincroniza entre admin y shopper.
- Mensajes fuera de rango.
- Cuestionario pendiente después de 48 horas.
- Visitas realizadas visibles en perfil.
- Certificaciones visibles en perfil.
- Historial shopper no vacío cuando existen visitas.

### P0.12 Perfil shopper funcional

Desde admin y desde shopper, el perfil debe mostrar:

- Datos principales.
- País/ciudad.
- Estado de certificaciones.
- Visitas asignadas.
- Visitas realizadas.
- Cuestionarios pendientes.
- Beneficios/honorarios/reembolsos.
- Historial de reprogramaciones.
- Puntaje/ranking.
- Documentos/NDA si aplica.
- Acciones admin permitidas.

Los botones de visitas realizadas y certificaciones deben abrir detalle real.

### P0.13 Responsables, Mi Día y notificaciones

Implementar visualmente el flujo completo:

- Asignar responsable en gestión interna.
- Que aparezca en Mi Día del responsable hasta gestionarse.
- Notificaciones bidireccionales admin/shopper.
- Tablón con contador.
- Atendido/gestionado.
- Reaparecer al día siguiente si sigue pendiente.
- Exportar pendientes.
- Ver drill desde dashboard.
- Diferenciar urgencias: fuera de rango, cuestionario pendiente, visita sin realizar, visita sin submitir, NDA pendiente, certificación vencida.

Las notificaciones WhatsApp/Make pueden quedar como acción preparada o plantilla si no hay conexión real, pero la UI no debe fingir envío real si no está conectado.

### P0.14 Filtros, búsquedas y navegación deben ser funcionales

Revisar todos los módulos principales para que filtros y buscadores realmente cambien la vista:

- Dashboard.
- HR.
- Postulaciones.
- Visitas.
- Shoppers.
- Certificaciones.
- Finanzas.
- Recursos.
- Academia.
- CRM/Proyectos.
- Soporte.

No debe haber filtros decorativos sin efecto.

### P0.15 Importador genérico CXOrbia, TyA como plantilla

El importador no debe estar escrito como migración TyA fija.

Debe funcionar como importador genérico CXOrbia con plantillas por cliente/proyecto:

- HR TyA/Cinépolis.
- Finanzas TyA GT/HN.
- Liquidaciones.
- Shoppers.
- Sucursales.
- Cuestionarios/certificaciones.

Debe mostrar mapeo editable, validaciones, errores y registros descartados. Si usa IA, debe invocar la capa de IA del prototipo cuando exista configuración; si no, debe mostrar fallback honesto, no análisis simulado como real.

### P0.16 Proyectos autoadministrables

La administración de proyectos debe permitir:

- Crear proyecto.
- Editar proyecto.
- Activar/desactivar.
- Países y monedas.
- Periodos.
- Sucursales.
- Escenarios.
- Honorarios/reembolsos.
- Cuestionarios.
- Manuales.
- Certificaciones.
- Recursos.
- Responsables.
- Clientes/portal cliente.

TyA/Cinépolis debe ser un proyecto configurado, no lógica fija incrustada.

## 3. P1 - Mejoras importantes acumuladas

### P1.1 Academia, manuales y certificaciones

- Cursos con lecciones extensas.
- Quiz por lección.
- Crear/editar/eliminar categorías.
- Crear/editar/eliminar lecciones.
- Manuales por rol/proyecto.
- Banco de preguntas real.
- Certificación con IA desde instructivo cuando aplique.
- Recertificación con notificación.
- KPI de certificación con detalle.

### P1.2 Finanzas operativas en prototipo

- Movimientos por shopper, proyecto, país y moneda.
- Separar GTQ y HNL.
- Honorarios por país desde configuración.
- Boleto y combo como reembolsos operativos.
- Lotes de pago seleccionables.
- Agregar pendientes de meses pasados.
- Agregar a meses futuros.
- Estado visible para shopper y admin.
- CxC/CxP con detalle y edición.
- Importador financiero de hojas TyA/TyA HN/Liquidación.

### P1.3 Cliente, cuentas y CRM

- Unificar/vincular ficha de cliente/cuenta/proyecto.
- Sincronizar con proyectos y propuestas.
- Portal cliente con reportes, recursos y avances del proyecto.
- Evitar duplicación de cliente vs cuenta CRM.

### P1.4 Reportes

- Crear reportes con IA si hay configuración.
- Elegir columnas.
- Editar estructura.
- Descargar CSV/PDF cuando aplique.
- Reportes por país, periodo, proyecto y cliente.
- Reportes no deben usar datos hardcodeados.

### P1.5 Soporte

- Bandeja viva.
- Estados claros.
- Respuesta o cambio de estado que notifique al solicitante.
- Filtros por prioridad, estado, rol y proyecto.

### P1.6 Marketing e integraciones

- Marketing mensual por IA con temática, embudo, objetivo, CTA, hashtags y herramienta.
- Automatizaciones autoadministrables.
- Plantillas ricas.
- Activar/configurar integraciones visualmente.
- No fingir integraciones reales si solo existe maqueta.

## 4. TyA/Cinépolis - Reglas operativas que debe reflejar el prototipo

- GT y HN separados.
- Quincena 1 y 2 separadas.
- Franja WK/WKND.
- `Disponible desde` dinámico.
- Q1 usa submitido Q2 anterior cuando exista.
- Q2 usa submitido Q1.
- Q2 restringe desde el día 16 al fin de mes.
- Si no hay submitido, usar cuestionario completado +2 o realizada +3, y estimación posterior según regla operativa vigente.
- `P x Agendar` solo con shopper asignado.
- `P x visita previa` en Q1 si no existe Q2 previa.
- Evidencias: video/foto según proyecto.
- Combo JUMBO como reembolso cuando aplique.
- Cuestionario menor a 48 horas como control operativo.
- Pendientes de cuestionario deben generar alerta.
- Fuera de rango debe permitir flujo de reprogramación.

## 5. Errores/regresiones que Claude no debe reintroducir

- Mezclar TyA con Banca/Restaurantes/demo.
- Mostrar notas técnicas en UI final.
- Romper UTF-8.
- Duplicar títulos/secciones.
- Perder módulos existentes al mejorar uno.
- Mover el detalle de KPI al final de la página sin contexto.
- Dejar botones sin acción ni explicación honesta.
- Dejar configuración sin funcionar.
- Filtrar postulaciones solo por pendientes cuando se necesita vista total.
- Mostrar `localStorage/demo` como si fuera estado operativo final.
- Cambiar visual aprobado sin necesidad.
- Rehacer arquitectura o convertir a framework.
- Introducir datos reales en demo/prototipo.
- Tocar backend protegido.

## 6. Entrega esperada de Claude

Claude debe entregar una nueva versión del prototipo con:

- Lista de archivos tocados.
- Resumen de cambios por módulo.
- Confirmación de que trabajó sobre V58 o el prototipo más reciente entregado por Paula.
- Confirmación de que no revirtió avances existentes.
- Confirmación de que no tocó backend protegido.
- `CAMBIOS-PROTOTIPO.md` actualizado si existe o creado si no existe.
- `PENDIENTES-PROTOTIPO.md` actualizado con lo que quede pendiente.
- Notas claras de cualquier funcionalidad que dependa de backend real.

## 7. Prioridad de implementación para Claude

Orden recomendado:

1. Limpiar TyA de demos y avisos técnicos.
2. Corregir UTF-8 y README sin Python.
3. Consolidar NDA por rol/versión.
4. Hacer configuración funcional/autoadministrable.
5. Corregir periodo dinámico y HR viva.
6. Corregir dashboard/KPIs/drill.
7. Corregir postulaciones/asignaciones/visitas.
8. Corregir perfil shopper y certificaciones.
9. Corregir finanzas operativas visuales.
10. Consolidar importador genérico y proyectos autoadministrables.
