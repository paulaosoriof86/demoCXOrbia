# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__C5_DEV_MATERIALIZED_1406_CXDATA_PASS__C6_AUTH_READONLY_RECONCILED_PROVIDER_DELTA_PREPARED_NO_EXECUTE__HOSTING0OF1_RESERVED`

## 1. Estado general
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Baseline frontend `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- Backend DEV canónico `cxorbia-backend-dev`.
- Hosting DEV existente `cxorbia-backend-dev.web.app`, target `cxorbia-dev`.
- Hosting público final futuro `tya-plataforma`.
- No nueva candidata/base/rama/PR/Hosting.

## 2. Bloques cerrados
### Corte 1 / 2A / 3
FROZEN/APROBADO. Corte 3: 14 periodos/616 visitas, mayo 44 pagadas, junio 2 pagadas/42 pendientes.

### Corte 4 — preparación/mapping
CERRADO para materialización: HR hasta julio, 208/208 refs, 194 perfiles canónicos, 77 certificaciones, write plan idempotente.

### Corte 5 — materialización DEV + CX.data
- 1,406/1,406 Firestore writes y 1,406/1,406 readback; mismatch 0.
- 616 visitas, 572 controles de liquidación, 77 certificaciones.
- P0 proyecto/periodo corregido focalmente.
- Re-smoke final PASS: source=firestore, fallback=false, projects1, periods14, visits616, currentProjectId=`cinepolis`, currentPeriodId=`2026-07`, blockers0.
- No repetir materialización.

## 3. Corte 6 — Auth/RBAC
### Read-only completado
- 17 usuarios Auth activos password.
- 13 con tenant permitido.
- 7 operadores listos bajo reglas actuales.
- 2 clientes: tenant TyA sí, proyecto `cinepolis` no; ready0.
- 4 shoppers: tenant TyA sí, proyecto `cinepolis` no; 3 tienen shopperId/perfil Firestore exacto; ready0.
- scopes viejos detectados: `tya`/`tya-piloto`.
- provider writes0, PII exportada0.

### Runtime preparado
- browser Firebase Auth interactivo solo en backend DEV;
- claims como autoridad, no selector local de rol;
- consultas Firestore por principal autenticado;
- no credencial persistida;
- `firestore.rules` fuente preparada para `status` canónico + `estado` legacy en disponibles shopper;
- interfaz CX.data preservada; módulos UI intactos.

### Provider gate preparado NO EXECUTE
- máximo 5 claim writes: cliente2 + shopper3 con vínculo exacto;
- reemplazo de scope stale por `cinepolis`;
- no usuarios nuevos/password/delete;
- deploy exclusivo de `firestore.rules`;
- request `enabled=false`, `consumed=false` hasta autorización expresa.

## 4. Hosting DEV
Paula ya autorizó una ejecución al mismo Hosting DEV; sigue 0/1 y `consumed=false` porque el preflight bloqueó antes de Auth.

Regla: **no pedir otra autorización de Hosting**. Después del PASS Corte6 se consume esa autorización existente y se hace smoke real.

## 5. Agosto
- Fuente canónica materializada termina julio 2026.
- Agosto HN HOLD por inconsistencia país/tab.
- Después del smoke Auth/Hosting: refresh fuente → resolver HOLD → validar período/visitas → materializar solo delta agosto.

## 6. Siguiente bloque exacto
`AUTORIZACIÓN ÚNICA CORTE6 AUTH CLAIMS MÁX5 + FIRESTORE RULES → EJECUCIÓN/READBACK AUTH → HOSTING DEV YA AUTORIZADO → SMOKE ADMIN/OPS/CLIENTE/SHOPPER → FREEZE → AGOSTO DELTA → CORTE8 PREPROD/CUTOVER`.

## 7. Claude/prototipo
No nueva candidata. Solo tarea localizada si el smoke posterior demuestra P0 frontend reproducible. P1/P2 preservados: PDF gráfica, Excel formato, reportKit/copy.

## 8. Academia
Actualizar identidad autenticada vs selector de rol, tenant/proyecto/claims, shopperId exacto, visitas disponibles protegidas, conflicto a review y no ampliación silenciosa de permisos.

## 9. Clasificación
- `Reusable CXOrbia`: Auth browser gate, principal-scoped reads, claim migration fail-closed, status compatibility.
- `Exclusivo cliente`: TyA/Cinépolis, scopes stale y agosto.
- `Claude/prototipo`: sin tarea actual.
- `Academia`: Auth/RBAC y alcance.
- `Sin impacto Claude`: runners/requests/evidencia.

## 10. Estado seguro
R17N previo 1,406 writes ya ejecutados. Corte6 actual: Auth writes0; Firestore data writes0; Rules deploy0; Hosting deploy0; Storage/HR/legacy0; payments0; merge=false; production=false; Make/Gemini0; PII cruda0.
