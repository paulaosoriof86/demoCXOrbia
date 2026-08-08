# Academia role-based learning Phase A/B TyA

Fecha: 2026-07-04

## Decision

Academia queda incorporada al plan de trabajo como modulo estrategico del producto, no como una pantalla informativa superficial.

La prioridad inmediata sigue siendo backend Phase A, HR, visitas, shoppers, postulaciones, certificaciones, revision, submitido, liquidaciones/pagos y `CX.data`. Sin embargo, Academia debe avanzar en paralelo como contrato, arquitectura de contenido y backlog, para que no se pierda durante el empalme V82 y el backend.

## Por que Academia es critica

La plataforma sera robusta y multi-rol. Si los usuarios no entienden como operarla, sus beneficios y sus flujos, se pierde valor comercial y operativo.

Academia debe lograr que una persona nueva pueda:

- entender que es CXOrbia y que valor aporta;
- aprender segun su rol;
- saber que modulos debe usar;
- saber donde hacer clic y que accion ejecutar;
- comprender el flujo completo de su trabajo;
- identificar errores frecuentes;
- pedir capacitacion si necesita ayuda;
- descubrir paquetes, modulos, integraciones y servicios adicionales.

## Regla de profundidad

Cada modulo de Academia debe explicar, por rol:

- que es;
- para que sirve;
- quien lo usa;
- que valor agrega;
- que problema resuelve;
- como ahorra tiempo;
- como operarlo paso a paso;
- que botones o acciones usar;
- que datos entran y salen;
- como validar que se hizo bien;
- errores comunes;
- cuando pedir ayuda;
- que modulos, servicios o integraciones adicionales puede contratar si aplica.

No basta con decir que hace cada modulo en terminos generales.

## Rutas de aprendizaje por rol

### Superadmin

Objetivo: dominar gobierno completo de la plataforma.

Debe aprender:

1. Vision general del SaaS y propuesta de valor.
2. Conceptos de mystery shopping / field operations.
3. Tenant, proyectos, paises, monedas y multi-proyecto.
4. Usuarios, roles, permisos y alcance.
5. Creacion y configuracion de proyectos.
6. HR Source y fuentes operacionales.
7. Shoppers, postulaciones y asignaciones.
8. Certificaciones y bancos de preguntas.
9. Agenda, reprogramacion y cancelacion.
10. Cuestionarios internos/externos/link por visita.
11. Revision admin, submitido y conflictos HR.
12. Liquidaciones, pagos, honorarios y reembolsos.
13. Portal cliente y lectura de resultados.
14. Automatizaciones, Make, WhatsApp, Gemini y gates.
15. Academia como administracion de conocimiento.
16. Paquetes adicionales y crecimiento comercial.

### Administrador

Objetivo: operar proyectos y supervisar calidad.

Debe aprender:

1. Que hace la plataforma y como ayuda a operar proyectos.
2. Conceptos basicos del negocio.
3. Lectura de HR y estado operativo.
4. Gestion de shoppers.
5. Postulaciones, aprobaciones y asignaciones.
6. Seguimiento de visitas.
7. Reprogramaciones y cancelaciones.
8. Certificaciones.
9. Cuestionarios y evidencias.
10. Revision admin y submitido.
11. Liquidaciones/pagos.
12. Reportes y seguimiento al cliente.
13. Notificaciones y solicitudes de capacitacion.

### Operativo / coordinador

Objetivo: ejecutar seguimiento diario de campo.

Debe aprender con maxima profundidad:

1. Que es una HR / hoja de ruta.
2. Que es una visita disponible, asignada, realizada y revisada.
3. Que es una postulacion y como gestionarla.
4. Como aprobar/asignar shoppers.
5. Como enviar o preparar notificaciones.
6. Como validar agenda, reprogramacion y cancelacion.
7. Como dar seguimiento a cuestionario pendiente.
8. Como revisar evidencias.
9. Como detectar conflictos HR/plataforma.
10. Como escalar problemas.
11. Como usar tablon/notificaciones/seguimiento.
12. Como apoyar a clientes sin modificar datos indebidamente.

### Shopper

Objetivo: profesionalizar al shopper y reducir errores operativos.

Debe aprender:

1. Que es mystery shopping.
2. Cual es la finalidad de una visita.
3. Que es un escenario.
4. Que es una hoja de ruta desde la perspectiva shopper.
5. Como postularse a una visita.
6. Como agendar.
7. Como reprogramar o cancelar.
8. Como realizar una visita correctamente.
9. Que son evidencias y como cumplirlas.
10. Como llenar un cuestionario con detalle.
11. Como justificar hallazgos negativos.
12. Que significa marcar cuestionario realizado.
13. Que errores frecuentes debe evitar.
14. Como funcionan beneficios, honorarios, reembolsos y liquidaciones.
15. Como mejorar su perfil y profesionalizarse.

### Cliente final

Objetivo: entender el valor del servicio y usar el portal/reportes.

Debe aprender:

1. Que valor recibe con CXOrbia.
2. Como leer dashboards y KPIs.
3. Como interpretar estados de visitas.
4. Como leer resultados y hallazgos.
5. Como solicitar soporte o nuevos servicios.
6. Que automatizaciones o integraciones puede contratar.
7. Que modulos adicionales existen y que beneficios tienen.
8. Como aprovechar la informacion para tomar decisiones.

### Consultora / representante / franquiciado / aliado / socio

Objetivo: operar y vender mejor con CXOrbia.

Debe aprender:

1. Que es una consultora de mystery shopping.
2. Que significa operar como representante, franquiciado, coordinador o aliado.
3. Como se configura un proyecto.
4. Como se administra la red de shoppers.
5. Como se asegura calidad.
6. Como se entrega valor al cliente.
7. Como se usan automatizaciones e integraciones.
8. Como se ofrecen paquetes adicionales.
9. Como se hace venta cruzada.
10. Como usar Academia para capacitar a su propio equipo y clientes.

## Solicitud de capacitacion

Todos los roles deben tener opcion de pedir capacitacion.

La solicitud debe permitir:

- seleccionar tema;
- seleccionar modulo;
- indicar prioridad;
- escribir dudas;
- elegir canal de contacto;
- solicitar fecha sugerida;
- registrar estado: solicitada, programada, en progreso, completada, cancelada o requiere seguimiento.

## Academia como valor comercial

Academia tambien debe ayudar a vender y ampliar servicios.

Debe explicar:

- paquetes adicionales;
- automatizaciones;
- integraciones;
- modulos premium;
- beneficios de contratar nuevos servicios;
- como pedirlos;
- que problema resuelven;
- que ahorro o ventaja generan.

Esto aplica especialmente a clientes, consultoras, representantes, franquiciados, aliados, socios y superadmin.

## Integracion con backend

El contrato creado es:

- `app/contracts/academy-role-learning-phase-a.tya.contract.json`

Este contrato define:

- rutas por rol;
- entidades de Academia;
- profundidad minima de contenido;
- solicitud de capacitacion;
- prioridades Phase A y Phase B;
- hard stops.

## Prioridad por fases

### Phase A

Incluir como minimo:

- induccion shopper;
- ruta admin/operativa basica;
- ruta cliente basica;
- solicitud de capacitacion documentada/preparada;
- glosario base: mystery shopping, escenario, HR, cuestionario, submitido, evidencia, liquidacion, postulacion, asignacion.

### Phase B

Profundizar:

- rutas completas por rol;
- guias paso a paso por modulo;
- tours guiados in-app;
- analitica de avance;
- contenido comercial avanzado;
- ayuda de Gemini para borradores con revision humana;
- biblioteca de casos, errores frecuentes y buenas practicas.

## Relacion con auditoria modulo por modulo

En cada modulo que se revise para backend se debe documentar tambien:

- que debe aprender cada rol sobre ese modulo;
- que inconsistencias tiene la pantalla actual de Academia;
- que contenido falta;
- que flujo paso a paso debe incluirse;
- que valor agregado comercial u operativo debe explicarse.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin Firestore writes.
- Sin Gemini real.
- Sin Storage real.
- Sin deploy.
- Sin produccion.
