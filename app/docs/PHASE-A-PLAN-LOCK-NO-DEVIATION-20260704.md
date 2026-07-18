# CXOrbia TyA — Plan de trabajo Phase A con validación visual continua

Fecha original: 2026-07-04  
Última revisión: 2026-07-18, Corte 0B R20 histórico  
Estado: ACTIVO, OBLIGATORIO Y PREVALENTE

## 1. Objetivo

Acondicionar CXOrbia para operar TyA/Cinépolis como primer proyecto configurable con HR e histórico completos, shoppers, certificaciones, visitas, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia, manuales y sincronización HR/plataforma, siempre sobre base nueva y sin conectar ni copiar la base vieja.

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

Sin `APROBADO`, el estado máximo es `TECHNICAL_PASS_PENDING_VISUAL`.

## 3. Método obligatorio para futuras candidatas

```text
EXECUTION_LANE_READY
→ AUDITORÍA DELTA
→ COMPOSITE TEMPORAL DEL MISMO HASH + BACKEND/OVERLAYS
→ GATES SEMÁNTICOS
→ VISUALIZACIÓN PRE-EMPALME
→ APROBACIÓN/HOLD
→ APPLY_DELTA_DIRECTLY DEL MISMO HASH APROBADO
→ COMMIT/PUSH ATÓMICO
→ POST-GATES
→ FREEZE
```

No nueva rama, PR, `main`, workflow transportador, PowerShell para Paula ni candidata distinta entre visualización y empalme.

## 4. Definición de terminado

Un corte solo queda `FROZEN` cuando:

1. fuente, campos, claves, periodos y conteos están identificados;
2. el mapping no depende de heurísticas silenciosas;
3. los consumidores usan una única verdad;
4. gates reproducibles pasan sobre el mismo build;
5. Paula valida el comportamiento en pantalla;
6. checkpoint, CAMBIOS, Claude, PENDIENTES, Academia, tracker y PR están actualizados.

## 5. Estado actual

### Cerrado técnicamente

- V159 auditada y empalmada.
- Manifest/build-lock/verificador.
- Hosting DEV y smoke técnico anteriores.
- HR source-safe con 14 periodos/616 visitas disponible como snapshot de build.
- Contratos, adapters, importadores, reviewQueue, rollback y readiness preparados.

### No cerrado

V159 fue `NO APROBADA` visualmente. No es `ACTIVE_BASELINE`.

## 6. Plan vigente

### CORTE 0 — V159 post-empalme

Estado: **NO CERRADO**.

P0 comprobado: cuestionarios/submitidos históricos incorrectos, divergencia KPI/fases/listados, liquidaciones contaminadas, asignación/disponibilidad incorrecta, Shopper sin visitas disponibles, contexto y Academia por rol incompletos, comparativo sin histórico y manuales superficiales.

### CORTE 0B — Motor canónico histórico + tenant/login

Estado: **ACTIVO**.

#### Alcance histórico obligatorio

La lectura y las reglas se aplican a:

- todos los tabs/periodos detectados en la HR;
- como mínimo todo el año vigente si una fuente más antigua no puede leerse;
- todo periodo futuro sin programar excepciones por mes.

Mayo, junio y julio son casos obligatorios de regresión, no el límite del desarrollo.

#### 0B.1 — Fuente y motor canónico

- leer HR multi-tab completa;
- normalizar fechas sin aceptar valores inválidos como agenda/realizada/cuestionario/submitido;
- mapear por fila: shopper, fecha programada, realizada, cuestionario, submitido y control;
- separar:
  - `assignmentState`;
  - `schedulingState`;
  - `executionState`;
  - `questionnaireState`;
  - `submissionState`;
  - `liquidationState`;
  - `paymentState`;
  - `outOfRange`;
  - `reviewRequired`;
- enviar contradicciones a revisión, sin sobrescritura silenciosa;
- mantener liquidación/pago separados de submitido.

Implementación actual:

- `tools/hr-source/tya-canonical-visit-state-r20.mjs`;
- `tools/hr-source/tya-build-live-hr-source-safe-r15g.mjs` con R20;
- `backend/contracts/phase-a-hr-canonical-visit-state-r20-v1.json`.

#### 0B.2 — Consumo único y gates

- Dashboard KPI, fases, listados, Visitas, disponibles, Shopper y Finanzas consumen facets canónicos;
- submitido no aparece como pendiente de cuestionario/submitido;
- submitido sin cruce financiero aparece como pendiente de pago/cruce, no pagado;
- comparativo usa periodos reales;
- gate recorre todos los periodos y valida progresión monotónica;
- gate compara resúmenes por periodo, país y estado;
- gate bloquea fechas/columnas ambiguas y conflictos ocultos.

Implementación actual:

- `tools/release/tya-source-safe-binding-build-r15g.mjs`;
- `tools/qa/tya-canonical-history-reconciliation-r20-gate.mjs`;
- `tools/qa/tya-source-semantics-r15g-gate.mjs` elevado a R20.

#### 0B.3 — Tenant y login

- perfil único de tenant;
- países y banderas configurables;
- banderas solo de países del tenant o proyectos activos;
- proyectos activos/inactivos;
- proyecto y periodo separados;
- roles visibles de login configurables;
- scopes por rol;
- TyA inicialmente muestra Admin, Operativo y Shopper;
- Cliente permanece oculto hasta habilitar portal y contenido;
- ocultar un botón no sustituye Auth/RBAC.

Implementación actual:

- `backend/config/tya-tenant-runtime-profile.source-safe.json`;
- binding source-safe de build.

#### 0B.4 — Pendiente antes de cerrar

1. ejecutar builder vivo R20;
2. revisar todos los conflictos/fechas inválidas;
3. ejecutar gates R20;
4. construir Hosting DEV corregido con autorización específica;
5. verificar Admin, Operativo, Shopper, Cliente habilitable y Academia;
6. corregir únicamente diferencias reproducibles;
7. recibir `APROBADO`;
8. congelar Corte 0B.

Corte 1 no comienza antes.

### CORTE 1 — Contexto, HR e histórico

- proyecto Cinépolis configurable;
- todos los periodos HR reconocidos;
- 14 periodos y 616 visitas para el snapshot vigente, con diferencias futuras documentadas;
- cambio de periodo altera KPI, filas, detalle y exportación;
- histórico por país y periodo;
- junio ejecutado, no visitas pendientes;
- fuente/origen visible y honesto.

### CORTE 2 — Ciclo Shopper

- disponibles reales;
- postulaciones;
- asignaciones HR/plataforma sin duplicar;
- agenda/reprogramación/cancelación;
- realizadas/cuestionario/submitido;
- shopper por llave estable;
- certificaciones preservadas;
- conflictos visibles.

### CORTE 3 — Finanzas

- honorario, boleto, combo/reembolso, total y moneda;
- liquidación no equivale a pago;
- hasta mayo pagado solo con fuente;
- junio pendiente según fuente financiera;
- lotes/movimientos sin inferencias;
- Beneficios del shopper coherente.

### CORTE 4 — Backend nuevo `CX.data` read-only

Prerequisito: Firebase nuevo y vacío. Implementar `loadSnapshot(context)`, bloquear `mutate`, conectar en punto único y repetir visualmente Cortes 1–3 sin fallback demo.

### CORTE 5 — Materialización DEV

Dry-run, idempotencia, lotes controlados, trazabilidad, conflictos y cero datos sensibles. Solo con autorización expresa.

### CORTE 6 — Auth/RBAC

Claims por persona/rol/scope, proyectos, países, rutas, acciones, Academia y notificaciones. No importar Auth legacy.

### CORTE 7 — Sync/evidencias/operación completa

HR→plataforma, plataforma→HR, no duplicación, reviewQueue, cuestionario configurable, evidencias protegidas, certificaciones preservadas y pagos nunca inferidos. Make, Storage, Gemini y HR writes por gates separados.

### CORTE 8 — Preproducción y producción

Cortes anteriores congelados, rollback probado, smoke integral, source lock final y autorización expresa para merge/deploy/producción.

## 7. Cadencia visual

Paula revisa antes de pasar a cada corte:

- `APROBADO`;
- `DIFERENCIA: rol / ruta / acción / esperado / observado`;
- `ERROR: acción / resultado`.

No se pide revisar cada script; sí el build exacto antes de congelar.

## 8. No reabrir desde cero

No se reinician adapters, domain mapping, materialization plan, Auth readiness, importadores, reviewQueue, rollback, HR source-safe, manifests, source locks ni V159. Se complementan o corrigen focalizadamente.

## 9. Claude/prototipo

Claude no reinterpreta reglas HR. Recibe contratos y tareas localizadas para:

- selectores proyecto/periodo por rol;
- componentes configurables de login;
- Academia Cliente;
- Manual como documento distinto de Curso;
- UX/copy que consuma estados canónicos.

Todo patrón reusable se documenta para el prototipo comercializable.

## 10. Academia

Cada cambio actualiza manuales, cursos, checklists, glosario, errores frecuentes, rutas por rol, notificaciones y fecha/versión. Los manuales deben ser documentos profundos, no lecciones breves disfrazadas.

## 11. Estado seguro

Sin merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, pagos ni base vieja conectada. Hosting DEV requiere autorización separada.
