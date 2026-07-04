# Claude accumulated pending while V78 continues

Fecha: 2026-07-04

## Uso

Este documento acumula pendientes, mejoras y hallazgos para el proximo paquete Claude, mientras se sigue trabajando sobre V78 y Claude no tiene capacidad para procesar el paquete anterior.

## Pendientes acumulados actuales

### Phase A aprobada

- HR completa.
- Import historico.
- Ciclo shopper/admin.
- Multi-proyecto.
- Certificaciones conservadas.
- Cuestionario configurable.
- Make/Gemini dentro del alcance con gates.

### Revisión y submitido

- Agregar revision funcional como etapa real despues de cuestionario realizado.
- Registrar estado de revision.
- Registrar fecha de revision.
- Permitir que la revision habilite submitido externo o liquidacion.
- Submitido no debe ser accion universal de CXOrbia.
- Submitido puede venir desde HR.
- Cada proyecto define quien revisa y quien submitira/cerrara.

### Proyecto y fuentes

- Wizard de creacion debe incluir configuracion Phase A completa.
- Proyecto debe configurar HR source, origen, URL/sourceRef seguro y mapa.
- Proyecto debe configurar origen de cuestionario: interno, plataforma externa, link general o link por visita desde HR.
- No hardcodear plataformas externas como opcion general del SaaS.

### Contactos

- Configurar contactos por tipo de gestion: evidencias, cuestionario, soporte, reprogramacion/cancelacion, pagos y coordinacion.
- Al marcar visita realizada, mostrar cuestionario y contacto de evidencias.

### Notificaciones

- Plantillas por evento.
- Modos: off, in-app, WhatsApp Web plantilla/manual, WhatsApp API, Make.
- Green API evaluable pero no dependencia unica.
- No reenviar comunicaciones historicas automaticamente.
- No decir enviado/sincronizado/en vivo si no hay proveedor real confirmado.

### V79 no adoptada

- V79 queda auditada pero no adoptada.
- Conservar hallazgos V79 como pendientes para Claude.
- No usar V79 como source lock hasta que se corrija y Paula lo apruebe.

## Proximo paquete Claude

Cuando Paula lo pida, el paquete debe incluir:

- Este documento.
- Auditoria V79.
- Pendientes V79.
- Phase A aprobada.
- Contratos backend creados despues del paquete anterior.
- Cambios y mejoras directas documentadas durante continuidad sobre V78.

## Estado

- Documento acumulativo creado.
- Sin cambios frontend.
- Sin deploy.
