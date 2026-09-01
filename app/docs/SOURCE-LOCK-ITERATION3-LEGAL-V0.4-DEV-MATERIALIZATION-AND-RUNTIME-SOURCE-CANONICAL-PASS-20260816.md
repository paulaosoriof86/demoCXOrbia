# SOURCE LOCK — I3 LEGAL V0.4 · DEV MATERIALIZATION + RUNTIME SOURCE · CANONICAL PASS · 2026-08-16

**Estado:** `PASS_I3_V0_4_DEV_MATERIALIZATION__PASS_RUNTIME_SOURCE__CANONICAL_GATE_PASS__NO_DEPLOY__HUMAN_ACCEPTANCE_NEXT__GO_LIVE_35`

## Autoridad acumulada

Este lock sucede, sin invalidarlos, a:
- `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md`;
- `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-DEV-PASS-20260816.md`.

Preserva I1/I2, Historical Shopper congelado, request08 consumido, counsel GT/HN diferido y aceptación exclusivamente humana.

## Materialización real DEV

Gate humano: `PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Run `31961266066`; job materialización `95199496314`; validación `95199496265`; `PASS_COMMITTED_READBACK`.

Exacto:
- target `cxorbia-backend-dev`, tenant `tya`;
- Firestore `4` writes create-only;
- legalProfile `1`;
- Provider Registry `1`;
- legalContent/version `2`;
- legalContentId `tya-platform-master-terms`;
- legalVersion `tya-legal-bundle-v0.4-interim-golive-20260816`;
- digest `58d16a736495065a7244f8018d95a1faa87eae9a00e36d7ffc65a41edd58f58d`;
- legalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`;
- automaticAcceptance=false;
- request `i3-legal-v04-dev-20260816-01` consumido/no retry;
- deploy `0`, merge=false, producción=false.

Evidencia: `app/docs/evidence/ITERATION3-LEGAL-V04-MATERIALIZATION-DEV-LATEST.json`.

## Runtime source

Runtime provider-backed y browser bridge quedaron wired únicamente en DEV source; production entrypoint permanece intacto. No `/app/modules` ni `/app/core` changes en este bloque. No deploy.

La aceptación requiere actor autenticado exacto, contenido/version/digest provider-authoritative, dos casillas humanas no premarcadas y clic explícito. No aceptación automática.

## Incidente y corrección

Run `31961173013` falló antes de request/provider por YAML inválido; cero jobs/provider IO/writes. Se corrigió antes de la ejecución real.

Run canónico `31961999583` luego pasó todos los gates técnicos y falló únicamente `DURABLE_PLAN_NOT_INDEXED`. La causa era documental: el índice reducido había omitido `ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`.

Se restauró la fuente durable en el índice y se reconcilió el checkpoint, sin reejecutar provider.

## Gate canónico final certificado

HEAD checkpoint `930ed9fb8597ba2f43ed8a32b24c0a0bec21abbe`.

`CXOrbia Phase A Live Execution Checkpoint`:
- run `31962243842`;
- job `95201831257`;
- conclusión `SUCCESS`.

Todos los pasos canónicos pasaron: I1, I2, frozen I3 historical, legal-aware historical harness, Admin overlay-aware subgate, durable legal acceptance, immutable publication, V0.4 materialization provider source y current operational checkpoint.

Commits posteriores del mismo bloque son documentación/handoff y no alteran el runtime/producto certificado ni reejecutan el bootstrap.

## Estado seguro

- Historical credentials/reset/reconcile: `0` nuevos.
- Request08: no rerun.
- V0.4 bootstrap: no rerun.
- LegalAcceptance humano: todavía `0`.
- Deploy: `0`.
- Merge: `false`.
- Producción: `false`.
- Counsel: `deferred_post_golive`, no `approved`.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**35% completado / 65% pendiente.**

## Siguiente gate exacto

`PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`.

Solo puede autorizar deploy/update DEV del runtime/Hosting existente y habilitar el endpoint de `legal.acceptance.record` para un receipt generado exclusivamente tras acción humana real. No bootstrap V0.4 otra vez, no request08, no historical/Auth/HR/Rules/Storage/Make/Gemini/pagos fuera de presupuesto, sin merge ni producción.
