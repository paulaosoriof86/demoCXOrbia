# Client CRM, OneDrive documents and pipeline Phase A TyA

Fecha: 2026-07-04

## Objetivo

Incorporar la trazabilidad de clientes/prospectos/proyectos, carpetas compartidas de OneDrive, documentos externos, propuestas, hojas de costos, hojas de ruta y pipeline comercial/operativo.

Este bloque no conecta OneDrive real, no descarga documentos y no escribe Storage/Firestore.

## Contrato creado

- `app/contracts/client-crm-drive-documents-phase-a.tya.contract.json`

## Decision

La plataforma debe soportar varios niveles de relacion:

1. Tenant/empresa que usa CXOrbia.
2. Consultora/franquicia/representante/aliado que opera o contrata.
3. Cliente final o prospecto.
4. Proyecto delegado internacional o cliente local facturado directamente.
5. Oportunidad/pipeline/propuesta.
6. Carpeta externa compartida, como OneDrive.
7. Documentos vinculados: propuestas, hojas de costos, hojas de ruta, briefs, instructivos, requisitos.
8. Comunicaciones asociadas por email, WhatsApp, notificaciones o notas.

## OneDrive compartido

Para el caso TyA, existe una carpeta compartida de OneDrive donde pueden estar:

- hojas de ruta;
- propuestas;
- informacion de clientes;
- hojas de costos;
- documentos de proyectos;
- otros recursos.

La plataforma debe poder guardar la URL de la carpeta como referencia externa asociada a:

- TyA como consultora/partner;
- un cliente final/prospecto;
- un proyecto;
- una oportunidad de pipeline;
- un documento especifico.

## Documentos

Debe poder registrarse trazabilidad de documentos como:

- hoja de ruta;
- propuesta;
- hoja de costos;
- brief de proyecto;
- requisitos del cliente;
- contrato/acuerdo;
- instructivo;
- fuente de cuestionario;
- recurso de evidencia;
- adjunto de correo;
- otro.

Inicialmente puede quedar como link externo/metadata. Descargar o copiar documentos requiere autorizacion posterior y politica de privacidad.

## CRM / pipeline

Los clientes/prospectos deben conservar historial aunque el prospecto quede pausado.

Estados sugeridos:

- lead identificado;
- prospecto contactado;
- discovery/necesidades;
- propuesta en proceso;
- propuesta enviada;
- negociacion;
- ganado / configuracion de proyecto;
- perdido o pausado;
- cliente activo;
- dormido / reactivar futuro.

## Trazabilidad integrada

La ficha de cliente/prospecto/proyecto debe poder ver, segun permisos:

- pipeline;
- documentos vinculados;
- carpetas externas;
- correos vinculados;
- WhatsApp/notificaciones vinculadas;
- notas internas;
- proyectos relacionados;
- hojas de ruta;
- propuestas y costos;
- historial de cambios.

## Relacion con email

Si se habla con un cliente o prospecto por correo, ese correo debe poder quedar vinculado a:

- cliente;
- oportunidad;
- proyecto;
- propuesta;
- soporte;
- pago;
- capacitacion;
- gestion general.

Esto es por usuario/cuenta de correo cuando se active integracion real o por log manual mientras no exista integracion.

## Pendientes backend

- Definir schema final de CRM client/prospect/opportunity.
- Preparar externalFolderRef para OneDrive.
- Definir politica de permisos por rol.
- Preparar documentTraceLinks.
- Integrar emailTraceLinks y notification outbox con CRM.
- Preparar futuro connector OneDrive/SharePoint sin activarlo.

## Pendientes prototipo

- Ficha cliente/prospecto con carpeta OneDrive externa.
- Pipeline comercial/operativo.
- Documentos vinculados.
- Trazabilidad de correos y notificaciones.
- Diferenciar cliente final, proyecto delegado, cliente local y consultora/partner.
- Permitir descargar/ver documentos solo cuando exista politica y permiso.

## Impacto Academia

Academia debe explicar:

- diferencia entre TyA como consultora/partner y cliente final/proyecto;
- como crear o revisar un cliente/prospecto;
- como usar pipeline;
- como vincular carpeta OneDrive;
- como vincular documentos;
- como asociar correos y notificaciones a la ficha;
- como recuperar informacion si un prospecto se retoma en el futuro.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin OneDrive API real.
- Sin descarga de documentos.
- Sin Storage real.
- Sin Firestore writes.
- Sin deploy.
- Sin produccion.
