# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-24  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V174_ACTIVE_BASELINE_CORTE3_HOSTING_DEV_AUTHORIZED_PENDING_EXACT_REQUEST_NO_PRODUCTION`

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
7. `app/docs/VALIDACION-VISUAL-V174-APROBADA-CON-PENDIENTES-P1-P2-20260723.md`.
8. `app/docs/CORTE3-FINANCIAL-RECONCILIATION-R20-TECHNICAL-PASS-20260723.md`.
9. `app/docs/CORTE3-CANONICAL-FINANCE-SNAPSHOT-ADAPTER-R23-20260723.md`.
10. `app/docs/CORTE3-CANONICAL-FINANCE-UI-EXPORT-R23-TECHNICAL-PASS-20260724.md`.
11. `app/docs/CORTE3-HOSTING-DEV-AUTORIZACION-Y-PREFLIGHT-20260724.md`.
12. `app/docs/CAMBIOS-BACKEND-ADDENDUM-CORTE3-UI-EXPORT-R23-PASS-20260724.md`.
13. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE3-UI-EXPORT-R23-PASS-20260724.md`.
14. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-CORTE3-UI-EXPORT-R23-PASS-20260724.md`.
15. `app/docs/ACADEMIA-IMPACTO-CORTE3-FINANZAS-UI-EXPORT-R23-20260724.md`.
16. Tracker, manifest/source lock más reciente, PR #7 y HEAD vivo.

## 3. Baseline activa preservada

- V174/M1/Corte 1/Corte 2A: PASS técnico y visual aprobado.
- Source lock visual: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- Hosting DEV vigente anterior: 14 periodos, 616 visitas y 34 GT/10 HN por periodo.
- Lectura HR source-safe, módulos V174, adapters y `CX.data`: preservados.
- No se reabren V174, Corte 1 o Corte 2A.

## 4. Corte 3 — verdad financiera canónica

- 616 visitas HR;
- 247 filas financieras;
- 209 vínculos exactos;
- 207 montos canónicos listos;
- 38 filas sin vínculo exacto;
- 79 revisiones de vínculo;
- 2 revisiones de monto;
- 37 evidencias candidatas de ledger;
- 0 pagos confirmados;
- 0 lotes.

Finanzas y Beneficios consumen la misma verdad. Pago permanece `pending_source_confirmation` hasta evidencia completa.

## 5. Gate UI/export remoto — PASS

- Perfil: `CORTE3_CANONICAL_FINANCE_UI_EXPORT_R23`.
- Target HEAD: `357cdbc73467344557c0da113262bba4f6a976fc`.
- Request commit: `f415f23eb974b664181d1f618aa47e79ac99ed94`.
- Run: `30074835544`.
- Job: `89423207982`.
- Artifact: `8589444193`.
- Digest: `sha256:06188dc26dcba0a4e0b9b6fc4119ed32ca31d38462a6e513f177ab84cdba0deb`.
- Estado observable: `cxorbia/readonly-post-gates/overall = success`.

Mayo 2026 se comprobó con 44 visitas HR y 42 filas financieras exactas. Los dos casos no exactos permanecen en revisión y no se fabrican como liquidaciones.

## 6. Hosting DEV autorizado

Paula autorizó expresamente el 2026-07-24 publicar el mismo build en Hosting DEV.

El carril queda limitado a:

- V174 + HR live source-safe + finanzas canónicas R23;
- proyecto `cxorbia-backend-dev`, target `cxorbia-dev`;
- smoke remoto y validación visual;
- cero Cloud Run deploy, producción, merge, imports, pagos o writes reales.

Archivos preparados:

- `tools/release/tya-corte3-hosting-dev-build-r24.mjs`;
- `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml`;
- solicitud aislada pendiente de activación exacta.

## 7. Pendientes no bloqueantes preservados

- responsive parcial;
- inspección visual de gráfica en PDF real;
- formato operativo del Excel real;
- etiqueta técnica `sourceAccessMode`.

## 8. Siguiente bloque exacto

`COMMIT AISLADO DE SOLICITUD AUTORIZADA → HOSTING DEV DEL MISMO BUILD → SMOKE REMOTO → VALIDACIÓN VISUAL DE PAULA → CORRECCIÓN FOCALIZADA SI APLICA → FREEZE CORTE 3`.

No iniciar Corte 4 antes del freeze.

## 9. Estado seguro

Sin Hosting nuevo todavía, merge, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Cloud Run deploy, Make/Gemini live, lotes ni pagos.
