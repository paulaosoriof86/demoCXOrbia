# CAMBIOS BACKEND — ADDENDUM V159 VISUAL NO APROBADO

Fecha: 2026-07-18

## Cambio registrado

- Se registró decisión de Paula: `NO_APROBADO / HOLD_VISUAL_SEMANTIC_P0_PROVEN`.
- Se preserva V159 empalmada y Hosting DEV como evidencia, pero no se congela como `ACTIVE_BASELINE`.
- Se localizó causa raíz en múltiples derivaciones del ciclo de visita: `visitBucketFns` canónico convive con filtros directos en Dashboard y Liquidaciones.
- Se clasificó como responsabilidad backend corregir mapping HR, motor canónico de estados, reconciliación de KPI/fases/listados/Finanzas y contrato tenant/login/roles.
- Se clasificó como responsabilidad Claude renderizar el contrato sin recalcular negocio, selectores por rol, visibilidad configurable del login y Academia/manuales.
- Se agregó metodología `PRE-EMPALME_COMPOSITE_VISUAL_GATE` para candidatas que toquen módulos críticos Phase A, autorizada por Paula ante P0 reproducible.

## Archivo principal

- `app/docs/VALIDACION-VISUAL-V159-NO-APROBADO-20260718.md`

## Phase A

- Corte 0 no se cierra.
- Se agrega Corte 0B: motor canónico de estados + configuración tenant/login.
- No se reinician empalme, auditoría estructural, HR canonical, adapters, importadores ni contratos ya preparados.

## Clasificación

- Reusable CXOrbia: estado canónico, tenant/login configurable, proyectos activos, gate visual pre-empalme.
- Exclusivo TyA: mapping HR y verdad mayo/junio/julio.
- Claude/prototipo: consumo/render del contrato, selectores, login y Academia.
- Academia: manuales documentales profundos y rutas por rol.
- Sin impacto Claude: gates y validadores.

## Estado seguro

Sin merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
