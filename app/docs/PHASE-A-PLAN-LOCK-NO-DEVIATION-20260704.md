# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-25  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `V174_ACTIVE_BASELINE_V181_AUDITED_P0_PROVEN_HOLD_V182_REQUIRED`

## 1. Objetivo

Operar TyA/Cinépolis como proyecto configurable con HR/histórico, shoppers, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización, sobre base nueva sin conectar/copiar la base vieja.

## 2. Secuencia por corte

`FUENTE → MAPPING/ADAPTER → GATES → BUILD → VALIDACIÓN VISUAL → CORRECCIÓN FOCALIZADA → FREEZE`

Un PASS técnico sin validación real no congela un corte.

## 3. Carril de candidatas

`EXECUTION_LANE_READY → AUDITORÍA DELTA → P0_PROVEN o GO → si GO APPLY_DELTA_DIRECTLY → COMMIT/PUSH → POST-GATES → HOSTING DEV → VALIDACIÓN → FREEZE`

No se sustituye por nueva rama/PR, workflow, PowerShell, incoming, composite ni acción manual de Paula.

## 4. Cortes cerrados

V174/M1/Corte 1/Corte 2A: **FROZEN/APROBADO**.

- source lock `d057d77c9117d9d451cfc9a6563083b78b926d57`;
- 14 periodos y 616 visitas;
- HR, adapters y `CX.data` preservados.

## 5. Corte activo — Corte 3 Finanzas

Estado: `V181_P0_PROVEN_HOLD_V182_REQUIRED`.

### Verdad canónica

- 247 filas;
- 209 vínculos;
- 207 montos;
- 0 pagos;
- 0 lotes;
- mayo: 44 visitas, 42 exactas, 2 revisiones, 32 GT y 10 HN.

### Historial correctivo

- V175 HOLD R26/R27;
- V176 HOLD R26–R28;
- V177 HOLD R29;
- V178 HOLD R30;
- V179 HOLD R31;
- V180 HOLD R32;
- V181 R26–R31 PASS, R32 anterior PASS, R32 vigente HOLD; no aplicada.

### Avances válidos de V181

- filas review fuera de métricas;
- presupuesto vacío sin herencia;
- CxP sin doble suma conocida;
- liquidaciones/CxP histórica con controles de moneda;
- lotes y Beneficios con revisión visible;
- 0 pagos y 0 lotes.

### P0 V181

1. Lotes referencia `PENDING_CURRENCY` declarado solo dentro de Movimientos.
2. Liquidaciones/CxP histórica referencia `currencyOf` declarado solo dentro de Movimientos.
3. Ambos producen `ReferenceError` runtime.

### Cierre de gates

R32 sigue siendo el barrido consolidado final. Se amplió con un harness runtime de módulos; no se creó R33.

Después de R26–R32 vigentes PASS:

- se aplica directamente V182;
- no se crea otro gate por falta de datos TyA, móvil, host o archivos abiertos;
- esas pruebas se ejecutan post-apply sobre el mismo build.

### Pendiente para congelar Corte 3

1. Claude entrega V182 incremental.
2. Confirmar carril.
3. Auditar delta contra V181/V174.
4. Ejecutar `node --check` y R26–R32 vigentes.
5. Ejecutar harness de Lotes y CxP histórica.
6. Con GO sin P0: `APPLY_DELTA_DIRECTLY`.
7. Commit/push y post-gates.
8. Hosting DEV del mismo build.
9. Validar mayo 44/42/2/32/10/209/207.
10. Validar mayo ↔ julio.
11. Validar revisión fuera de métricas.
12. Validar presupuesto vacío.
13. Validar CxP sin duplicación.
14. Validar liquidaciones/lotes/Beneficios fail-closed.
15. Validar viewport móvil.
16. Validar host autorizado/no autorizado.
17. Descargar y abrir PDF/XLSX.
18. Validar shopper HNL sin Q 0.
19. Paula: `APROBADO`.
20. Freeze Corte 3.

Corte 4 no comienza antes.

## 6. Cortes siguientes

- **Corte 4:** backend nuevo `CX.data` read-only en Firebase nuevo/vacío.
- **Corte 5:** materialización DEV con dry-run/idempotencia.
- **Corte 6:** Auth/RBAC.
- **Corte 7:** sincronización, evidencias y gates Make/Gemini.
- **Corte 8:** preproducción/producción con autorización.

## 7. Claude/prototipo

Paquete vigente: `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V181-P0-HOLD-20260725.md`.

## 8. Academia

Después de V182 GO documentar:

- sintaxis frente a runtime;
- aislamiento de módulos;
- moneda fail-closed;
- liquidaciones/lotes/CxP histórica;
- exportación y pruebas post-apply.
