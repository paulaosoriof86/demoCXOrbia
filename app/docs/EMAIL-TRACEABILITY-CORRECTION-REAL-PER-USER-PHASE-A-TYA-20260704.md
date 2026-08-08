# Email traceability correction - Real per-user email Phase A TyA

Fecha: 2026-07-04

## Aclaracion importante

Cuando el documento anterior indico que no quedaba autorizado leer/enviar correos reales, no significaba que la plataforma final no deba tener correo real.

Significa solamente que ese bloque documental no activo OAuth, Gmail, Outlook, IMAP/SMTP, lectura real ni envio real en este PR/etapa segura.

La regla corregida es:

- El correo debe ser real y funcional cuando se autorice la integracion.
- Debe configurarse por usuario, no solo por tenant/equipo.
- Al crear un usuario debe poder definirse si tendra correo vinculado desde el inicio o no.
- Cada usuario debe poder usar su correo como correo normal dentro de las capacidades autorizadas.
- La trazabilidad debe asociar correos a gestiones, clientes, proyectos, shoppers, postulaciones, visitas, soporte, pagos, propuestas y Academia cuando aplique.

## Modelo corregido

El correo tiene dos niveles:

### Configuracion tenant

Define politicas generales:

- proveedor permitido;
- dominio permitido;
- reglas de privacidad;
- almacenamiento permitido;
- integraciones habilitadas;
- permisos por rol.

### Configuracion usuario

Define cuenta individual:

- userId;
- emailAddress;
- provider;
- connectionStatus;
- canSend;
- canRead;
- canLogManual;
- defaultSignature;
- relatedRole;
- privacyScope.

## Creacion de usuario

Al crear un usuario, la plataforma debe permitir:

- crear con correo vinculado;
- crear sin correo vinculado;
- invitar a vincular correo despues;
- permitir solo log manual;
- restringir lectura/envio segun rol y politica;
- registrar estado de conexion.

## Correo real futuro

Cuando se autorice la integracion, el correo debe poder:

- leer hilos permitidos;
- enviar correos;
- crear borradores;
- responder;
- asociar correos a entidades;
- registrar trazabilidad;
- preservar permisos y privacidad;
- mostrar historico relacionado en la ficha correspondiente.

## TyA

Aunque TyA use poco correo para operaciones de shoppers, correo es importante para:

- comercial;
- clientes/prospectos;
- propuestas;
- informacion de proyectos;
- soporte;
- seguimiento interno;
- trazabilidad de comunicaciones con shoppers cuando se use email.

## Seguridad

Activar correo real requiere bloque futuro con:

- proveedor elegido;
- OAuth/IMAP/SMTP;
- reglas de permisos;
- politica de almacenamiento;
- privacidad;
- pruebas DEV;
- autorizacion explicita.

## Estado seguro

Este documento corrige la interpretacion y prepara el modelo. No conecta correo real en este bloque.
