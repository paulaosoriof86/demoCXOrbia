# Phase A TyA — importadores source-safe operativos R4

Fecha: 2026-07-11  
Baseline: V103 Phase A R3 empalmada.

## Objetivo operativo

Preparar la carga controlada de dos fuentes separadas que Phase A necesita para operar sin inferencias:

1. movimientos/pagos históricos y de junio;
2. certificaciones ya presentadas.

El bloque no vuelve a leer HR ni reconstruye shoppers. Usa directamente el índice source-safe ya validado de 616 visitas y 213 shoppers.

## Herramienta

`tools/migration/tya_phase_a_source_safe_import.py`

Acepta JSON, CSV, XLSX y XLSM. En una sola ejecución:

- lee la HR source-safe;
- normaliza columnas y fechas;
- excluye campos sensibles;
- cruza pagos por `visitId`, `paymentItemId` o `hrRowId`;
- cruza certificaciones por `shopperId` o `shopperCode`;
- colapsa duplicados idénticos;
- envía conflictos a `reviewQueue`;
- crea `auditEvents` sin valores privados;
- produce los dos envelopes JS que el runtime R3 ya sabe consumir;
- no copia automáticamente los resultados al runtime;
- no escribe Firebase/HR ni ejecuta pagos.

## Reglas de pagos

Un pago solo queda aceptado en dry-run cuando tiene match estable con la visita, lote, fecha, fuente, actor confirmador, moneda/país coherentes y monto compatible con honorario + boleto + combo. No se acepta match por nombre, shopper + monto o semejanza visual.

## Reglas de certificación

Un carryover solo queda aceptado en dry-run cuando tiene match exacto de shopper, proyecto, certificación, fecha presentada, fuente, revisor, fecha de revisión, decisión aceptada y auditRef. Un nombre escrito no sirve como llave.

## Validación

- JSON y XLSX: 20 controles PASS, 0 blockers.
- Dry-run sintético contra índice HR real: 616 visitas / 213 shoppers; 1 pago aceptado y 2 en revisión; 1 carryover aceptado y 2 en revisión; reviewQueue 4; auditEvents 6.

Los registros de prueba son sintéticos contra IDs source-safe reales. No representan pagos o certificaciones reales importados.

## Estado seguro

Sin deploy, merge, import real, Firestore/Auth/Storage writes, HR writeback, Make, Gemini, pagos ni producción.
