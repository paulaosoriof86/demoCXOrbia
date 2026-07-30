# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-30  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN__R17N_FINAL_DEV_MATERIALIZED_1406__READBACK_1406_PASS__POST_COMPARE_SMOKE_PENDING__NO_PRODUCTION`

## 1. Objetivo
Operar TyA/Cinépolis como primer tenant/proyecto configurable de CXOrbia con HR/histórico, shoppers reales, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización.

Arquitectura vinculante:
- `tya-plataforma` = legacy a retirar + Hosting/URL pública final;
- `cxorbia-backend-dev` = backend DEV canónico, reutilizado;
- sandbox C4 = no destino;
- proyecto padre `cinepolis`; meses = periodos;
- identidad real en backend/UI autorizada; source-safe solo para repo/log/evidencia.

## 2. Secuencia obligatoria
`FUENTE VIVA → INVENTARIO/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE → WRITE PLAN → DRY-RUN/IDEMPOTENCIA → WRITE EXACTO AUTORIZADO → READBACK/POST-COMPARE → SMOKE → VALIDACIÓN VISUAL → FREEZE/CUTOVER`

Para candidatas frontend continúa `EXECUTION_LANE_READY → AUDITORÍA → GO/P0 → APPLY_DELTA_DIRECTLY`.

## 3. Cortes cerrados
- M1 / Corte 1 / Corte 2A: `FROZEN/APROBADO`.
- Corte 3: `FROZEN_ACTIVE_BASELINE` en `CXORBIA-TYA-CORTE3-V182-20260729`.
- Corte 3 conserva 14 periodos / 616 visitas; mayo 44 pagadas; junio 2 pagadas /42 pendientes; no V183/R33.

## 4. Fuente actual y reconciliación
HR actual hasta julio:
- 14 periodos;
- 616 visitas;
- 208 refs shopper;
- el snapshot 210 refs / 9 pendientes quedó superado;
- Agosto HN permanece HOLD.

Identidad:
- 201 reuse canonical existing;
- 2 link a legacy create;
- 5 create desde HR actual;
- 208/208 ready; 0 HOLD actual.

Legacy:
- 149 shoppers únicos;
- 120 profile create;
- 22 stable-linked updates HOLD;
- 7 legacy HOLD;
- 78 certificaciones útiles = 77 create +1 HOLD.

## 5. Corte 4 — backend canónico / plan
R17N FINAL no-execute quedó PASS antes del write con 1,406 operaciones exactas:
- foundation 16;
- legacy profiles 120;
- HR-current profiles 5;
- certifications 77;
- visits 616;
- liquidation controls 572.

R14C preserva 247 filas financieras, 196 links exactos por `visitId` y 51 reviews. No se reactiva el snapshot shopper=210.

## 6. Corte 5 — MATERIALIZACIÓN DEV
**Estado: MATERIALIZED + READBACK PASS.**

Autorización consumida: `r17n-final-dev-20260730-01`.

Preflight final:
- 1,406 intended;
- 1,406 absent;
- 0 conflictos;
- HR identity recheck 208/208;
- 201/201 targets canónicos existentes verificados;
- 201/201 con nombre real visible;
- 0 enriquecimientos adicionales requeridos;
- 196 links financieros exactos preservados.

Write/readback:
- **1,406 Firestore writes ejecutados**;
- **1,406/1,406 readback PASS**;
- mismatch 0.

Excluido:
- tenant update 1;
- existing profile updates 22;
- legacy holds 7;
- certification hold 1;
- Agosto HN;
- deletes;
- pagos/lotes;
- Auth/Storage/HR/legacy writes;
- deploy/merge/producción.

Incidencia corregida antes de escribir: dos preflights HOLD `live_identity_207`, ambos con writes=0. Causa raíz: hash del executor colapsaba espacios internos; R20 no. Se alineó exactamente con R20 y el gate pasó 208/208 antes de ejecutar.

Evidencia: `app/docs/evidence/R17N-FINAL-DEV-MATERIALIZATION-LATEST.json`.

## 7. Siguiente bloque — post-write
`POST-COMPARE READ-ONLY → SMOKE CX.data CANÓNICO + IDENTIDAD REAL → VALIDACIÓN OPERATIVA`.

Corte 5 no se congela como operativo hasta demostrar que CX.data consume la topología canónica correcta, sin fallback demo, con identidad real y conteos esperados. Si aparece P0 reproducible se corrige focalizadamente; no se reconstruye la materialización.

## 8. Corte 6 — Auth/RBAC
Después del smoke post-write: reutilizar Auth DEV existente; claims por persona/rol/tenant/project/country; proteger PII por Rules/RBAC. No importar Auth legacy a ciegas. Cualquier Auth change requiere autorización específica.

## 9. Corte 7 — sincronización/evidencias
HR↔plataforma con stable keys, no duplicación, reviewQueue, evidencias protegidas, cuestionario configurable. Make/Gemini solo con gate y revisión humana.

## 10. Corte 8 — preproducción/cutover
- cortes previos validados;
- refresh delta final si aplica;
- rollback probado;
- smoke integral;
- cutover sobre Hosting/URL `tya-plataforma` con autorización específica;
- no cambiar URL pública.

## 11. Claude/prototipo
No nueva candidata. No reabrir V182. Claude interviene únicamente ante P0 frontend reproducible post-smoke o en backlog P1/P2. Backend no parchea módulos UI.

## 12. Academia
Actualizar manuales/cursos/rutas con: fuente viva vs snapshot, identidad operativa vs source-safe, preflight fail-closed, write idempotente, readback, liquidación ≠ pago y RBAC posterior.

## 13. Estado seguro
Firestore writes autorizados ejecutados: 1,406. Auth/Storage/HR/legacy writes=0; deletes=0; pagos/lotes=0; deploy=0; merge=false; producción=false; Make/Gemini=0.
