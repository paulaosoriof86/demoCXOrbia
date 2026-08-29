# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-29  
**STATE_SYNC_EPOCH:** `CXORBIA-20260829-F10-HR-KPI-P1-CONTROL-PLANE-SYNC-11`  
**Estado:** `F10_CONTROL_PLANE_SYNCHRONIZATION_APPLIED__P1_HR_KPI_FRESHNESS_AND_CANONICAL_BRIDGE_OPEN`

## Estado canónico preservado

F8.5=`CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`; F9=`POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY`; Phase A=`100/100`; Production Real Readiness=`100/100` como estado histórico terminal del release certificado.

Release preservado: `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`, functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. El incidente F10 no demuestra drift de módulos ni autoriza restauración global.

## 2026-08-29 — F10 · REPARACIÓN TRANSVERSAL DEL CONTROL PLANE

### Problema demostrado

Había fuentes llamadas `VIGENTE` y mirrors raíz que todavía dirigían a M2/M3/F8 o readiness 69/95. Además, `tools/continuity/validate-cxorbia-state-sync.js` seguía validando expresamente `M2_FINITE_F0_CLOSURE`. Ese desacople podía hacer que una nueva sesión o herramienta reabriera trabajo cerrado y reprodujera el bucle de continuidad.

### Aplicado directamente en la rama viva

1. `backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json`
   - nuevo epoch F10;
   - current step `F10_HR_KPI_FRESHNESS_AND_CONTROL_PLANE_RECONCILIATION`;
   - incidente `F10-HR-KPI-FRESHNESS-20260829-01` registrado como P1 activo;
   - next exacto fijado a reconciliación provider fresh + reparación QA/bridge;
   - hard lock contra self-parity como certificado de frescura.
2. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
   - jerarquía de autoridad actualizada;
   - overlay definido como cursor efectivo;
   - F8.5 preservado como autoridad de versiones/linaje;
   - mirrors históricos impedidos de dirigir ejecución.
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
   - movido del cierre F9 al incidente F10 real.
4. `app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`
   - eliminado el cursor obsoleto M3/readiness 69;
   - F10 y el incidente actual son ahora el único cursor vigente.
5. `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`
   - separa source/version congelada de cursor operativo y frescura de datos;
   - evita diagnosticar un KPI incorrecto como regresión de versión sin probar drift.
6. `app/docs/PENDIENTES-PROTOTIPO.md`
   - registra la reparación transversal y el trabajo F10 restante.
7. `app/docs/RESUMEN-PARA-CLAUDE.md`
   - aclara que no corresponde reconstrucción frontend; solo fixes focales demostrados.

### Pendiente dentro del mismo bloque

- sincronizar `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md` y `PENDIENTES-PROTOTIPO.md` de raíz con sus canónicos de `app/docs`;
- reemplazar la lógica obsoleta de `tools/continuity/validate-cxorbia-state-sync.js` por un validador F10 que lea overlay/incidente y detecte mirrors stale;
- ejecutar readback source-only de ese validador;
- después pasar inmediatamente a provider `fresh=1` fila a fila.

## Incidente F10 HR/KPI — permanece abierto

El run `33257681796` queda degradado a `INTERNAL_SNAPSHOT_SELF_CONSISTENCY_ONLY` para frescura. La prueba comparó KPIs y summary del mismo snapshot; no demostró Google Sheets en el mismo instante.

Causas demostradas:

1. QA self-parity;
2. stale-while-revalidate del runtime HR, donde solo `fresh=1` fuerza espera;
3. pérdida semántica canónica entre R20 y CX.data/KPIs, especialmente `submitted → liquidationCandidate` separado de liquidación/pago confirmado.

No se hardcodearon cifras ni se adjudicó sin evidencia el delta de cuestionarios/realizadas.

## Clasificación obligatoria

- **Reusable CXOrbia:** cursor efectivo único + detección de mirrors stale + separación `module lineage / live data authority / control-plane state`.
- **Exclusivo cliente:** incidente TyA/Cinépolis y discrepancias temporales de agosto 2026.
- **Claude/prototipo:** fixes focales únicamente en bridge/data/dashboard/periodos/historico después de demostrar el delta.
- **Academia:** sin cambio funcional todavía; actualizar solo si cambia semántica visible.
- **Sin impacto Claude:** overlay, índice, checkpoint, execution state, source lock, mirrors y validator de continuidad.

## Seguridad

Provider/business/Auth/Firestore/HR/Storage/Rules/payment writes=0; Make/Gemini=0; deploy/rebuild/reimport/merge=0; nueva rama/PR/workflow=0; legacy DB access=false.

## Siguiente bloque exacto

`F10_FORCE_FRESH_PROVIDER_ROW_LEVEL_RECONCILIATION_THEN_FIX_QA_FRESHNESS_AND_CANONICAL_KPI_BRIDGE_BEFORE_OWNER_VISUAL_ACCEPTANCE` después de cerrar readback del control plane.
