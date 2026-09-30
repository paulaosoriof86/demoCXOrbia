# COMPARACIÓN DE SHAS PHASE A — BLOQUE 3 V182/CORTE 3 Y C6

**Fecha:** 2026-08-03  
**Estado:** `PASS_V182_FROZEN_LINEAGE_RECOVERED__3_EXACT__2_LATER_C6_RECONCILIATIONS_PRESERVED`

## 1. Fuente V182

Paquete entregado por Paula:

`Prototype development request CXOrbia V182.zip`

SHA-256 del ZIP:

`9954d46191bf15631866e6a8a085cabae1373d18ca14571f89e33eef2dfb5abc`.

Manifest interno:

- package: `CANDIDATA_V182_CORTE3_20260725`;
- tipo: `CANDIDATA_INCREMENTAL`;
- baseline: V181 sobre V174 viva;
- delta: cinco archivos;
- gates: R26 28/28, R27 14/14, R28 18/18, R29 12/12, R30 12/12, R31 27/27, R32 amended 25/25 y node-check 4/4.

El paquete declara expresamente que V182 corrige dos P0 de scope en Finanzas sin revertir avances V181 y sin tocar backend, adapters, HR, `CX.data`, Firebase, Make, Gemini, pagos o importadores.

## 2. Git blobs reconstruidos desde los bytes del ZIP

| Archivo | Blob V182 | Blob vivo | Resultado | Decisión |
|---|---|---|---|---|
| `app/app.js` | `d509d08bd20dd2e44fa414e0b4d2819dd18f7c36` | `d509d08bd20dd2e44fa414e0b4d2819dd18f7c36` | EXACTO | `PRESERVAR_V182_FROZEN` |
| `app/modules/beneficios.js` | `73e200e57530479637792c89c644fcfdf78b6799` | `73e200e57530479637792c89c644fcfdf78b6799` | EXACTO | `PRESERVAR_V182_FROZEN` |
| `app/styles/layout.css` | `2cea8372cad099cb4610b93744824e4596b04adc` | `2cea8372cad099cb4610b93744824e4596b04adc` | EXACTO | `PRESERVAR_V182_FROZEN` |
| `app/core/finanzas-core.js` | `ca1811366180eedbc910f2fbf8cfb2a75a242997` | `6d3f46f003f3319f96cfd759b8b5ed52afc6a125` | DIFERENTE POSTERIOR | `PRESERVAR_C6_ROOT_FIX__NO_RESTORE_V182` |
| `app/modules/finanzas.js` | `42a3394065fcf8853450d29fba4c90e6ded397be` | `623fab9ba1e06c39f83beda610bb771e23910a07` | DIFERENTE POSTERIOR | `PRESERVAR_C6_ROOT_FIX__NO_RESTORE_V182` |

## 3. Razón de las dos diferencias financieras

Las diferencias de `finanzas-core.js` y `finanzas.js` no son pérdida acumulativa demostrada.

Después de V182 se aplicaron fixes C6 para:

- materializar el modelo financiero por `tenantId::projectId` antes de normalizar;
- mantener Cinépolis como delegado;
- `localBilling=false`;
- regalía 0;
- Q60 GT/L200 HN;
- 14 periodos/proyectos delegados;
- cero violaciones;
- no usar honorario Shopper como ingreso;
- no inventar splits, regalías, impuestos, pagos o lotes.

El source lock C6 desplegado `b908daa8...` contiene exactamente los blobs vivos actuales de ambos archivos y pasó diagnóstico remoto financiero.

Restaurar V182 en esos dos archivos revertiría fixes posteriores demostrados. Queda prohibido.

## 4. Dictamen acumulativo Corte 3

### Preservar exactos V182

- `app/app.js`;
- `app/modules/beneficios.js`;
- `app/styles/layout.css`.

### Preservar reconciliación posterior C6

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`.

### No permitido

- restaurar el paquete V182 completo de forma ciega;
- reemplazar los dos archivos financieros actuales por los bytes del ZIP;
- considerar la diferencia de SHA como regresión sin revisar el linaje posterior;
- abrir nueva candidata o repetir Corte 3.

## 5. P1/P2 preservados

El paquete y la validación posterior no convierten en P0:

- PDF sin todas las gráficas;
- Excel sin el formato visual definitivo;
- mejoras de branding/exportación.

Se mantienen como pendientes de Reportes, sin bloquear la recuperación de la composición Phase A.

## 6. Avance de clasificación

Con los bloques 1–3 quedan probados:

- ocho blobs M1/Corte 2A exactos;
- trece blobs actuales exactos respecto del source lock C6 desplegado;
- tres blobs V182 exactos;
- dos diferencias V182 justificadas y protegidas por fixes C6 posteriores.

No se ha encontrado todavía ningún archivo Phase A que requiera restauración por pérdida de SHA.

## 7. Pendiente siguiente

Recuperar y comparar el linaje de:

- `visita-detalle.js`;
- `revision-admin.js`;
- `documentos.js`;
- `costos.js`;
- `cliente-data.js`;
- Reportes Admin/Cliente/Shopper y report kit;
- overlays y orden de carga transversal.

## 8. Estado seguro

- archivos funcionales modificados: 0;
- deploy: 0;
- provider writes: 0;
- merge: false;
- producción: intacta.
