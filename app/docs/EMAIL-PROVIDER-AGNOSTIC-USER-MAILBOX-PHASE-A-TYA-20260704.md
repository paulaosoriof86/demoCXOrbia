# Email provider-agnostic user mailbox Phase A TyA

Fecha: 2026-07-04

## Objetivo

Corregir y complementar el modelo de correo: debe poder configurarse con cualquier proveedor y por usuario.

El correo puede ser:

- asignado directamente por TyA;
- creado por nosotros/CXOrbia en una fase futura;
- correo personal del usuario;
- correo corporativo de la consultora;
- alias por rol;
- placeholder/ficticio sin envio real;
- contacto manual sin cuenta conectada.

Este bloque no conecta proveedores reales ni envia/lee correos. Define el modelo para soportarlo correctamente.

## Contrato creado

- `app/contracts/email-provider-agnostic-user-mailbox-phase-a.tya.contract.json`

## Decision

El correo no debe depender de un solo proveedor.

Debe soportar:

- Gmail / Google Workspace;
- Microsoft 365 / Outlook;
- IMAP/SMTP generico;
- SMTP custom;
- API custom futura;
- log manual;
- proveedor desconocido a configurar.

## Configuracion por usuario

La unidad operativa no es solo el tenant. Es el usuario.

Cada usuario puede tener una o mas cuentas/correos con:

- emailAddress;
- ownership type;
- proveedor;
- estado de conexion;
- permisos de leer;
- permisos de enviar;
- permisos de crear borrador;
- permisos de log manual;
- alcance de privacidad;
- firma predeterminada;
- trazabilidad asociada.

## Estados

- `not_configured`
- `manual_only`
- `placeholder_no_send`
- `connection_requested`
- `oauth_pending_future`
- `smtp_config_pending_future`
- `connected_future`
- `connection_error_future`
- `revoked`
- `disabled`

## Reglas

- El proveedor debe seleccionarse por usuario.
- El tenant puede definir politicas permitidas, pero cada usuario conserva su configuracion individual.
- Un correo ficticio/placeholder no debe enviar ni recibir correos reales.
- Un contacto manual puede servir para trazabilidad antes de conectar proveedor.
- Cualquier integracion real requiere autorizacion y configuracion segura.
- Las comunicaciones deben poder vincularse a clientes, shoppers, proyectos, visitas, pagos, soporte, capacitacion o gestiones.

## Seguridad

- No guardar secretos en repo.
- No guardar tokens OAuth en texto plano.
- No leer/enviar correos hasta aprobar integracion.
- No exponer correo personal de un usuario a otros sin permiso.
- No tratar placeholder como correo entregable.

## Impacto Academia

Academia debe explicar:

- crear usuario con o sin correo;
- diferencia entre correo personal, asignado, alias o placeholder;
- proveedor agnostico;
- log manual vs correo conectado;
- privacidad y permisos.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin correo real conectado.
- Sin lectura de correos.
- Sin envio de correos.
- Sin OAuth real.
- Sin Firestore writes.
- Sin deploy.
- Sin produccion.
