# Frontend pendings addendum - Claude P0 package

Fecha: 2026-07-05

## Contexto

Se preparo el paquete para Claude cuando recupere capacidad. El objetivo es evitar que reinicie metodologia o use su capacidad en temas posteriores al P0.

## Prioridad unica para Claude

Corregir P0 de honestidad operativa:

- mensajes que prometen envio real;
- mensajes que prometen sincronizacion real;
- textos de movimiento automatico de liquidaciones;
- `cuestionario enviado` cuando corresponde realizado/completado pendiente revision.

## Reglas

- No redisenar.
- No reescribir modulos.
- No tocar backend.
- No tocar contratos.
- No tocar tools.
- No ampliar Academia antes del P0.
- Entregar candidata con delta real.

## Auditoria posterior obligatoria

Toda candidata nueva debe auditarse antes de empalmar. Si no hay delta real, se clasifica como `no_real_delta`.
