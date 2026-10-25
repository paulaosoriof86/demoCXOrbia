# RESUMEN PARA CLAUDE — IMPACTO R18A

Fecha: 2026-07-14

## Estado de Claude

Paula ya envió el paquete focalizado V110 → V111. No se amplía ese paquete mientras Claude trabaja.

## Qué resolvió backend en paralelo

Backend integró, en una ruta build-only y sin tocar módulos UI:

- fechas externas normalizadas a ISO;
- fechas ambiguas a `reviewQueue`;
- estados operativo/cuestionario/submitido/liquidación/pago separados;
- submitido no equivale a liquidado/pagado;
- metadata de snapshot frente a runtime;
- shoppers source-safe como referencia protegida sin atributos inventados.

## Qué debe preservar V111

Las tres tareas del paquete enviado siguen siendo las únicas P0 de Claude:

1. proyecto/periodo canónico y sincronizado en todos los módulos;
2. login, marca y alcance país/multipaís desde configuración;
3. referencia shopper protegida frente a perfil autorizado.

## Contrato de datos que V111 podrá consumir

La salida R18A expone:

- `CX.data.currentRootProjectId`;
- `CX.data.currentPeriodId`;
- `CX.data.setCurrentPeriod(id)`;
- evento `cx:period-changed`;
- `canonicalState`;
- `operationalState`;
- `questionnaireState`;
- `submissionState`;
- `liquidationState`;
- `paymentState`;
- `sourceSnapshotAt`;
- `sourceReadMode`;
- `runtimeSyncActive`;
- `dataLevel=protected_reference` para shoppers protegidos.

El adapter mantiene `currentProjectId` como alias temporal de periodo para compatibilidad V110. Claude debe retirar esa dependencia conceptual en V111, no romperla antes del empalme.

## No pedir a Claude

- normalizadores;
- parsers HR;
- estados backend;
- reconciliación shopper;
- conciliación financiera;
- importadores;
- Firebase/Auth/Storage;
- Make/Gemini;
- datos TyA;
- workflows/gates.

## Validación posterior a V111

La candidata será comparada contra:

1. V110 exacta;
2. el paquete V110 → V111 enviado;
3. el contrato R18A;
4. pruebas positivas y negativas de periodo, login/alcance y shoppers protegidos.

No se aceptarán afirmaciones sin reproducción funcional.
