# PENDIENTES-PROTOTIPO-V64.md

Fecha: 2026-07-01
Version auditada: Prototype development request CXOrbia V64.zip
Estado: documento vivo actualizado para evitar reprocesar pendientes ya atendidos.

## Criterio de actualizacion

Este documento reemplaza como referencia operativa los pendientes V62/V63 acumulados que V64 declara como resueltos y verificados.

No se eliminan los aprendizajes historicos, pero los items marcados como resueltos por V64 no deben volver a pedirse a Claude/ChatGPT como pendientes abiertos salvo que una validacion visual posterior demuestre regresion.

## Pendientes cerrados por V64 o ya declarados resueltos en su documentacion

### Nucleo / white-label / IA

- IA multi-proveedor sin sesgo y comparativo costo/beneficio.
- `CX.ai.ask` conectado a proveedores IA a nivel de prototipo.
- Lectura de adjuntos PDF/texto a nivel prototipo.
- PWA auto-install y favicon con logo de consultora.
- Login white-label con logo cliente, banderas y texto CXOrbia.
- Logo del cliente en topbar y propuestas.
- Temas, paletas y tipografias.
- Roles coordinador, aliado, representante y scope por pais.
- Permisos por rol gobiernan navegacion real.

### Operacion

- Mis Visitas y Mis Beneficios filtran por shopper autenticado.
- Acciones operativas persistibles y bitacora de auditoria a nivel prototipo.
- Postulaciones: solicitar ajuste, visitas aprobadas, reasignar con buscador y perfil real.
- Reservas/asignacion: cruce reserva-postulacion y notificaciones bidireccionales.
- Boton Asignar responsable con notificacion y Mi Dia.
- Dashboard operativo con KPIs vivos, avance real vs ideal por pais y sin hardcode de mes/2026.
- Estado operativo de visitas con detalle real, editar y borrar inline.
- Visitas disponibles multi-proyecto para shopper.

### Finanzas

- CxC/CxP clickeables.
- Pago de lote como movimiento por shopper.
- Financiamiento con concepto.
- Presupuesto mensual.
- Analisis critico.
- Fecha de pago configurable: viernes + N dias.
- Liquidacion reacciona a cuestionario + submit.
- Importador Excel real con SheetJS.

### Comercial

- CRM completo estilo Orbit.
- Ficha 360 a pantalla completa con pestanas.
- Trazabilidad de correos.
- Proyectos/propuestas vinculados.
- Clientes y cuentas CRM sincronizados.
- Costos/propuestas con plantilla, IA, investigacion web, PDF y envio.
- Marketing con generacion IA mensual por tematicas, embudo, objetivo, CTA y hashtags.

### Capacitacion, documentos y soporte

- Academia con cursos admin, shopper y cliente.
- Admin puede ver/editar/dirigir cursos por audiencia.
- Crear curso/leccion/categoria con IA.
- Video, imagen y documento embebidos.
- Manuales con visibilidad por rol y visor pantalla completa.
- Certificacion con banco IA desde instructivo, examen shopper y recertificacion.
- Documentos/recursos del proyecto con visor pantalla completa y generacion IA.
- Reportes crear/editar/exportar CSV/generar con IA.
- Soporte con bandeja viva, cambio de estado y responsable.

### Configuracion / gobierno

- Centro de autoadministracion.
- Listas desplegables administrables.
- Usuarios crear/editar con cualquier dominio y roles personalizados.
- Setup inteligente con seleccion de items a generar.
- NDA/Legal versionado, auditoria y textos por rol.
- Modo demo/piloto y proyecto inicial configurable.
- Impresion/PDF limpia.
- Add-ons con catalogo in-app, evidencia geolocalizada y documentos comerciales.

### Separacion Proyecto / Periodo

- Selector Proyecto = programa, no meses.
- Subselector Periodo iniciado en V64.

## Pendientes vigentes P0/P1 para proximas versiones del prototipo

### P0 - Periodos e historico

1. Submodulo Periodos completo: crear, cerrar, archivar, duplicar y comparar periodos de un programa.
2. Vista de Historico consultable por proyecto, pais, periodo, quincena, shopper, sucursal, KPI, liquidacion y beneficios, sin mezclarse con operacion activa.
3. Deteccion de periodo en importador HR: proyecto nuevo/existente, periodo nuevo/existente, duplicados, errores y panel de confirmacion antes de cargar.
4. Sincronia de filtros proyecto/periodo/pais entre todos los modulos desde un unico estado.

### P1 - Estados honestos

1. Correo debe diferenciar: simulado, borrador, pendiente backend, enviado real.
2. Automatizaciones deben mostrar estado honesto: activa, pausada, pendiente backend, error o simulada, con ultima/proxima ejecucion.
3. Integraciones deben indicar conectado, pendiente o simulado por integracion.
4. IA debe indicar pendiente backend/API real cuando no exista API key o backend conectado.

### P1 - Fichas ampliadas

1. Ficha de Periodo.
2. Ficha de Visita ampliada.
3. Ficha de Sucursal con historico, scores, hallazgos y comparativo.

### P1 - Centro de Actualizaciones SaaS

1. Vista admin de releases.
2. Estado por tenant.
3. Vista cliente con banner, historial y confirmacion de lectura.
4. Compatibilidad con planes, paises, modulos activos, permisos y feature flags.

### P2 - Profundidad no bloqueante

1. Mas cursos extensos en Academia por industria.
2. Mas analitica en Finanzas y Portal Cliente.
3. Mayor profundidad de reportes y comparativos historicos.

## Separacion de responsabilidades

### Claude / prototipo

- UX, pantallas, flujos visuales, fichas, botones, textos honestos, estados simulados/conectados, filtros, periodos, historico y navegacion.

### ChatGPT / backend

- Firestore real, Auth, Storage, Gemini server-side, Make/WhatsApp/correo real, persistencia, reglas, seeds, smoke tests, validadores y adapter CX.data.

## Nota de control

Si una validacion visual posterior contradice un item declarado resuelto por V64, se documentara como regresion nueva y no como pendiente historico reabierto sin evidencia.
