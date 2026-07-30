# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_IDENTITY_PROTECTED_PASS__AUG_GT34_TECH_READY__HN_SOURCE_MISMATCH__NO_UNASSIGNED_VISITS__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV: `cxorbia-backend-dev`.
- Hosting DEV: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar sin gate específico de producción.
- No crear nuevo Firebase, Hosting, rama, PR o candidata por rutina.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes de empalme/carril, Academia, patrones y antidesvío;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CAMBIOS-BACKEND-ADDENDUM-C6-PROTECTED-IDENTITY-READONLY-PASS-20260730.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-AUGUST-READONLY-DELTA-20260730.md`;
7. `evidence/CORTE6-PROTECTED-SHOPPER-IDENTITY-READONLY-LATEST.json`;
8. `evidence/LIVE-HR-CURRENT-RECONCILIATION-LATEST.json`;
9. `evidence/LIVE-HR-COUNTRY-TAB-CONSISTENCY-LATEST.json`;
10. `evidence/AUGUST-DELTA-READONLY-PLAN-LATEST.json`;
11. `evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json`;
12. `evidence/CORTE6-FIRESTORE-RULES-DEPLOY-LATEST.json`;
13. `app/core/backend-firebase.js`;
14. `RESUMEN-PARA-CLAUDE.md`;
15. `PENDIENTES-PROTOTIPO.md`;
16. tracker/plan Phase A;
17. Academia Corte6;
18. PR #7 y HEAD vivo.

## 3. Baseline protegida — no reabrir
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL:1,406/1,406 Firestore data writes/readback; mismatch0.
- Materializado:616 visitas +572 controles liquidación +77 certificaciones + foundation/perfiles.
- Corte5 `CX.data`: `cinepolis`,14 periodos,616 visitas,currentPeriodId=`2026-07`,source=firestore,fallback=false PASS.
- Corte6 Auth import/readback91/91 PASS; no repetir/resetear.
- claims5/5 + Rules PASS.

## 4. Identidad protegida — PASS
El preview source-safe puede mostrar `Shopper protegido`; Firestore protegido no. Gate directo:
- shoppers340; nombres reales340; placeholder0;
- visitas616; nombres reales616; placeholder0;
- perfiles referenciados194/194 con nombre real;
- Rules/adapter protegidos PASS.

Estado GitHub: `PASS_C6_PROTECTED_IDENTITY_READONLY`.

## 5. Agosto — refresh real actual
La HR viva cache-busted detecta agosto, pero no está lista para publicación:
- contrato mensual esperado GT34/HN10;
- `AGOSTO 26` GT:34 filas y country mismatch0;
- `AGOSTO 26 HN`:34 filas, las34 vienen marcadas GT → `HOLD_COUNTRY_TAB_MISMATCH`;
- delta GT técnico:34 nuevas,0 existentes,28 source shopper refs mapeadas28/28 a perfiles canónicos existentes;
- periodo2026-08 aún no existe en Firestore;
- estado operativo GT: assigned34, unassigned0, scheduled34, realized34, submitted27, questionnaire7;
- `releaseReadiness=NO_UNASSIGNED_VISITS_IN_ACCEPTED_SOURCE`.

Decisión: `PASS_AUGUST_GT34_DELTA_TECH_READY__HN_HOLD_SOURCE_COUNTRY_MISMATCH`, pero **no listo para publicar visitas disponibles**.

## 6. Regla fail-closed
No convertir filas GT de la pestaña HN en HN por inferencia. No convertir visitas asignadas/realizadas en disponibles. No copiar nombres reales al source-safe. La fuente HR de agosto debe corregirse/actualizarse antes del write.

## 7. Gate vivo único
`CORREGIR/ACTUALIZAR HR AGOSTO → REFRESH READ-ONLY → EXPECT GT34/HN10 + ESTADOS PUBLICABLES → DELTA PLAN EXACTO → AUTORIZACIÓN WRITE SOLO DELTA`.

Después:
`MATERIALIZAR DELTA → READBACK/SMOKE → PREPROD PROTEGIDA CON IDENTIDAD REAL → CUTOVER tya-plataforma`.

## 8. Estado seguro
Producción no tocada. PR #7 draft/open/no merge. Histórico/Auth91/Rules/CX.data preservados. Todo el bloque agosto fue read-only: HR/Firestore/Auth/Rules/Hosting/Storage/legacy/payments/Functions/Make/Gemini writes0; PII exportada0.