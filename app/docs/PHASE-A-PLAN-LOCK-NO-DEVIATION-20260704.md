# CXOrbia TyA — Plan de trabajo Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-24  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `V174_ACTIVE_BASELINE_CORTE3_ROOT_CAUSE_DIAGNOSED_CORRECTION_PACKAGE_READY_P0_HOLD`

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

Sin `APROBADO`, el estado máximo es `TECHNICAL_PASS_PENDING_VISUAL` o `P0_PROVEN_VISUAL_HOLD` cuando exista bloqueo demostrado.

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

No se sustituye por composite previo obligatorio, nueva rama/PR, workflow transportador, aplicación archivo por archivo, PowerShell ni acciones manuales de Paula.

Cuando ya existe un `P0_PROVEN`, primero se realiza diagnóstico localizado y paquete correctivo. La candidata correctiva vuelve al flujo anterior; no se reconstruye la baseline ni se reinicia el plan.

## 4. Definición de terminado

Un corte solo queda `FROZEN` cuando:

1. fuente, campos, llaves, periodos y conteos están identificados;
2. mapping y adapter usan una única verdad;
3. gates reproducibles pasan sobre el mismo build;
4. archivos reales de exportación y flujos por rol se prueban cuando aplican;
5. visualización y comportamiento móvil/escritorio fueron comprobados;
6. Paula responde `APROBADO` o se documenta un P1/P2 no bloqueante;
7. checkpoint, CAMBIOS, Claude, PENDIENTES, Academia, tracker y PR están actualizados.

## 5. Baseline y cortes cerrados

### V174 / M1 / Corte 1 / Corte 2A

Estado: **FROZEN / APROBADO**.

- V174 empalmada y preservada.
- Source lock visual: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- 14 periodos y 616 visitas.
- HR source-safe, adapters y `CX.data` preservados.
- Contexto, histórico y ciclo Shopper de Corte 2A aprobados según checkpoint vigente.
- No se reabren por la corrección financiera.

## 6. Corte activo

### CORTE 3 — Finanzas

Estado: `ROOT_CAUSE_DIAGNOSED_CORRECTION_PACKAGE_READY_P0_HOLD`.

#### Verdad canónica preservada

- 247 filas financieras;
- 209 vínculos exactos;
- 207 montos canónicos listos;
- 38 filas sin vínculo exacto;
- 79 revisiones de vínculo;
- 2 revisiones de monto;
- 37 evidencias candidatas;
- 0 pagos confirmados;
- 0 lotes.

#### Mayo 2026

- 44 visitas HR;
- 42 filas exactas;
- 2 revisiones fail-closed;
- 32 exactas GT;
- 10 exactas HN.

#### Hosting y gate anterior

- Hosting DEV publicado.
- Remote live smoke R25: PASS técnico.
- El PASS R25 no cerró Corte 3 porque solo validó DOM/spec y una sesión Shopper inyectada; no abrió exportaciones reales ni probó móvil/identidad visible.

#### P0 demostrados

1. suma GTQ + HNL rotulada como GTQ;
2. honorarios mostrados como pagados con cero pagos confirmados;
3. reembolso conciliado por regla inventada del 85 %;
4. periodo financiero aislado del contexto canónico;
5. PDF vacío/incorrecto y Excel no generado;
6. dos revisiones financieras sin superficie visible;
7. Beneficios no validable con identidad Shopper visible en DEV.

#### Corrección ya preparada

- diagnóstico de causa raíz cerrado;
- paquete focalizado para Claude creado;
- gate fuente fail-closed R26 creado;
- plan canónico reconciliado;
- baseline y datos preservados.

#### Pendiente para cerrar Corte 3

1. Claude aplica el paquete focalizado sobre V174.
2. Entrega candidata incremental.
3. Confirmar `EXECUTION_LANE_READY`.
4. Auditar delta contra V174 y backend protegido.
5. Ejecutar `node --check`, gate R26 y gates semánticos.
6. Si queda GO sin P0, `APPLY_DELTA_DIRECTLY` sobre la rama viva.
7. Commit/push atómico y post-gates.
8. Hosting DEV del mismo build.
9. Revalidación móvil real de Paula.
10. PDF y Excel descargados y abiertos.
11. Dos revisiones visibles.
12. Shopper controlado accesible desde el login DEV.
13. `APROBADO`.
14. Freeze de Corte 3.

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

Claude recibe únicamente tareas localizadas y reproducibles por archivo/módulo. No reinterpreta reglas HR ni modifica backend, adapters, gates o datos. No se solicita una candidata nueva por rutina; solo la correctiva ya justificada por P0.

Paquete vigente:

`app/docs/PAQUETE-CLAUDE-CORTE3-CORRECCION-FOCALIZADA-20260724.md`.

## 9. Academia

Cada corrección debe actualizar o documentar:

- devengado vs liquidado vs por pagar vs pagado;
- multimoneda sin conversión implícita;
- revisión financiera fail-closed;
- exportación PDF/Excel;
- identidad Shopper DEV vs Auth real;
- rutas por rol y errores frecuentes.

Manual y Curso permanecen como objetos distintos.

## 10. Estado seguro

Hosting DEV permanece publicado. Sin producción, merge, Cloud Run deploy, Firestore/Auth/Storage/HR writes, import real, pagos, lotes, Make ni Gemini live.
