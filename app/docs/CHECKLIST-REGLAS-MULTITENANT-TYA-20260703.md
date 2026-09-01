# Checklist reglas multi-tenant TyA

Fecha: 2026-07-03

## Objetivo

Preparar validacion de reglas antes de cualquier escritura DEV futura.

## Alcance

- Tenant TyA.
- Proyecto Cinépolis.
- Roles admin, coordinador, cliente y shopper.
- Rutas por tenantId y projectId.

## Checklist

- Toda ruta debe incluir tenantId.
- Todo dato operativo debe incluir projectId.
- Admin TyA no debe ver otros tenants.
- Cliente solo debe ver su proyecto.
- Shopper solo debe ver datos asignados o permitidos.
- Datos privados deben estar en zona restringida.
- Storage debe separar evidencias por tenant/proyecto.
- Make/Gemini no deben recibir datos sensibles sin filtro.

## Validacion pendiente

- Emulador o revision formal de reglas.
- Smoke por rol.
- Smoke por tenant.
- Smoke por proyecto.

## Estado actual

Checklist documental. No ejecuta escrituras ni deploy.
