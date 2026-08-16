# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-16 11:12 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_CONSUMED__LEGAL_V0_4_DEV_MATERIALIZATION_PASS__4_WRITES_EXACT__REQUEST_CONSUMED__RUNTIME_SOURCE_WIRED__GO_LIVE_35__DEV_DEPLOY_HUMAN_ACCEPTANCE_GATE_NEXT__NO_PRODUCTION_YET`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Cerrado y no reprocesar

I1 PASS `15/15`. I2 PASS `20/20`. Historical Shopper run `31906391682` PASS congelado; reset histórico único consumido; toda continuación `passwordResets=0`; cero credential access/reconcile/recovery histórico.

Request08 run `31909354336`, job `95071998299` consumido/no rerun. No Shopper nuevo se creó por request08.

## Counsel / V0.4

Counsel GT/HN `deferred_post_golive`, no `approved`, y no bloquea el go-live interino. V0.4 vigente: `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.

Source lock técnico prevalente:
`app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-DEV-PASS-20260816.md`.

## Materialización REAL Firebase DEV — PASS

Gate autorizado: `PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Request `i3-legal-v04-dev-20260816-01` ejecutado una sola vez y consumido; no automatic retry.

Run `31961266066`; job materialización `95199496314`; job validación `95199496265`; `PASS_COMMITTED_READBACK`.

Resultado:
- Firestore writes `4` create-only;
- legalProfile `1`;
- Provider Registry `1`;
- legalContent/version `2`;
- `legalContentId=tya-platform-master-terms`;
- `legalVersion=tya-legal-bundle-v0.4-interim-golive-20260816`;
- digest `58d16a736495065a7244f8018d95a1faa87eae9a00e36d7ffc65a41edd58f58d`;
- legalAcceptance `0`;
- Auth `0`;
- passwordResets `0`;
- historicalCredentialAccess/reconciliation `0/0`;
- HR/Rules/Storage/Make/Gemini/pagos `0`;
- automaticAcceptance=false;
- deploy `0`, merge=false, producción=false.

Evidencia: `app/docs/evidence/ITERATION3-LEGAL-V04-MATERIALIZATION-DEV-LATEST.json`.

## Runtime DEV source — preparado, NO desplegado

Provider-backed legal runtime quedó integrado en fuente al servicio DEV existente y al entrypoint protegido `app/index-backend-dev.html`.

El runtime verifica ID token exacto, deriva actor del provider, lee contenido/version/digest desde Firestore, falla cerrado y no usa localStorage como autoridad. La UI DEV muestra el texto completo y exige dos casillas no premarcadas + clic humano. El endpoint de receipt permanece deshabilitado hasta un gate de deploy separado.

Production `app/index.html` no fue conectado. No se modificó `/app/modules` ni `/app/core` en este bloque.

## Incidente no material

Commit `491042ba6eef90701799fa0f8eed2a1b7c66a1c8`, run `31961173013`: FAILURE por YAML inválido antes de request/provider; cero jobs, cero provider IO y cero writes. Corregido antes de la ejecución real.

Después del wiring source, run canónico push `31961999583` pasó los gates técnicos I1/I2/frozen I3/legal durable/publication/V0.4; falló únicamente current checkpoint con `DURABLE_PLAN_NOT_INDEXED` porque el índice había omitido el addendum durable. El índice ya fue reconciliado documentalmente. No se reejecuta el request V0.4.

## Seguridad / efectos acumulados del bloque autorizado

Bootstrap: Firestore `4` exactos; legalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`. Runtime source wiring no produjo provider IO adicional. Deploy `0`; merge=false; producción=false; automaticAcceptance=false.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**35% completado / 65% pendiente.** I3 no suma hasta PASS integral.

## Gate siguiente

`PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`.

Debe autorizar exclusivamente deploy/update DEV del runtime/Hosting existente y habilitar el endpoint para `1` receipt legalAcceptance **solo después del clic humano de Paula**. No bootstrap V0.4 otra vez; no request08; Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`; sin merge ni producción.
