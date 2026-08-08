# Resumen addendum protected Firestore schema DEV

Fecha: 2026-07-09

## Para Claude/prototipo

Nuevo patron generico que debe reflejarse en la proxima candidata:

- preview publico source-safe;
- perfil completo protegido por Auth/RBAC;
- Firestore protegido separado de payload publico;
- roles configurables por tenant/proyecto;
- certification attempts y carryovers;
- liquidaciones y lotes sin pago real;
- reviewQueue;
- auditEvents de lectura protegida;
- copy honesto cuando Auth/gates esten apagados.

No hardcodear cliente, proyecto, pais, moneda, fuente, periodo, logo ni PWA.

## Para backend

Se agrego contrato/config source-safe para preparar colecciones protegidas:

- shopperPublicRefs;
- shopperProtectedProfiles;
- shopperIdentityLinks;
- certificationAttempts;
- certificationCarryovers;
- protectedLiquidations;
- protectedPaymentBatches;
- protectedReadAudit;
- reviewQueue.

## Para Academia

Agregar explicacion por rol sobre:

- perfil publico vs protegido;
- datos sensibles;
- roles y permisos;
- reviewQueue;
- auditEvents;
- certificaciones preservadas;
- pagos/liquidaciones auditadas sin ejecucion real.

## Estado seguro

No conectado. Sin datos reales. Sin writes. Sin produccion.
