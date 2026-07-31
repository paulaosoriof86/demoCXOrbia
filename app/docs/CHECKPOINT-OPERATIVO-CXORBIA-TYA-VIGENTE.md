# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_STABLE_COMPOSER_CODE_PASS__LOCAL_REGRESSION_3X_PASS__PENDING_ONE_HOSTING_DEV_AUTH__NO_PRODUCTION`

## 1. Repo/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Hosting DEV `cxorbia-backend-dev` target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N 1,406/1,406; 616 visitas + 572 controles liquidación + 77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore:120 docs/329 campos WRITE+READBACK PASS, mismatches0.
- Finanzas/pagos canónicos source-safe permanecen autoridad.

## 3. P0 humano reproducido y causa raíz
La visual anterior mostró 88→44 visitas, badge1,232/546, scroll movido, duplicados Shopper, perfil/histórico fragmentado y comparativo incompleto.

La HR canónica revalidada mantiene30 tabs/28 mensuales, sin agosto 2026, y julio=34 GT+10 HN. La causa fue composición no idempotente: el overlay reutilizaba arrays ya compuestos y podía anexar historia Firestore sobre la misma visita HR.

## 4. Root fix aplicado en rama viva
- nuevo `app/adapters/tya-cumulative-read-model.js`;
- `app/adapters/tya-dev-full-visual-bridge.js` recompone siempre desde baseline HR inmutable por revision;
- protected visits solo empatan por `hrRowId`, `sourceTab+sourceRow` o `visitId` exacto y nunca se anexan a la base HR;
- crosswalk Shopper nace de evidencia técnica exacta;
- username/password también se leen de rutas anidadas conocidas cuando existen;
- `app/adapters/tya-live-source-refresh-watch.js` no reaplica ni rerenderiza si la revision no cambió; con cambio aplica1 vez y preserva scroll/controles/modal/foco;
- `/app/modules/*` y `/app/core/*` intactos.

## 5. Regression gate local PASS
`PASS_C6_STABLE_COMPOSER_3X_IDEMPOTENCE` sobre baseline 14/616/208 +120 perfiles protegidos +616 protected visits con IDs distintos:
- reapply1=616 visitas/208 shoppers;
- reapply2=616/208;
- reapply3=616/208;
- duplicateVisitKeys0;
- duplicateShopperIds0;
- protectedVisitsAppended0;
- estado operacional HR preservado;
- perfil protegido visible.

Sintaxis de composer/bridge/watcher/gate PASS. CI automático: no ejecutado/no disponible para este commit; evidencia local declarada como tal en `evidence/CORTE6-STABLE-COMPOSER-REGRESSION-GATE-LATEST.json`.

## 6. Lock permanente
Sigue prevalente `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`. Ninguna etapa futura puede saltarse el regression gate acumulativo.

## 7. 31 identity HOLD
Siguen31 sin vínculo canónico reproducible; no crear ni emparejar por nombre/teléfono/email.

## 8. Gate exacto ahora
El root fix está en GitHub pero aún no está publicado en Hosting DEV. La autorización anterior de Hosting fue consumida y no se reutiliza.

Siguiente operación, solo con autorización fresca:
`1x redeploy del Hosting DEV existente cxorbia-backend-dev/cxorbia-dev`.

No requiere Cloud Run redeploy. Después: remote smoke + human visual acumulativa con 3 refresh y validación Dashboard/HR, Shopper/perfil/credenciales/histórico, comparativo, Beneficios y Finanzas.

## 9. Estado seguro
En este bloque: provider/data writes0; Hosting0; Cloud Run0; nuevos Firebase/Hosting0; merge=false; producción=false.
