# Cambios - Phase A real data proof gate TyA

Fecha: 2026-07-09  
Bloque: prueba de datos reales antes de produccion  
Estado: documentado y seguro.

## Archivos creados

1. `tools/contracts/tya-real-data-source-proof-gate.mjs`
   - Gate seguro para detectar si la app sigue usando data demo/generica.
   - No llama providers, no escribe datos, no despliega.
   - Bloquea decision de produccion si no se prueba fuente real.

2. `app/docs/PHASE-A-REAL-DATA-PROOF-GATE-TYA-20260709.md`
   - Documento funcional del gate.
   - Define hallazgo critico, evidencia requerida y cambio de prioridad.

3. `app/docs/CAMBIOS-PHASE-A-REAL-DATA-PROOF-GATE-TYA-20260709.md`
   - Bitacora puntual.

## Impacto

Corrige el posible desvio de avanzar infraestructura sin evidencia de datos reales TyA/Cinepolis.

## Decision

Produccion queda bloqueada hasta probar que los datos reales de TyA se leen o se importan de forma sanitizada y auditable.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin import real.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
