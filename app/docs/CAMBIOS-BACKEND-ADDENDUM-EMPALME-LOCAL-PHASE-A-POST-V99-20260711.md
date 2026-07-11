# CAMBIOS BACKEND — addendum empalme local + Phase A post-V99

Fecha: 2026-07-11

## Baseline autorizada

La candidata incremental `Prototype development request (1).zip` fue aceptada por Paula como baseline viva local.

SHA-256: `e3b2bbf9b7823e2c0c0a60459b0d86f96917b3ee1ff5d8ca181161de94d7e5b3`.

Frente a V99: 12 archivos modificados, 0 agregados, 0 eliminados y 91 idénticos.

## Trabajo backend realizado

Se preparó un runtime local empalmado y una entrada Phase A aislada:

- `index-tya-phase-a-source-safe.html`;
- `data/tya-hr-source-safe-periods.js`;
- `core/tya-phase-a-source-safe-preview.js`;
- `core/tya-phase-a-data-source-reconcile.js`;
- validadores estructurales y semánticos.

El adapter:

- reemplaza el dataset demo antes de cargar módulos;
- crea 14 IDs de periodo únicos `cinepolis-YYYY-MM`;
- enlaza cada visita con su periodo correcto;
- conserva `program/externalProjectId` como proyecto base configurable;
- normaliza fechas Excel válidas a ISO;
- no inventa fechas ambiguas: las deja `null` y marca revisión;
- alinea `CX.dataSource`, `CX_BACKEND_DEV` y `cx_imported` para el preview TyA;
- mantiene `imported=false`, `production=false` y `sourceSafe=true`.

## Validación real

- 14 periodos únicos;
- 616 visitas únicas;
- 213 shoppers protegidos;
- GT 476 / HN 140;
- liquidada 400;
- cuestionario 142;
- realizada 31;
- agendada 36;
- fuera de rango 7;
- cero IDs demo en el contrato hidratado;
- cero campos PII detectados;
- cero enlaces visita-periodo inválidos;
- 68 JavaScript con 0 errores sintácticos;
- 0 scripts faltantes o duplicados en ambos entry points;
- UTF-8 sin BOM.

## Estado seguro

El runtime empalmado y validado permanece como artefacto local descargable. La rama GitHub no recibió un reemplazo parcial de runtime: se mantiene lógica y verificablemente segura. No hubo merge, deploy, producción, imports, writes, Auth, reglas, Make, Gemini ni pagos.