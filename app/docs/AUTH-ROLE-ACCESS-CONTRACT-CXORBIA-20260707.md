# Auth role access contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para Auth, roles y accesos CXOrbia.

Archivo creado:

- `tools/contracts/cxorbia-auth-role-access-contract.mjs`

## Objetivo

Preparar Auth real sin activarlo y sin escribir usuarios reales.

El contrato define roles, permisos y rutas permitidas para que la futura conexion Auth preserve multi-tenant, proyecto y experiencia por rol.

## Roles base

- `superadmin`
- `admin`
- `ops`
- `finance`
- `academy_admin`
- `shopper`
- `client`
- `technical_reviewer`

## Permisos base

- gestion de tenant;
- gestion de proyecto;
- lectura y escritura de visitas;
- revision de asignaciones;
- revision de postulaciones;
- lectura de shoppers;
- lectura y revision de beneficios/liquidaciones;
- lectura y escritura Academia;
- revision de integraciones;
- lectura de auditoria.

## Rutas cubiertas

- `dashboard`
- `projects`
- `visits`
- `applications`
- `settlements`
- `academy`
- `integrations`
- `audit`

## Reglas clave

- Auth real queda apagado hasta gate y autorizacion.
- Cada rol debe tener permisos explicitos.
- Cada ruta debe declarar roles permitidos.
- Shopper no debe ver configuracion global.
- Finance puede revisar liquidaciones sin administrar todo el proyecto.
- Academia tiene rol propio para edicion y revision de contenido.
- Technical reviewer puede revisar integraciones sin operar visitas.

## Relacion con Phase A

Este contrato prepara:

- acceso admin;
- acceso shopper;
- acceso finanzas;
- acceso Academia;
- acceso a integraciones en modo revision;
- auditoria por rol.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para todos los clientes porque define roles, permisos y rutas de forma configurable.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

No cambia UI, pero Claude debe mantener rutas por rol, badges/estados y mensajes coherentes con permisos.

### Academia

Impacta Academia porque define rol `academy_admin` y acceso por rol al contenido.

### Sin impacto Claude

No hay cambio visual directo.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports, sin lectura de secrets y sin datos sensibles.
