# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-23  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V174_R20_M1_TECHNICAL_PASS_HOSTING_DEV_DEPLOYED_VISUAL_REVIEW_PENDING`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- `main`, nueva rama/PR y force push: prohibidos.
- Producción, merge, imports, pagos y writes reales: no ejecutados.

## 2. Lectura obligatoria

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA.md`.
3. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`.
4. Addenda vigentes de Academia, patrones reutilizables y antidesvío.
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
7. `app/docs/VALIDACION-VISUAL-Y-LOCK-ANTI-REGRESION-CORTE1-M1-20260722.md`.
8. `app/docs/AUDITORIA-CANDIDATA-V174-CORTE2A-SOURCE-LOCK-20260722.md`.
9. `app/docs/MANIFEST-V174-CORTE2A-EMPALME-DIRECTO-20260722.json`.
10. `backend/contracts/cxorbia-controlled-runners-v1.json`.
11. CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES, Academia, tracker, PR #7 y HEAD vivo.

## 3. Lock prevalente

`AUDIT_LANE_READY → AUDITED_GO → APPLY_DELTA_DIRECTLY → COMMIT/PUSH ATÓMICO → POST-GATES → HOSTING DEV → VALIDACIÓN VISUAL → FREEZE`

Carril atómico y gates controlados permanecen vigentes. No nueva candidata, reauditoría, nueva metodología ni trabajo manual para Paula mientras V174 está en revisión visual.

## 4. Source lock y technical PASS

- V174 package SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Empalme funcional: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Source-lock final: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- Aggregate: `ab11bc47dfd096cbe6a110db250c46e656c2dc9760ad832c07958b6c9a886818`.
- R20, HR in-place, histórico, reportes, proyecto/periodo/KPI, Corte 2A, M1 y verificador: PASS técnico.

## 5. Hosting DEV vigente

- URL visual: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible&fresh=1`.
- Workflow run: `30027204176`.
- Job: `89274577170`.
- Artifact: `8571796399`.
- Digest: `sha256:50ef940bb7ab52f0fac318cd23f6c4e233f4581fee0a1035c8d936abb7e42a9e`.
- Hosting deploy: SUCCESS.
- Cloud Run redeploy: no.
- Build-lock remoto: coincide con el local.
- Endpoint HR vivo: `runtimeRead=true`, `sourceSafe=true`, 14 periodos y 616 visitas.

## 6. HR remota comprobada

- 14 periodos, junio 2025–julio 2026.
- 616 visitas históricas.
- 44 visitas por periodo.
- GT 34 + HN 10 por periodo.
- Julio 2026: 44 visitas, 43 asignadas, 1 sin asignar, 29 realizadas, 28 cuestionarios, 20 submitidas y 0 pagos confirmados.

## 7. Pendiente vivo

Revisión visual focalizada por Paula. Solo un NO GO visual reproducible puede abrir corrección.

La telemetría remota de `sourceAccessMode` todavía muestra `public_gviz_csv_cache_busted`, aunque el endpoint same-origin devuelve lectura runtime source-safe fresca y los conteos correctos. Se documenta para cierre productivo y no impide la revisión visual DEV.

## 8. Siguiente bloque exacto

`PAULA ABRE HOSTING DEV → VALIDA LOGIN/ROLES/PROYECTO/PERIODO/DASHBOARD/HISTÓRICO/VISITAS/REPORTES/ACADEMIA → APROBADO O NO GO CONCRETO → FREEZE O FIX ÚNICO → PLAN DE CUTOVER PRODUCTIVO`.

## 9. Estado seguro

Sin merge, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
