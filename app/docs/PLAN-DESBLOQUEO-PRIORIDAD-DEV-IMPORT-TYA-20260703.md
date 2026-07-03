# Plan de desbloqueo por prioridad DEV import TyA

Fecha: 2026-07-03

## Objetivo

Ordenar el trabajo pendiente antes de una futura escritura DEV autorizada. Este plan no ejecuta escrituras ni importacion.

## Seguridad actual

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- canImport=false.
- executeAllowed=false.

## P0 - Seguridad de datos

- Definir politica de datos sensibles de shoppers.
- Definir si ciertos campos se excluyen, se cifran o se guardan en una zona privada restringida.
- Revisar textos historicos con problemas de codificacion y decidir si se reparan o se excluyen del primer import.

## P1 - Consistencia de fuentes

- Resolver duplicidad entre fuentes de cuestionario/postulacion.
- Mantener notificaciones antiguas como historial hasta resolver destinatarios.
- Revisar excepcion de HN junio antes de importar.

## P2 - Finanzas

- Mantener liquidaciones como candidatas.
- Cruzar con fuente financiera autorizada antes de marcarlas como finales.

## P3 - Preparacion tecnica

- Checklist de reglas multi-tenant.
- Plan de rollback.
- Runner DEV futuro separado, con autorizacion explicita y dry-run por defecto.

## Orden recomendado

1. Politica de datos sensibles.
2. Codificacion historica.
3. Duplicados operativos.
4. Notificaciones historicas.
5. Excepcion HN junio.
6. Cruce financiero.
7. Reglas multi-tenant.
8. Rollback.
9. Runner DEV futuro.
10. Autorizacion final de Paula.

## Puede avanzar sin Paula

- Propuesta tecnica de datos sensibles.
- Reglas de deduplicacion.
- Checklist multi-tenant.
- Plan de rollback sin escritura.

## Requiere Paula

- Decision sobre datos sensibles.
- Decision sobre historicos afectados.
- Confirmacion de excepcion HN junio.
- Fuente financiera autorizada.
- Autorizacion de cualquier escritura futura.
