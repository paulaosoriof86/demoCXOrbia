# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-16 12:18 -06:00  
**Estado vigente:** `PHASE_A_ROOT_CAUSE_TRACKER_35__I3_LEGAL_V0_4_MATERIALIZATION_PASS__RUNTIME_AND_HOSTING_DEV_DEPLOY_PASS__HUMAN_ACCEPTANCE_PENDING__COUNSEL_DEFERRED_NONBLOCKING__NO_FRONTEND_REDESIGN`

## Estado real

I1 `15/15`, I2 `20/20`, I3 `0/25`, I4 `0/25`, I5 `0/15`: **35% completado / 65% pendiente**.

Historical Shopper run `31906391682` PASS congelado. No repetir reset/recovery/reconcile ni acceder a credencial histórica; `passwordResets=0` en toda continuación. Request08 `31909354336` / `95071998299` consumido/no rerun.

## V0.4 legal — materialización REAL DEV PASS

V0.4 está materializada en `cxorbia-backend-dev`:
- legalProfile `1`;
- Provider Registry `1`;
- legalContent/version `2`;
- legalContentId `tya-platform-master-terms`;
- legalVersion `tya-legal-bundle-v0.4-interim-golive-20260816`;
- digest `58d16a736495065a7244f8018d95a1faa87eae9a00e36d7ffc65a41edd58f58d`.

Run `31961266066`; job `95199496314`; `PASS_COMMITTED_READBACK`. Bootstrap request consumido/no retry. Counsel GT/HN sigue `deferred_post_golive`, no `approved`.

## Runtime legal + Hosting DEV — YA desplegados

Source lock actual:
`app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.4-DEV-RUNTIME-DEPLOY-PASS-HUMAN-ACCEPTANCE-PENDING-20260816.md`.

Gate ejecutado:
`PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`.

Run `31963932862`; job `95206055703`; `SUCCESS`.

Runtime real:
- Cloud Run service `cxorbia-live-hr-dev`;
- revision `cxorbia-live-hr-dev-00010-n78`;
- Hosting DEV `https://cxorbia-backend-dev.web.app`;
- browser bridge servido desde `app/index-backend-dev.html`;
- `/api/tenants/**` resuelto por el servicio DEV.

Antes del deploy se corrigió una causa raíz de packaging: el Dockerfile no copiaba `legal-runtime.mjs` ni `cxorbia-legal-acceptance-provider-v1.mjs` aunque `server.mjs` los necesitaba. Se corrigió antes de construir la imagen; no hubo deploy defectuoso por esa causa.

El deploy produjo:
- Cloud Run deploy `1`;
- Hosting deploy `1`;
- legalAcceptance writes `0`;
- acceptance count `0 → 0`;
- Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`;
- automaticAcceptance=false;
- merge=false;
- producción=false.

Request deploy `i3-legal-v04-runtime-dev-20260816-01` consumido/no retry.

## Aceptación: pendiente exclusivamente humana

Todavía **no existe receipt legalAcceptance**. Eso es correcto: el deploy no podía aceptar por la persona.

La UI DEV:
- carga la versión actual desde provider;
- exige Firebase ID token real;
- deriva actor del provider;
- muestra contenido legal completo;
- presenta dos casillas no premarcadas;
- habilita `Aceptar y continuar` únicamente tras las dos acciones humanas;
- registra máximo un receipt exacto por identidad/version/digest con server timestamp y provider ACK;
- no usa localStorage/sessionStorage como autoridad;
- no autoacepta.

## Regla reusable/no-code

`perfil legal mutable provider-authoritative → snapshot publicado inmutable → render UTF-8/LF → SHA-256 → receipt humano por identidad/versión/digest`.

Rebranding no reescribe versiones históricas. Datos TyA son tenant-only/provider-authoritative, no constantes globales.

## Qué NO debe tocar Claude ahora

- no rediseñar `/app/modules` ni `/app/core` desde backend;
- no reemplazar `CX.data`;
- no duplicar el runtime legal ya desplegado;
- no convertir localStorage en autoridad legal;
- no automatizar la aceptación;
- no tocar identidad/credencial histórica;
- no reejecutar bootstrap V0.4 ni deploy request;
- no reutilizar request08;
- no presentar counsel diferido como aprobado;
- no tocar production `app/index.html` sin gate posterior.

## Frontend/no-code posterior por módulo

1. `app/modules/configuracion.js`: Legal y cumplimiento provider-authoritative; perfil mutable vs versiones publicadas.
2. `app/modules/administrabilidad.js`: auditoría legal sin datos restringidos.
3. proyecto/wizard: Evidencias y privacidad.
4. integraciones: Provider Registry dinámico.
5. marca: displayName/estado registral/licenciante separados.
6. gate legal definitivo: conservar contenido completo/versionado + casillas no premarcadas + acción humana.

No aplicar esos cambios ahora desde backend.

## Próxima secuencia

1. Paula abre DEV y se autentica con su cuenta canónica;
2. lee V0.4, marca ambas confirmaciones y pulsa `Aceptar y continuar`;
3. validar exactamente un receipt con provider ACK/readback;
4. reload/new-tab debe conservar aceptación;
5. nueva continuación I3 Admin/new Shopper, sin request08;
6. Auth + claims + membership + profile/shopper + crosswalk exactos;
7. login/reload/new-tab/segundo contexto del Shopper nuevo;
8. counsel GT/HN post-go-live.

PR #7 permanece draft/open/no merge. Producción sigue intacta.
