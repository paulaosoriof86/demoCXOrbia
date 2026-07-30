# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-29  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN__ARCHITECTURE_CORRECTED__CANONICAL_BACKEND_RECOVERED__R16E_PASS__R17M_WRITE_PLAN_READY_NO_EXECUTE__LEGACY_REFRESH_PENDING`

## 1. Objetivo
Operar TyA/Cinépolis como primer tenant/proyecto configurable de CXOrbia con HR/histórico, shoppers, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización.

La base legacy que será retirada es la plataforma TyA Consultores actual. `cxorbia-backend-dev` es el backend DEV canónico de CXOrbia y se reutiliza.

## 2. Secuencia obligatoria
`FUENTE → INVENTARIO → MAPPING/ADAPTER → PROVIDER COMPARE → WRITE PLAN → REFRESH/DIFF → DRY-RUN/IDEMPOTENCIA → WRITE AUTORIZADO → BUILD/SMOKE → VALIDACIÓN VISUAL → FREEZE`

Para candidatas frontend continúa:
`EXECUTION_LANE_READY → AUDITORÍA DELTA → P0_PROVEN o GO → APPLY_DELTA_DIRECTLY → COMMIT/PUSH → POST-GATES → VISUAL → FREEZE`.

No nueva rama/PR, PowerShell, nueva candidata ni tareas manuales por rutina.

## 3. Arquitectura — lock
- Legacy TyA Consultores: plataforma actual a retirar; solo origen de shoppers/certificaciones y otros datos útiles demostrables.
- `cxorbia-backend-dev`: backend DEV canónico; TyA primer tenant; reutilizar.
- `cxorbia-tya-dev-260729-c4`: sandbox técnico; no destino de materialización.
- Repo legacy operativo: `paulaosoriof86/cxorbia-tya-plataforma`.
- `.firebaserc` del repo legacy confirma Firebase default `tya-plataforma`; ese Hosting público se conserva para cutover final.

## 4. Cortes cerrados
### M1 / Corte 1 / Corte 2A
`FROZEN/APROBADO`.

### Corte 3 — Finanzas e histórico
`FROZEN_ACTIVE_BASELINE` sobre `CXORBIA-TYA-CORTE3-V182-20260729`.
- 14 periodos / 616 visitas hasta julio;
- 34 GT + 10 HN por periodo;
- Mayo 44 pagadas / 0 pendientes;
- Junio 2 pagadas / 42 pendientes;
- P1/P2 PDF/Excel/reportKit/copy siguen backlog.

## 5. Corte 4 — `CX.data` read-only / backend canónico
### 5.1 Sandbox técnico
VIS-01/VIS-02/VIS-02B resueltos: no demo fallback, empty-backend válido, null-safety, role-switch limpio, asset-integrity y 0 pageerrors. No se materializa TyA en el sandbox.

### 5.2 Inventario / gap / HR viva
`cxorbia-backend-dev`: Auth 17, projects 29, visits 619, questionnaires 557, shoppers 215, liquidations 255, certifications 0.

Gap: faltan julio GT+HN en topología period-country previa = 44 visitas; dos overages quedan HOLD_NO_DELETE; pilotos preservados.

HR viva: 15 periodos / 30 tabs / 684 visitas / 236 referencias shopper; julio GT34/HN10 correcto; `AGOSTO 26 HN` HOLD porque 34 filas dicen País=GT.

### 5.3 Plan canónico
`phasea_2f71daec3e68dfa1` + `r16d_f471a6b486f3a269b0dd`: 1,415 operaciones = tenant 1, proyecto padre `cinepolis` 1, HR import 1, periodos 14, shoppers 210, visitas 616, liquidaciones 572; certificaciones 0 / pagos 0.

Modelo: **proyecto padre `cinepolis` → periodos → visitas**.

### 5.4 R16E provider compare — CERRADO
Autorización read-only ejecutada contra `cxorbia-backend-dev`.
- run `29282169628`, job `90741969389`: SUCCESS;
- decisión `PASS_WITH_REVIEW_CANONICAL_MATERIALIZATION_DRY_RUN_R16`;
- create 1,414 / update 1 / noop 0 / review 0;
- extras preservados 244;
- deletes/writes/deploy/production 0.

`create=1414` significa ausencia de la topología canónica bajo esos paths, no backend vacío.

### 5.5 R17M write plan exacto — CERRADO, NO EXECUTE
Decisión: `PASS_R17M_WRITE_PLAN_NO_EXECUTE__LEGACY_SHOPPER_CERT_REFRESH_PENDING`.

Estrategia: canonical-shadow sobre `cxorbia-backend-dev`, preservando la topología DEV previa para rollback y manteniendo un único read-path activo después del smoke.

Grupos:
1. tenant update `op_00001`: HOLD por `configurable`, `name`, `schemaVersion`;
2. foundation `op_00002..op_00017`: 16 create candidates tras idempotencia;
3. shoppers `op_00018..op_00227`: 210 HOLD hasta refresh legacy + diff estable;
4. visits `op_00228..op_00843`: 616 canonical-shadow candidates, HR-first;
5. liquidations `op_00844..op_01415`: 572 control-only candidates, 0 pagos;
6. subtotal potencial excluyendo shopper/tenant: 1,204, todavía NO autorizado;
7. 244 extras/pilotos y 2 cleanup candidates: preservar/HOLD_NO_DELETE;
8. Agosto HN: HOLD.

Evidencia: `app/docs/evidence/R17M-WRITE-PLAN-NO-EXECUTE-LATEST.json`.
Validator: `tools/reconciliation/tya-r17m-write-plan-no-execute-validate.mjs`.

### 5.6 Gate activo para cerrar Corte 4 / entrar a Corte 5
`REFRESH LEGACY SHOPPERS/CERTIFICACIONES → DIFF ESTABLE → REBUILD R17M → OFFLINE IDEMPOTENCE → CANONICAL READ-PATH BINDING/SMOKE`.

Corte 4 se congela cuando el binding/read-path canónico sobre `cxorbia-backend-dev` quede PASS sin reintroducir VIS-01/VIS-02/VIS-02B. No requiere poblar otra base.

## 6. Corte 5 — materialización DEV incremental
Solo después de refresh legacy + rebuild R17M + idempotencia + autorización explícita de grupos/conteos exactos.

Alcance:
- julio 2026 HR 34 GT + 10 HN;
- shoppers legacy: diff estable contra 215 existentes;
- certificaciones legacy: historial faltante según fuente;
- visitas legacy no se importan porque HR es fuente;
- no deletes de overages/pilotos salvo plan y autorización separados;
- agosto HN HOLD;
- datos sensibles protegidos.

Prompt legacy: `PROMPT-REFRESH-DELTA-LEGACY-TYA-SHOPPERS-CERTIFICACIONES-20260729.md`.

## 7. Corte 6 — Auth/RBAC
Reutilizar Auth DEV existente cuando corresponda; claims por persona/rol/scope, países/proyectos/rutas/acciones/Academia/notificaciones. No importar Auth legacy a ciegas.

## 8. Corte 7 — sincronización y evidencias
HR→plataforma, plataforma→HR, dedupe por llave estable, reviewQueue, cuestionario configurable, evidencias protegidas, Make/Gemini con gates.

## 9. Corte 8 — preproducción y producción
- cortes previos congelados;
- refresh final delta si aplica;
- rollback;
- smoke integral;
- proyecto Hosting público verificado: `tya-plataforma`;
- desplegar CXOrbia sobre la URL pública actual usada por shoppers;
- autorización específica;
- no cambiar URL pública.

## 10. Claude/prototipo
No P0 frontend nuevo. No nueva candidata. Preservar fixes core/entrypoint y no convertir periodos en proyectos independientes en UX/producto.

## 11. Academia
Documentar separación legacy/backend/sandbox, canonical-shadow, read-path único, carryover de certificaciones, compare vs write y cutover con rollback.

## 12. Estado seguro
Sin producción, merge, nuevo Hosting, Firestore/Auth/Storage/HR writes, imports, pagos/lotes, Make ni Gemini live hasta autorización específica.
