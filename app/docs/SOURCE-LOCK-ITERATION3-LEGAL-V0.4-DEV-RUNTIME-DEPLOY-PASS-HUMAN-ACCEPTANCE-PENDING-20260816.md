# SOURCE LOCK — ITERATION 3 · LEGAL V0.4 DEV RUNTIME DEPLOY · PASS · HUMAN ACCEPTANCE PENDING · 2026-08-16

**Estado:** `PASS_I3_LEGAL_V0_4_DEV_RUNTIME_AND_HOSTING_DEPLOY__HUMAN_ACCEPTANCE_PENDING__GO_LIVE_35`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; target DEV `cxorbia-backend-dev`.

Este lock sucede al lock `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-DEV-MATERIALIZATION-AND-RUNTIME-SOURCE-CANONICAL-PASS-20260816.md` únicamente para el deploy real del runtime/Hosting DEV. Preserva la materialización V0.4 ya consumida, I1/I2, histórico I3 congelado, request08 consumido y counsel diferido.

## Autorización humana exacta

Paula autorizó `PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME` para:
- actualizar/desplegar únicamente `cxorbia-live-hr-dev` en `cxorbia-backend-dev`;
- desplegar únicamente el Hosting DEV existente necesario para el entrypoint protegido;
- habilitar el runtime para máximo un write `legalAcceptance` solamente después del clic humano de Paula;
- provider ACK/readback;
- Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`;
- no rerun del bootstrap V0.4;
- no request08;
- no identidad histórica;
- no aceptación automática;
- no merge ni producción.

## Hallazgo previo al deploy y corrección de causa raíz

La imagen existente del servicio DEV no copiaba `backend/runtime/hr-live-service/legal-runtime.mjs` ni `backend/runtime/cxorbia-legal-acceptance-provider-v1.mjs`, aunque `server.mjs` ya importaba el runtime legal. Desplegar sin corregirlo habría producido una imagen incapaz de iniciar el handler legal.

Se corrigió exclusivamente el packaging del runtime DEV en `backend/runtime/hr-live-service/Dockerfile`, commit `54741f3d7cef9c601db2c77e2b5d1d778cc25c27`. No se tocó `/app/modules`, `/app/core` ni producción.

## Carril de deploy reutilizado

No se creó workflow nuevo. Se reutilizó y recondujo el workflow existente:
`.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml`.

Commit de carril I3: `9adc72ad573bc8a813b8b8ed4b63fdb9bb9f7e6a`.

Request one-shot:
`backend/config/i3-legal-v04-runtime-deploy-dev-request.json`.

Execute marker:
`backend/config/i3-legal-v04-runtime-deploy-dev-execute.json`.

Request ID `i3-legal-v04-runtime-dev-20260816-01`; `enabled=false`, `consumed=true`, `noAutomaticRetry=true` después del PASS. No rerun.

## Deploy REAL DEV — PASS

Workflow: `CXOrbia I3 Legal V0.4 DEV Runtime Deploy`.

Run `31963932862`; job `95206055703`; conclusión `SUCCESS`.

Todos los pasos PASS:
1. autorización one-shot exacta;
2. auth a Google Cloud DEV existente;
3. preflight source + Firestore read-only;
4. build exacto de imagen;
5. update único de `cxorbia-live-hr-dev`;
6. smoke directo legal fail-closed;
7. deploy único Hosting DEV;
8. smoke Hosting protegido y rewrite legal;
9. provider post-readback;
10. consumo del request y evidencia sanitizada.

Cloud Run revision: `cxorbia-live-hr-dev-00010-n78`.

Hosting DEV: `https://cxorbia-backend-dev.web.app`.

## V0.4 preservada

- `legalContentId=tya-platform-master-terms`;
- `legalVersion=tya-legal-bundle-v0.4-interim-golive-20260816`;
- `contentDigest=58d16a736495065a7244f8018d95a1faa87eae9a00e36d7ffc65a41edd58f58d`.

El deploy no modificó esos documentos.

## Presupuesto real del deploy

Evidencia:
`app/docs/evidence/ITERATION3-LEGAL-V04-RUNTIME-DEPLOY-DEV-LATEST.json`.

Resultado:
- Cloud Run deploy executions `1`;
- Hosting deploy executions `1`;
- legalAcceptance writes durante deploy `0`;
- acceptance count antes/después `0/0`;
- futuro budget de aceptación humana `1`;
- Auth writes `0`;
- passwordResets `0`;
- historicalCredentialAccess `0`;
- historicalReconciliationWrites `0`;
- HR/Rules/Storage/Make/Gemini/payment `0`;
- automaticAcceptance `false`;
- merge `false`;
- producción `false`.

## Runtime humano habilitado

El servicio DEV quedó con los gates exactos:
- `CXORBIA_I3_LEGAL_ACCEPTANCE_WRITE_ENABLED=true`;
- `CXORBIA_I3_LEGAL_ACCEPTANCE_WRITE_GATE=PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`.

El browser bridge usa `/api/tenants/{tenantId}/legal/current` y `/api/tenants/{tenantId}/legal/commands`; `firebase.json` ya preservaba el rewrite `/api/tenants/**` al servicio DEV y `/` redirige a `/index-backend-dev.html`.

La UI exige contenido completo, dos casillas no premarcadas y clic explícito. El provider deriva actor desde el Firebase ID token verificado, usa server timestamp y receipt determinista/idempotente. Sin clic humano no existe write.

## No reejecutar

- bootstrap V0.4 `i3-legal-v04-dev-20260816-01`: consumido/no retry;
- deploy request `i3-legal-v04-runtime-dev-20260816-01`: consumido/no retry;
- request08: consumido/no rerun;
- histórico Shopper: congelado; `passwordResets=0`.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**GO-LIVE 35% completado / 65% pendiente.** El deploy es subgate I3 y no suma hasta cierre integral.

## Siguiente acción exacta

`HUMAN_PAULA_LEGAL_ACCEPTANCE_UI_CLICK`.

Paula debe abrir el DEV protegido, autenticarse con su cuenta canónica, leer V0.4, marcar ambas confirmaciones y pulsar `Aceptar y continuar`. Esa interacción puede producir como máximo el receipt legal autorizado. Después corresponde readback provider y continuación I3 Admin/new Shopper, sin request08 ni identidad histórica.
