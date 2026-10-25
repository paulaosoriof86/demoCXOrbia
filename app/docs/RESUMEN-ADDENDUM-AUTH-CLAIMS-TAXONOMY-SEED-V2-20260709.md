# Resumen addendum Auth claims taxonomy seed v2

Fecha: 2026-07-09

## Para Claude/prototipo

El prototipo debe separar persona operativa, rol tecnico y scope.

No basta con `admin/shopper`. Deben existir configuraciones para:

- dueno/administrador tenant;
- franquicia/franquiciado;
- representante pais/territorio;
- coordinacion operativa;
- coordinacion por proyecto;
- representante de campo;
- finanzas;
- certificaciones;
- cliente/marca evaluada admin;
- cliente/marca evaluada viewer;
- shopper/evaluador.

## Comportamiento esperado

- UI de permisos debe permitir persona + scope.
- Claims deben representarse como gate/config, no como Auth activo.
- Los datos completos siguen bloqueados hasta Auth/RBAC.
- No hardcodear organizacion especifica de un tenant real.

## Estado

Backend preparo contrato, config y validador. No hay Auth real ni writes.
