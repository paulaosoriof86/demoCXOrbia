# Checkpoint — baseline viva empalmada V106 / Phase A R8

Fecha: 2026-07-11

## Decisión

El paquete V105/build interno V106 queda como **baseline auditada de continuidad empalmada**, no source lock final. Backend seguro continúa sobre esta baseline y no sobre V103/V104.

## Empalme realizado localmente

Base backend protegida:

- runtime R5;
- plan Firestore R6;
- executor hard-disabled R8.

Frontend incorporado:

- paquete completo V105/build interno V106, sin editar módulos desde backend.

Se preservaron snapshot HR, adapters, reconciliadores, integridad de periodos/histórico, liquidación/pago/carryover, importadores, reviewQueue/auditEvents, runtime guard, plan Firestore, validadores y workflows.

`index-tya-phase-a-source-safe.html` fue regenerado desde el `index.html` exacto de V106 y los scripts backend protegidos.

## Validación

- frontend V106: 0 diferencias frente al ZIP;
- 0 errores de sintaxis;
- scripts genérico/source-safe completos y sin duplicados;
- 48 registros de módulo únicos, 0 duplicados;
- UTF-8 sin BOM/mojibake;
- 14 periodos, 616 visitas, 213 shoppers;
- 572 liquidaciones; 0 pagos confirmados; 0 certificaciones materializadas;
- validadores de periodos, liquidaciones/certificaciones, importadores y materialización: PASS;
- manifest externo de continuidad R8: PASS;
- manifest interno V106: pendiente Claude.

## Gates

- baseline continuidad: GO;
- source lock final: HOLD;
- smoke visual post-empalme: HOLD;
- materialización/import/deploy/producción: HOLD;
- Firebase/HR writes: 0.
