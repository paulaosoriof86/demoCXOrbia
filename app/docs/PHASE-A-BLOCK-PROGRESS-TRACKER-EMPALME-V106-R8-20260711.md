# Tracker Phase A — empalme V106 / R8

## Completado

- V106 auditada como legítima y estructuralmente usable.
- Empalme frontend V106 sobre backend R5 y plan Firestore R6.
- Entrada source-safe regenerada.
- 14 periodos / 616 visitas / 213 shoppers preservados.
- Liquidaciones/carryover/importadores/reviewQueue/materialización R6 preservados.
- Validación estructural y semántica R8 PASS.
- Manifest externo de continuidad verificable.
- Executor Firestore hard-disabled con validación 5/5 PASS y 0 writes.
- Pendientes Claude y Academia profundizados.

## En progreso

- Continuación backend operativa sobre V106/R8.
- Acumulación del próximo paquete Claude.
- Recuperación de exports limpios de pagos y certificaciones.
- Preparación del smoke post-empalme.

## Pendiente Claude

- P0/P1 del addendum V106/R8.
- Academia según contrato profundo.
- Manifest interno y smoke completo.

## Gates

- baseline auditada de continuidad: GO;
- source lock final: HOLD;
- smoke visual post-empalme: HOLD;
- executor preflight: PASS;
- Emulator writes: HOLD;
- dev_clean writes: BLOCKED v1;
- materialización/import/deploy/producción: HOLD;
- Firebase/HR writes: 0.

## Siguiente bloque exacto

1. Mantener executor hard-disabled y preparar evidencia de base realmente nueva/vacía.
2. Recuperar únicamente los exports limpios faltantes.
3. Entregar a Claude el paquete acumulado actualizado cuando recupere capacidad.
4. Auditar/empalmar la siguiente candidata y repetir smoke antes de DEV.
