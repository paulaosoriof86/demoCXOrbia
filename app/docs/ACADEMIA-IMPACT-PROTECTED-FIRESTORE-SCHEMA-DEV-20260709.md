# Academia impact protected Firestore schema DEV

Fecha: 2026-07-09

## Objetivo academico

Academia debe explicar como la plataforma separa preview publico source-safe de datos protegidos por Auth/RBAC.

## Contenido requerido

### Conceptos

- Perfil publico vs perfil protegido.
- Source-safe.
- Datos sensibles.
- Auth/RBAC.
- Roles por tenant/proyecto.
- ReviewQueue.
- AuditEvents.
- Certification carryover.
- Liquidaciones y pagos auditados sin ejecucion real.

### Por rol

- Administrador tenant: configura roles, revisa auditoria y conflictos.
- Administrador proyecto: revisa perfiles acotados al proyecto, visitas y certificaciones.
- Finanzas: ve liquidaciones/lotes sin banco crudo.
- Certificaciones: ve intentos y carryovers.
- Shopper: ve solo su propio perfil y beneficios.

### Checklists

- Antes de activar Auth DEV.
- Antes de permitir lectura protegida.
- Antes de importar perfiles.
- Antes de marcar pago auditado.
- Antes de exponer cualquier dato en preview.

## Mensajes recomendados

- `Vista protegida pendiente de Auth`.
- `Perfil completo requiere rol autorizado`.
- `Datos source-safe para preview publico`.
- `Pago preparado/auditado; no ejecucion bancaria desde preview`.
- `Conflicto enviado a reviewQueue`.

## Estado

Pendiente para Claude/prototipo y Academia. Backend deja contrato listo sin activacion.
