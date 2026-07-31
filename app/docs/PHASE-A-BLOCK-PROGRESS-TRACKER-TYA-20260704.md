# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_PROFILE_WRITE_PASS__C6_STABLE_COMPOSER_LOCAL_3X_PASS__PENDING_HOSTING_DEV`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406;616 visitas;572 liquidaciones;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.
- Finanzas/pagos canónicos source-safe preservados.

## 2. Regresión C6 reproducida
Visual anterior:88→44 visitas, badge1,232/546, scroll movido, shoppers duplicados, perfil/histórico fragmentado y comparativo incompleto.

HR read-only verificada:30 tabs/28 mensuales; julio34 GT+10 HN; sin agosto 2026. El P0 fue de composición.

## 3. Root fix estable — CODE PASS
Aplicado en rama viva:
- composer puro/idempotente `tya-cumulative-read-model.js`;
- full visual usa baseline HR inmutable por revision;
- no append protected visits;
- crosswalk por evidencia técnica exacta;
- HR mantiene estado operacional;
- watcher revision-gated y preserva UI state;
- módulos/core frontend intactos.

## 4. Regression gate local — PASS
`PASS_C6_STABLE_COMPOSER_3X_IDEMPOTENCE`:
- reapply1=616 visitas/208 shoppers;
- reapply2=616/208;
- reapply3=616/208;
- duplicateVisitKeys0;
- duplicateShopperIds0;
- protectedVisitsAppended0;
- visit/shopper IDs estables;
- HR state preservado;
- profile overlay visible.

CI remoto no ejecutado; evidencia local declarada explícitamente.

## 5. Lock permanente
Activo `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`. Toda etapa futura hereda el regression gate.

## 6. 31 identity HOLD
No resueltos por llaves estables. No usar nombre/teléfono/email.

## 7. Claude/Academia
- Claude/prototipo: consumir el read model estable, no reconstruir fuentes/estados en módulos.
- Academia: ownership, idempotencia, revision gate, crosswalk y refresh sin interrumpir al usuario. Ver `ACADEMIA-IMPACTO-C6-STABLE-COMPOSER-ROOT-FIX-20260731.md`.

## 8. Gate pendiente
Código todavía no desplegado. Autorización Hosting anterior consumida.

Siguiente acción autorizable: exactamente `1x redeploy Hosting DEV existente cxorbia-backend-dev/cxorbia-dev`; Cloud Run0. Después remote smoke + human visual3x refresh + Dashboard/Shopper/histórico/comparativo/Beneficios/Finanzas.

## 9. Siguiente bloque
`1x HOSTING DEV AUTORIZADO → REMOTE/HUMAN REGRESSION PASS → FREEZE C6 → AGOSTO`.

## 10. Estado seguro
Provider/data writes0; Hosting0; Cloud Run0; merge=false; producción=false.
