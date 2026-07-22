# CAMBIOS BACKEND — Inicio Corte 2A y lock M1

Fecha: 2026-07-22  
Estado: `CORTE_2A_STARTED_FRONTEND_DELTA_PENDING`

## Archivos creados

1. `backend/contracts/phase-a-corte2a-shopper-operation-canonical-v1.json`
   - contrato de aceptación de Visitas Admin, Postulaciones, reasignación, exportación, ausencia vs cero y canary;
   - incorpora expresamente el baseline funcional M1 y sus gates obligatorios.

2. `tools/qa/tya-corte1-m1-regression-lock.mjs`
   - gate compuesto para ejecutar los gates R20/contexto/reportes/proyecto-periodo;
   - bloquea regreso a `location.reload()` y ausencia del entrypoint de aplicación in-place/sourceRevision;
   - genera reporte en `.tmp/tya-corte1-m1-regression-lock/`.

3. `tools/qa/tya-corte2a-shopper-operation-canonical-gate.mjs`
   - gate de aceptación específico de Corte 2A;
   - mantiene HOLD mientras Visitas use estado crudo, Postulaciones no tenga exportación/reasignación completa o el bridge convierta ausencias financieras en cero;
   - exige revisión de fuente en exportaciones, copy read-only honesto y tres decisiones explícitas de fecha/franja.

4. `app/docs/PAQUETE-CLAUDE-CORTE2A-CICLO-SHOPPER-OPERACION-CANONICA-20260722.md`
   - paquete frontend localizado para `app/modules/visitas.js`, `app/modules/postulaciones.js` y, solo si es indispensable, preservación de null en el bridge source-safe;
   - prohíbe reinterpretar HR, hardcodear periodos, activar writes o crear rutas paralelas.

5. `app/docs/PROMPT-EJECUCION-CLAUDE-CORTE2A-20260722.md`
   - instrucción única y ejecutable para Claude;
   - define archivos autorizados, baseline congelado, gates requeridos, entregables y método posterior `APPLY_DELTA_DIRECTLY`.

6. `app/docs/CAMBIOS-BACKEND-ADDENDUM-INICIO-CORTE2A-LOCK-M1-20260722.md`.
7. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-INICIO-CORTE2A-20260722.md`.
8. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-INICIO-CORTE2A-20260722.md`.
9. `app/docs/ACADEMIA-IMPACT-INICIO-CORTE2A-LOCK-M1-20260722.md`.

## Archivos vigentes actualizados en este bloque

- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- PR #7.

## Clasificación

- **Reusable CXOrbia:** gate compuesto de regresión, gate de aceptación por corte, facets ortogonales, null distinto de cero, canary y revisión única.
- **Exclusivo cliente:** variantes HR TyA/Cinépolis y conteos usados solo como evidencia de regresión.
- **Claude/prototipo:** delta localizado de Visitas y Postulaciones y prompt exacto de ejecución.
- **Academia:** estados canónicos, reasignación segura, ausencia vs cero, sourceRevision y canary.
- **Sin impacto Claude:** wrapper de gates y evidencia de runtime/fresh.

## Estado seguro

- M1/Corte 1 permanece congelado.
- No se aplicó todavía ningún cambio frontend de Corte 2A.
- El gate Corte 2A está preparado para fallar hasta que el delta frontend satisfaga el contrato; no se declara PASS anticipadamente.
- No merge, producción, HR writes, Firestore/Auth/Storage writes, Make/Gemini ni pagos.
