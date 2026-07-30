# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `CORTE3_FROZEN__CANONICAL_BACKEND_RECOVERED__CURRENT_HR_208_REFS__IDENTITY_208_OF_208_READY__R17N_FINAL_1406_NO_EXECUTE__NO_DATA_WRITES__NO_PRODUCTION`

## 1. Repositorio y seguridad
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Firestore/Auth/Storage/HR/legacy writes=0; deletes=0; deploy=0; producción=false; merge=false.

## 2. Arquitectura vinculante
- Legacy actual: Firebase `tya-plataforma`; a retirar; fuente de datos útiles y Hosting/URL pública a conservar.
- `cxorbia-backend-dev`: backend DEV canónico; reutilizar.
- `cxorbia-tya-dev-260729-c4`: sandbox técnico; no destino.
- No nueva base Firebase.

## 3. Corte 3 — FROZEN
`CXORBIA-TYA-CORTE3-V182-20260729`: 14 periodos / 616 visitas hasta julio. Mayo 44 pagadas; junio 2 pagadas / 42 pendientes. No V183/R33.

## 4. Backend canónico
Read-only `cxorbia-backend-dev`: Auth 17, projects 29, visits 619, questionnaires 557, shoppers 215, liquidations 255, shopperBenefits 572, certifications 0.

Topología previa preservada para rollback; no deletes de pilotos/overages por rutina.

## 5. Legacy shoppers/certificaciones — PASS
Read-only directo contra `tya-plataforma/tya_shoppers_extra`:
- 149 shoppers únicos;
- 120 legacy profile create-candidates;
- 22 stable-linked existing con posibles updates en HOLD;
- 7 legacy profile HOLD;
- 78 certificaciones útiles;
- 77 certification create-candidates +1 HOLD;
- PII cruda en GitHub=0.

## 6. Fuente HR actual — corrección de frescura
El snapshot source-safe del 13-jul con 210 refs quedó superado.

Fuente viva actual hasta julio:
- 14 periodos;
- 616 visitas;
- 208 refs shopper;
- vs snapshot viejo: +2 / -4 / 206 intersección;
- PII=0; writes=0.

La HR completa ya contiene agosto, pero `AGOSTO 26 HN` permanece HOLD por país/tab inconsistente. Agosto no entra al write actual.

## 7. Identidad shopper actual
Crosswalk exacto con visitas existentes:
- 208 refs actuales;
- 201 resueltas hacia shopper canónico existente;
- 7 sin match transaccional inicial;
- 0 conflictos;
- 571 visitas con match exacto; 45 sin evidencia histórica exacta.

Reconciliación real read-only de las 7:
- 7/7 identidad real presente en HR viva;
- 2 → perfil legacy create-candidate;
- 5 → perfil create-candidate desde HR actual;
- 0 HOLD de identidad actual;
- raw PII en GitHub=0.

Regla: identidad real debe existir en plataforma autorizada; nombre no se usa como única llave de automerge.

## 8. R17N FINAL — PASS / NO EXECUTE
Evidencia: `evidence/R17N-FINAL-WRITE-PLAN-NO-EXECUTE-LATEST.json`.

Identity resolution:
- total refs 208;
- reuse existing 201;
- link legacy create 2;
- HR-current create 5;
- hold 0;
- ready 208.

Grupos ready:
- foundation 16;
- legacy profile creates 120;
- HR-current profile creates 5;
- certification creates 77;
- visits 616;
- liquidation controls 572;
- **total exactReadyWrites = 1,406**.

HOLD/excluido:
- tenant update 1;
- existing-profile updates 22;
- legacy profile holds 7;
- certification hold 1;
- Agosto HN;
- deletes;
- pagos/lotes;
- Auth/Storage/HR writes;
- deploy/merge/producción.

Idempotencia offline PASS. `executeAllowed=false`. Writes autorizados/ejecutados=0.

## 9. Gate/hardening corregido
- El workflow offline ahora publica estado por `job.status`, no por presencia de artefacto previo.
- Se corrigió el validador de `hrImports` al path real bajo proyecto.
- R14C financiero viejo conserva shoppers=210; no se fuerza. Se preservan 247 filas, 196 links exactos por visitId y 51 reviews para la ejecución exacta sin reintroducir el snapshot stale.

## 10. Siguiente bloque exacto
`AUTORIZACIÓN DE 1,406 WRITES DEV POR GRUPOS → MATERIALIZACIÓN IDEMPOTENTE EN cxorbia-backend-dev → POST-COMPARE + SMOKE CX.data/IDENTIDAD REAL → CORTE 6 AUTH/RBAC → CORTE 7 SYNC/EVIDENCIAS → CORTE 8 CUTOVER tya-plataforma`.

No hace falta otro refresh general, otra base, nueva candidata ni nuevo Hosting de prueba antes de este gate.

## 11. Claude/Academia
- Claude: no nueva candidata; intervención solo si smoke posterior demuestra P0 o para backlog P1/P2.
- Academia: snapshot vs fuente viva, sanitización técnica vs identidad operativa, crosswalk transaccional, fail-closed e idempotencia.

## 12. Estado seguro
Sin data writes, import real, deploy, merge, producción, pagos/lotes, Make ni Gemini.
