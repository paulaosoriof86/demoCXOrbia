# Academia coverage audit - Backend to date

Fecha: 2026-07-04

## Objetivo

Revisar retroactivamente lo avanzado en backend para identificar que debe entrar en Academia, manuales, cursos, rutas por rol, glosario, checklists, notificaciones y contenido interactivo.

Este documento complementa el backfill ya creado y convierte los bloques backend en backlog accionable de Academia.

## Estado general

Academia ya quedo declarada como modulo estrategico, profundo, interactivo, editable y con gate obligatorio por cambio de modulo.

Sin embargo, por la cantidad de avances backend previos, aun se requiere implementar contenido retroactivo en Academia para todo lo ya trabajado.

## Cobertura por bloque backend

### 1. CX.data adapter / backend bridge

Estado Academia: pendiente de curso completo.

Debe incluir:

- que es `CX.data` explicado sin tecnicismos;
- diferencia entre prototipo localStorage y backend real;
- que significa adapter;
- por que no se debe mezclar backend dentro de modulos UI;
- que significa preview/staging/produccion;
- que cambia para admin/superadmin.

Formato recomendado:

- curso superadmin/admin;
- glosario;
- diagrama simple de flujo de datos;
- checklist de validacion.

### 2. HR Source

Estado Academia: pendiente de profundidad.

Debe incluir:

- que es HR/hoja de ruta;
- fuente operacional;
- sourceRef opaco;
- preview vs importacion real;
- lectura de columnas relevantes;
- que cambia por proyecto;
- por que no se usa URL cruda en produccion.

Formato recomendado:

- manual admin/ops;
- glosario;
- curso de lectura HR;
- errores frecuentes.

### 3. Auth, roles y claims

Estado Academia: pendiente.

Debe incluir:

- roles y permisos;
- diferencia entre ocultar UI y seguridad real;
- claims;
- rol ops/coordinador pendiente de decision;
- login externo configurable.

Formato recomendado:

- curso superadmin;
- manual de permisos;
- checklist de configuracion tenant.

### 4. Tenant profile, login externo y modulos

Estado Academia: pendiente nuevo.

Debe incluir:

- diferencia entre tenant/cliente CXOrbia y cliente final de consultora;
- tipos de tenant: consultora, franquicia, representante, coordinador, aliado, socio, custom;
- opciones externas de login;
- modulos internos por plan;
- preview comercial;
- seguridad backend.

Formato recomendado:

- curso superadmin/consultora;
- ficha editable guiada;
- checklist de configuracion.

### 5. Project wizard Phase A

Estado Academia: pendiente de manual profundo.

Debe incluir:

- crear proyecto;
- pais/moneda;
- HR;
- cuestionario;
- certificacion;
- revision;
- submitido;
- agenda;
- pagos;
- integraciones/gates;
- restricciones configurables.

Formato recomendado:

- curso superadmin/admin;
- tour guiado futuro;
- checklist de proyecto listo.

### 6. Restricciones de proyecto y ficha de postulacion

Estado Academia: pendiente nuevo.

Debe incluir:

- leer ficha de postulacion;
- honorario/reembolso;
- escenario;
- datos HR vs configuracion;
- restricciones de perfil;
- frecuencia/ultima visita;
- dias/horarios/franja;
- elegibilidad;
- revision manual.

Formato recomendado:

- curso shopper;
- curso ops/admin;
- glosario;
- checklist interactivo.

### 7. Reservas, franja, rango y quincena

Estado Academia: pendiente nuevo.

Debe incluir:

- reserva;
- fecha propuesta;
- disponible desde;
- WK/WKND Cinepolis como regla de proyecto;
- quincena;
- autorizaciones fuera de rango;
- posible impacto en puntaje sin penalizacion automatica.

Formato recomendado:

- lecciones shopper;
- manual ops/admin;
- checklist de validacion fecha.

### 8. Postulaciones y asignaciones

Estado Academia: pendiente de profundidad.

Debe incluir:

- postularse;
- aprobar;
- no seleccionado suave;
- asignar;
- agrupar por sucursal;
- filtrar por shopper;
- Q1/Q2 o periodo;
- pedir ajuste/confirmacion/reprogramacion;
- evitar doble aprobacion;
- origen plataforma vs HR.

Formato recomendado:

- curso ops;
- curso shopper;
- simulacion de decision;
- plantillas de mensajes.

### 9. Visit lifecycle

Estado Academia: pendiente de curso completo.

Debe incluir:

- disponible;
- asignada;
- agendada;
- reprogramada;
- cancelada;
- realizada;
- cuestionario realizado;
- revision;
- submitido;
- liquidacion;
- pago.

Formato recomendado:

- curso shopper;
- curso ops/admin;
- mapa visual de estados;
- checklist.

### 10. Cuestionarios, revision admin y submitido

Estado Academia: pendiente de profundidad.

Debe incluir:

- cuestionario interno;
- externo general;
- externo por visita;
- boton correcto para shopper;
- cuestionario realizado != submitido;
- revision admin;
- HR-driven submitido;
- conflictos.

Formato recomendado:

- curso shopper simplificado;
- curso admin/ops profundo;
- glosario.

### 11. Notificaciones y outbox

Estado Academia: pendiente nuevo.

Debe incluir:

- in-app;
- WhatsApp Web fallback;
- Make/API futura;
- preparado vs enviado;
- contacto faltante;
- plantillas;
- notificaciones Academia.

Formato recomendado:

- manual ops/admin;
- leccion shopper sobre notificaciones;
- curso Academia admin.

### 12. Email traceability

Estado Academia: pendiente nuevo.

Debe incluir:

- por que trazabilidad por correo;
- log manual;
- integracion futura;
- asociar correo a gestion;
- privacidad;
- adjuntos;
- correo vs notificacion.

Formato recomendado:

- manual admin/ops;
- curso privacidad;
- checklist de vinculacion.

### 13. Liquidaciones/pagos

Estado Academia: pendiente de bloque dedicado.

Debe incluir:

- honorarios;
- reembolsos;
- liquidacion candidata;
- submitido como requisito;
- pago programado;
- pagado;
- diferencia junio visitas ejecutadas vs pagos pendientes;
- visibilidad shopper/admin.

Formato recomendado:

- curso admin;
- curso shopper beneficios;
- glosario financiero.

### 14. Academia misma

Estado Academia: pendiente de implementacion visual futura.

Debe incluir:

- Top bar/acceso persistente;
- notificaciones propias;
- rutas por rol;
- cursos por modulo;
- lecciones interactivas;
- fichas inteligentes de creacion/edicion;
- borrar/archivar/duplicar/versionar;
- generar desde texto/recurso adjunto;
- revision humana si IA ayuda.

## Pendientes transversales

- Crear matriz curso/manual por rol y modulo.
- Crear glosario consolidado.
- Crear mapa de notificaciones de Academia.
- Crear backlog de lecciones por Phase A y Phase B.
- Crear criterio de profundidad para auditar paquetes Claude.
- Definir cuales cursos son obligatorios para cada rol al primer ingreso.

## Estado seguro

Solo documentacion. Sin cambios frontend, sin runtime, sin Firestore real, sin Gemini real, sin deploy y sin produccion.
