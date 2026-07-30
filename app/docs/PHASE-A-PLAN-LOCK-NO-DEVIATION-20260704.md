# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-29  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN__ARCHITECTURE_CORRECTED__CANONICAL_BACKEND_RECOVERED__R16E_READONLY_PASS_WITH_REVIEW__R17_WRITE_PLAN_PENDING`

## 1. Objetivo
Operar TyA/Cinépolis como primer tenant/proyecto configurable de CXOrbia con HR/histórico, shoppers, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización.

La “base vieja” que no se conecta/copia es la plataforma legacy TyA Consultores que será retirada. `cxorbia-backend-dev` es el backend DEV canónico de CXOrbia y debe reutilizarse.

## 2. Secuencia obligatoria
`FUENTE → INVENTARIO → MAPPING/ADAPTER → PROVIDER COMPARE → WRITE PLAN → DRY-RUN/IDEMPOTENCIA → WRITE AUTORIZADO → BUILD/SMOKE → VALIDACIÓN VISUAL → FREEZE`

Para candidatas frontend continúa vigente:
`EXECUTION_LANE_READY → AUDITORÍA DELTA → P0_PROVEN o GO → APPLY_DELTA_DIRECTLY si GO → COMMIT/PUSH → POST-GATES → VISUAL → FREEZE`.

No nueva rama/PR, PowerShell, nueva candidata ni tareas manuales de Paula por rutina.

## 3. Arquitectura — lock
- Legacy TyA Consultores: sistema actual a retirar; solo origen de datos útiles/limpios.
- `cxorbia-backend-dev`: backend DEV canónico; TyA primer tenant; reutilizar.
- `cxorbia-tya-dev-260729-c4`: sandbox técnico; aprendizajes preservados, no destino de datos.
- Hosting público TyA: conservar URL; cutover final con rollback/smoke/autorización.

## 4. Cortes cerrados
### M1 / Corte 1 / Corte 2A
`FROZEN/APROBADO`.

### Corte 3 — Finanzas e histórico
`FROZEN_ACTIVE_BASELINE` sobre `CXORBIA-TYA-CORTE3-V182-20260729`.
- 14 periodos / 616 visitas hasta julio;
- 34 GT + 10 HN por periodo;
- Mayo 44 pagadas / 0 pendientes;
- Junio 2 pagadas / 42 pendientes;
- P1/P2 de PDF/Excel/reportKit/copy siguen backlog.

## 5. Corte 4 — `CX.data` read-only / backend canónico
### 5.1 Sandbox técnico
VIS-01/VIS-02/VIS-02B resueltos: no demo fallback, empty-backend válido, null-safety, role-switch limpio, asset-integrity, 0 pageerrors. No se materializa TyA en el sandbox.

### 5.2 Inventario canónico
`cxorbia-backend-dev` read-only PASS:
- Auth 17;
- projects 29;
- visits 619;
- questionnaires 557;
- shoppers 215;
- liquidations 255;
- certifications 0;
- materialización sustancial existente, sin PII/provider writes.

### 5.3 Gap + HR viva
- faltan julio GT+HN en materialización period-country previa: 44 visitas;
- exceso abril `sprint5-visit-mutation-no-real-data`;
- exceso junio HN `hr-58fb469666080189`, sourceRow 12 no presente en HR viva;
- pilotos/no canónicos preservados;
- HR viva actual: 15 periodos / 30 tabs / 684 visitas / 236 referencias shopper;
- `AGOSTO 26 HN` HOLD: 34 filas dicen País=GT; no bloquea julio.

### 5.4 Plan canónico
Refresh offline PASS:
- `phasea_2f71daec3e68dfa1` + `r16d_f471a6b486f3a269b0dd`;
- 1,415 operaciones;
- tenant 1 / proyecto padre `cinepolis` 1 / HR import 1 / periodos 14 / shoppers 210 / visitas 616 / liquidaciones 572;
- certificaciones 0 / pagos 0.

Modelo: **proyecto padre `cinepolis` → periodos → visitas**.

### 5.5 R16E provider compare — CERRADO
Autorización read-only ejecutada contra `cxorbia-backend-dev`.

Resultado:
- run `29282169628`, job `90741969389`: SUCCESS;
- decisión `PASS_WITH_REVIEW_CANONICAL_MATERIALIZATION_DRY_RUN_R16`;
- create 1,414;
- update 1;
- noop 0;
- record review 0;
- extras preservados 244 = 29 project docs + 215 shopper docs;
- deletes/writes/deploy/production 0.

Interpretación: la topología canónica nueva casi no existe bajo esos paths; la información existente está principalmente en la topología DEV previa. `create=1414` no significa base vacía y no autoriza ejecutar 1,415 writes a ciegas.

R16E deja evidencia en `app/docs/evidence/R16E-PROVIDER-COMPARE-LATEST.json`.

### 5.6 Gate activo de Corte 4 / transición a Corte 5
**R17 WRITE PLAN EXACTO SIN EJECUTAR**.

R17 debe:
1. separar topología canónica a crear de materialización DEV previa a preservar/reutilizar;
2. mantener extras/pilotos sin deletes automáticos;
3. excluir review/noop de writes;
4. incorporar refresh legacy shoppers/certificaciones como delta por llave estable;
5. mantener julio HR-first y agosto HN HOLD;
6. producir lotes exactos y dry-run/idempotencia;
7. no ejecutar provider writes.

Corte 4 se congela cuando el binding/read-path canónico y smoke read-only sobre `cxorbia-backend-dev` queden PASS sin reintroducir VIS-01/VIS-02/VIS-02B. No requiere poblar otra base.

## 6. Corte 5 — materialización DEV incremental
Solo después de R17 + refresh legacy + dry-run/idempotencia + autorización explícita de writes exactos.

Alcance:
- julio 2026 HR 34 GT + 10 HN;
- shoppers legacy: diff estable contra 215 existentes;
- certificaciones legacy: historial faltante según fuente;
- no reimportar visitas legacy si HR es fuente;
- limpieza de los dos extras únicamente si write plan lo demuestra y autoriza;
- pilotos/no canónicos separados;
- agosto HN HOLD;
- datos sensibles protegidos.

Prompt legacy: `PROMPT-REFRESH-DELTA-LEGACY-TYA-SHOPPERS-CERTIFICACIONES-20260729.md`.

## 7. Corte 6 — Auth/RBAC
Reutilizar Auth DEV existente donde corresponda; claims por persona/rol/scope, países/proyectos/rutas/acciones/Academia/notificaciones. No importar Auth legacy a ciegas.

## 8. Corte 7 — sincronización y evidencias
HR→plataforma, plataforma→HR, dedupe por llave estable, reviewQueue, cuestionario configurable, evidencias protegidas, Make/Gemini con gates.

## 9. Corte 8 — preproducción y producción
- cortes previos congelados;
- refresh final delta si aplica;
- rollback;
- smoke integral;
- verificar proyecto dueño del Hosting público actual;
- desplegar CXOrbia sobre la URL pública ya usada por shoppers;
- autorización específica;
- no cambiar URL pública por rutina.

## 10. Claude/prototipo
No P0 frontend nuevo por R16E. No nueva candidata. Preservar fixes core/entrypoint y no convertir periodos en proyectos independientes en UX/producto.

## 11. Academia
Documentar separación legacy/backend/sandbox, path canónico vs backend vacío, compare read-only vs write autorizado, proyecto vs periodo, carryover de certificaciones y cutover con rollback.

## 12. Estado seguro
Sin producción, merge, nuevos Hosting, Firestore/Auth/Storage/HR writes, imports, pagos/lotes, Make ni Gemini live hasta autorización específica.
