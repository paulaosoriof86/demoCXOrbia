# PHASE A R25A — CX.data portable adapter preconnection

Fecha: 2026-07-14

## Objetivo

Adelantar la conexión backend mientras Firebase DEV sigue bloqueado por IAM y Claude trabaja sobre el prototipo, sin tocar `/app/core`, `/app/modules` ni la candidata frontend.

## Resultado

Se creó un adapter provider-neutral que:

- conserva lecturas síncronas después de una hidratación explícita;
- separa tenant, proyecto y periodo;
- filtra por tenant y alcance país;
- preserva proyectos, periodos, visitas, postulaciones y shoppers;
- mantiene compatibilidad temporal con `_visitas`, `_posts` y `setProject`;
- no usa fixtures como fallback ante error;
- mantiene writes en HOLD por defecto;
- solo llama mutaciones del proveedor cuando el gate se activa expresamente.

## Archivos

- `backend/contracts/cx-data-portable-adapter-v1.json`
- `backend/runtime/cx-data-portable-adapter-v1.mjs`
- `tools/qa/verify-cx-data-portable-adapter-v1.mjs`
- `.github/workflows/cxorbia-phase-a-r25a-cxdata-portable.yml`

## Pruebas

El verificador cubre:

- hidratación source-safe;
- aislamiento de tenant;
- separación proyecto/periodo;
- cambio válido de periodo;
- rechazo de periodo ajeno al proyecto;
- cambio de proyecto con periodo válido;
- filtro país;
- arrays legacy;
- shopper protegido;
- fallo de proveedor sin caída a demo;
- mutaciones bloqueadas antes del gate;
- mutaciones con contexto estable después de un gate explícito.

## Impacto Phase A

Cuando exista el proyecto Firebase nuevo y vacío, el proveedor Firestore deberá implementar únicamente `loadSnapshot(context)` y `mutate(command)`. No será necesario rediseñar la interfaz `CX.data` ni volver a inventariar módulos.

## Seguridad

- Sin cambios frontend.
- Sin conexión Firebase.
- Sin credenciales.
- Sin writes reales.
- Sin import.
- Sin deploy.
- Sin producción.

## Clasificación

- Reusable CXOrbia: adapter provider-neutral, hidratación, aislamiento multi-tenant, fail-closed y write gate.
- Exclusivo TyA/Cinépolis: ninguno dentro del adapter; los mapeos TyA siguen fuera.
- Claude/prototipo: sin tarea nueva; el paquete V114 → V115 ya cubre estados de hidratación, snapshot/runtime y gates honestos.
- Academia: explicar hidratación, snapshot/runtime, error de fuente y write gate por rol.
- Sin impacto Claude: runtime backend, contrato y workflow.
