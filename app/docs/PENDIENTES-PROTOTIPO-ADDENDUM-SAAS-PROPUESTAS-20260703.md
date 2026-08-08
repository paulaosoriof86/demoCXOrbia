# Addendum pendientes prototipo - SaaS y propuestas cliente

Fecha: 2026-07-03

## Motivo

Revision posterior al paquete V71/V72: se detecto que los pendientes relacionados con modelo SaaS comercializable y flujo de presentacion de propuesta a cliente no estaban suficientemente documentados en el paquete entregado a Claude.

## Estado

No se considera atendido.

## Pendiente P0 - Modelo SaaS comercializable

El prototipo debe representar Orbit/CXOrbia como plataforma SaaS multi-tenant versionada, no como ZIP distinto por cliente.

Debe contemplar visualmente:

- tenant por cliente,
- proyecto por programa,
- plan contratado,
- pais,
- modulos activos,
- permisos por rol,
- feature flags,
- releases/novedades,
- actualizaciones centralizadas.

## Pendiente P0 - Flujo comercial de propuesta a cliente

Debe existir un flujo para preparar una propuesta comercial desde plantilla.

Debe permitir, al menos:

- seleccionar cliente o prospecto,
- seleccionar vertical o industria,
- seleccionar tipo de programa,
- usar plantilla predeterminada,
- generar propuesta inteligente basada en datos del cliente,
- elegir modulos incluidos,
- elegir alcance geografico,
- definir usuarios/roles,
- incluir fases de implementacion,
- incluir entregables,
- incluir precios o placeholders de precios,
- exportar o preparar presentacion/propuesta.

## Pendiente P1 - Plantillas

Deben existir tipos de plantilla:

- plantilla base de mystery shopping,
- plantilla field operations,
- plantilla auditoria operativa,
- plantilla experiencia cliente,
- plantilla propuesta ejecutiva corta,
- plantilla propuesta completa.

## Pendiente P1 - Estados del flujo

Estados sugeridos:

- borrador,
- en revision,
- lista para enviar,
- enviada,
- aceptada,
- rechazada,
- convertida en proyecto.

## Pendiente P1 - Integracion futura backend

Todo debe quedar como frontend informativo por ahora. No debe conectar CRM real, pagos, contratos ni base real hasta autorizacion posterior.

## Instruccion para Claude

La proxima version debe incluir estas pantallas o dejar documentado por que no se implementaron. No debe afectar backend ni HR Source.
