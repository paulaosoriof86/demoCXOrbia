# Validación — control Phase A de pago y certificación

Fecha: 2026-07-11

Validador: `tools/contracts/validate-phase-a-payment-certification-control.mjs`.

## Resultado local

`ok: true` — 6/6 casos aprobados.

### Pago

- visita liquidada + pago pendiente: válido y no pagado;
- pago confirmado con lote/fecha/fuente/actor/auditRef: válido y pagado;
- fecha de realización usada como fecha de pago: rechazada.

### Certificación

- evidencia presente pendiente de revisión: válida y no habilita;
- carryover revisado con actor/auditRef: válido y habilita;
- `approved_preview` usado como elegibilidad real: rechazado.

## Seguridad

- cero writes;
- cero proveedores;
- cero producción;
- cero PII;
- fixture source-safe y referencias opacas.

## Impacto

El contrato queda listo para conectarse más adelante al adapter/backend nuevo. No corrige por parche los módulos V103: esos pendientes permanecen en Claude/prototipo.
