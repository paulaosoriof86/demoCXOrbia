# CAMBIOS BACKEND — liquidaciones/pagos/certificaciones R3

## Archivos runtime nuevos

- `data/tya-financial-control-source-safe.js`;
- `data/tya-certification-carryover-source-safe.js`;
- `core/tya-phase-a-liquidation-certification-integrity.js`;
- `tools/validation/validate-phase-a-liquidation-certification-integrity.mjs`.

## Punto de conexión

Se actualizó solo la entrada local backend `index-tya-phase-a-source-safe.html` para cargar los envelopes y el adapter después de `core/liquidacion.js`.

## Contratos/config/validator

- `backend/contracts/phase-a-liquidation-payment-source-safe-projection-v1.json`;
- `backend/contracts/phase-a-certification-carryover-source-safe-projection-v1.json`;
- `backend/config/phase-a-liquidation-certification-projection-summary.source-safe.json`;
- `tools/release/tya-phase-a-liquidation-certification-source-safe-validate.mjs`.

## Resultado

- 572 liquidaciones source-safe;
- 0 pagos confirmados sin fuente financiera;
- pago local bloqueado;
- 213 carryovers pendientes de fuente;
- 0 elegibilidad inventada;
- 1,357 candidatos reviewQueue en memoria.

No se modificaron módulos UI ni `index.html` genérico.
