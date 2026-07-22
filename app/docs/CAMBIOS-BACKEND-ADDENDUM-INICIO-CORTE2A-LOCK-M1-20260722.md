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

3. `app/docs/PAQUETE-CLAUDE-CORTE2A-CICLO-SHOPPER-OPERACION-CANONICA-20260722.md`
   - paquete frontend localizado para `app/modules/visitas.js`, `app/modules/postulaciones.js` y, solo si es indispensable, preservación de null en el bridge source-safe;
   - prohíbe reinterpretar HR, hardcodear periodos, activar writes o crear rutas paralelas.

4. `app/docs/CAMBIOS-BACKEND-ADDENDUM-INICIO-CORTE2A-LOCK-M1-20260722.md`.
5. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-INICIO-CORTE2A-20260722.md`.
6. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-INICIO-CORTE2A-20260722.md`.
7. `app/docs/ACADEMIA-IMPACT-INICIO-CORTE2A-LOCK-M1-20260722.md`.

## Archivos vigentes a reemplazar/actualizar en este bloque

- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- PR #7.

## Clasificación

- **Reusable CXOrbia:** gate compuesto de regresión, facets ortogonales, null distinto de cero, canary y revisión única.
- **Exclusivo cliente:** variantes HR TyA/Cinépolis y conteos usados solo como evidencia de regresión.
- **Claude/prototipo:** delta localizado de Visitas y Postulaciones.
- **Academia:** estados canónicos, reasignación segura, ausencia vs cero, sourceRevision y canary.
- **Sin impacto Claude:** wrapper de gates y evidencia de runtime/fresh.

## Estado seguro

- M1/Corte 1 permanece congelado.
- No se aplicó todavía ningún cambio frontend de Corte 2A.
- No merge, producción, HR writes, Firestore/Auth/Storage writes, Make/Gemini ni pagos.
