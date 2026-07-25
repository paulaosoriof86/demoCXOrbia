# CXOrbia TyA — Plan de trabajo Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-25  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `V174_ACTIVE_BASELINE_V177_AUDITED_P0_PROVEN_HOLD_V178_REQUIRED`

## 1. Objetivo operativo

Acondicionar CXOrbia para operar TyA/Cinépolis como primer proyecto configurable con HR e histórico completos, shoppers, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia, manuales y sincronización HR/plataforma, sobre una base nueva y sin conectar ni copiar la base vieja.

El resultado debe verse y funcionar en pantalla. Un contrato, script o PASS técnico sin validación visual no cierra un corte.

## 2. Secuencia obligatoria por corte

```text
FUENTE Y REGLA
→ MAPPING / ADAPTER
→ GATES DE DATOS Y SEMÁNTICA
→ BUILD EXACTO
→ VALIDACIÓN VISUAL
→ CORRECCIÓN FOCALIZADA
→ FREEZE
```

Sin `APROBADO`, el estado máximo es `TECHNICAL_PASS_PENDING_VISUAL` o `P0_PROVEN_VISUAL_HOLD`.

## 3. Método obligatorio para candidatas

```text
EXECUTION_LANE_READY
→ AUDITORÍA DELTA
→ P0_PROVEN o GO
→ si GO sin P0: APPLY_DELTA_DIRECTLY
→ COMMIT/PUSH ATÓMICO
→ MANIFEST / BUILD-LOCK / VERIFICADOR
→ POST-GATES
→ VALIDACIÓN VISUAL
→ CORRECCIÓN FOCALIZADA SI APLICA
→ FREEZE
```

No se sustituye por composite, nueva rama/PR, workflow transportador, PowerShell, incoming ni acciones manuales de Paula.

Cuando existe `P0_PROVEN`, se hace diagnóstico localizado y paquete correctivo. No se reconstruye la baseline ni se reinicia el plan.

## 4. Definición de terminado

Un corte solo queda `FROZEN` cuando:

1. fuente, campos, llaves, periodos y conteos están identificados;
2. mapping y adapter usan una única verdad;
3. gates reproducibles pasan sobre el mismo build;
4. exportaciones y flujos por rol se prueban realmente;
5. móvil y escritorio fueron comprobados;
6. Paula responde `APROBADO` o se documenta un P1/P2 no bloqueante;
7. checkpoint, CAMBIOS, Claude, PENDIENTES, Academia, índice y PR están actualizados.

## 5. Baseline y cortes cerrados

### V174 / M1 / Corte 1 / Corte 2A

Estado: **FROZEN / APROBADO**.

- V174 empalmada y preservada.
- Source lock visual: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- 14 periodos y 616 visitas.
- HR source-safe, adapters y `CX.data` preservados.
- No se reabren por la corrección financiera.

## 6. Corte activo — Corte 3 Finanzas

Estado: `V177_AUDITED_P0_PROVEN_HOLD_V178_REQUIRED`.

### Verdad canónica preservada

- 247 filas financieras;
- 209 vínculos exactos;
- 207 montos canónicos listos;
- 38 filas sin vínculo exacto;
- 79 revisiones de vínculo;
- 2 revisiones de monto;
- 37 evidencias candidatas;
- 0 pagos confirmados;
- 0 lotes.

Mayo 2026:

- 44 visitas HR;
- 42 filas exactas;
- 2 revisiones fail-closed;
- 32 exactas GT;
- 10 exactas HN.

### Candidatas correctivas

#### V175

- integridad y sintaxis PASS;
- mejoras parciales válidas;
- R26/R27 HOLD;
- no aplicada.

#### V176

- integridad y sintaxis PASS;
- mejoras parciales válidas;
- R26/R27/R28 HOLD;
- no aplicada.

#### V177

- SHA ZIP `cb755c9d7ce02d11944cb9926d1362ef37062a6edb8a46f28544ed3c7b849aea`;
- manifest/hashes, UTF-8 y sintaxis: PASS;
- R26/R27/R28: PASS;
- delta real: `finanzas-core.js`, `finanzas.js`, `beneficios.js`;
- `app.js` y `layout.css`: idénticos a V176;
- R29: HOLD 11/12;
- no aplicada.

### P0 residuales de V177

1. Dashboard usa presupuesto con periodo implícito local.
2. Dashboard crea montos de presupuesto ficticios al no existir fuente.
3. Moneda faltante hereda la primera moneda mediante `|| cur`.
4. Financiamientos multipaís se suman y rotulan con una sola moneda.
5. Presupuesto no asignado se presenta como gasto real/ejecutado.
6. Persiste referencia a campo eliminado y moneda inventada para presupuesto.
7. `porPais(data)` usa periodo global en vez del contexto suministrado.
8. Evidencia canónica/móvil/PDF/Excel incompleta.

### Pendiente para cerrar Corte 3

1. Claude corrige V177 y entrega V178 incremental.
2. Confirmar `EXECUTION_LANE_READY`.
3. Auditar delta contra V177 y baseline V174.
4. Ejecutar `node --check`, R26, R27, R28 y R29.
5. Si queda GO sin P0, `APPLY_DELTA_DIRECTLY` sobre la rama viva.
6. Commit/push atómico y post-gates.
7. Hosting DEV del mismo build.
8. Revalidación con fuente TyA y viewport móvil.
9. PDF y Excel descargados y abiertos.
10. Dos revisiones GT visibles en mayo.
11. Fila sin moneda visible en revisión y fuera de agregados.
12. Presupuesto vacío sin cifras ficticias.
13. Presupuesto pendiente no presentado como ejecutado.
14. Shopper HNL sin Q 0.
15. Host DEV autorizado y host no autorizado probados.
16. `APROBADO`.
17. Freeze de Corte 3.

Corte 4 no comienza antes.

## 7. Cortes siguientes

### CORTE 4 — Backend nuevo `CX.data` read-only

Prerequisito: Corte 3 congelado y Firebase nuevo/vacío. Conectar `loadSnapshot(context)` en el punto único autorizado, bloquear mutaciones y repetir visualmente Cortes 1–3 sin fallback demo.

### CORTE 5 — Materialización DEV

Dry-run, idempotencia, trazabilidad, conflictos, lotes controlados y datos sensibles protegidos. Solo con autorización expresa.

### CORTE 6 — Auth/RBAC

Claims por persona, rol y scope; países, proyectos, rutas, acciones, Academia y notificaciones. No importar Auth legacy.

### CORTE 7 — Sincronización y evidencias

HR→plataforma, plataforma→HR, no duplicación, reviewQueue, cuestionario configurable, evidencias protegidas, certificaciones preservadas y pagos nunca inferidos. Make, Storage, Gemini y HR writes por gates separados.

### CORTE 8 — Preproducción y producción

Cortes anteriores congelados, rollback probado, smoke integral, source lock final y autorización específica para merge/deploy/producción.

## 8. Claude/prototipo

Claude recibe tareas localizadas y reproducibles por archivo/módulo. No reinterpreta HR ni modifica backend, adapters, gates o datos.

Paquete vigente:

`app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V177-P0-HOLD-20260725.md`.

## 9. Academia

La corrección aprobada debe documentar:

- periodo canónico vs mes local;
- multimoneda sin fallback;
- presupuesto planeado, pendiente y ejecutado;
- devengado/por pagar/pagado;
- revisión financiera fail-closed;
- exportación PDF/Excel;
- identidad Shopper DEV vs Auth real;
- rutas por rol y errores frecuentes.
