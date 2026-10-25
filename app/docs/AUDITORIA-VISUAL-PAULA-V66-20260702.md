# AUDITORÍA VISUAL PAULA V66 — HALLAZGOS PROFUNDOS

Fecha: 2026-07-02
Base: V66 aplicada en commit `a3634baaa35b75bcf5f2fbcb0fe033fe6d964216`.
Alcance: hallazgos detectados por Paula durante validación visual local en `http://127.0.0.1:5186/`.

## 0. Resultado general

V66 abre en preview local y muestra una cobertura visual amplia, pero la validación visual demuestra que muchos módulos siguen siendo demo, mock, hardcodeados, superficiales, no sincronizados o con botones no funcionales. Estos puntos no deben perderse en la siguiente entrega de Claude. Solo se deben cerrar cuando Paula pueda validar visualmente que el flujo funciona con datos coherentes, botones accionables y estado/trazabilidad.

## 1. SaaS multi-tenant, roles, permisos, planes y add-ons

- No queda claro desde dónde se administran módulos y accesos por rol.
- No queda claro dónde se asigna a representante/coordinador/aliado/franquiciado: proyecto, país, módulos, permisos, accesos, periodo, cliente o alcance.
- Falta panel completo para crear/editar usuarios con rol base, país, proyecto, periodo, módulos, permisos por acción, plan, add-ons, integraciones y auditoría.
- Los add-ons aparecen como oferta, pero no como módulos contratables y activables por cliente/tenant/plan.
- Debe poder probarse que un aliado de Honduras solo ve y gestiona lo autorizado.

## 2. Datos demo vs TyA/Cinépolis DEV

- En preview normal aparecen proyectos demo y no TyA/Cinépolis.
- Debe distinguirse demo comercial, tenant DEV TyA, proyecto Cinépolis, datos importados y backend DEV.
- Al cambiar periodo, notas técnicas y KPIs deben cambiar con el periodo o indicar que son demo.
- Lo específico de TyA/Cinépolis debe conservarse como configuración por tenant/proyecto, no hardcodearse como lógica global.

## 3. Dashboard operativo

- KPIs abren algunos modales, pero faltan acciones por registro.
- En KPIs de visitas no aparece gestión WA/correo desde cada registro.
- Registros no siempre son clickeables.
- La lupa del tablero de visitas no funciona.
- Falta ver detalle, enviar WA/correo mock, copiar plantilla, reasignar, autorizar fuera de rango, registrar nota, crear tarea y navegar al módulo relacionado.
- El análisis crítico no evidencia lectura de datos vivos, no tiene regenerar y sus botones no funcionan.
- Cada KPI debe explicar cálculo, fuente de datos y periodo.

## 4. Visitas, fuera de rango y trazabilidad

- Se requiere autorizar visitas fuera de rango indicando quién autorizó en TyA, motivo, fecha/hora, evidencia/comentario y responsabilidad.
- El puntaje del shopper solo debe afectarse si la responsabilidad es del shopper.
- Si el motivo es TyA, cliente, local cerrado u otra causa externa, no debe penalizarse igual.
- Cada visita debe tener ficha completa e historial de estados: publicada, postulada, asignada, agendada, reprogramada, realizada, cuestionario, submitida, validada, liquidada, cancelada, fuera de rango autorizado.

## 5. Postulaciones, reservas y asignación

- Al reasignar no hay buscador de shoppers, solo listado.
- Debe filtrar por país, ciudad, certificación, disponibilidad, puntaje, experiencia y proyecto.
- Reservas & Asignación debe contemplar escenarios desde HR online, HR archivo, creación manual, visitas sin asignar y cancelaciones.
- Si no hay escenarios y reservan, debe haber autorización para aprobar postulación de una vez, quitar visita de disponibles, registrar shopper/teléfono en HR, notificar y solicitar fecha.
- Publicar y cruzar debe explicarse y tener flujo completo sin duplicados.

## 6. Shoppers, puntuación y certificación

- KPIs de Shoppers no funcionan clickeables.
- Falta criterio profundo de puntuación: cancelación por shopper/TyA/cliente, reprogramación, fuera de rango, cuestionario tarde, evidencia, calidad narrativa y reincidencia.
- Certificación debe almacenarse por proyecto y vigencia, y no pedirse de nuevo si sigue válida.
- Si no está certificada, debe ser prerrequisito para gestionar visitas asignadas.
- Debe verse dónde admin crea banco de preguntas y dónde shopper lo responde.

## 7. Reportes & KPIs

- Crear reporte es muy básico.
- Reportes creados no permiten editar, eliminar, agregar/quitar columnas, cambiar filtros, programar, publicar, versionar ni elegir visibilidad.
- Botones de reportes no funcionan.
- Debe existir builder real de reportes para admin, cliente y shopper.

## 8. Clientes, ficha 360, portal cliente, Insights y Benchmark

- KPIs de clientes no funcionan con detalle y faltan OKRs.
- La ficha cliente debe ser modal grande, 360, integral, accionable y trazable.
- Debe conectar CRM, propuestas, reportes, reuniones, documentos, finanzas, marketing, proyectos, contratos, add-ons y portal cliente.
- Documentos en ficha cliente no se visualizan; subir documento no funciona; correo no abre ni muestra preview.
- No queda claro cómo funciona NPS, reunión con consultora, capacitación cliente, reportes cliente ni roles/permisos del portal.
- Insights y Benchmark tienen KPIs y botones no funcionales.

## 9. Proyectos, periodos e histórico

- Creación de proyecto debe ser realmente inteligente: cliente, industria, países, monedas, frecuencia, rondas, duración, HR, cuestionario, instructivo, recursos, certificación, presupuesto, reportes, portal cliente, reglas, escenarios, restricciones, roles y plan.
- Periodos no tienen KPIs funcionales ni edición profunda.
- Periodos debe permitir frecuencia, tiempo de medición, cantidad de rondas al año, fechas, país, quincenas y reglas.
- Histórico tiene KPIs no funcionales, resumen no clickeable, comparativo mínimo, sin tabla ni variaciones relevantes.

## 10. HR, cuestionarios e importador inteligente

- En Hojas de Ruta no queda claro cómo crear HR inteligente o manualmente; aparece cargar pero no crear desde cero.
- Botón Parada no funciona.
- Revisar igual Cuestionarios.
- Importador inteligente se ve básico y al probar archivo/base64 devolvió datos que no correspondían, sugiriendo hardcode o análisis falso.
- Debe leer documento completo, detectar tipo, mostrar preview, proponer mapeo, separar registros buenos/problemáticos, detectar duplicados, iterar/refinar, explicar destino de importación y guardar auditoría.

## 11. Academia, cursos, quizzes, certificaciones y recursos

- Academia y manuales son superficiales.
- No explican cómo se usa cada módulo/sección ni su valor real.
- Falta edición y creación inteligente de quizzes con cantidad de preguntas, nivel, fuente, tipo, aprobación, vigencia e intentos.
- Certificaciones no se pudieron probar por requerir IA.
- Recursos deben permitir categorías, múltiples archivos, nombres propios, visibilidad por rol, ícono/emoticon, embed/preview y control de lectura.
- Recursos no se ven embebidos en portal shopper.
- Manuales deben tener formato oficial CXOrbia y profundidad real, no solo listado de secciones.

## 12. Finanzas

- KPIs financieros muestran información repetida o igual.
- Presupuesto aparece editable en dashboard, pero ahí debería analizarse; creación/edición debe estar en sección propia.
- Presupuesto debe incluir fecha de pago/vencimiento para alertas.
- Movimientos no muestran fuente de ingreso ni beneficiario de egreso.
- Ingreso no permite seleccionar proyecto destino, pagador ni ingreso proyectado.
- Egreso no tiene beneficiario ni proyecto.
- Pago de lote debe generar egreso por beneficiario con número de lote.
- Egreso programado no quedó en CxP.
- CxC creada no aparece por ningún lado.
- Falta tablero claro de CxC y CxP.
- Liquidaciones no sincronizan estado al cambiarlo y falta mover a lote.
- Falta manual financiero profundo.

## 13. Comercial, costos, propuestas y CRM

- Cargar plantilla de propuesta no funciona.
- Propuesta necesita análisis, vista previa, datos fijos/variables, investigación web o campo equivalente, levantamiento de información, calculadora validada, propuesta económica configurable, logo cliente, plantilla por defecto CXOrbia/TyA, historial y versiones.
- Si se genera desde pipeline debe tomar datos del prospecto, documentos y ficha 360.
- No se ve historial ni análisis de propuestas.
- CRM debe revisarse por datos vivos/código muerto.
- Pipeline crea fichas ejemplo completas pero la creación es básica y no hay edición clara.
- Falta responsable, cambio de etapa, notas, tareas, WA, correo, Meet, documentos, propuesta y trazabilidad.

## 14. Marketing

- Debe ser módulo estratégico: objetivos, embudo, calendario, piezas, copies, campañas, resultados, estadísticas, recomendaciones e iteración.
- Importación de calendario debe mostrar preview, permitir modificar y guardar versiones.
- Debe simular o preparar integración con redes y herramientas de medición.

## 15. Configuración, marca, integraciones, automatizaciones y correo

- Revisar todos los botones de configuración: editar, cancelar, agregar, eliminar y guardar.
- Identidad de marca debe leer logo, sugerir colores, aplicar paleta/manual y reflejarse en login, topbar, portal, reportes, propuestas, PDF, favicon y PWA.
- Manuales deben explicar valor de add-ons, integraciones, automatizaciones y correo: qué impactan, cómo funcionan, qué requiere backend y qué está listo.

## 16. Portal cliente, capacitación, novedades y notificaciones

- Capacitación cliente no se entiende: objetivo, flujo, cursos, asignación, notificación y medición de avance.
- Reportes cliente no son administrables desde admin por visibilidad.
- Novedades/actualizaciones no están sincronizadas con campanita del portal cliente.
- Solicitudes y recordatorios manuales deben aparecer como cuadro grande al ingresar, Mi Día, campanita y tablón hasta gestionarse.

## 17. PWA

- Instalar como app sigue mostrando instrucciones. Debe intentar prompt automático donde el navegador lo permita y explicar limitación solo si aplica.

## 18. Regla de cierre

Un hallazgo solo se cierra si la pantalla existe, los botones funcionan en mock/local, los datos son coherentes, hay detalle/edición/acción, hay trazabilidad o estado, se indica si requiere backend y Paula puede validarlo visualmente.