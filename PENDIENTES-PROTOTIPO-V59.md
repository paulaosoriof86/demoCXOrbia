# CXOrbia - Pendientes prototipo V59 para Claude con máxima profundidad

Fecha: 2026-07-01
Base vigente: `Prototype development request CXOrbia V59.zip`
Archivo para Claude/frontend. No incluir ni resolver aquí tareas de backend.

## 0. Instrucción principal para Claude

Trabajar exclusivamente sobre el prototipo CXOrbia V59 o sobre la versión más reciente que Paula entregue después de V59. No usar versiones viejas, no reabrir ramas anteriores y no perder mejoras ya incorporadas.

Claude debe entregar una versión corregida y profundamente revisada, no solo parches superficiales. Cada punto debe quedar resuelto funcionalmente, con datos coherentes de prototipo, navegación estable, estados claros, acciones visibles y sin regresiones.

## 1. Límites estrictos de alcance

Claude debe corregir frontend/prototipo. No debe tocar ni revertir:

- Reglas Firestore.
- Scripts Firebase.
- Loaders, seeds, validators o herramientas de carga.
- Helpers locales ignorados.
- Archivos de salida local ignorados.
- `app/index-backend-dev.html`.
- Archivos `app/core/*backend*.js`.
- Configuración técnica de backend.
- Producción, Hosting o datos reales.

Si una mejora requiere backend real, Claude debe dejar la interfaz preparada con fallback honesto y documentar la dependencia, pero no debe fingir que ya está conectado ni mostrar datos simulados como reales.

## 2. Estado V59 auditado

V59 fue aplicado como prototipo más reciente y se preservó backend protegido. La auditoría previa a la aplicación detectó:

- 86 archivos en `app`.
- 85 archivos texto auditados.
- El ZIP V59 no contenía `app/index-backend-dev.html`, lo cual evita sobrescribir el preview backend.
- 0 referencias a Python/http.server.
- 1 archivo con carácter sospechoso UTF-8: `app/modules/aprendizaje.js`.
- 18 archivos con referencia a Banca.
- 10 archivos con referencia a Restaurantes.
- 27 archivos con referencia a `localStorage`.
- 51 archivos con posibles términos técnicos visibles: demo, Firebase, backend, beta, núcleo, diagnóstico u otros equivalentes.

Claude debe revisar estos hallazgos. No se asume que estén resueltos solo porque V59 los incluyó.

## 3. Archivos específicos que requieren revisión por auditoría

### 3.1 UTF-8/caracteres sospechosos

Revisar y corregir desde origen:

- `app/modules/aprendizaje.js`

Requisito:

- Guardar en UTF-8 sin BOM.
- Mantener `<meta charset="UTF-8">` en HTML.
- No corregir a mano reemplazando símbolos uno por uno si el problema es codificación.
- Si aparecen caracteres como `Ã©`, `â€`, `�` o caracteres de control, corregir la causa de codificación.

### 3.2 Referencias Banca que no deben contaminar TyA

Archivos detectados con Banca:

- `app/core/config.js`
- `app/core/data.js`
- `app/core/manuales-data.js`
- `app/core/shoppers-store.js`
- `app/demo/index.html`
- `app/docs/AUDITORIA-Y-CONFIG-TENANT-V58.md`
- `app/docs/HANDOFF-DESARROLLO.md`
- `app/docs/INSTRUCCIONES-MIGRACION-TYA.md`
- `app/docs/PLAN-DE-TRABAJO.md`
- `app/docs/RESUMEN-PARA-CHATGPT-BACKEND.md`
- `app/modules/academia.js`
- `app/modules/configuracion.js`
- `app/modules/crm.js`
- `app/modules/integraciones.js`
- `app/modules/operacion-extra.js`
- `app/modules/postulaciones.js`
- `app/modules/proyecto-wizard.js`
- `app/modules/proyectos.js`

Requisito:

- Banca no debe aparecer dentro del tenant TyA/Cinépolis como proyecto, cliente, cuenta, tema visual, datos, escenario o demo operativo.
- Si Banca se conserva, debe estar aislado como plantilla/sandbox explícito fuera de TyA.
- La experiencia TyA debe iniciar en TyA/Cinépolis, no en Banca.

### 3.3 Referencias Restaurantes que no deben contaminar TyA

Archivos detectados con Restaurantes:

- `app/core/config.js`
- `app/core/data.js`
- `app/demo/index.html`
- `app/docs/AUDITORIA-Y-CONFIG-TENANT-V58.md`
- `app/docs/PLAN-DE-TRABAJO.md`
- `app/modules/academia.js`
- `app/modules/configuracion.js`
- `app/modules/crm.js`
- `app/modules/proyecto-wizard.js`
- `app/modules/proyectos.js`

Requisito:

- Restaurantes no debe aparecer dentro de TyA/Cinépolis como dato operativo.
- Si se conserva como demo genérico, debe estar separado de la vista TyA.

### 3.4 Referencias localStorage

Archivos detectados con `localStorage`:

- `app/app.js`
- `app/core/automations.js`
- `app/core/cliente-data.js`
- `app/core/config.js`
- `app/core/manuales-data.js`
- `app/core/programa.js`
- `app/core/pwa.js`
- `app/core/router.js`
- `app/core/shoppers-store.js`
- `app/core/store.js`
- `app/core/topbar.js`
- `app/demo/index.html`
- `app/docs/ARCHITECTURE.md`
- `app/docs/CAMBIOS-PROTOTIPO.md`
- `app/docs/HANDOFF-DESARROLLO.md`
- `app/docs/INSTRUCCIONES-FIJAS-PROYECTO.md`
- `app/docs/RESUMEN-PARA-CHATGPT-BACKEND.md`
- `app/modules/academia.js`
- `app/modules/clientes.js`
- `app/modules/comercial.js`
- `app/modules/configuracion.js`
- `app/modules/correo.js`
- `app/modules/crm.js`
- `app/modules/integraciones.js`
- `app/modules/marca.js`
- `app/modules/operacion-extra.js`
- `app/modules/reservas.js`

Requisito:

- `localStorage` puede existir como mecanismo temporal de prototipo, pero no debe mostrarse al usuario final como fuente operativa real.
- Cuando el backend indique Firestore, el badge/estado visual no puede seguir diciendo localStorage/demo.
- Las pantallas finales no deben usar textos técnicos de almacenamiento.

## 4. P0 - Correcciones críticas que Claude debe resolver

### P0.1 TyA/Cinépolis limpio, sin demos ajenos

Cuando el tenant/proyecto visible sea TyA/Cinépolis:

- No mostrar proyectos Banca, Restaurantes, Retail u otros sectores ajenos como datos operativos.
- No mostrar Cliente Banca.
- No usar paleta, tema o textos de banca en TyA.
- No mezclar demos con TyA.
- Los demos solo pueden existir como plantillas/sandbox aislados.
- El selector de proyecto debe iniciar en TyA/Cinépolis.
- Los datos de prueba deben ser coherentes con mystery shopping TyA/Cinépolis.

Criterio de aceptación:

- Al entrar como admin TyA, solo se ven datos del tenant/proyecto TyA o plantillas claramente aisladas.
- No hay referencias visibles a Banca/Restaurantes dentro de TyA.

### P0.2 Ocultar avisos técnicos visibles en UI final

Eliminar u ocultar en experiencia final:

- demo
- Firebase
- backend
- beta
- núcleo/nucleo
- diagnóstico/diagnostico
- localStorage
- firestore-dev
- mensajes internos de implementación
- cualquier etiqueta técnica al lado de módulos del sidebar

Criterio de aceptación:

- Un cliente, shopper o administrador no ve etiquetas técnicas en sidebar, dashboards, tarjetas, login, topbar o módulos.
- Las etiquetas técnicas solo pueden aparecer en modo preview técnico explícito.

### P0.3 Configuración debe funcionar como centro autoadministrable

Paula reportó que Configuración no funcionaba bien y debe quedar profunda, real y editable.

Debe permitir administrar por tenant/proyecto:

- Proyectos.
- Clientes/cuentas.
- Países.
- Monedas.
- Honorarios por país.
- Reembolsos por país.
- Boleto/combo.
- Franjas WK/WKND.
- Quincenas.
- Sucursales.
- Escenarios.
- Roles/permisos visibles.
- Plantillas de notificaciones.
- NDA por rol.
- Estados operativos.
- Parámetros de fecha y periodos.
- Integraciones y automatizaciones visibles como configurables.

Cada sección debe tener:

- Crear.
- Editar.
- Eliminar o desactivar.
- Validación de campos requeridos.
- Estado vacío útil.
- Confirmación de cambios.
- Persistencia en prototipo.

Criterio de aceptación:

- Ninguna opción de Configuración debe ser decorativa.
- Las listas desplegables de otros módulos deben alimentarse de Configuración cuando aplique.

### P0.4 NDA/confidencialidad por rol y versión

El módulo de NDA no debe volver a textarea único.

Debe tener:

- Texto por rol: shopper, admin, ops, coordinador, aliado, cliente, super.
- Versionado visible.
- Estado vigente/inactivo.
- Historial/auditoría visible para admin.
- Vista previa antes de publicar.
- Flujo de aceptación por usuario/rol.
- Reaceptación si cambia versión.
- Copia exportable/imprimible.
- Mensajes claros cuando falte configurar NDA.

Criterio de aceptación:

- Admin puede editar por rol y versión.
- Shopper/usuario ve el NDA que corresponde a su rol.
- Cambio de versión obliga reaceptación.

### P0.5 Periodo dinámico

No debe quedar julio fijo ni fechas rígidas.

Debe:

- Cambiar desde selector de periodo.
- Actualizar HR, dashboard, postulaciones, visitas, beneficios, certificaciones y finanzas.
- Mostrar periodo activo en encabezados y filtros.
- Permitir histórico mensual.
- No mezclar meses.
- Soportar periodos futuros y pasados.

Criterio de aceptación:

- Cambiar periodo cambia datos y KPIs de forma consistente.

### P0.6 HR viva TyA/Cinépolis

La HR debe ser la fuente visual de verdad para TyA/Cinépolis.

Debe cubrir:

- País GT/HN.
- Quincena 1/2.
- Franja WK/WKND.
- Sucursal.
- Shopper asignado.
- Estado correcto.
- Disponible desde dinámico.
- Fecha agendada.
- Fecha realizada.
- Cuestionario completado.
- Submitido.
- Liquidación.
- Reembolsos.
- Evidencias.

Reglas operativas:

- Q1 usa submitido Q2 anterior cuando exista.
- Q2 usa submitido Q1.
- Q2 restringe desde día 16 al fin de mes.
- Si no hay submitido, usar cuestionario completado +2 o realizada +3, y estimación posterior según regla vigente.
- `P x Agendar` solo con shopper asignado.
- `P x visita previa` en Q1 si no existe Q2 previa.
- Visita realizada y cuestionario no pueden tener fecha futura.
- Fuera de rango debe activar reprogramación.
- Cuestionario mayor a 48 horas debe generar alerta.

Criterio de aceptación:

- Conteos de HR coinciden con dashboard.
- No hay duplicados por país/quincena.
- Cada visita abre detalle.

### P0.7 Dashboard operativo, KPIs y drill

Paula reportó errores de KPIs, detalles mal ubicados y conteos incorrectos.

Debe corregir:

- Totales globales y por país sin duplicar.
- Asignadas.
- Agendadas.
- Realizadas.
- Cuestionario marcado.
- Submitidas.
- Sin submitir.
- Liquidadas.
- Pendientes de pago.
- Certificaciones.
- Ranking shoppers.

Reglas:

- `Sin submitir` = cuestionario marcado/presente sin fecha submitido.
- No sumar GTQ/HNL como si fueran misma moneda.
- No multiplicar liquidadas por 100.
- No mostrar liquidadas = 0 si existen registros.
- Drill debe abrir debajo de KPIs o en modal amplio, no mandar al final de la lista sin contexto.
- Cada fila del drill debe ser clicable.
- Flujo por fases debe separarse por GT/HN y quincena.
- Ranking shoppers debe mostrar top 5, promedio de días a cuestionario y criterios visibles.
- Certificaciones KPI debe abrir detalle.

Criterio de aceptación:

- Al hacer clic en cualquier KPI, se abre detalle correcto en zona visible o modal amplio.
- Los números no se contradicen entre tarjetas, HR y tabla.

### P0.8 Postulaciones y asignaciones completas

Postulaciones debe mostrar todas, no solo pendientes.

Agrupar por:

- Sucursal.
- Shopper.
- Estado.
- País.
- Quincena.
- Proyecto.
- Periodo.

Acciones requeridas:

- Aprobar.
- Rechazar.
- Stand-by.
- Solicitar ajuste.
- Reprogramar.
- Reasignar con buscador.
- Marcar atendida/gestionada.
- Ver historial.
- Ver relación con HR y visita.
- Generar notificación admin/shopper.

Criterio de aceptación:

- No hay duplicación entre postulación, reserva y visita aprobada.
- Una aprobación crea o actualiza la visita correcta.
- Shopper y admin ven el mismo estado.

### P0.9 Reservas/asignación

Debe quedar claro el flujo entre visitas disponibles, reservas, postulaciones y asignación.

Debe:

- Detectar visitas disponibles sin shopper en HR.
- Cargar escenarios por periodo.
- Cruzar reserva con postulación.
- Evitar doble asignación.
- Mostrar disponibilidad por franja.
- Respetar restricciones WK/WKND.
- Permitir reasignación con trazabilidad.

Criterio de aceptación:

- Una visita no puede quedar asignada dos veces sin alerta.
- Reasignar conserva historial.

### P0.10 Flujo shopper completo y estable

El portal shopper debe conservar el flujo aprobado:

1. Postulación/asignación.
2. Instructivo.
3. Agendar con control de franja.
4. Reprogramar.
5. Confirmar fecha si admin lo solicita.
6. Marcar realizada con validación de rango.
7. Acceder a cuestionario o redirección T&A Online según proyecto.
8. Marcar cuestionario realizado.
9. Estado revisión/submitido.
10. Beneficios/pagos visibles.

Corregir:

- Botones que solo hacen toast.
- Botones inactivos sin razón.
- Estados que no sincronizan admin/shopper.
- Mensajes de fuera de rango.
- Cuestionario pendiente después de 48 horas.
- Visitas realizadas visibles en perfil.
- Certificaciones visibles en perfil.
- Historial shopper no vacío si hay visitas.

Criterio de aceptación:

- El flujo funciona completo en orden y evita acciones fuera de rango.

### P0.11 Perfil shopper funcional

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
- Documentos/NDA.
- Acciones admin permitidas.

Criterio de aceptación:

- Botones de visitas realizadas y certificaciones abren detalle real.
- Perfil no queda vacío si el shopper tiene historial.

### P0.12 Mis beneficios y finanzas operativas

Debe separar honorarios y reembolsos.

Debe mostrar:

- Honorarios por visita.
- Reembolso boleto.
- Reembolso combo.
- País.
- Moneda.
- Estado de pago.
- Lote.
- Fecha estimada.
- Fecha pagada.
- Pendientes de meses pasados.
- Agregados a meses futuros.

Reglas:

- GTQ y HNL no se suman en un único total sin conversión explícita.
- Honorarios por país desde Configuración, no hardcode.
- Boleto + combo como reembolsos operativos en flujo T&A -> Paula -> shopper.
- Liquidaciones validan cuestionario realizado y submitido.
- Fecha estimada = viernes +15 días desde submitido, según regla operativa vigente.

Criterio de aceptación:

- Mis beneficios abre detalle por honorarios/reembolsos.
- Finanzas separa países y monedas.

### P0.13 Certificaciones y Academia

Debe quedar profundo, no decorativo.

Academia:

- Cursos por proyecto/rol.
- Lecciones extensas.
- Recursos embebidos.
- Manuales por rol/proyecto.
- Crear/editar/eliminar categorías.
- Crear/editar/eliminar lecciones.
- Progreso visible.

Certificaciones:

- Banco real de preguntas.
- Quiz por lección o curso.
- Certificación desde instructivo con IA si hay configuración.
- Recertificación.
- Notificación de certificación vencida.
- KPI con detalle.
- Visible en perfil shopper.

Criterio de aceptación:

- KPI Certificaciones abre detalle.
- Shopper ve certificación y estado.
- Admin puede gestionar banco de preguntas.

### P0.14 Responsables, Mi Día y notificaciones

Debe funcionar como flujo operativo.

Implementar visualmente:

- Asignar responsable.
- Aparecer en Mi Día del responsable hasta gestionarse.
- Atender/gestionar.
- Reaparecer si sigue pendiente.
- Tablón con contador.
- Drill desde dashboard.
- Exportar pendientes.
- Notificaciones bidireccionales admin/shopper.

Urgencias diferenciadas:

- Fuera de rango.
- Cuestionario pendiente.
- Visita sin realizar.
- Visita sin submitir.
- NDA pendiente.
- Certificación vencida.
- Reprogramación pendiente.
- Liquidación pendiente.

WhatsApp/Make:

- Puede quedar como plantilla o acción preparada si no hay conexión real.
- No debe fingir envío real si no está conectado.

### P0.15 Filtros y búsquedas reales

Revisar todos los módulos:

- Dashboard.
- HR.
- Postulaciones.
- Reservas.
- Visitas.
- Shoppers.
- Certificaciones.
- Finanzas.
- Recursos.
- Academia.
- CRM/Proyectos.
- Configuración.
- Soporte.

Requisito:

- Filtros deben modificar resultados.
- Búsqueda debe buscar en los campos visibles relevantes.
- Filtros activos deben mostrarse y poder limpiarse.
- No debe haber filtros decorativos.

### P0.16 Importador genérico CXOrbia

No debe ser solo migración TyA fija.

Debe funcionar como importador genérico con plantillas:

- HR TyA/Cinépolis.
- Finanzas TyA GT.
- Finanzas TyA HN.
- Liquidaciones.
- Shoppers.
- Sucursales.
- Cuestionarios/certificaciones.
- Recursos/manuales.

Debe mostrar:

- Mapeo editable.
- Validaciones.
- Errores por fila.
- Registros descartados.
- Previsualización antes de importar.
- Diferencia entre crear y actualizar.
- No duplicar HR.
- Plantillas descargables.

IA:

- Si hay configuración, usar `CX.ai.ask`.
- Si no hay configuración, mostrar fallback honesto.
- No simular análisis IA como real.

### P0.17 Proyectos autoadministrables

La administración de proyectos debe permitir:

- Crear proyecto.
- Editar proyecto.
- Activar/desactivar.
- Países.
- Monedas.
- Periodos.
- Sucursales.
- Escenarios.
- Honorarios.
- Reembolsos.
- Cuestionarios.
- Manuales.
- Certificaciones.
- Recursos.
- Responsables.
- Cliente/portal cliente.
- Plantillas de notificación.

Criterio de aceptación:

- TyA/Cinépolis debe ser configuración, no lógica fija incrustada.

### P0.18 Portal cliente

Debe ser coherente con proyecto/tenant.

Debe mostrar:

- Proyectos del cliente.
- Avance operativo.
- Recursos.
- Reportes.
- Documentos.
- Hallazgos.
- Estados.
- Acceso restringido por cliente/proyecto.

No debe mostrar datos de otros clientes o demos.

### P0.19 Soporte

Debe tener:

- Bandeja viva.
- Estados.
- Prioridad.
- Responsable.
- Respuesta.
- Notificación al solicitante.
- Filtros por estado, prioridad, rol y proyecto.

No debe ser pantalla estática.

### P0.20 Reportes

Debe permitir:

- Crear reporte con IA si hay configuración.
- Elegir columnas.
- Editar estructura.
- Descargar CSV/PDF cuando aplique.
- Reportes por país, periodo, proyecto y cliente.
- Reportes sin datos hardcodeados.

### P0.21 Integraciones, automatizaciones y marketing

Integraciones:

- Estados honestos.
- Activar/configurar visualmente.
- Plantillas editables.
- No fingir integración real.

Automatizaciones:

- Plantillas por evento.
- Responsable.
- Canal.
- Estado.
- Historial.

Marketing:

- Generación mensual por IA con temática, embudo, objetivo, CTA, hashtags y herramienta.
- Fallback honesto si no hay IA.

## 5. Reglas TyA/Cinépolis que deben reflejarse

- GT y HN separados.
- Quincena 1 y 2 separadas.
- Franja WK/WKND.
- Disponible desde dinámico.
- Q1 usa submitido Q2 anterior cuando exista.
- Q2 usa submitido Q1.
- Q2 restringe desde día 16 al fin de mes.
- Si no hay submitido, usar cuestionario completado +2 o realizada +3 y estimación posterior según regla vigente.
- `P x Agendar` solo con shopper asignado.
- `P x visita previa` en Q1 si no existe Q2 previa.
- Evidencias video/foto según proyecto.
- Combo JUMBO como reembolso cuando aplique.
- Cuestionario menor a 48 horas como control operativo.
- Fuera de rango activa reprogramación.
- No permitir visita realizada futura.
- No permitir cuestionario realizado futuro.

## 6. Errores/regresiones que Claude no debe reintroducir

- Mezclar TyA con Banca/Restaurantes/demo.
- Mostrar notas técnicas en UI final.
- Romper UTF-8.
- Duplicar títulos o secciones.
- Perder módulos existentes al mejorar otro.
- Mandar detalle de KPI al final de la página sin contexto.
- Dejar botones sin acción ni explicación honesta.
- Dejar Configuración sin funcionar.
- Filtrar postulaciones solo por pendientes cuando se necesita vista total.
- Mostrar `localStorage/demo` como estado final operativo.
- Cambiar visual aprobado sin necesidad.
- Rehacer arquitectura o convertir a framework.
- Introducir datos reales en demo/prototipo.
- Tocar backend protegido.
- Reintroducir Python en README o instrucciones locales.
- Reintroducir símbolos corruptos.
- Ocultar errores reales detrás de toasts genéricos.

## 7. Pruebas que Claude debe realizar antes de entregar

Claude debe revisar manualmente o con smoke local de frontend:

1. Login/selector de rol.
2. Admin TyA/Cinépolis.
3. Dashboard con KPIs.
4. Drill de cada KPI.
5. HR por país/quincena/franja.
6. Postulaciones todas y agrupadas.
7. Flujo aprobar/rechazar/stand-by/reprogramar/reasignar.
8. Portal shopper completo.
9. Perfil shopper.
10. Mis beneficios.
11. Certificaciones.
12. Academia/manuales.
13. Configuración/NDA.
14. Importador.
15. Reportes.
16. Portal cliente.
17. Soporte.
18. Recursos/documentos.
19. Filtros y búsquedas.
20. Revisión visual de que no aparezcan etiquetas técnicas.
21. Revisión visual de que no aparezcan Banca/Restaurantes dentro de TyA.
22. Revisión UTF-8.
23. Revisión responsive móvil.
24. Revisión de que no se perdió ninguna mejora de V59.

## 8. Entrega esperada de Claude

Claude debe devolver:

- ZIP/prototipo corregido basado en V59 o versión más reciente.
- Lista de archivos tocados.
- Cambios por módulo.
- Qué pendientes cerró.
- Qué queda pendiente y por qué.
- Confirmación de que no tocó backend protegido.
- Confirmación de que no introdujo datos reales.
- Confirmación de que no usó versiones viejas.
- `CAMBIOS-PROTOTIPO.md` actualizado o creado.
- `PENDIENTES-PROTOTIPO.md` actualizado.
- Evidencia de pruebas realizadas.

## 9. Prioridad sugerida de trabajo

1. Limpiar TyA/Cinépolis de Banca/Restaurantes/demos ajenos.
2. Corregir UTF-8 y avisos técnicos visibles.
3. Configuración autoadministrable.
4. NDA por rol/versión.
5. Periodo dinámico.
6. HR viva y reglas Q1/Q2.
7. Dashboard/KPIs/drill.
8. Postulaciones/reservas/asignaciones.
9. Flujo shopper y perfil shopper.
10. Beneficios/finanzas/liquidaciones.
11. Certificaciones/Academia/manuales.
12. Responsables/Mi Día/notificaciones.
13. Importador genérico.
14. Proyectos autoadministrables.
15. Portal cliente, soporte, reportes e integraciones.

## 10. Nota final para Claude

Paula pidió máxima profundidad. No entregar solo cambios cosméticos. La versión debe ser estable, coherente por tenant/proyecto, sin etiquetas técnicas visibles, sin demos mezclados, sin caracteres corruptos y con flujos operativos completos o con dependencia backend declarada de forma honesta.
