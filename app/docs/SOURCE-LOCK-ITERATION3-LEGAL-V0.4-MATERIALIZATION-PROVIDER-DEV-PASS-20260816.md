# SOURCE LOCK — ITERATION 3 · LEGAL V0.4 MATERIALIZATION PROVIDER DEV · PASS · 2026-08-16

**Estado:** `PASS_I3_LEGAL_V0_4_MATERIALIZATION_PROVIDER_DEV__4_WRITES_EXACT__READBACK_PASS__REQUEST_CONSUMED__RUNTIME_SOURCE_WIRED__NO_DEPLOY__HUMAN_ACCEPTANCE_NEXT__GO_LIVE_35`

## 1. Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; target exacto `cxorbia-backend-dev`.

Este lock sucede al lock source-only `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md` únicamente en lo relativo a la materialización real V0.4 y al wiring source de runtime DEV. Preserva I1/I2, historical I3 congelado, request08 consumido, counsel diferido y aceptación exclusivamente humana.

## 2. Autorización humana exacta

Paula autorizó `PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3` exclusivamente en `cxorbia-backend-dev` para:
- una sola materialización V0.4 de máximo `4` writes Firestore create-only;
- `legalProfile=1`;
- `Provider Registry=1`;
- `legalContent/version=2`;
- wiring/runtime DEV necesario para leer y mostrar la versión;
- `legalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos=0` durante bootstrap;
- aceptación legal únicamente humana en UI;
- sin reutilizar request08;
- sin deploy/merge/producción.

No se amplía esta autorización por inferencia.

## 3. Incidente previo no ejecutado

Primer intento de extender el workflow existente: commit `491042ba6eef90701799fa0f8eed2a1b7c66a1c8`, run `31961173013`, conclusión `FAILURE`, cero jobs. Causa: YAML inválido por heredoc. Ocurrió antes de existir request ejecutable y antes de autenticación/provider IO.

Efecto real de ese intento: Firestore `0`, provider reads/writes `0/0`, Auth `0`, historical `0`, deploy `0`, producción `false`.

Se corrigió la causa en fuente antes de crear el request autorizado.

## 4. Executor y carril corregido

- executor exacto: `tools/migration/tya-i3-legal-v04-materialize-dev.mjs`, commit `1865af59781dd17c0053b1a7bd1b05680d5880b6`;
- request control one-shot: `tools/migration/tya-i3-legal-v04-request-control.mjs`, commit `b2ed739504af1227b8768fe69fc92b79531f7ff6`;
- workflow existente corregido/reutilizado: `.github/workflows/cxorbia-phase-a-firestore-materialization-executor.yml`, commit `1545807324ae71df0ae31a863797243afd45b7c9`;
- no se creó workflow nuevo.

Validación pre-ejecución: run `31961226214`; jobs `95199402826` y `95199402954` SUCCESS. La rama de ejecución quedó correctamente omitida al no existir aún request; provider IO `0`.

## 5. Request one-shot

Request: `backend/requests/i3-legal-v04-materialization-dev.json`.

Creación/autorización operativa: commit `5813cf50dbc8a2fd0cc69b18ecbc44caec45e64d`.

`requestId=i3-legal-v04-dev-20260816-01`; source pin `1545807324ae71df0ae31a863797243afd45b7c9`; target `cxorbia-backend-dev`; tenant `tya`.

Después de la ejecución el request quedó `enabled=false`, `consumed=true`, `noAutomaticRetry=true`. **No rerun.**

## 6. Materialización REAL Firebase DEV — PASS

Workflow: `CXOrbia Phase A Firestore Materialization Executor`.

Run `31961266066`; job materialización `95199496314`; job validación `95199496265`; conclusión SUCCESS.

Evidencia canónica sanitizada:
`app/docs/evidence/ITERATION3-LEGAL-V04-MATERIALIZATION-DEV-LATEST.json`.

Resultado exacto:
- `status=PASS_COMMITTED_READBACK`;
- `providerAttempted=true`;
- `providerAck=true`;
- `committed=true`;
- `readbackReady=true`;
- `legalContentId=tya-platform-master-terms`;
- `legalVersion=tya-legal-bundle-v0.4-interim-golive-20260816`;
- `contentDigest=58d16a736495065a7244f8018d95a1faa87eae9a00e36d7ffc65a41edd58f58d`;
- Firestore writes `4` exactos;
- legalProfile `1`;
- legalProvider `1`;
- legalContent/version `2`;
- legalAcceptance `0`;
- Auth `0`;
- passwordResets `0`;
- historicalCredentialAccess `0`;
- historicalReconciliationWrites `0`;
- HR/Rules/Storage/Make/Gemini/payment `0`;
- deploy `0`;
- automaticAcceptance `false`;
- production `false`;
- merge `false`;
- blockers `[]`.

Los cuatro documentos fueron create-only. No hubo overwrite ni segundo bootstrap.

## 7. Runtime DEV — wiring SOURCE preparado, NO desplegado

Se reutiliza el servicio DEV existente y los rewrites existentes; no se crea servicio nuevo.

Archivos source:
- `backend/runtime/hr-live-service/legal-runtime.mjs`, commits `db598ab53382c46a80859ed622b9ce686634d8dc` y hardening `aa33d746657c5e3e2b63fd1d3e9f5ca93e559db3`;
- `backend/runtime/hr-live-service/server.mjs`, commit `2c91301ee5201e8aeb8d868af0de30c7021dd4b0`;
- `app/adapters/cxorbia-legal-runtime-http-v1.js`, commit `8c579d707d9b16c42baab92d8ed6ca1237a84a9a`;
- `tools/qa/verify-i3-legal-acceptance-durable-source-only.mjs`, commit `90cd767da441e9ce1dc2ca84e67141c20a0ff0f9`;
- `app/index-backend-dev.html`, commit `c6e1e55d581f3eb15fc5bf430de4adb2de4e51ca`.

El runtime fuente:
- verifica Firebase ID token exacto;
- deriva identidad/rol/namespace del token provider;
- lee la versión provider-authoritative;
- valida versión y SHA-256;
- no usa localStorage/sessionStorage como autoridad legal;
- no devuelve UID/raw token al browser;
- muestra el texto completo en DEV protegido;
- requiere dos confirmaciones humanas no premarcadas y clic explícito;
- no puede registrar aceptación si el runtime gate de aceptación humana no está habilitado por deploy separado;
- production `app/index.html` permanece sin wiring legal.

## 8. Gate canónico source después del wiring

Sobre HEAD `c6e1e55d581f3eb15fc5bf430de4adb2de4e51ca`, run canónico push `31961999583` pasó I1, I2, frozen I3, historical harness legal-aware, Admin overlay-aware, durable legal acceptance, immutable publication y V0.4 materialization source. Falló únicamente `Verify Phase A current operational checkpoint` con `DURABLE_PLAN_NOT_INDEXED`, porque el índice vigente había sido reducido y omitía el nombre del addendum durable. No fue una falla funcional ni provider; no produjo writes ni deploy.

La corrección permitida es documental: restaurar en el índice la fuente durable vigente y reconciliar el checkpoint con este lock. No se reejecuta el request V0.4.

## 9. Preservaciones

- I1 PASS `15/15`.
- I2 PASS `20/20`.
- Historical Shopper run `31906391682` PASS congelado; reset histórico consumido; toda continuación `passwordResets=0`.
- Request08 run `31909354336` / job `95071998299` consumido/no rerun.
- Counsel GT/HN `deferred_post_golive`, no `approved`.
- V0.4 interina publicada en DEV no implica revisión jurídica profesional.
- No aceptación automática.
- No `/app/modules` changes en este bloque.
- No `/app/core` changes en este bloque.
- No production entrypoint changes.
- No deploy.
- No merge.
- No producción.

## 10. Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**GO-LIVE 35% completado / 65% pendiente.** La materialización real es un subgate I3; I3 solo suma cuando cierre integralmente.

## 11. Siguiente gate exacto

`PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`.

Ese gate debe autorizar exclusivamente el deploy/update del runtime DEV existente y del Hosting DEV necesario para servir el entrypoint protegido, con el endpoint de aceptación legal habilitado para **un receipt Firestore únicamente después del clic humano de Paula**. Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos permanecen `0`; sin request08, sin rerun del bootstrap V0.4, sin merge ni producción.
