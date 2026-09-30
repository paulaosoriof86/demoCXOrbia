# Phase A approved - salida operativa controlada TyA

Fecha: 2026-07-04

## Decision aprobada

Paula aprueba Phase A como salida operativa controlada TyA, con:

- HR completa.
- Import historico.
- Ciclo shopper/admin.
- Multi-proyecto.
- Certificaciones conservadas.
- Cuestionario configurable.
- Make/Gemini dentro del alcance con gates.

## Aclaracion de submitido

Submitido aparece con fechas desde HR.

En la mayoria de proyectos TyA no se realiza desde CXOrbia porque TyA o el cliente/proveedor externo hace el submitido. Por eso la creacion/configuracion de proyecto debe preguntar:

- quien revisa cuestionario/evidencias;
- quien submitira o cerrara el cuestionario;
- si CXOrbia solo monitorea submitido desde HR;
- si fecha submitido viene desde HR;
- si la liquidacion depende de revision, submitido o cuestionario.

## Revision como punto de control

La revision se agrega al flujo como etapa util para el prototipo:

- revisar cuestionario;
- revisar evidencias;
- marcar fecha de revision;
- escribir fecha de revision en HR cuando Make/backend este conectado;
- habilitar siguiente paso: revision consultora, submit externo o liquidacion segun configuracion.

## Flujo shopper/admin aprobado

- Shopper ingresa.
- Lee documentos.
- Se certifica si aplica.
- Si ya certifico, no repite.
- Ve visitas disponibles.
- Se postula.
- Admin gestiona postulacion.
- Al aprobar, Make actualiza HR cuando el gate este activo.
- Shopper agenda, reprograma, cancela o marca realizada segun estado.
- Al marcar realizada se guarda fecha y se activa cuestionario.
- Cuestionario puede estar en CXOrbia, plataforma externa, link general o link por visita desde HR.
- Si es interno, se detecta automaticamente.
- Si es externo, el shopper abre link y marca cuestionario realizado.
- Se activa revision si aplica.
- Liquidacion se habilita segun reglas del proyecto.

## Contactos y evidencias

Cada proyecto debe configurar contactos por tipo de gestion:

- evidencias;
- cuestionario;
- soporte operativo;
- reprogramacion/cancelacion;
- pagos/liquidaciones;
- coordinacion general.

Al marcar visita realizada debe mostrarse acceso a cuestionario y contacto de evidencias por WhatsApp segun configuracion.

## Notificaciones y WhatsApp

Los recordatorios deben soportar modos:

- Make;
- WhatsApp API;
- WhatsApp Web plantilla/manual;
- in-app;
- apagado.

Green API puede evaluarse, pero no debe ser dependencia unica. Si falla, debe existir alternativa WhatsApp Web o API WA alternativa.

## Estado

- Phase A aprobada y documentada.
- Pendientes Claude deben actualizarse.
- Sin cambios frontend en este documento.
- Sin deploy ejecutado.
