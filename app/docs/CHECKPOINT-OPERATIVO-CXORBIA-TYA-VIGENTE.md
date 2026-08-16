# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-16 12:19 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_CONSUMED__LEGAL_V0_4_MATERIALIZATION_PASS__RUNTIME_AND_HOSTING_DEV_DEPLOY_PASS__HUMAN_ACCEPTANCE_PENDING__GO_LIVE_35__NO_PRODUCTION_YET`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

Source lock técnico prevalente:
`app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.4-DEV-RUNTIME-DEPLOY-PASS-HUMAN-ACCEPTANCE-PENDING-20260816.md`.

## Cerrado y no reprocesar

I1 PASS `15/15`. I2 PASS `20/20`.

Historical Shopper run `31906391682` PASS congelado; reset histórico único consumido; toda continuación `passwordResets=0`; cero credential access/reconcile/recovery histórico.

Request08 run `31909354336`, job `95071998299` consumido/no rerun.

Bootstrap V0.4 `i3-legal-v04-dev-20260816-01` consumido/no retry.

Deploy V0.4 `i3-legal-v04-runtime-dev-20260816-01` consumido/no retry.

## Counsel / V0.4

Counsel GT/HN `deferred_post_golive`, no `approved`, y no bloquea el go-live interino.

V0.4:
- legalContentId `tya-platform-master-terms`;
- legalVersion `tya-legal-bundle-v0.4-interim-golive-20260816`;
- digest `58d16a736495065a7244f8018d95a1faa87eae9a00e36d7ffc65a41edd58f58d`.

## Materialización REAL Firebase DEV — PASS

Gate ejecutado: `PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Run `31961266066`; materialización `95199496314`; validación `95199496265`; `PASS_COMMITTED_READBACK`.

Resultado:
- Firestore writes `4` create-only;
- legalProfile `1`;
- Provider Registry `1`;
- legalContent/version `2`;
- legalAcceptance `0`;
- Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`;
- automaticAcceptance=false.

Evidencia: `app/docs/evidence/ITERATION3-LEGAL-V04-MATERIALIZATION-DEV-LATEST.json`.

## Runtime legal + Hosting DEV — PASS REAL

Gate ejecutado:
`PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`.

Antes del deploy se detectó y corrigió una causa raíz: el Dockerfile no incluía `legal-runtime.mjs` ni el provider que `server.mjs` importaba. Se corrigió antes de construir/desplegar, commit `54741f3d7cef9c601db2c77e2b5d1d778cc25c27`.

No se creó workflow nuevo. Se reutilizó `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml`.

Run `31963932862`; job `95206055703`; `SUCCESS`.

Resultado exacto:
- Cloud Run service `cxorbia-live-hr-dev` actualizado una vez;
- revision `cxorbia-live-hr-dev-00010-n78`;
- Hosting DEV desplegado una vez;
- DEV root `https://cxorbia-backend-dev.web.app`;
- legalAcceptance writes durante deploy `0`;
- acceptance count `0 → 0`;
- futuro budget humano `1`;
- Auth writes `0`;
- passwordResets `0`;
- historicalCredentialAccess/reconciliation `0/0`;
- HR/Rules/Storage/Make/Gemini/pagos `0`;
- automaticAcceptance=false;
- merge=false;
- producción=false.

Evidencia:
`app/docs/evidence/ITERATION3-LEGAL-V04-RUNTIME-DEPLOY-DEV-LATEST.json`.

## Runtime humano listo

El runtime DEV verifica Firebase ID token exacto, deriva actor del provider, lee V0.4/version/digest desde Firestore, falla cerrado, no usa localStorage/sessionStorage como autoridad legal y sirve el texto completo.

La UI exige dos casillas no premarcadas y clic explícito. El endpoint está habilitado únicamente para el receipt humano exacto autorizado. Sin clic humano no hay write.

Production `app/index.html` permanece intacto. No se modificó `/app/modules` ni `/app/core` para este bloque.

## Seguridad / efectos acumulados

Materialización V0.4: Firestore `4` exactos. Deploy: Cloud Run `1`, Hosting `1`, Firestore/legalAcceptance writes `0`. El contador de aceptaciones sigue `0` antes de la acción humana. Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`. Merge=false. Producción=false.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**35% completado / 65% pendiente.** I3 no suma hasta PASS integral.

## Acción siguiente exacta

`HUMAN_PAULA_LEGAL_ACCEPTANCE_UI_CLICK`.

Paula abre `https://cxorbia-backend-dev.web.app`, inicia sesión con su cuenta canónica, lee la V0.4, marca las dos confirmaciones y pulsa `Aceptar y continuar`. Esa es la única acción que puede generar el receipt legal autorizado. Después corresponde provider readback, reload/new-tab y continuación I3 Admin/new Shopper sin request08 ni identidad histórica.
