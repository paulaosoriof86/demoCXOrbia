# Phase A TyA — importadores source-safe operativos R4

Fecha: 2026-07-11
Baseline: V103 Phase A R3 empalmada.

## Objetivo operativo

Preparar la carga controlada de dos fuentes separadas que Phase A necesita para operar sin inferencias: movimientos/pagos históricos y de junio, y certificaciones ya presentadas.

El bloque no vuelve a leer HR ni reconstruye shoppers. Usa directamente el índice source-safe ya validado de 616 visitas y 213 shoppers.

## Herramienta

`tools/migration/tya_phase_a_source_safe_import.py`

Acepta JSON, CSV, XLSX y XLSM. Lee HR source-safe, normaliza, excluye campos sensibles, cruza por llaves estables, colapsa duplicados exactos, envía conflictos a `reviewQueue`, crea `auditEvents` y produce envelopes JS sin copiar resultados al runtime ni escribir Firebase/HR.

## Reglas

Pago: match estable, lote, fecha, fuente, actor, moneda/país y monto compatible con honorario + boleto + combo. No nombre, shopper+monto o semejanza visual.

Certificación: match exacto, proyecto, certificación, fecha, fuente, revisor, fecha de revisión, decisión aceptada y auditRef. Un nombre escrito no sirve como llave.

## Validación

- JSON y XLSX: 20 controles PASS, 0 blockers.
- Dry-run sintético contra índice HR real: 616 visitas / 213 shoppers; 1 pago aceptado y 2 en revisión; 1 carryover aceptado y 2 en revisión; reviewQueue 4; auditEvents 6.

Los registros de prueba son sintéticos contra IDs source-safe reales. No representan pagos o certificaciones reales importados.

## Estado de las fuentes reales

No se localizó todavía un archivo limpio utilizable de pagos/movimientos ni de certificaciones presentadas. La búsqueda adicional en File Library falló por error técnico. Estado exacto: `app/docs/SOURCE-SEARCH-STATUS-PAYMENTS-CERTIFICATIONS-R4-20260711.md`.

## Estado seguro

Sin deploy, merge, import real, Firestore/Auth/Storage writes, HR writeback, Make, Gemini, pagos ni producción.
