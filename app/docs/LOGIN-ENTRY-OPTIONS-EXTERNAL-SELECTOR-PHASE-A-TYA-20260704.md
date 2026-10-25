# Login entry options external selector Phase A TyA

Fecha: 2026-07-04

## Objetivo

Corregir la interpretacion anterior: la pregunta de Paula no era sobre modulos internos visibles despues del login, sino sobre las opciones/botones que aparecen en la pantalla externa de login.

Ejemplos:

- Admin.
- Shopper.
- Cliente / portal cliente.
- Representante.
- Coordinador regional.
- Coordinador local.
- Franquiciado.
- Aliado/socio.

Este bloque no modifica frontend y no activa Auth real.

## Decision

Si es viable. Debe resolverse por configuracion del tenant, no hard-codeado.

Cada tenant debe poder definir que opciones de login aparecen en la pantalla inicial, sin limitar la capacidad global de la plataforma.

Esto es distinto de administrar modulos internos por plan.

## Diferencia clave

### Modulos internos

Son las funcionalidades que se ven despues de entrar:

- shoppers;
- postulaciones;
- visitas;
- portal cliente;
- academia;
- reportes;
- liquidaciones;
- automatizaciones.

Esto ya existe como administracion de modulos/plan.

### Opciones externas de login

Son los botones o entradas antes de iniciar sesion:

- entrar como admin;
- entrar como shopper;
- entrar como cliente;
- entrar como coordinador;
- entrar como representante;
- entrar como franquiciado/aliado.

Esto debe ser configurable por tenant.

## Contrato creado

- `app/contracts/login-entry-options-phase-a.tya.contract.json`

## Tipos de tenant/organizacion

La configuracion del tenant debe permitir que quien contrata el sistema sea, por ejemplo:

- consultora;
- franquicia;
- representante;
- coordinador regional;
- coordinador local;
- aliado;
- socio;
- cliente final con portal;
- operador interno;
- tipo custom.

Un tenant puede tener estructura regional: por ejemplo, una franquicia que coordina un programa regional y delega acceso a coordinadores locales o representantes por pais/region.

## Estados de visibilidad de login

Cada entrada puede estar en:

- `visible_enabled`;
- `hidden`;
- `visible_preview_sales`;
- `visible_requires_invitation`;
- `visible_disabled_message`;
- `disabled_by_plan`.

## Caso TyA inicial

Para TyA se puede iniciar con:

- Admin visible.
- Shopper visible.
- Portal cliente oculto o preview comercial, segun decision de Paula.
- Coordinador/representante/aliado ocultos inicialmente.

Esto no limita que mas adelante se activen.

## Seguridad

Ocultar un boton de login es UX/configuracion comercial. No reemplaza seguridad real.

Cuando se active Auth real, las claims y reglas backend deben validar que el usuario realmente tenga rol/acceso, aunque un boton este visible u oculto.

## Pendientes backend

- Conectar loginEntryOptions con tenant profile.
- Alinear loginEntryOptions con Auth claims.
- Definir preview comercial para portal cliente.
- Definir acceso por region/pais/proyecto cuando aplique.

## Pendientes prototipo

- Login debe leer opciones externas desde configuracion de tenant.
- No mostrar todos los botones para todos los tenants.
- Permitir preview comercial sin abrir modulo funcional real.
- Permitir entradas custom si el modelo del tenant lo requiere.

## Impacto Academia

Academia debe explicar:

- diferencia entre opciones externas de login y modulos internos;
- como configurar entradas de login por tenant;
- como manejar coordinadores/representantes/franquiciados;
- por que ocultar un boton no reemplaza permisos backend.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin Auth real.
- Sin Firestore writes.
- Sin deploy.
- Sin produccion.
