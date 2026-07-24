# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-24  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V174_ACTIVE_BASELINE_CORTE3_HOSTING_DEV_DEPLOYED_REMOTE_LIVE_SMOKE_PENDING_NO_PRODUCTION`

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
12. `app/docs/CORTE3-HOSTING-DEV-PREFLIGHT-HOLD-ROOT-CAUSE-20260724.md`.
13. `app/docs/CORTE3-HOSTING-DEV-REMOTE-SMOKE-HOLD-ROOT-CAUSE-20260724.md`.
14. `app/docs/CAMBIOS-BACKEND-ADDENDUM-CORTE3-UI-EXPORT-R23-PASS-20260724.md`.
15. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE3-UI-EXPORT-R23-PASS-20260724.md`.
16. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-CORTE3-UI-EXPORT-R23-PASS-20260724.md`.
17. `app/docs/ACADEMIA-IMPACTO-CORTE3-FINANZAS-UI-EXPORT-R23-20260724.md`.
18. Tracker, manifest/source lock más reciente, PR #7 y HEAD vivo.

## 3. Baseline activa preservada

- V174/M1/Corte 1/Corte 2A: PASS técnico y visual aprobado.
- Source lock visual: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- Lectura HR source-safe, módulos V174, adapters y `CX.data`: preservados.
- Gate R24: 1890/1895 archivos del manifest exactos; los cinco drifts permitidos son documentación viva y `app/index-backend-dev.html`; 0 drift funcional prohibido.
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

## 5. Gate UI/export técnico — PASS

- Perfil: `CORTE3_CANONICAL_FINANCE_UI_EXPORT_R23`.
- Target HEAD: `357cdbc73467344557c0da113262bba4f6a976fc`.
- Request commit: `f415f23eb974b664181d1f618aa47e79ac99ed94`.
- Run: `30074835544`.
- Job: `89423207982`.
- Artifact: `8589444193`.
- Digest: `sha256:06188dc26dcba0a4e0b9b6fc4119ed32ca31d38462a6e513f177ab84cdba0deb`.
- Estado observable: `PASS_READONLY_POST_GATES`.

## 6. Hosting DEV — desplegado

La autorización de Paula fue consumida para publicar el mismo build en:

- proyecto `cxorbia-backend-dev`;
- target `cxorbia-dev`;
- URL `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible&fresh=1`.

Evidencia del deploy:

- run `30098823043`;
- job `89499452079`;
- artifact `8598747476`;
- digest `sha256:88d201f834ce1237384de5c916f8cce65442e4255a710e58a9ade64e3707b016`;
- step `Deploy Hosting DEV only`: success;
- build-lock remoto: coincide;
- endpoint HR remoto: 14 periodos y 616 visitas;
- snapshot y adapter financiero remoto: ready;
- Cloud Run deploy: 0.

El run terminó HOLD únicamente porque el gate R23 confundía las 42 filas exactas con la colección live de 42 exactas + 2 revisiones fail-closed. El runtime no fabricó pagos ni montos canónicos.

## 7. Corrección y siguiente smoke

Se creó `tools/qa/tya-corte3-remote-live-finance-smoke-r25-gate.mjs` y el workflow existente admite `executionMode=remote_smoke_only`.

La siguiente ejecución:

- no vuelve a desplegar Hosting;
- verifica los mismos bytes remotos;
- exige 44 visitas, 42 exactas y 2 revisiones fail-closed;
- exige 0 pagos, 0 lotes y 0 diferencias de monto;
- valida Finanzas, Beneficios y export spec.

## 8. Pendientes no bloqueantes preservados

- responsive parcial;
- inspección visual de gráfica en PDF real;
- formato operativo del Excel real;
- etiqueta técnica `sourceAccessMode`.

## 9. Siguiente bloque exacto

`SOLICITUD AISLADA REMOTE_SMOKE_ONLY → SMOKE REMOTO R25 → VALIDACIÓN VISUAL DE PAULA → CORRECCIÓN FOCALIZADA SI APLICA → FREEZE CORTE 3`.

No iniciar Corte 4 antes del freeze.

## 10. Estado seguro

Hosting DEV actualizado; sin producción, merge, Cloud Run deploy, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, lotes ni pagos.
