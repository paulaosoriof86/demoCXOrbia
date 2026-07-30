# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-30  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN__CANONICAL_BACKEND_RECOVERED__CURRENT_HR_208_REFS__IDENTITY_208_OF_208_READY__R17N_FINAL_1406_NO_EXECUTE__NO_DATA_WRITES__NO_PRODUCTION`

## 1. Objetivo

Operar TyA/Cinépolis como primer tenant/proyecto configurable de CXOrbia con HR/histórico, shoppers reales, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización.

Legacy a retirar = Firebase/plataforma actual `tya-plataforma`. Backend DEV canónico de CXOrbia = `cxorbia-backend-dev`, que se reutiliza. El Hosting público `tya-plataforma` se conserva para el cutover final.

## 2. Secuencia obligatoria

`FUENTE VIVA → INVENTARIO/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE → WRITE PLAN → DRY-RUN/IDEMPOTENCIA → WRITE EXACTO AUTORIZADO → SMOKE → VALIDACIÓN VISUAL → FREEZE/CUTOVER`

Para candidatas frontend continúa el lock vigente `EXECUTION_LANE_READY → AUDITORÍA → GO/P0 → APPLY_DELTA_DIRECTLY`.

No nueva rama/PR, PowerShell, candidata, base Firebase ni tarea manual por rutina.

## 3. Arquitectura vinculante

- `tya-plataforma`: legacy operativo a retirar; solo fuente de datos útiles y Hosting/URL pública final.
- `cxorbia-backend-dev`: backend DEV canónico; TyA primer tenant; reutilizar.
- `cxorbia-tya-dev-260729-c4`: sandbox técnico; no destino de materialización.
- Proyecto padre canónico: `cinepolis`; los meses son periodos, no proyectos globales.
- UI final autorizada: identidad real shopper; hashes/placeholders solo en evidencia técnica.

## 4. Cortes cerrados

### M1 / Corte 1 / Corte 2A
`FROZEN/APROBADO`.

### Corte 3
`FROZEN_ACTIVE_BASELINE` en `CXORBIA-TYA-CORTE3-V182-20260729`.

- 14 periodos / 616 visitas hasta julio;
- Mayo: 44 pagadas / 0 pendientes;
- Junio: 2 pagadas / 42 pendientes;
- P1/P2 PDF/Excel/reportKit/copy no reabren Corte 3;
- no V183/R33.

## 5. Corte 4 — backend canónico / identidad / plan

### 5.1 Sandbox técnico preservado
VIS-01/VIS-02/VIS-02B resueltos: fail-closed sin demo, empty backend válido, null-safety, role-switch y assets. No materializar TyA allí.

### 5.2 Backend canónico existente
Inventario read-only `cxorbia-backend-dev`: Auth 17, projects 29, visits 619, questionnaires 557, shoppers 215, liquidations 255, shopperBenefits 572, certifications 0. Topología previa se preserva para rollback; no deletes por rutina.

### 5.3 Legacy shoppers/certificaciones
Refresh read-only directo a `tya-plataforma/tya_shoppers_extra`:

- 149 shoppers únicos;
- 120 perfiles legacy create-candidate;
- 22 stable-linked existing con update de campos en HOLD;
- 7 perfiles legacy HOLD;
- 78 certificaciones útiles;
- 77 certificaciones create-candidate + 1 HOLD;
- PII cruda en GitHub=0.

### 5.4 Frescura HR — corrección de raíz
El snapshot del 13-jul con 210 refs quedó superado. La proyección actual source-safe hasta julio, generada desde la HR viva, contiene:

- 14 periodos;
- 616 visitas;
- 208 refs shopper;
- contra snapshot previo: +2 refs / -4 refs / 206 intersección;
- PII=0; provider/HR/Firestore writes=0.

El set de 9 refs del snapshot viejo queda superado; nunca usarlo como verdad operativa futura.

### 5.5 Identidad shopper actual
Crosswalk exacto por `visitId`, `hrRowId`, `sourceSheet+sourceRow`:

- 201/208 refs → shopper canónico existente;
- 7/208 sin match transaccional inicial;
- 0 conflictos.

Reconciliación read-only de esas 7 con identidad real en memoria:

- 7/7 identidad presente en HR viva;
- 2 → perfil legacy create-candidate;
- 5 → perfil nuevo desde identidad real HR vigente;
- 0 HOLD de identidad actual.

No automerge por nombre. Al ejecutar, los 5 HR-only requieren relectura viva de identidad y escritura directa al backend protegido; no guardar PII en repo.

### 5.6 R17N FINAL — PASS, NO EXECUTE
Evidencia: `app/docs/evidence/R17N-FINAL-WRITE-PLAN-NO-EXECUTE-LATEST.json`.

Target: `cxorbia-backend-dev`, tenant `tya`, proyecto `cinepolis`.

Identity resolution:
- 208 refs totales;
- 201 reuse existing;
- 2 link a legacy profile create;
- 5 current-HR profile create;
- 0 HOLD;
- 208 ready.

Writes potenciales exactos listos, todavía NO autorizados:
- foundation: 16;
- legacy profile creates: 120;
- current-HR profile creates: 5;
- certification creates: 77;
- visits: 616;
- liquidation controls: 572;
- **total: 1,406**.

HOLD fuera del write autorizado:
- tenant update: 1;
- existing profile updates: 22;
- legacy profile holds: 7;
- certification hold: 1;
- `AGOSTO 26 HN`;
- payments/lots.

Idempotencia offline PASS. `executeAllowed=false`. Data writes=0.

### 5.7 Financial overlay
R14C conserva 247 filas, 196 enlaces financieros exactos por `visitId` y 51 reviews. Su contrato histórico contiene `shoppers=210`, por lo que no se fuerza sobre la HR actual de 208. La evidencia financiera se preserva por `visitId` para el write exacto sin reactivar el shopper-gap stale.

## 6. Corte 5 — materialización DEV incremental

Siguiente gate único: **autorización explícita de los grupos exactos del R17N FINAL**.

Alcance permitido si Paula autoriza:
- 16 foundation;
- 120 perfiles legacy reales;
- 5 perfiles desde HR viva con relectura de identidad en memoria;
- 77 certificaciones;
- 616 visitas HR current through July;
- 572 controles de liquidación;
- total 1,406 operaciones máximo.

Fuera de alcance: tenant update, 22 existing updates, 7 legacy holds, 1 cert hold, deletes, pagos, Agosto HN, Auth changes, Storage, HR writes, deploy, merge, producción.

Después: provider compare/idempotencia post-write + smoke `CX.data` canónico + verificación identidad real/RBAC.

## 7. Corte 6 — Auth/RBAC

Reutilizar Auth DEV existente cuando corresponda; claims por persona/rol/tenant/project/country. Proteger datos sensibles por rol/Rules. No importar Auth legacy a ciegas.

## 8. Corte 7 — sincronización/evidencias

HR→plataforma y plataforma→HR con llaves estables, reviewQueue, cuestionario configurable, evidencias protegidas; Make/Gemini solo con gates.

## 9. Corte 8 — cutover

- smoke integral y rollback preparados;
- refresh final delta si aplica;
- Hosting público Firebase `tya-plataforma`;
- desplegar CXOrbia sobre la URL actual usada por shoppers;
- no cambiar URL pública;
- autorización específica antes de deploy/producción.

## 10. Claude/prototipo

No nueva candidata ni P0 frontend actual. Después del write/smoke, validar identidad real visible por rol y ausencia de duplicados/ref placeholders. Backlog P1/P2 permanece.

## 11. Academia

Documentar frescura de fuente, snapshot vs verdad viva, identidad real vs sanitización de evidencia, crosswalk transaccional, no-name-only merge, idempotencia y cutover con rollback.

## 12. Estado seguro

PR #7 draft/open/no merge. Firestore/Auth/Storage/HR/legacy writes=0; deletes=0; deploy=0; producción=false; pagos/lotes/Make/Gemini=0 hasta autorización específica.
