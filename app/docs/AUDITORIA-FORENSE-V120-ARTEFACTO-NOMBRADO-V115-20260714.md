# AUDITORÍA FORENSE — ARTEFACTO NOMBRADO V115 / IDENTIDAD INTERNA V120

Fecha: 2026-07-14

## Decisión

El ZIP recibido como `Prototype development request CXOrbia V115.zip` declara internamente V120 en `core/build-lock.js` y contiene los cortes V114–V120.

No se empalma ni reemplaza la baseline activa.

## Verificación independiente

- SHA-256 ZIP recibido: `87c3acecda37f56c300f0444e7f2ed4601201cb9a0e4b28a1eaece8008cfbfc2`.
- 66 JavaScript: `node --check` PASS.
- Manifest vigente: `docs/MANIFEST-V120.json`.
- Archivos verificados: 159.
- Aggregate: `828ccc0fa96eb892fd0cb471c3587f19c8e69b4bdd13bf92c85fda8274384c90`.
- Diferencias: 0.
- `index.html`: scripts existentes y únicos; sin módulos huérfanos.
- Cero escrituras directas de `currentProjectId/currentPeriodId` fuera de `core/data.js`.
- Cero filtros `projectId===currentProjectId`.

## Avance real preservado

- proyecto/periodo corregidos;
- manifest dinámico;
- CRM fixtures solo en demo;
- `CX.data.ctx()` creado;
- `CX.dataSource.sourceContract()` creado;
- `CX.data.visitContract(v)` creado;
- importador separa accepted/duplicates/conflicts/discarded;
- conflictos HR vs existente visibles y retenidos.

## Gaps comprobados

1. Identidad externa V115 frente a source lock interno V120.
2. `CX.data.ctx()` no tiene consumidores de producto.
3. `sourceContract()` no tiene consumidores.
4. `visitContract(v)` no tiene consumidores.
5. Faltan vistas dry-run separadas para pagos, certificaciones y documentos.
6. CRM/documentos/configuración tenant no tienen cierre completo comprobado.
7. Academia conserva el texto falso `currentProjectId/currentPeriodId, el mismo valor`.
8. La evidencia V114/V115 afirmó que ese texto no existía, pero la inspección directa lo confirmó.
9. OLA 3 no está cerrada como cobertura transversal comprobada, aunque el CRUD de Academia ya contiene acciones importantes y no debe reconstruirse.

## Paquete residual

Preparado: `PAQUETE-CLAUDE-CXORBIA-V120-A-V121-RESIDUAL-COMPLETO-20260714.zip`.

El paquete separa trabajo cerrado de pendientes residuales y evita pedir nuevamente manifest, setters, Mi Día, ranking, CRM fixture gate o importador 1/1/1/1.

## Seguridad

- Sin empalme.
- Sin cambios frontend locales.
- Sin deploy/producción.
- Sin writes/imports.
- Sin Firebase/Auth/Storage/Make/Gemini/pagos.

## Clasificación

- Reusable CXOrbia: contexto/fuente/visita como contratos consumibles, import dry-run y gate de identidad de artefacto.
- Exclusivo TyA/Cinépolis: no incluido en el paquete.
- Claude/prototipo: pendientes residuales V120→V121.
- Academia: corregir texto puntual y cerrar cobertura transversal sin rehacer CRUD existente.
- Sin impacto Claude: R25A, Firebase IAM, providers y producción.
