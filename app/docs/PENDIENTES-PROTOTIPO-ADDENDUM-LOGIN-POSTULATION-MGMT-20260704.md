# Pendientes prototipo - Login externo y gestion de postulaciones

Fecha: 2026-07-04

## Login externo

- Configurar que botones/opciones aparecen en la pantalla de login por tenant.
- Opciones posibles: admin, shopper, cliente, representante, coordinador regional/local, franquiciado, aliado, socio, soporte o custom.
- No confundir con modulos internos por plan.
- Ocultar boton es UX/configuracion; permisos reales deben validarse por backend/Auth.

## Gestion de postulaciones

- Bandeja agrupada por sucursal.
- Bandeja/filtro por shopper.
- Filtro por quincena/periodo.
- Acciones: aprobar, aprobar con otra fecha/periodo, pedir ajuste de fecha, pedir confirmacion, pedir reprogramacion, no seleccionar con mensaje suave.
- Registrar quien aprueba.
- Evitar doble aprobacion por otro usuario.
- Notificar al shopper por in-app/WhatsApp Web cuando Make/API no este activo.
- No usar mensajes duros de rechazo cuando solo no fue seleccionado.

## Academia

- Manual ops/admin de decision de postulaciones.
- Curso shopper sobre que pasa despues de postularse.
- Curso admin sobre auditoria de aprobaciones y duplicidades.
