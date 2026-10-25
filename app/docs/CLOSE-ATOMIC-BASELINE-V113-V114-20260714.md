# CIERRE ATÓMICO DE BASELINE Y AUDITORÍA V113 → V114

Fecha: 2026-07-14

## CAMBIOS-BACKEND — addendum

- Creado `backend/contracts/prototype-baseline-registry-v1.json`.
- Creado `tools/qa/verify-prototype-baseline-atomicity.mjs`.
- Creado `.github/workflows/cxorbia-prototype-baseline-atomicity.yml`.
- Actualizados checkpoint vivo, contrato Phase A y su validador.
- Invariante: candidata aceptada = candidata empalmada = baseline activa.
- V110 permanece como única baseline aceptada/empalmada.
- V113 quedó rechazada, no empalmada.
- Sin cambios en `/app/modules` o `/app/core` del prototipo.
- Sin deploy, producción, writes, imports, Make, Gemini o pagos.

## RESUMEN-PARA-CLAUDE — addendum

V113 sí resolvió:

- almacenamiento separado proyecto/periodo;
- una sola definición de `setProgram()`;
- `project()`/`period()` distintos;
- selector de periodo validante;
- Mi Día y ranking/scoring preservados;
- manifest V113 internamente consistente.

V114 debe corregir únicamente:

1. escrituras directas de estado fuera de `core/data.js`;
2. filtros residuales de periodo y texto Academia;
3. verificador de manifest dinámico y literal.

## PENDIENTES-PROTOTIPO — addendum

Bloqueantes V113:

- `core/router.js`: cinco escrituras directas de `currentPeriodId`.
- `core/store.js`: restauración directa de `currentPeriodId`.
- `modules/cliente.js`: selector directo de `currentPeriodId`.
- `core/shoppers-store.js`: filtro de visita usa `currentProjectId`.
- `modules/finanzas.js`: filtro de visita usa `currentProjectId`.
- `modules/academia.js`: afirma falsamente que ambos IDs son el mismo valor.
- `docs/verify-manifest.mjs`: continúa leyendo `MANIFEST-V111.json`.

## ACADEMIA

Conservar todo V111–V113 salvo la explicación puntual proyecto/periodo.

La lección debe indicar:

- `currentProjectId` identifica proyecto/programa;
- `currentPeriodId` identifica periodo;
- son distintos;
- cambiar proyecto puede seleccionar un periodo válido;
- cambiar periodo no cambia de proyecto;
- los módulos operativos filtran por periodo activo.

## Clasificación

- Reusable CXOrbia: promoción atómica, registro único y manifest dinámico.
- Exclusivo TyA/Cinépolis: sin cambio.
- Claude/prototipo: tres gaps V114.
- Academia: corrección puntual proyecto/periodo.
- Sin impacto Claude: IAM/Firebase/adapters/importadores/gates backend.
