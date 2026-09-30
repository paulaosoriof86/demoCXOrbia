# CAMBIOS BACKEND — ADDENDUM FAMILIA A: CONTRATO Y PRECEDENCIA

**Fecha:** 2026-08-02  
**Estado:** `SOURCE_ONLY_DOCUMENTED__NO_FUNCTIONAL_CHANGE__NO_DEPLOY`

## Archivos creados

### `app/docs/RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-CONTRATO-Y-PRECEDENCIA-20260802.md`

Define:

- interfaz pública mínima de `CX.data`;
- identidad canónica de tenant/proyecto/periodo;
- precedencia de HR, read model, semántica, Auth, Firestore y Finanzas;
- clasificación de adapters y overlays;
- tratamiento de build-lock y service worker;
- gates antes del Checkpoint Visual 1 A+B;
- siguiente bloque exacto.

## Archivos inspeccionados

- `app/core/config.js`;
- `app/core/data.js`;
- `app/core/store.js`;
- `app/core/router.js`;
- `app/core/backend-firebase.js`;
- `app/core/backend-cxdata-read-guard.js`;
- `app/core/backend-cxdata-readonly-corte4.js`;
- `app/core/backend-protected-dev-mode.js`;
- `app/core/backend-protected-dev-session-continuity.js`;
- `app/core/build-lock.js`;
- `app/sw.js`;
- `app/app.js`;
- `app/adapters/tya-cumulative-read-model-v2.js`;
- `app/adapters/tya-canonical-state-semantics-v2.js`;
- `app/adapters/tya-c6-domain-consistency-bridge.js`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js`;
- `app/adapters/tya-project-financial-model-contract-v1.js`;
- `app/adapters/tya-live-source-inplace-apply.js`.

## Hallazgos

1. `CX.data` mantiene una interfaz extensa consumida directamente por los módulos; un adapter no puede reemplazarla parcialmente.
2. La marca/tenant local de `config.js` puede divergir de `tenantId=tya`; en runtime conectado debe prevalecer la llave técnica autenticada.
3. Proyecto y Periodo están separados en `data.js`, pero normalizadores/adapters posteriores pueden volver a mezclarlos si no existe un gate.
4. Hay varias definiciones de estados/KPIs en `data.js`, read guard, read model, canonical semantics y domain bridge.
5. `backend-cxdata-readonly-corte4.js` conserva carriles anteriores de backend vacío/source-safe; en el runtime humano autenticado solo debe bloquear writes.
6. `tya-c6-domain-consistency-bridge.js` y el unified runtime corrigen superficies visibles mediante overlays; esa lógica no puede quedar como única autoridad final.
7. `sw.js` usa `CX_BUILD_ID`; el build-lock V174 obsoleto mantiene riesgo de identidad/caché hasta el ensamblaje final.

## Decisiones

- HR viva gobierna periodos, visitas y estado operacional.
- Firestore solo enriquece por llaves exactas.
- Read model + canonical semantics son la autoridad de estados/facetas.
- Tenant `tya`, proyecto `cinepolis` y periodo `cinepolis-YYYY-MM` permanecen separados.
- Read/write guards no cambian la verdad canónica.
- Los bridges DOM deben migrar su lógica a fuentes canónicas o retirarse como autoridad.
- No se edita código funcional hasta definir el delta acumulativo A+B.

## Impacto por clasificación

- **Reusable CXOrbia:** interfaz estable y precedencia de fuentes.
- **Exclusivo cliente:** configuración `tya::cinepolis` y HR.
- **Claude/prototipo:** preservar shell; no consolidar parches visuales desde backend.
- **Academia:** alinear acceso, fuente, proyecto/periodo y estados.
- **Sin impacto Claude:** build-lock, SW, caché y gates.

## Estado seguro

- cambios funcionales: 0;
- deploy: 0;
- provider writes: 0;
- merge: false;
- producción: false.