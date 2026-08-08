# Phase A TyA — liquidaciones, pagos y carryover operativos source-safe

Fecha: 2026-07-11  
Baseline: V103 empalmada R3.

## Objetivo real

Evitar que el runtime siga interpretando el estado HR `liquidada` como pago real y preparar el corte de junio y el carryover de certificaciones con fuentes separadas.

## Resultado operacional

### Liquidaciones y pagos

- 572 candidatos de liquidación con llave estable;
- 528 registros hasta mayo con claim documentado de pago completo, pendientes de match con la fuente financiera sanitizada;
- junio: 44 registros, 34 GT y 10 HN;
- junio: 18 Q1, 22 Q2 y 4 con quincena faltante que pasan a conflicto/revisión;
- 40 ítems de junio quedan `pending_financial_source`;
- 4 quedan `conflict`;
- 0 pagos se muestran como confirmados;
- 0 registros pueden entrar a lote sin fuente financiera y monto completo;
- `payVisits()` queda bloqueado en source-safe para no crear movimientos locales ni fechas falsas.

### Montos

- 315 registros tienen honorario, boleto y combo completos;
- 257 tienen al menos un componente faltante y quedan `partial_pending_source`;
- el total conocido se conserva, pero no habilita lote.

### Certificaciones

- 213 shoppers tienen candidato de carryover;
- 0 fuentes sanitizadas de certificación están conectadas;
- 0 shoppers quedan habilitados por inferencia;
- 213 permanecen `pending_source`;
- solo `carried_over` con fuente, revisión humana autenticada y auditRef puede habilitar.

### reviewQueue

En memoria, sin persistir: 572 liquidaciones + 572 pagos + 213 certificaciones = 1,357 candidatos.

## Trabajo previo recuperado

- visitas hasta junio ejecutadas;
- hasta mayo pagado completo como regla documentada;
- junio pendiente de pagos, no de ejecución;
- Q1 parcialmente pendiente y Q2 pendiente;
- honorario separado de boleto y combo;
- certificaciones presentadas no deben pedirse de nuevo;
- revisión humana y llaves estables obligatorias.

## Lo que se descarta

- `liquidada → pagada`;
- usar `realizada` como `paidAt`;
- crear lotes automáticamente;
- marcar pagado desde navegador;
- deduplicar por nombre;
- inferir certificación por visitas o progreso demo.

## Bloqueo actual

Faltan dos fuentes sanitizadas separadas: movimientos/pagos y certificaciones presentadas. El backend ya acepta ambas sin cambiar módulos.

## Estado seguro

Sin deploy, merge, producción, import real, escrituras, proveedores o pagos.
