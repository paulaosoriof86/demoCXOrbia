# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-16 11:12 -06:00  
**Estado vigente:** `PHASE_A_ROOT_CAUSE_TRACKER_35__I3_LEGAL_V0_4_DEV_MATERIALIZATION_PASS__RUNTIME_SOURCE_WIRED__COUNSEL_DEFERRED_NONBLOCKING__DEV_DEPLOY_HUMAN_ACCEPTANCE_NEXT__NO_FRONTEND_REDESIGN`

## Estado real

I1 `15/15`, I2 `20/20`, I3 `0/25`, I4 `0/25`, I5 `0/15`: **35% completado / 65% pendiente**.

Shopper histórico I3 PASS congelado run `31906391682`; no repetir reset/recovery/reconcile ni acceder a credencial histórica; continuaciones `passwordResets=0`.

Request08 `31909354336` / `95071998299` consumido/no rerun.

## V0.4 legal — REAL DEV ya materializada

Source lock prevalente:
`app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-DEV-PASS-20260816.md`.

Gate humano ejecutado: `PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Run `31961266066`; job `95199496314`; `PASS_COMMITTED_READBACK`.

En `cxorbia-backend-dev` quedaron exactamente `4` create-only writes:
1. `legalProfile/current`;
2. Provider Registry `firebase-google-core`;
3. `legalContents/tya-platform-master-terms`;
4. versión `tya-legal-bundle-v0.4-interim-golive-20260816`.

Digest canónico:
`58d16a736495065a7244f8018d95a1faa87eae9a00e36d7ffc65a41edd58f58d`.

LegalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`; automaticAcceptance=false; request consumido/no retry; deploy `0`; merge=false; producción=false.

Counsel GT/HN continúa `deferred_post_golive`, no `approved`.

## Runtime DEV source wired — todavía NO desplegado

Source preparado:
- `backend/runtime/hr-live-service/legal-runtime.mjs`;
- `backend/runtime/hr-live-service/server.mjs`;
- `app/adapters/cxorbia-legal-acceptance-durable-contract-v1.js`;
- `app/adapters/cxorbia-legal-acceptance-provider-bridge-v1.js`;
- `app/adapters/cxorbia-legal-runtime-http-v1.js`;
- `app/index-backend-dev.html`.

Comportamiento DEV:
- provider authority real;
- Firebase ID token exacto; actor derivado del token;
- current version/digest desde Firestore;
- fail-closed;
- cero localStorage/sessionStorage como autoridad legal;
- contenido completo;
- dos casillas humanas no premarcadas;
- clic explícito;
- receipt bloqueado hasta deploy gate separado;
- no actor UID/raw token al browser;
- no aceptación automática.

Production `app/index.html` sigue sin wiring legal. No se modificó `/app/modules` ni `/app/core` en este bloque.

## Regla reusable/no-code

`perfil legal mutable provider-authoritative → snapshot publicado inmutable → render UTF-8/LF → SHA-256 → receipt humano por identidad/versión/digest`.

Rebranding no reescribe versiones históricas. Datos TyA concretos son tenant-only y provider-authoritative, no constantes globales.

## Qué NO debe tocar Claude ahora

- no rediseñar `/app/modules` ni `/app/core` desde backend;
- no reemplazar `CX.data`;
- no convertir localStorage en autoridad legal;
- no autoaceptar NDA/términos;
- no tocar identidad/credencial histórica;
- no duplicar bootstrap V0.4;
- no presentar counsel diferido como aprobado;
- no publicar domicilio registrado restringido.

## Frontend/no-code posterior por módulo

1. `app/modules/configuracion.js`: Legal y cumplimiento provider-authoritative; perfil mutable vs versiones publicadas.
2. `app/modules/administrabilidad.js`: auditoría legal sin datos restringidos.
3. proyecto/wizard: Evidencias y privacidad.
4. integraciones: Provider Registry dinámico.
5. marca: displayName/estado registral/licenciante separados.
6. gate legal definitivo: texto completo/versionado + casillas no premarcadas + acción humana.

## Gate canónico source

Run push `31961999583` sobre `c6e1e55d...` pasó I1/I2/frozen I3/durable legal/publication/V0.4 source y falló solo `DURABLE_PLAN_NOT_INDEXED` en current checkpoint. La causa era documental: el índice reducido omitía el addendum durable. Se restauró; no es P0 funcional ni autoriza rerun provider.

## Pendiente real

1. `PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`;
2. deploy/update únicamente DEV del servicio/Hosting existente;
3. Paula entra por login canónico y recibe la V0.4 desde provider;
4. Paula acepta humanamente;
5. exactamente 1 receipt legalAcceptance + provider ACK/readback;
6. reload/new-tab de aceptación;
7. nueva continuación I3 Admin/new Shopper sin request08;
8. login/reload/new-tab/segundo contexto Shopper nuevo;
9. counsel GT/HN post-go-live.

PR #7 permanece draft/open/no merge. Sin deploy ni producción todavía.
