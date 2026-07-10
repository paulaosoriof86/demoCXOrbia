# Pendientes prototipo addendum protected Firestore schema DEV

Fecha: 2026-07-09

## Pendientes para la proxima candidata Claude

Claude debe incorporar de forma generica:

1. Estado visual `perfil protegido` para shoppers completos.
2. Mensaje honesto cuando Auth/RBAC no este activo.
3. Preview publico con datos source-safe solamente.
4. Roles configurables por tenant/proyecto.
5. Estado de certificaciones preservadas o pendientes.
6. Estado de liquidaciones y lotes sin pago real.
7. Indicadores de reviewQueue.
8. Indicadores de auditEvents.
9. No mostrar PII en preview publico.
10. No hardcodear cliente, proyecto, pais, periodo, fuente, moneda, logo ni PWA.

## Criterio GO

GO solo si el prototipo muestra que el full profile requiere acceso protegido y no simula que la URL publica ya puede mostrar datos completos.

## Criterio NO GO

NO GO si el prototipo:

- muestra nombre/contacto real en preview publico;
- promete Auth real activo sin gate;
- mezcla datos protegidos con source-safe;
- oculta que certificaciones/liquidaciones requieren revision/auditoria;
- hardcodea comportamiento de un cliente real.
