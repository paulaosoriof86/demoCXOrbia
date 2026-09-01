# PHASE A — CORTE 1 INICIADO

Fecha: 2026-07-20
Estado: `CORTE_1_CONTEXT_HISTORY_REPORTS_GATE_PENDING`

## Baseline de partida

- `ACTIVE_BASELINE`: V161C/R21.
- Corte 0B congelado con aprobación visual de Paula.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.

## Objetivo del Corte 1

Cerrar contexto, HR, histórico, reportes y exportaciones sin modificar la interfaz aprobada ni inferir datos.

## Primer bloque ejecutado

- Contrato creado: `backend/contracts/phase-a-corte1-context-history-reports-v1.json`.
- Gate creado: `tools/qa/tya-corte1-context-history-reports-gate.mjs`.
- Carril canónico R18A/R21 actualizado para:
  - regenerar HR source-safe vigente;
  - aplicar inventario Corte 0B;
  - canonicalizar estados;
  - proyectar reportes por tenant/proyecto/periodo/país;
  - generar exportación source-safe JSON/CSV;
  - validar histórico y separación del periodo activo;
  - bloquear PII, periodos fuera de alcance, duplicados e inferencias de pago.

## Reportes frontend

El módulo `app/modules/cliente-extra.js` todavía responde con toast demo al pulsar PDF/Excel/PPT. El gate lo registra como consumidor frontend pendiente. No se parchea desde backend; cuando el contrato de Corte 1 esté aprobado se documentará el ajuste localizado para Claude.

## Certificaciones y recursos del proyecto

### Certificaciones

- Corte 2: cierre funcional principal.
- Incluye búsqueda certificados/no certificados, certificaciones ya presentadas, elegibilidad, banco por proyecto, solicitud puntual, excepción autorizada, re-certificación, intentos y relación con visitas.
- Corte 6: permisos Auth/RBAC por rol y scope.
- Corte 7: sincronización, evidencias y preservación completa entre HR/plataforma.

### Recursos del proyecto

- Corte 1: catálogo, contexto, origen, vínculo con tenant/proyecto/periodo y disponibilidad histórica sin PII.
- Corte 2: entrega contextual al shopper según proyecto, visita, escenario y certificación.
- Corte 6: permisos de lectura/edición por rol.
- Corte 7: carga real protegida, Storage, evidencias, versionado y sincronización.

Certificaciones y recursos son transversales y se validan visualmente en cada corte donde cambien. No quedan aplazados exclusivamente al final.

## Regla de cierre

Corte 1 no se congela ni permite iniciar Corte 2 hasta completar:

`GATE -> BUILD EXACTO DEV -> REVISIÓN VISUAL PAULA -> APROBACIÓN -> FREEZE CORTE 1`.

Estado seguro: sin deploy nuevo, merge, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
