# Tenant profile and module entitlements Phase A TyA

Fecha: 2026-07-04

## Objetivo

Responder y documentar dos puntos clave:

1. Si es viable mostrar/ocultar opciones de login y modulos por cliente/tenant.
2. Donde se configura la informacion completa del cliente de CXOrbia, es decir, la empresa consultora/tenant que usa la plataforma, diferente de los clientes finales que esa consultora administra.

Este bloque no modifica frontend y no activa runtime.

## Respuesta tecnica

Si es viable y no deberia ser dificil si se resuelve por configuracion, no por codigo duro.

La plataforma debe tener:

- perfil del tenant/empresa consultora;
- branding;
- plan;
- modulos habilitados;
- roles habilitados;
- feature flags;
- opciones visibles en login segun tenant, rol y plan.

Ocultar modulos en UI ayuda a orden y estrategia comercial, pero no reemplaza seguridad. Luego Auth claims y reglas backend deben proteger acceso real.

## Diferencia clave

Hay dos conceptos distintos:

### Tenant / cliente de CXOrbia

Es la empresa que contrata/usa CXOrbia, por ejemplo TyA.

Debe tener perfil propio:

- razon social;
- nombre comercial;
- pais;
- moneda;
- zona horaria;
- contactos;
- logo;
- colores;
- plan;
- modulos habilitados;
- permisos;
- facturacion;
- soporte;
- estado.

### Clientes finales de la consultora

Son los clientes que TyA u otra consultora administra dentro de su tenant, por ejemplo Cinépolis u otros proyectos/clientes.

Estos pertenecen al modulo de clientes/proyectos de la consultora.

## Contrato creado

- `app/contracts/tenant-profile-module-entitlements-phase-a.tya.contract.json`

Define rutas futuras:

- `tenants/{tenantId}/profile/main`
- `tenants/{tenantId}/settings/branding`
- `tenants/{tenantId}/settings/plan`
- `tenants/{tenantId}/settings/moduleEntitlements`
- `tenants/{tenantId}/settings/roleEntitlements`
- `tenants/{tenantId}/settings/featureFlags`
- `tenants/{tenantId}/clients/{clientId}`

## Modulos y visibilidad

Por defecto, los modulos pueden estar disponibles segun plan, pero cada tenant debe poder habilitar, ocultar o dejar como preview comercial.

Estados sugeridos:

- `enabled`
- `hidden`
- `preview_sales`
- `disabled_by_plan`
- `coming_soon`
- `requires_upgrade`

## Caso TyA inicial

Para TyA, operativamente se puede iniciar con:

- dashboard;
- shoppers;
- postulaciones;
- visitas;
- proyectos;
- HR Source;
- certificaciones;
- Academia;
- liquidaciones;
- pagos.

Y dejar como preview comercial si Paula lo decide:

- portal cliente;
- reportes avanzados;
- automatizaciones;
- paquetes comerciales.

Esto permite vender valor futuro sin saturar el login ni el menu.

## Reglas para login

El login o selector de entrada debe mostrar solo opciones habilitadas para:

- tenant;
- plan;
- rol;
- permisos del usuario;
- feature flags.

Si un modulo esta oculto, no debe aparecer como accion disponible.

Si esta como preview comercial, puede aparecer como tarjeta o teaser si el tenant lo permite, pero no como modulo funcional real.

## Pendientes backend

- Crear schema final de tenant profile.
- Conectar moduleEntitlements con Auth claims y permisos.
- Mapear menu/login a configuracion del tenant cuando frontend lo implemente.
- Definir como se administran previews comerciales.

## Pendientes prototipo

- SaaS Console debe permitir editar informacion completa del tenant.
- Configuracion del cliente/tenant debe separar empresa consultora de clientes finales.
- Login/menu debe leer modulos habilitados y roles disponibles.
- Portal cliente puede quedar oculto, enabled o preview_sales por tenant.

## Impacto Academia

Academia debe explicar:

- diferencia entre tenant/empresa consultora y clientes finales;
- como configurar modulos habilitados;
- como funcionan previews comerciales;
- como se controla el login por rol;
- por que ocultar UI no reemplaza permisos reales.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin Firestore writes.
- Sin Auth real.
- Sin deploy.
- Sin produccion.
