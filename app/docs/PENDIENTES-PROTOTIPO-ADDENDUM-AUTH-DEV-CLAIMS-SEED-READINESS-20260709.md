# Pendientes prototipo addendum Auth DEV claims seed readiness

Fecha: 2026-07-09

## Pendientes para Claude/prototipo

- Mostrar Auth/RBAC como gate configurable.
- No mostrar Auth como activo si backend no lo esta.
- Mostrar perfiles completos bloqueados hasta acceso.
- Usar fixtures source-safe de roles, nunca emails/passwords reales.
- Diferenciar usuario admin, projectAdmin, financeAdmin, certificationAdmin y shopper.
- Representar scopes: tenant, proyecto, financiero, certificacion y perfil propio.
- Mostrar mensajes honestos: pendiente Auth, requiere acceso, gate apagado.
- No exponer PII en preview publico.

## NO GO

- Si el prototipo trae emails/passwords reales.
- Si simula que Auth ya esta activo sin gate.
- Si permite ver perfil completo sin rol.
- Si mezcla roles antiguos con roles Phase A sin mapeo.
- Si expone datos sensibles en fixtures.
