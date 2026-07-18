# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

Fecha: 2026-07-18  
Estado: `CORTE_0B_R20_IMPLEMENTED_PENDING_GATES_AND_VISUAL`

## 1. Repositorio y estado seguro

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR: `#7`, draft/open/no merge
- V159 fue empalmada, pero la validación visual fue `NO APROBADA`.
- V159 no es `ACTIVE_BASELINE`.
- URL anterior se conserva únicamente como evidencia del fallo visual:
  `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`
- Sin producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.

## 2. P0 visual/semántico confirmado

- Cuestionario y submitido incorrectos en históricos.
- KPI, fases y listados con derivaciones distintas.
- Liquidaciones contaminadas por `v.estado`.
- Asignadas/sin asignar/disponibles de julio no alineadas con shopper real de HR.
- Shopper sin visitas elegibles.
- Proyecto y periodo unidos en Shopper/Cliente.
- Login no gobernado por perfil de tenant.
- Cliente sin Academia visible.
- Comparativo trimestral sin histórico real.
- Manuales superficiales.

## 3. Corte activo

`CORTE 0B — MOTOR CANÓNICO HISTÓRICO + TENANT/LOGIN`

El alcance ya no se limita a mayo, junio y julio. La regla se aplica a:

1. todos los tabs/periodos detectados en la HR;
2. como mínimo, todo el año vigente si una fuente anterior no puede leerse;
3. cada periodo futuro sin agregar excepciones por mes.

Mayo, junio y julio quedan como muestras obligatorias de regresión, no como lógica especial.

## 4. Implementado en este bloque

### Motor histórico R20

- `tools/hr-source/tya-canonical-visit-state-r20.mjs`
- `tools/hr-source/tya-build-live-hr-source-safe-r15g.mjs` actualizado
- `backend/contracts/phase-a-hr-canonical-visit-state-r20-v1.json`

Dimensiones separadas:

- `assignmentState`;
- `schedulingState`;
- `executionState`;
- `questionnaireState`;
- `submissionState`;
- `liquidationState`;
- `paymentState`;
- `outOfRange`;
- `reviewRequired`.

Reglas:

- sin shopper real = sin asignar;
- shopper sin fecha válida = pendiente de programar;
- realizada sin cuestionario = pendiente de cuestionario;
- cuestionario sin submitido = pendiente de submitido TyA;
- submitido = ciclo operativo completado y candidato a liquidación;
- submitido no equivale a liquidado ni pagado;
- liquidación/pago requieren fuente financiera;
- contradicciones de control/fechas/shopper pasan a revisión.

### Binding source-safe

- `tools/release/tya-source-safe-binding-build-r15g.mjs` actualizado.
- Dashboard, filtros, Liquidaciones y comparativo reciben datos canónicos mediante adapter/overlay de build, sin modificar `app/modules` ni el core fuente.
- Fases visibles se reconcilian desde facets canónicos.
- Comparativo usa periodos históricos reales del snapshot.
- `submitida` deja de aparecer como pendiente de cuestionario/submitido.
- Liquidaciones muestran `Pend. pago · cruce financiero` cuando existe submitido sin pago confirmado.

### Tenant/login

- `backend/config/tya-tenant-runtime-profile.source-safe.json`
- Roles visibles TyA: `admin`, `ops`, `shopper`.
- Cliente, coordinador y aliado ocultos en login TyA mientras no se habiliten.
- Países: GT/HN.
- Banderas derivadas del tenant o proyectos activos, no del catálogo global.
- Proyecto y periodo definidos como contextos separados.
- Persistencia real todavía pendiente del backend limpio/Auth.

### Gates

- `tools/qa/tya-canonical-history-reconciliation-r20-gate.mjs`
- `tools/qa/tya-source-semantics-r15g-gate.mjs` elevado a R20.

Los gates validan todos los periodos detectados, progresión monotónica, facets, resúmenes históricos, conflicto shopper/control, separación financiera, tenant y roles de login.

## 5. Pendiente real antes de nueva visualización

1. Ejecutar builder HR vivo R20 sobre el workbook vigente.
2. Ejecutar gate histórico y gate browser R20.
3. Revisar `reviewRequired`, especialmente fechas inválidas o columnas ambiguas.
4. Confirmar conteos por todos los periodos y por 2026.
5. Construir Hosting DEV corregido únicamente con autorización/gate de Hosting DEV.
6. Validar visualmente Admin, Shopper, Cliente y Academia.
7. Solo con `APROBADO` congelar Corte 0B.

## 6. Metodología futura de empalme

`AUDITORÍA → COMPOSITE DEL MISMO HASH → GATES SEMÁNTICOS → VISUALIZACIÓN PRE-EMPALME → APROBACIÓN → APPLY_DELTA_DIRECTLY → POST-GATES → FREEZE`

La rama viva no recibe futuras candidatas antes de la aprobación visual del composite.

## 7. Claude/prototipo y Academia

Claude recibe únicamente ajustes localizados que todavía requieran modificación de módulos fuente: selectores por rol, Academia Cliente y manuales documentales. No recibe la lógica HR para reinterpretarla.

Academia debe distinguir Manual de Curso y cubrir la operación completa, errores, validaciones, proyecto, periodo, estados y pagos.

## 8. Siguiente bloque exacto

`CORTE 0B.2 — EJECUCIÓN DE BUILDER/GATES R20 + REVISIÓN DE CONFLICTOS DE TODA LA HR`

No iniciar Corte 1 ni producción antes de completar y aprobar este bloque.
