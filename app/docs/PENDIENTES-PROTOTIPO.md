# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-29  
**STATE_SYNC_EPOCH:** `CXORBIA-20260829-F10-HR-KPI-P1-CONTROL-PLANE-SYNC-11`  
**Estado:** `PHASE_A_100__F10_CONTROL_PLANE_SYNCHRONIZED__P1_HR_KPI_FRESHNESS_AND_CANONICAL_BRIDGE_OPEN`

## Cerrado / no reprocesar

M1, M2/F0, M3, F3, F4, F5, F6 y F8 permanecen terminales. F7=`GO_WITH_WARNINGS_NO_P0`; F8.5 y F9 permanecen cerrados. Release=`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`; Phase A=`100/100`; Production Real Readiness=`100/100` como estado histórico terminal del release aceptado.

No restaurar V182 completo, no crear nueva candidata/rama/PR/workflow por rutina y no reabrir gates terminales sin P0 reproducible.

## Reparación transversal de continuidad — aplicada

Se corrigió la desincronización de control plane que podía devolver futuras sesiones a M2/M3/F8:

- `backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json` quedó como cursor efectivo F10 y registra el incidente activo;
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`, `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`, `EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md` y `SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md` quedaron alineados al mismo epoch;
- cualquier mirror/validator que todavía indique M2/M3/F8 o readiness 69/95 como estado actual queda clasificado como stale y no puede dirigir trabajo nuevo;
- F8.5 sigue siendo la autoridad de linaje/versiones aprobadas. El defecto actual no demuestra una versión vieja servida.

Pendiente de cerrar en este bloque: sincronizar mirrors raíz y sustituir el validador genérico obsoleto por validación del overlay/incidente actual.

## P1 activo — HR/KPIs

Incidente: `F10-HR-KPI-FRESHNESS-20260829-01`.

Estado: `OPEN_P1_PRODUCT_READ_MODEL_AND_QA_MECHANISM`; P0 de producto=`false`.

El run `33257681796` probó autenticación/navegación Admin+Shopper y consistencia interna del snapshot, pero no una lectura independiente de Google Sheets en el mismo instante. Self-parity no vuelve a aceptarse como certificado de frescura.

Discrepancias observadas respecto del snapshot de la app siguen siendo evidencia temporal, nunca seeds ni constantes: realizadas, pendientes de realizar, cuestionario pendiente y candidato a liquidación requieren reconciliación fila a fila.

## Pendientes exactos F10

1. Finalizar sincronización de mirrors/validator del control plane y ejecutar readback source-only.
2. Ejecutar provider read-only **forzado** (`fresh=1`) capturando `revision` y `sourceReadAt`.
3. Reconciliar agosto GT/HN fila a fila y calcular los estados canónicos fuera de `CX.data`.
4. Comparar Dashboard y cada módulo dependiente contra esa misma revisión, no contra su propio snapshot.
5. Adjudicar las diferencias entre cache obsoleto y mapping/semántica.
6. Corregir focalmente el QA para impedir self-parity falsa.
7. Corregir el bridge canónico para preservar `submitted`, `canonicalFacets` y `liquidationCandidate`, manteniendo separados candidato, liquidación confirmada y pago confirmado.
8. Revalidar Dashboard, HR Source, Periodos, Histórico, Visitas, Postulaciones, Reservas/Asignación, Shoppers, Finanzas/Liquidaciones y superficies Shopper contra una sola revisión fresca.
9. Recertificar login humano Shopper por credencial existente.
10. Resolver Cliente/Cliente 360 como frente separado; no mezclar su HOLD con HR.
11. Mantener P1 `Cinépolis JUN` para corrección frontend focal sin hardcodear meses.
12. Actualizar Academia/manuales solo si cambia una definición visible de estado/KPI.

## Frontend / Claude

Archivos focales ya demostrados: `app/core/tya-phase-a-source-safe-preview.js`, `app/core/data.js`, `app/modules/dashboard.js`, `app/modules/periodos.js`, `app/modules/historico.js`. No reescribir el frontend completo ni tocar módulos no involucrados.

## Producción operativa

No hay P0 destructivo demostrado y el release congelado se preserva. La plataforma puede seguir accesible, pero la aceptación de exactitud operacional dinámica de los KPIs HR permanece retenida hasta cerrar la reconciliación fresca.

## Seguridad

Provider/data/Auth/Firestore/HR/Storage/Rules/payment writes=0; Make/Gemini=0; deploy/rebuild/reimport/merge=0; legacy DB prohibida.

**NEXT:** `F10_FORCE_FRESH_PROVIDER_ROW_LEVEL_RECONCILIATION_THEN_FIX_QA_FRESHNESS_AND_CANONICAL_KPI_BRIDGE_BEFORE_OWNER_VISUAL_ACCEPTANCE`.
