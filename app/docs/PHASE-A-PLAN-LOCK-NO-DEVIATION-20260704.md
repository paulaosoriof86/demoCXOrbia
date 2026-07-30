# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-30  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN__R17N_FINAL_DEV_MATERIALIZED_1406__C5_CXDATA_TECH_PASS__EXISTING_HOSTING_VISUAL_AUTH_PREREQUISITE__DEPLOY0__NO_PRODUCTION`

## 1. Objetivo
Operar TyA/Cinépolis como primer tenant/proyecto configurable de CXOrbia con HR/histórico, shoppers reales, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización.

Arquitectura vinculante:
- `tya-plataforma` = legacy a retirar + Hosting/URL pública final;
- `cxorbia-backend-dev` = backend DEV canónico, reutilizado;
- Hosting DEV de visualización existente = `cxorbia-backend-dev.web.app`, target `cxorbia-dev`;
- sandbox C4 = no destino;
- proyecto padre `cinepolis`; meses = periodos;
- identidad real en backend/UI autorizada; source-safe solo para repo/log/evidencia;
- no crear otro Firebase/Hosting por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA → INVENTARIO/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE → WRITE PLAN → DRY-RUN/IDEMPOTENCIA → WRITE EXACTO AUTORIZADO → READBACK/POST-COMPARE → SMOKE → AUTH/RBAC SI ES PREREQUISITO DE PII REAL → VALIDACIÓN OPERATIVA → FREEZE/CUTOVER`

Para candidatas frontend continúa `EXECUTION_LANE_READY → AUDITORÍA → GO/P0 → APPLY_DELTA_DIRECTLY`.

## 3. Cortes cerrados
- M1 / Corte 1 / Corte 2A: `FROZEN/APROBADO`.
- Corte 3: `FROZEN_ACTIVE_BASELINE` en `CXORBIA-TYA-CORTE3-V182-20260729`.
- Corte 3 conserva 14 periodos /616 visitas; mayo 44 pagadas; junio 2 pagadas /42 pendientes; no V183/R33.

## 4. Fuente actual y reconciliación
HR actual hasta julio: 14 periodos, 616 visitas, 208 refs shopper; snapshot 210 refs histórico; Agosto HN HOLD.

Identidad: 208/208 refs ready; resuelven a 194 perfiles canónicos únicos según mapping estable; no se deduplica por nombre.

Legacy: 149 shoppers únicos; 120 profile create materializados; 22 stable-linked updates HOLD; 7 legacy HOLD; 78 certificaciones útiles =77 materializadas +1 HOLD.

R14C preserva 247 filas financieras, 196 links exactos por `visitId` y 51 reviews. No se reactiva snapshot shopper=210.

## 5. Corte 5 — MATERIALIZACIÓN DEV
**Estado de write: MATERIALIZED + READBACK PASS. Estado técnico del consumidor: PASS. Estado visual: bloqueado únicamente por prerequisito de Auth seguro; deploy no consumido.**

Autorización consumida: `r17n-final-dev-20260730-01`.

Preflight/write:
- 1,406 intended /1,406 absent /0 conflictos;
- HR identity recheck 208/208;
- 201/201 targets existentes con nombre real visible;
- 196 links financieros exactos;
- **1,406 Firestore writes**;
- **1,406/1,406 readback PASS**;
- mismatch 0.

Grupos: foundation16 + legacy profiles120 + HR-current profiles5 + certifications77 + visits616 + liquidation controls572.

Fuera: tenant update1, existing updates22, legacy holds7, cert hold1, Agosto HN, deletes, pagos/lotes, Auth/Storage/HR/legacy writes, merge/producción.

## 6. Post-write provider compare + identidad
Provider/identity permanece PASS:
- 1,406/1,406 rutas presentes;
- missing/auth drift/production drift =0/0/0;
- canonical project `cinepolis` presente;
- 14 periodos, 616 visitas, 572 controles, 77 certificaciones;
- payments/lots 0/0;
- 208/208 refs y 194/194 targets canónicos esperados;
- 616/616 visitas con identidad real y target válido;
- 194/194 perfiles referenciados con nombre real;
- 77/77 certificaciones con shopper válido;
- placeholders demo 0.

## 7. P0 Corte 5 — modelo de periodos CX.data — RESUELTO
P0 histórico: `P0_PROVEN_C5_CXDATA_PERIOD_MODEL_MISMATCH`.

Causa raíz:
- el adapter construía periodos desde `tenants/tya/projects`;
- no leía la subcolección canónica `projects/<projectId>/periods`;
- podía conservar `currentPeriodId` stale/no canónico.

Corrección autorizada:
- `app/core/backend-firebase.js` commit `96cb7601559a76595d6203724a4bcf2d0b35b390`;
- periodos ahora se leen desde la subcolección canónica del proyecto activo;
- project docs ya no se convierten en periodos;
- currentPeriodId se conserva solo si es canónico; si no, se usa el periodo activo/último.

## 8. Re-smoke read-only — PASS
Run final `30544595440`; artifact `8760141578`; digest `sha256:337c4e8b07786effea5c326c77dfb31f9edc2fa49e09d7e46e18fa4c8dacbc98`.

CX.data exacto:
- source `firestore`;
- fallback `false`;
- interfaz preservada;
- projects=1;
- periods=14;
- visits=616;
- currentProjectId=`cinepolis`;
- currentPeriodId=`2026-07`;
- period IDs adapter = canonical period IDs;
- read-only/writeMode disabled;
- blockers 0.

El primer intento post-fix `30544254033` devolvió periods=0 por omisión del snapshot QA en memoria, no por proveedor/runtime. El harness fue corregido en `21ce464772bfe6543b3672ad4b6d7deafd564adc` para incluir los 14 periodos ya leídos del proveedor; sin data writes.

## 9. Preflight del Hosting DEV existente
Paula autorizó un único redeploy sobre **el Hosting DEV ya existente**.

Verificación:
- `.firebaserc`: project `cxorbia-backend-dev`, target `cxorbia-dev`, site `cxorbia-backend-dev`;
- new Hosting=false;
- new Firebase project=false;
- request one-shot registrado;
- Hosting deploy ejecutado=0;
- autorización de Hosting no consumida.

Fail-closed antes del deploy:
- las reglas Firestore requieren `request.auth` y claims de rol/tenant para leer datos reales;
- el entrypoint backend DEV necesita una sesión Firebase Auth para el preview protegido;
- el login visible actual de la UI selecciona perfiles/roles pero no autentica ante Firebase;
- la autorización vigente excluye Auth writes y Rules deploy;
- no se permite publicar passwords, custom tokens, ID tokens, service accounts ni PII en JS/URL/Hosting.

Por tanto, desplegar ahora no validaría la app real de forma segura. El único redeploy queda reservado y no consumido.

## 10. Gate actual
Estado: `CORTE5_TECHNICAL_PASS__VISUAL_BLOCKED_BY_SECURE_AUTH_PREREQUISITE__DEPLOY_NOT_CONSUMED`.

Siguiente secuencia exacta:
`CORTE6 AUTH/RBAC PREPARATION READ-ONLY/OFFLINE → RECONCILIAR AUTH EXISTENTE + CLAIM TAXONOMY + LOGIN SEGURO → autorización específica solo para cambios Auth/Rules mínimos → REUTILIZAR EL MISMO HOSTING DEV + el redeploy ya autorizado → VALIDACIÓN VISUAL/OPERATIVA CON DATOS REALES → FREEZE`.

No repetir materialización. No nueva base/candidata/rama/PR/Hosting. No parche UI inseguro. El Hosting público final `tya-plataforma` todavía no se toca.

## 11. Corte 6 — Auth/RBAC
Auth/RBAC deja de ser una actividad posterior abstracta y pasa a ser **prerequisito técnico de la validación visual con PII real**.

Reglas:
- reutilizar Auth DEV existente cuando las identidades sean válidas;
- no importar Auth legacy a ciegas;
- claims por persona/rol/tenant/project/country;
- proteger PII por Rules/RBAC;
- selector de rol visual no equivale a autenticación;
- ningún cambio Auth/Rules se ejecuta sin autorización específica;
- no pedir otra autorización de Hosting mientras el redeploy siga 0/1.

## 12. Corte 7 — sincronización/evidencias
HR↔plataforma con stable keys, no duplicación, reviewQueue, evidencias protegidas y cuestionario configurable. Make/Gemini solo con gate y revisión humana.

## 13. Corte 8 — preproducción/cutover
Cortes previos congelados, refresh delta final si aplica, rollback probado, smoke integral y cutover sobre Hosting/URL `tya-plataforma` con autorización específica; no cambiar URL pública.

## 14. Claude/prototipo
No nueva candidata. No reabrir V182. El login real/Auth debe incorporarse de manera compatible con el prototipo; no hardcodear credenciales ni simular Auth mediante selección de rol. Claude interviene con tarea focalizada o ante P0 frontend reproducible.

## 15. Academia
Actualizar manuales/cursos/rutas con: fuente viva vs snapshot, referencia HR vs perfil canónico, identidad operativa vs source-safe, proyecto padre vs periodo, autenticación vs selección de rol, readback vs consumidor runtime, materialización/readback y liquidación ≠ pago.

## 16. Estado seguro
R17N: 1,406 Firestore writes autorizados ya ejecutados. Bloque actual: Hosting deploy=0; Firestore/Auth/Storage/HR/legacy writes=0; Rules/Functions deploy=0; deletes=0; pagos/lotes=0; merge=false; producción=false; Make/Gemini=0; PII cruda repo/artifacts=0.
