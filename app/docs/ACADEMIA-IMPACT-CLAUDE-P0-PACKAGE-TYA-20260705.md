# Academia impact - Claude P0 package TyA

Fecha: 2026-07-05

## Objetivo

Documentar que el paquete para Claude prioriza P0 y aplaza Academia profunda hasta que se corrijan los bloqueos visibles.

## Decision

No pedir a Claude ampliar Academia mientras tenga capacidad limitada y el P0 frontend siga vivo.

## Contenido Academia posterior

Cuando el P0 este corregido y auditado, Academia debera cubrir:

- preview vs produccion;
- gates;
- blockers;
- manual review;
- source lock;
- mensajes honestos antes de indicar envio o sincronizacion;
- lectura de matriz de produccion controlada.

## Razon

La salida controlada requiere primero eliminar mensajes que prometen acciones reales sin gates activos. Academia debe acompanar, pero no desplazar ese P0.
