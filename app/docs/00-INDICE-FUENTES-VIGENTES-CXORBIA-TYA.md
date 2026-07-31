# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_IDENTITY_PROTECTED_PASS__AUGUST_PROVIDER_TABS_MISSING__GVIZ_PHANTOM_FIXED__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV: `cxorbia-backend-dev`.
- Hosting DEV: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar sin gate de producción.
- No crear Firebase, Hosting, rama, PR o candidata por rutina.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda vigentes;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CAMBIOS-BACKEND-ADDENDUM-C6-PROTECTED-IDENTITY-READONLY-PASS-20260730.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-AUGUST-READONLY-DELTA-20260730.md`;
7. `backend/config/tya-live-hr-tab-registry.source-safe.json`;
8. `evidence/LIVE-HR-CURRENT-RECONCILIATION-LATEST.json`;
9. `evidence/AUGUST-DELTA-READONLY-PLAN-LATEST.json`;
10. `evidence/CORTE6-PROTECTED-SHOPPER-IDENTITY-READONLY-LATEST.json`;
11. `evidence/CORTE6-CREDENTIAL-IMPORT-LATEST.json`;
12. `evidence/CORTE6-FIRESTORE-RULES-DEPLOY-LATEST.json`;
13. `RESUMEN-PARA-CLAUDE.md`;
14. `PENDIENTES-PROTOTIPO.md`;
15. tracker/plan Phase A, Academia y PR #7.

## 3. Baseline protegida — no reabrir
- Corte3 FROZEN `CXORBIA-TYA-CORTE3-V182-20260729`.
- R17N FINAL1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones.
- Corte5 CX.data: `cinepolis`,14 periodos,616 visitas,currentPeriod `2026-07`,Firestore/fallback=false PASS.
- Auth legacy91/91; claims5/5; Rules PASS.

## 4. Corte6 identidad — PASS
- Auto-entry Admin observado funcionando.
- Source-safe público puede enmascarar nombres.
- Firestore protegido: shoppers340/340 con nombre real; visitas616/616 con nombre real; placeholders0; perfiles referenciados194/194; Rules/adapter PASS.
- GitHub: `PASS_C6_PROTECTED_IDENTITY_READONLY`.

## 5. Agosto — causa raíz vigente
Metadata real de Google Sheets confirmó que el workbook `HR Guatemala - Sincronizacion Google Sheets` tiene tabs mensuales solo hasta `JULIO 26` / `JULIO 26 HN`.

**No existen `AGOSTO 26` ni `AGOSTO 26 HN`.**

La evidencia anterior que aparentaba GT34/HN34 provenía de una falla metodológica: GViz puede devolver otra hoja cuando se consulta un tab inexistente. Se corrigió con registro de tabs observado directamente del provider y enforcement fail-closed.

Re-read final:
- periodos reales14;
- tabs mensuales reales28;
- visitas616;
- agosto GT0/HN0;
- `AGOSTO 26` y `AGOSTO 26 HN` rechazados como tabs fantasma;
- Firestore periodo2026-08 inexistente;
- delta agosto0.

Planner final: `HOLD_AUGUST_REQUIRED_PROVIDER_TABS_MISSING` / `SOURCE_TABS_MISSING`.

## 6. Regla fail-closed
No fabricar agosto copiando julio, no aceptar GViz como prueba de existencia del tab y no escribir Firestore sin fuente real autorizada. Cuando existan los tabs reales, primero se refresca metadata/source-safe y luego se valida país/estado/mapping.

## 7. Gate vivo único
`FUENTE AUTORIZADA AGOSTO DISPONIBLE EN HR → REFRESH PROVIDER METADATA + SOURCE-SAFE → VALIDAR GT/HN/ESTADOS → DELTA PLAN EXACTO → AUTORIZACIÓN WRITE SOLO DELTA`.

Después: `READBACK/SMOKE → PREPROD PROTEGIDA CON IDENTIDAD REAL → CUTOVER tya-plataforma`.

## 8. Estado seguro
Producción no tocada. PR#7 draft/open/no merge. Histórico/Auth91/Rules/CX.data preservados. Bloques identidad/agosto: provider reads y repo/docs; HR/Firestore/Auth/Rules/Hosting/Storage/legacy/payments/Functions/Make/Gemini writes0; PII exportada0.