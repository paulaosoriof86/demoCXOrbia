# Academia implementation backlog - Backend to date

Fecha: 2026-07-04

## Objetivo

Convertir la auditoria retroactiva de Academia en backlog implementable para cursos, manuales, lecciones, glosario, checklists, notificaciones y rutas por rol.

## Prioridad Phase A minima

### Ruta Shopper

1. Induccion a mystery shopping.
2. Como leer ficha de postulacion.
3. Restricciones y elegibilidad.
4. Postularme a una visita.
5. Fecha propuesta y reservas.
6. Agendar, reprogramar y cancelar.
7. Realizar visita.
8. Cuestionario realizado.
9. Notificaciones que recibire.
10. Beneficios, honorario, reembolso, liquidacion y pago.

### Ruta Operativo / Coordinador

1. Lectura de HR y visitas disponibles.
2. Gestion de postulaciones por sucursal y shopper.
3. Aprobacion, no seleccionado suave y asignacion.
4. Control de fecha propuesta, franja, rango y quincena.
5. Agenda, reprogramacion, cancelacion.
6. Notificaciones y WhatsApp Web fallback.
7. Revision admin basica y escalamiento.
8. Seguimiento a cuestionario pendiente.
9. Conflictos HR/plataforma.

### Ruta Admin

1. Configuracion de proyecto Phase A.
2. Restricciones por proyecto.
3. Tenant, modulos y login externo.
4. HR Source y mapping.
5. Postulaciones/asignaciones.
6. Lifecycle de visitas.
7. Revision, submitido, liquidacion y pagos.
8. Notificaciones, correo y trazabilidad.
9. Academia como herramienta de adopcion.

### Ruta Superadmin / Consultora / Franquicia / Aliado

1. Modelo SaaS multi-tenant.
2. Perfil tenant/empresa consultora.
3. Modulos, plan, preview comercial y login externo.
4. Creacion de proyectos configurables.
5. Integraciones y gates.
6. Operacion regional/local.
7. Venta cruzada y paquetes adicionales.
8. Academia para equipos, shoppers y clientes.

### Ruta Cliente final

1. Que valor recibe.
2. Como leer estados de visitas.
3. Como leer reportes y avances.
4. Que notificaciones puede recibir.
5. Que servicios/paquetes adicionales existen.

## Manuales Phase A

- Manual HR Source.
- Manual ficha de postulacion.
- Manual restricciones de proyecto.
- Manual postulaciones y asignaciones.
- Manual reservas/agendamiento/reprogramacion.
- Manual lifecycle de visitas.
- Manual cuestionario/revision/submitido.
- Manual notificaciones y WhatsApp Web.
- Manual correo/trazabilidad.
- Manual liquidaciones/pagos.
- Manual tenant/login/modulos.

## Glosario inicial

- Tenant.
- Cliente final.
- Consultora.
- Franquicia.
- Representante.
- Coordinador regional/local.
- HR / hoja de ruta.
- SourceRef.
- Gate.
- Preview.
- Postulacion.
- Fecha propuesta.
- Reserva.
- Asignacion.
- Disponible desde.
- Franja.
- WK.
- WKND.
- Quincena.
- Escenario.
- Honorario.
- Reembolso.
- Cuestionario realizado.
- Submitido.
- Revision admin.
- Liquidacion.
- Pago.
- Outbox.
- WhatsApp Web fallback.
- Email traceability.

## Checklists interactivos a crear

1. Shopper: antes de postularme.
2. Shopper: antes de realizar visita.
3. Shopper: despues de cuestionario.
4. Ops: aprobar postulacion.
5. Ops: validar fecha propuesta.
6. Ops: pedir ajuste/confirmacion/reprogramacion.
7. Admin: configurar proyecto.
8. Admin: revisar restricciones.
9. Admin: auditar notificaciones/correo.
10. Admin: liquidacion/pago.

## Notificaciones Academia a crear

- Curso asignado.
- Curso obligatorio pendiente.
- Manual actualizado por cambio de modulo.
- Nueva leccion disponible.
- Solicitud de capacitacion recibida.
- Capacitacion programada.
- Contenido pendiente de revision humana.

## Pendiente de implementacion visual

Este backlog debe convertirse en diseno de plataforma interactivo, no en texto simple.

Debe incluir:

- tarjetas;
- rutas;
- progreso;
- filtros;
- buscador;
- lecciones interactivas;
- checklists;
- fichas editables;
- versionado;
- notificaciones;
- Top bar/acceso persistente.

## Estado seguro

Solo documentacion. Sin frontend, sin runtime, sin Firestore real, sin Gemini real, sin deploy y sin produccion.
