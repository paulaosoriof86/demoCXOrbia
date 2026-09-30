# Frontend pendings addendum - Local readiness runbook

Fecha: 2026-07-05

## Contexto

Backend agrego un runbook local unico de readiness preview. Esto no cambia pendientes frontend ni corrige P0.

## P0 vigente

Frontend/Claude debe corregir textos que prometen acciones reales con gates apagados.

## P1 posterior

Despues del P0, la UI puede mostrar readiness con estados honestos:

- preview ready;
- manual review required;
- blocked prototype pending;
- blocked missing input;
- not production ready.

## Decision

No source lock mientras el P0 frontend siga vivo.
