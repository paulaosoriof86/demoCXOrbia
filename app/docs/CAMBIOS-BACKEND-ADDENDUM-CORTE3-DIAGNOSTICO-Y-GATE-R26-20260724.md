# CAMBIOS BACKEND — Corte 3 diagnóstico y gate R26

**Fecha:** 2026-07-24  
**Estado:** `ROOT_CAUSE_DIAGNOSED_CORRECTION_PACKAGE_READY_P0_HOLD`

## Qué se hizo

- Se inspeccionaron directamente los archivos funcionales asociados a los P0:
  - `app/modules/finanzas.js`;
  - `app/core/finanzas-core.js`;
  - `app/modules/beneficios.js`;
  - `app/app.js`;
  - gate remoto R25.
- Se cerró la causa raíz de los siete P0 y los P1 vinculados.
- Se creó un paquete focalizado para Claude/prototipo.
- Se agregó un gate fuente fail-closed R26 para impedir que una candidata quede GO mientras conserve los patrones demostrados.
- Se corrigió la desalineación del plan Phase A canónico, que todavía mostraba V159/Corte 0B y el método obsoleto de composite previo.
- Se actualizó el checkpoint vigente.

## Archivos creados

- `tools/qa/tya-corte3-p0-source-contract-r26-gate.mjs`.
- `app/docs/CORTE3-DIAGNOSTICO-CAUSA-RAIZ-Y-CORRECCION-FOCALIZADA-20260724.md`.
- `app/docs/PAQUETE-CLAUDE-CORTE3-CORRECCION-FOCALIZADA-20260724.md`.
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-CORTE3-DIAGNOSTICO-Y-GATE-R26-20260724.md`.

## Archivos modificados

- `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
- PR #7, título/cuerpo.

## Archivos funcionales no modificados

- `app/modules/**`.
- `app/core/**`.
- `app/app.js`.
- `app/index.html`.
- adapters/snapshots HR y financieros.
- Firestore/Auth/Storage/Rules.

La corrección frontend permanece asignada a Claude mediante paquete localizado, conforme a la separación backend/prototipo.

## Diagnóstico resumido

1. Movimientos y Beneficios usan la moneda del primer país para agregados de varias monedas.
2. `honPaga` contiene honorarios devengados/por pagar y se presenta como pagado.
3. Reembolsos aplica una inferencia fija del 85 % sin fuente.
4. Finanzas usa periodos del store local y no el contexto canónico.
5. R25 validó la especificación del reporte, no archivos descargados.
6. Las revisiones fail-closed no tienen bandeja visible.
7. Shopper fue inyectado por el gate y no seleccionado desde el flujo DEV visible.

## Impacto Phase A

- Corte 3 permanece HOLD, pero la causa raíz ya está cerrada.
- No se reabren V174, M1, Corte 1 ni Corte 2A.
- La siguiente candidata tiene alcance exacto y un gate previo reproducible.
- Corte 4 permanece bloqueado hasta freeze de Corte 3.

## Clasificación

- **Reusable CXOrbia:** gate multimoneda/pago/review/export/rol y contrato de corrección.
- **Exclusivo cliente:** cifras y dos revisiones TyA de mayo.
- **Claude/prototipo:** cambios funcionales descritos en el paquete.
- **Academia:** actualizar conceptos de moneda, pago, revisión, exportación y acceso por rol.
- **Sin impacto Claude:** reconciliación de plan/checkpoint y gate R26.

## Seguridad

Sin producción, merge, Hosting nuevo, Cloud Run deploy, Firestore/Auth/Storage/HR writes, imports, pagos, lotes, Make ni Gemini live.

## Siguiente bloque

Recibir la candidata correctiva de Claude sobre V174, confirmar el carril y ejecutar auditoría delta + R26 antes de cualquier aplicación.
