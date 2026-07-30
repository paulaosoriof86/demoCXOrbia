# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN__CANONICAL_BACKEND_RECOVERED__CURRENT_HR_208_REFS__IDENTITY_208_OF_208_READY__R17N_FINAL_1406_NO_EXECUTE__NO_DATA_WRITES__NO_PRODUCTION`

## 1. Repositorio
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción/merge/imports/pagos/provider data writes: 0 en el bloque vigente.

## 2. Lectura obligatoria vigente
1. este índice;
2. `ADDENDUM-CORRECCION-ARQUITECTURA-LEGACY-VS-CXORBIA-BACKEND-DEV-20260729.md`;
3. reglas maestras + addenda de empalme/carril;
4. addenda de Academia, patrones y antidesvío;
5. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. `ADDENDUM-IDENTIDAD-REAL-SHOPPER-PII-SOURCE-SAFE-VS-PLATAFORMA-20260729.md`;
8. `CAMBIOS-BACKEND-ADDENDUM-R17N-FINAL-CURRENT-HR-IDENTIDAD-20260730.md`;
9. `evidence/CURRENT-HR-THROUGH-JULY-SOURCE-SAFE-LATEST.json`;
10. `evidence/VISIT-IDENTITY-CROSSWALK-READONLY-LATEST.json`;
11. `evidence/CURRENT-UNRESOLVED-SHOPPER-IDENTITY-READONLY-LATEST.json`;
12. `evidence/LEGACY-SHOPPERS-CERTIFICATIONS-REFRESH-LATEST.json`;
13. `evidence/LEGACY-EXISTING-PROFILE-FIELD-DIFF-READONLY-LATEST.json`;
14. `evidence/R17N-FINAL-WRITE-PLAN-NO-EXECUTE-LATEST.json`;
15. CAMBIOS/Claude/PENDIENTES/Academia más recientes;
16. baseline Corte 3, PR #7 y HEAD vivo.

Prevalece: `cxorbia-backend-dev` NO es legacy y la fuente operativa de visitas es la HR viva, no un snapshot histórico.

## 3. Arquitectura vinculante
- Legacy actual: Firebase `tya-plataforma`; a retirar, solo fuente de datos útiles y Hosting/URL pública a preservar.
- Backend canónico: `cxorbia-backend-dev`; reutilizar.
- Sandbox `cxorbia-tya-dev-260729-c4`: no destino.
- No crear otra base Firebase.
- Proyecto padre `cinepolis`; meses=periodos.

## 4. Corte 3 — FROZEN
`CXORBIA-TYA-CORTE3-V182-20260729`: 14 periodos / 616 visitas hasta julio; mayo 44 pagadas; junio 2 pagadas / 42 pendientes. P1/P2 reportes/copy no reabren.

## 5. Backend canónico / HR viva
Inventario `cxorbia-backend-dev`: Auth 17, projects 29, visits 619, questionnaires 557, shoppers 215, liquidations 255, shopperBenefits 572, certifications 0.

HR viva completa: 15 periodos / 684 visitas; Agosto HN sigue HOLD por país/tab inconsistente.

Proyección **actual hasta julio** source-safe:
- 14 periodos;
- 616 visitas;
- 208 refs shopper;
- snapshot anterior: 210 refs;
- delta de frescura: +2 / -4 / 206 intersección;
- PII=0; writes=0.

Por tanto, toda documentación de 210 refs/9 pendientes queda histórica y no debe reactivar ese set.

## 6. Legacy shoppers/certificaciones — READ-ONLY PASS
Lectura directa de `tya-plataforma`, nodo `tya_shoppers_extra`:
- 149 shoppers únicos;
- 120 legacy profile create-candidates;
- 22 stable-linked existing con updates HOLD;
- 7 legacy profile HOLD;
- 78 certificaciones útiles;
- 77 create-candidates +1 HOLD;
- PII cruda en repo=0.

## 7. Identidad real — política vinculante
`source-safe` protege repo/log/evidencia; no anonimiza el producto. Admin/Operativo debe ver identidad real conforme RBAC/Rules. Nombre puede ser visible, pero nunca es llave única de automerge.

## 8. Crosswalk actual — PASS
Contra HR actual hasta julio:
- 208 refs;
- 201 → shopper canónico existente;
- 7 sin match transaccional inicial;
- 0 conflictos;
- 571/616 visitas con evidencia exacta por visita;
- 45 sin evidencia transaccional exacta.

Reconciliación real de las 7:
- 7/7 identidad presente en HR viva;
- 2 → legacy profile create-candidate;
- 5 → profile create-candidate desde identidad HR viva;
- 0 HOLD de identidad actual.

## 9. R17N FINAL — PASS / NO EXECUTE
Target `cxorbia-backend-dev` / tenant `tya` / project `cinepolis`.

- identidad: 208/208 refs ready;
- 201 reuse existing +2 legacy-create link +5 HR-current create;
- foundation 16;
- legacy profile creates 120;
- HR-current profile creates 5;
- certification creates 77;
- visits 616;
- liquidation controls 572;
- **exactReadyWrites=1,406**;
- idempotencia offline PASS;
- `executeAllowed=false`;
- data writes ejecutados=0.

HOLD fuera del write: tenant1, existing-profile updates22, legacy profile holds7, certification hold1, Agosto HN, deletes/pagos.

## 10. Financial overlay
R14C preservado: 247 filas, 196 links exactos por `visitId`, 51 reviews. Su contrato histórico tiene shoppers=210 y no se fuerza sobre la fuente actual de 208; se conservará la evidencia financiera por visitId en la ejecución exacta.

## 11. Gate vivo único
`AUTORIZACIÓN EXACTA DE 1,406 WRITES DEV POR GRUPOS → MATERIALIZACIÓN IDEMPOTENTE EN cxorbia-backend-dev → POST-COMPARE/SMOKE CX.data + IDENTIDAD REAL → CORTE 6 AUTH/RBAC → CORTE 7 SYNC/EVIDENCIAS → CORTE 8 CUTOVER EN tya-plataforma`.

Fuera de la autorización: tenant update, 22 updates conflictivos, 7 legacy holds, 1 cert hold, deletes, pagos, Agosto HN, Auth/Storage/HR writes, deploy, merge, producción.

## 12. Claude/Academia
- Claude: no nueva candidata ni P0 actual; validar identidad real solo después del smoke backend.
- Academia: fuente viva vs snapshot, privacidad técnica vs identidad operativa, stable-key crosswalk, fail-closed e idempotencia.
