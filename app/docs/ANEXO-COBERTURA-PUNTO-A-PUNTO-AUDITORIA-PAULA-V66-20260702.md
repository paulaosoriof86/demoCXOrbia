# ANEXO DE COBERTURA PUNTO A PUNTO — AUDITORÍA PAULA V66

Fecha: 2026-07-02
Base visual vigente: V66
Objetivo: evitar pérdida de detalle de la auditoría visual extensa de Paula. Este anexo no reemplaza `AUDITORIA-VISUAL-PAULA-V66-20260702.md`; lo complementa como lista de trazabilidad para que ningún punto quede omitido al preparar el siguiente prototipo de Claude ni al continuar backend.

## Regla de uso

- Ningún punto se considera cerrado por estar escrito aquí.
- Solo se cierra si existe pantalla/flujo funcional, dato coherente, botón accionable, edición o trazabilidad donde aplique, y Paula lo valida visualmente.
- Lo útil debe quedar generalizable para CXOrbia SaaS multi-tenant y multi-proyecto.
- Lo exclusivo de TyA/Cinépolis se conserva como configuración por tenant/proyecto/periodo/país/regla, no como lógica global hardcodeada.

## 1. Preview, datos demo y conexión backend

1.1. El preview normal muestra proyectos demo y no TyA/Cinépolis real.
1.2. Debe quedar claro cuándo se está en demo comercial, tenant DEV TyA, proyecto Cinépolis o backend conectado.
1.3. Si la HR histórica ya fue cargada en backend DEV, debe verificarse por adapter y no asumir que el preview normal la consume.
1.4. Al cambiar periodo, notas técnicas, KPIs y textos del dashboard deben cambiar con datos vivos del periodo o mostrar aviso honesto de demo.
1.5. Se debe sincronizar `index-backend-dev.html` con V66 antes de continuar Sprint 9, sin romper backend protegido.

## 2. Administración de roles, permisos, países, proyectos, módulos, add-ons y visibilidad

2.1. Debe existir pantalla clara para administrar módulos y accesos de cada rol.
2.2. Debe existir pantalla para asignar a representante/coordinador/aliado/franquiciado: tenant, cliente, proyecto, país, periodo, módulos, permisos, plan, add-ons y acciones permitidas.
2.3. Debe poder configurarse visibilidad por rol para admin, operativo, coordinador, representante, aliado, franquiciado, shopper y portal cliente.
2.4. Debe poder probarse que un usuario con alcance país/proyecto solo ve lo autorizado.
2.5. Los add-ons no deben aparecer solo como oferta comercial; deben poder activarse/desactivarse por cliente/tenant/plan/contratación.
2.6. Debe existir explicación operativa y manual de qué impacta cada add-on, integración y automatización.

## 3. Dashboard operativo y KPIs

3.1. Los KPIs deben ser clickeables y mostrar detalle accionable.
3.2. Los registros dentro de los modales de KPIs deben ser clickeables.
3.3. Debe poder gestionarse WA/correo desde cada registro, como preview/copia de plantilla o pendiente backend, no envío real sin autorización.
3.4. La lupa del tablero de visitas debe funcionar.
3.5. Cada KPI debe explicar fuente, fórmula, periodo, país y alcance.
3.6. El análisis crítico detallado debe leer datos vivos o indicar claramente que es demo; debe tener botón regenerar/actualizar y sus botones deben funcionar.
3.7. El presupuesto no debe editarse dentro del dashboard si ahí solo se analiza; la creación/edición debe estar en sección correspondiente.
3.8. La lectura del dashboard debe conectarse al presupuesto real, movimientos reales, liquidaciones y HR real.
3.9. Los cronogramas/visuales deben leer datos vivos y permitir detalle.

## 4. Visitas, autorización fuera de rango y trazabilidad

4.1. Se necesita autorización de visitas fuera de rango.
4.2. La autorización debe registrar quién autorizó en TyA, rol, fecha/hora, motivo, observación y evidencia si aplica.
4.3. Debe afectar el puntaje del shopper únicamente si la responsabilidad es del shopper.
4.4. Debe distinguir responsabilidad: shopper, TyA, cliente, local cerrado, cambio operativo, fuerza mayor u otra causa.
4.5. La visita debe tener historial completo de estados y cambios.
4.6. Ficha de visita debe permitir ver, editar mock, reasignar, reprogramar, solicitar fecha, enviar plantilla, registrar observación, crear tarea y ver trazabilidad.
4.7. Visitas disponibles deben mostrar postulaciones, botones y flujos funcionando.

## 5. Postulaciones, reservas y asignaciones

5.1. Al reasignar debe existir buscador de shoppers, no solo listado largo.
5.2. El buscador debe filtrar por país, ciudad, disponibilidad, certificación, proyecto, experiencia, puntaje y conflicto de asignación.
5.3. Reservas & Asignación debe considerar que escenarios pueden llegar desde HR en línea, archivo, creación manual, visita sin asignar detectada o visita cancelada.
5.4. Al cancelar una visita debe volver a disponibilidad si corresponde y no duplicarse.
5.5. Cuando no hay escenarios y alguien reserva, debe haber opción para autorizar y aprobar postulación de una vez.
5.6. Al aprobar debe desaparecer de disponibles, quedar asignada, registrar shopper/teléfono en HR, notificar shopper y solicitar fecha de visita.
5.7. Debe quedar claro qué hace “Publicar y cruzar”.
5.8. Debe evitar duplicar postulaciones/visitas al cruzar.
5.9. Las solicitudes deben aparecer en Mi Día, campanita, cuadro grande al ingresar y tablero hasta gestionarse.

## 6. Shoppers, ranking, scoring y certificación

6.1. KPIs de Shoppers deben ser clickeables.
6.2. Debe revisarse y documentarse criterio de puntuación.
6.3. Penalizaciones deben depender de motivo y responsabilidad: cancelación por shopper, cancelación por TyA, cambio del cliente, local cerrado, reprogramación justificada, fuera de rango autorizado, cuestionario tarde, evidencia incompleta, calidad narrativa, reincidencia.
6.4. Certificación del shopper debe almacenarse por tenant, proyecto, periodo/vigencia, banco de preguntas, intentos y resultado.
6.5. Si el shopper ya está certificado y vigente, no debe repetirse.
6.6. Si no está certificado, debe ser prerrequisito para gestionar visitas asignadas si el proyecto así lo configura.
6.7. Debe verse dónde admin crea el banco de preguntas y dónde shopper lo responde.
6.8. Feedback de certificación debe leer datos vivos o indicar demo; no debe ser hardcodeado.

## 7. Reportes & KPIs

7.1. La ficha de creación de reportes es demasiado básica.
7.2. Debe existir builder real de reportes.
7.3. Reportes creados deben permitir editar, agregar/quitar columnas, modificar filtros, modificar visualizaciones, eliminar, duplicar, versionar, programar y publicar.
7.4. Debe poder elegirse quién ve cada reporte: admin, cliente, shopper, rol específico, país, proyecto o periodo.
7.5. Botones de reportes deben funcionar.
7.6. Los reportes deben poder administrarse desde admin para clientes y shoppers.
7.7. Debe existir manual profundo del módulo de reportes.

## 8. Clientes, ficha 360 y portal cliente

8.1. KPIs de clientes no funcionan con detalle.
8.2. Faltan OKRs del cliente y del programa.
8.3. Ficha cliente debe ser más grande, 360, integral, accionable y trazable.
8.4. Ficha cliente debe conectar CRM, pipeline, propuestas, documentos, reuniones, notas, tareas, reportes, finanzas, marketing, proyectos, contratos, add-ons y portal cliente.
8.5. Botón correo en ficha cliente no abre ni muestra preview útil.
8.6. Botón subir documento desde ficha cliente no funciona.
8.7. Documentos de ficha cliente no se visualizan/embeben.
8.8. Debe existir edición completa de ficha cliente y trazabilidad.
8.9. Debe poder asignarse responsable.
8.10. Deben existir plantillas WA/correo/Meet/seguimiento/propuesta desde ficha cliente.

## 9. Portal cliente, Insights, Benchmark, NPS, reuniones y capacitación cliente

9.1. KPIs de Insights y Benchmark no funcionan.
9.2. Botones de Insights/Benchmark no funcionan.
9.3. Debe explicar cómo funciona NPS del portal cliente: fuente, quién responde, periodicidad, cálculo, lectura, acciones y trazabilidad.
9.4. Debe funcionar solicitud de reunión con consultora o quedar como mock accionable.
9.5. Debe quedar claro si la reunión se integra con Meet y si deja trazabilidad en ficha cliente.
9.6. Capacitación del cliente no se entiende: objetivo, contenido, cursos, asignación, notificación, avance y medición.
9.7. Cuando se asigna un curso debe definirse a quién llega, dónde aparece al usuario, dónde se ve para admin y cómo se mide avance.
9.8. Reportes del cliente deben ser editables/personalizables por admin.
9.9. Debe poder controlar roles del portal cliente, permisos y visibilidad.
9.10. Los add-ons contratados deben integrarse al portal del cliente específico.
9.11. Deben implementarse oportunidades de mejora identificadas por investigación de mercado frente a otras plataformas, o documentar cuáles faltan.

## 10. Proyecto inteligente, configuración inicial y periodos

10.1. Creación de proyecto debe ser realmente inteligente.
10.2. Debe permitir cargar instructivo, documentación, HR sincronizada/cargada, cuestionario, recursos, reglas, escenarios y restricciones.
10.3. Debe adaptar plataforma según industria, cliente, países, monedas, módulos, flujos, evidencia, certificación, reportes y portal.
10.4. Al crear cliente/proyecto debe capturarse información completa: frecuencia, tiempo de medición por ronda, cantidad de rondas al año, países, quincenas, moneda, honorarios, reembolsos, calendario, reglas, presupuesto y responsable.
10.5. Periodos no tienen KPIs funcionales.
10.6. Periodos no tienen edición profunda.
10.7. Ficha de personalización de periodo es demasiado básica.
10.8. Histórico tiene KPIs no funcionales, resumen no clickeable, comparativo mínimo, sin tabla de datos ni variaciones relevantes.
10.9. Histórico debe permitir drill-down, tabla, exportación, comparativo entre periodos, países, indicadores, evolución y hallazgos.

## 11. HR, Hojas de Ruta, paradas y cuestionarios

11.1. En Hojas de Ruta no queda claro dónde se crea inteligentemente o manualmente.
11.2. La sección muestra cargar archivo pero no creación manual completa.
11.3. Botón “Parada” no funciona.
11.4. Cuestionarios deben revisarse igual: creación manual, inteligente, desde archivo, desde instructivo, desde HR, ponderaciones, secciones, evidencia y criterios críticos.
11.5. HR debe sincronizar visitas disponibles, asignaciones, cancelaciones, postulaciones, fecha, shopper, teléfono y estado.
11.6. HR online y HR archivo deben coexistir.
11.7. Debe existir auditoría de importación y sincronización.

## 12. Importador inteligente e IA

12.1. Importador inteligente se ve demasiado básico.
12.2. Debe tener más funcionalidades y secciones: detección de tipo, preview, mapeo, registros buenos/problemáticos, duplicados, destino de importación, iteración/refinamiento, guardar auditoría y simulación.
12.3. Al subir/cargar recurso, el importador devolvió texto extraño y datos que no correspondían.
12.4. Esto sugiere hardcode o análisis falso; es grave porque la plataforma depende de inteligencia real.
12.5. Debe leer documento completo, no solo una parte.
12.6. Si no hay IA real configurada, debe usar mock honesto sin fingir análisis real.
12.7. Debe tener botón regenerar/iterar y trazabilidad de prompts/resultados.

## 13. Academia, manuales, cursos, quizzes, certificaciones y recursos

13.1. Quizzes/evaluaciones de academia no muestran opción de editar.
13.2. No se puede crear quiz inteligente eligiendo cantidad de preguntas, nivel, tipo de preguntas, aprobación, intentos, vigencia y fuente.
13.3. Debe poder generarse desde archivo adjunto o contenido del curso.
13.4. Certificaciones no se pudieron probar porque exige conectar IA.
13.5. Debe confirmarse que carga banco de preguntas y que shopper lo ve.
13.6. Debe permitir crear categorías de recursos por proyecto.
13.7. Cada categoría debe soportar varios archivos.
13.8. Debe permitir nombres propios de documentos y elegir quién visualiza.
13.9. Crear recurso debe permitir elegir emoticon/ícono.
13.10. Recursos deben quedar embebidos/preview, no solo descargables.
13.11. Recursos deben verse embebidos también en portal shopper.
13.12. Manuales deben estar en formato oficial CXOrbia/Orbia visual, como documento demo, no texto simple.
13.13. Impresión/PDF de manuales está fea y debe mejorarse.
13.14. Manuales son superficiales; deben explicar cómo se utiliza cada módulo, cada sección, cada botón, valor agregado, impacto y ejemplos.
13.15. Cursos de academia son superficiales; deben ser profundos para uso correcto de módulos y para información sectorial.
13.16. Botón crear con IA de academia no funciona.
13.17. Al seleccionar cargar recursos lleva al importador, pero genera texto/formato extraño y datos no relacionados.
13.18. Manuales/cursos de shopper, admin y cliente deben permitir autogestión real.

## 14. Finanzas, movimientos, CxC, CxP, presupuesto, lotes y liquidaciones

14.1. Todos los KPIs de finanzas muestran exactamente la misma información o información repetida.
14.2. Presupuesto de gastos aparece editable en dashboard, pero ahí solo debe analizarse.
14.3. Presupuesto debe crearse/editarse en sección propia y conectarse al dashboard.
14.4. Presupuesto debe incluir fecha de pago/vencimiento para saber si está a tiempo o atrasado y generar notificaciones.
14.5. Movimientos no muestran fuente de ingreso ni beneficiario de egreso.
14.6. Registrar ingreso no permite seleccionar proyecto destino.
14.7. Ingreso no permite indicar pagador.
14.8. Ingreso no permite agregar ingreso proyectado.
14.9. Egreso no permite indicar beneficiario ni proyecto correspondiente.
14.10. Pago de lote debe generar egreso por cada beneficiario y mostrar número de lote, no solo movimiento global del lote.
14.11. Egreso programado no quedó en CxP.
14.12. Cuentas por cobrar deben poder agregarse y verse en tablero de movimientos y/o tablero exclusivo CxC.
14.13. Cuenta por cobrar creada no aparece por ningún lado.
14.14. Lista desplegable de CxP aparece extraña, sin buscador y difícil de entender.
14.15. Debe existir tablero claro de CxP y CxC.
14.16. Debe estar listo para cargar información histórica de movimientos y mapearla a módulos correspondientes.
14.17. Ingresos por tipo no deben mostrar solo concepto y valor; deben mostrar pagador y categoría.
14.18. Liquidaciones: al cambiar estado no cambia panel principal, por lo que no hay sincronía.
14.19. Liquidaciones deben tener botón mover a lote.
14.20. Debe existir manual financiero profundo.
14.21. Debe distinguir movimientos reales de empresa vs pagos aplicados a aseguradora/cliente/proyecto cuando aplique.
14.22. Debe existir conciliación, fuente, estado y trazabilidad.

## 15. Comercial, costos y propuestas

15.1. Cargar plantilla para propuesta de cliente no funciona.
15.2. Propuesta necesita análisis, vista preliminar, datos fijos y variables.
15.3. Debe poder incluir investigación web/contexto del cliente o campo equivalente si no se conecta web.
15.4. Debe permitir cargar levantamiento de información.
15.5. Calculadora de gastos debe revisarse.
15.6. Debe permitir elegir dónde poner propuesta económica y qué datos incluir.
15.7. Debe permitir plantilla por defecto CXOrbia si cliente no tiene plantilla.
15.8. Plantilla por defecto debe llevar logo del cliente, pie “elaborado por CXOrbia” y secciones similares a propuesta T&A/Spectrum.
15.9. Debe haber análisis de propuesta, vista previa, historial, versiones, edición y seguimiento.
15.10. Si se genera desde pipeline debe traer datos existentes del prospecto/cliente.
15.11. Si pipeline/ficha cliente tiene documentos, deben considerarse inteligentemente para propuesta.
15.12. Costos y propuestas deben vincularse con ficha 360 del cliente.
15.13. Debe existir historial de propuestas y estado.

## 16. CRM, pipeline, prospectos, documentos, Meet, WA y correo

16.1. Revisar si dashboard de CRM usa datos vivos o código muerto.
16.2. Análisis del CRM debe considerar todas las pestañas.
16.3. Fichas del pipeline aparecen completas en ejemplos, pero creación es básica.
16.4. Al crear ficha no hay edición suficiente, por lo que no queda claro cómo se actualiza pipeline y prospecto.
16.5. Falta responsable.
16.6. Deben existir botones para cambio de etapa/listas, movimientos, notas, tareas, documentos y trazabilidad.
16.7. Además de llamada debe haber WA.
16.8. Deben existir plantillas comerciales: envío de propuesta, citación Meet, seguimiento, cierre, reactivación.
16.9. Integración Meet debe dejar trazabilidad en ficha cliente y conectarse con botón reunión.
16.10. Botón correo de ficha cliente no abre correo o preview útil.
16.11. Botón subir documento no funciona.
16.12. Documentos de ficha cliente no se visualizan.

## 17. Marketing estratégico

17.1. Marketing debe ser módulo estratégico, no superficial.
17.2. Debe medir resultados.
17.3. Debe generar contenidos y piezas reales o mock completo.
17.4. Debe permitir iterar cada copy/pieza y estrategia completa según resultados.
17.5. Debe conectarse a redes sociales/herramientas de medición o mostrar configuración pendiente.
17.6. Debe tener estadísticas y sugerencias analíticas por resultados.
17.7. Si se importa calendario/contenido, debe importarlo inteligentemente, mostrar preview, permitir modificar y guardar.
17.8. Debe manejar objetivos, embudo, resultados por embudo y recomendaciones por embudo.

## 18. Configuración, marca, integraciones, automatizaciones y correo integrado

18.1. Revisar todos los botones de configuración.
18.2. Cada sección debe tener editar, cancelar, agregar, eliminar, guardar, preview y trazabilidad cuando aplique.
18.3. Identidad de marca debe funcionar perfecto.
18.4. Debe sugerir cambios a partir de logo, colores y manual de identidad de marca.
18.5. Debe aplicar marca a login, topbar, portal, reportes, propuestas, manuales, PDF, favicon/PWA y documentos.
18.6. Manuales deben explicar valor agregado de cada add-on, integración, automatización y correo integrado.
18.7. Deben explicar dónde influyen, qué impactan, cómo funcionan y si están listos para configuración.
18.8. Correo integrado debe tener flujos claros, plantillas, preview, estado y trazabilidad.

## 19. Novedades, campanita, Mi Día, tablón, solicitudes y recordatorios

19.1. Novedades/actualizaciones del menú no está sincronizado con campanita del portal cliente.
19.2. Deben revisarse demás sincronías de campanita y tablón.
19.3. Debe poder agendar recordatorios manuales y elegir destinatarios.
19.4. Solicitudes a usuarios deben aparecer como cuadro grande al ingresar, en Mi Día, campanita y tablón hasta gestionarse.
19.5. Gestiones pendientes deben mostrarse como cuadro grande al abrir plataforma y luego quedar en campanita/tablón.
19.6. Cada notificación debe tener estado: pendiente, visto, atendido, vencido, descartado, responsable y trazabilidad.

## 20. PWA / instalar como app

20.1. Instalar como app sigue mostrando instrucciones.
20.2. Debe intentar prompt automático donde el navegador lo permita.
20.3. Debe explicar limitaciones del navegador solo cuando aplique.
20.4. Debe usar logo/favicons de marca del tenant cuando corresponda.

## 21. Profundidad de auditoría y metodología

21.1. Claude y ChatGPT deben detectar proactivamente mejoras y cambios, no depender solo de Paula.
21.2. No deben excluirse hallazgos porque la auditoría visual sea larga.
21.3. Todo debe documentarse con profundidad.
21.4. Lo pequeño que se pueda corregir desde backend/ChatGPT debe gestionarse y documentarse, pero Claude debe implementar la solución visual/prototipo definitiva.
21.5. Nada debe cerrarse porque se vea en demo: debe ser funcional y validable.
21.6. Todo debe ser multiproyecto y multi-tenant; lo de Cinépolis/TyA es configuración y caso DEV, no producto cerrado.

## 22. Paquete para Claude

22.1. El paquete para Claude debe incluir este anexo.
22.2. Debe pedir a Claude implementación profunda, no superficial.
22.3. Debe pedir que Claude indique qué resolvió, qué queda abierto, qué cambió por archivo, qué requiere backend, qué debe validar Paula y criterios de aceptación.
22.4. Debe pedir que no se pierdan lógicas TyA/Cinépolis ni mejoras comercializables generales.

## 23. Backend específico que no debe perderse

23.1. Sincronizar `index-backend-dev.html` con V66 antes de Sprint 9.
23.2. Validar tenant DEV `tya` y proyecto `cinepolis-abril-26`.
23.3. Confirmar HR histórica real y su lectura.
23.4. Mantener `CX.data` como interfaz estable.
23.5. Adapter Firestore debe filtrar antes de renderizar por tenant, proyecto, periodo, país, rol, permisos, plan y feature flags.
23.6. Acciones reales siguen bloqueadas hasta autorización.
23.7. Diseñar auditoría backend para autorizaciones, cambios de estado, notificaciones, importaciones y finanzas.
23.8. Storage debe soportar documentos embebidos, recursos, manuales, evidencias y control de acceso.

## 24. Cierre

Este anexo se creó precisamente porque la respuesta resumida anterior no reflejaba la cantidad de detalle de la auditoría visual. A partir de este documento, el paquete para Claude y el trabajo backend deben tratar todos estos puntos como pendientes vivos hasta validación explícita.