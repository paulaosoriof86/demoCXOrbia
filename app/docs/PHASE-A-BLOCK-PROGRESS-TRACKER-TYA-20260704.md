# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-24  
**Estado:** `CORTE3_P0_PROVEN_VISUAL_HOLD_NO_FREEZE`

## 1. Estado general

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Baseline activa: V174.
- Hosting DEV: publicado.
- Sin deploy productivo, merge, producción, import real, Firestore/Auth/Storage/HR writes, Cloud Run deploy, Make/Gemini live ni pagos.

## 2. Cortes cerrados

### V174 / M1 / Corte 1 / Corte 2A

- PASS técnico y visual aprobado.
- 14 periodos, junio 2025–julio 2026.
- 616 visitas.
- 44 visitas por periodo: 34 GT y 10 HN.
- Proyecto y periodo separados.
- Ciclo Shopper y operación preservados.
- Gate R24 confirma 0 drift funcional prohibido.

No reabrir sin evidencia reproducible.

## 3. Corte activo — Corte 3 Finanzas

### Verdad canónica preservada

- 247 filas financieras;
- 209 vínculos exactos;
- 207 montos listos;
- 38 filas sin vínculo exacto;
- 79 revisiones de vínculo;
- 2 revisiones de monto;
- 37 evidencias candidatas;
- 0 pagos;
- 0 lotes.

### Hosting y smoke técnico

- Hosting DEV publicado.
- Smoke remoto live R25: PASS técnico.
- Mayo 2026: 44 visitas, 42 exactas, 2 revisiones fail-closed, 32 GT y 10 HN exactas.

### Validación visual de Paula — HOLD

P0 comprobados:

1. suma GTQ/HNL rotulada como Q;
2. honorarios mostrados como pagados con 0 pagos confirmados;
3. conciliación de reembolsos inferida sin fuente;
4. selector financiero solo julio, desacoplado de 14 periodos;
5. PDF vacío/incorrecto y Excel no generado;
6. dos revisiones no visibles ni localizables;
7. Shopper Beneficios no validable con identidad real.

P1 comprobados:

- responsive insuficiente;
- tablas y modales cortados;
- exportación habilitada con 0 filas;
- copy IA/Gemini no honesto;
- Dashboard y Movimientos/Tesorería ambiguos;
- topbar y breadcrumbs truncados.

## 4. Hallazgo metodológico

El gate R25 comprobó DOM, spec de reporte y una sesión Shopper controlada, pero no descargó los archivos reales, no validó una identidad Shopper visible y no ejecutó un recorrido móvil humano completo. El PASS técnico no sustituyó la validación visual.

## 5. Decisión

- Corte 3 no aprobado.
- Freeze prohibido.
- Corte 4 no inicia.
- Los P0 no pueden degradarse a pendientes cosméticos.

## 6. Claude/prototipo

Paquete focalizado creado en `RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE3-VISUAL-HOLD-20260724.md`, con archivos, reglas y validación esperada.

## 7. Academia

Pendiente actualizar monedas, liquidación/pago, revisión financiera, selector de periodo, exportación y rutas Admin/Shopper después de la corrección aprobada.

## 8. Siguiente bloque exacto

`DIAGNÓSTICO DE CAUSA RAÍZ POR HALLAZGO → PAQUETE FOCALIZADO PARA CLAUDE/PROTOTIPO + AJUSTE DE GATES → CANDIDATA AUDITADA → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN MÓVIL REAL → APROBADO → FREEZE CORTE 3`.

## 9. Regla de cierre

Cada bloque debe indicar qué se hizo, avance Phase A, preservación, documentación Claude/Academia, pendiente real, siguiente bloque, estado seguro y bloqueo comprobado o ausencia de bloqueo.
