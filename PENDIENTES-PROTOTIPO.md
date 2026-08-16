# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-16 12:18 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_CONSUMED__LEGAL_V0_4_MATERIALIZATION_PASS__RUNTIME_AND_HOSTING_DEV_DEPLOY_PASS__HUMAN_ACCEPTANCE_PENDING__COUNSEL_DEFERRED_NONBLOCKING__SAME_CANDIDATE__GO_LIVE_35`

No nueva candidata/rama/PR/workflow. I1/I2 cerradas. I3 continúa por **aceptación humana durable + Admin/new Shopper**. El deploy DEV ya no es pendiente. Counsel GT/HN queda post-go-live y no bloquea la ruta interina.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.  
Source lock actual: `app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.4-DEV-RUNTIME-DEPLOY-PASS-HUMAN-ACCEPTANCE-PENDING-20260816.md`.  
Evidencia materialización: `app/docs/evidence/ITERATION3-LEGAL-V04-MATERIALIZATION-DEV-LATEST.json`.  
Evidencia deploy: `app/docs/evidence/ITERATION3-LEGAL-V04-RUNTIME-DEPLOY-DEV-LATEST.json`.

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## No reprocesar

- I1/I2.
- Historical Shopper run `31906391682`; reset único consumido; `passwordResets=0`; cero credential access/reconcile/recovery.
- Request08 `31909354336` / `95071998299`; consumido/no rerun.
- Bootstrap V0.4 `i3-legal-v04-dev-20260816-01`; consumido/no rerun/no automatic retry.
- Deploy V0.4 `i3-legal-v04-runtime-dev-20260816-01`; consumido/no rerun/no automatic retry.
- Los cuatro documentos Firestore V0.4; ya materializados/readback.
- Cloud Run revision `cxorbia-live-hr-dev-00010-n78` y Hosting DEV ya desplegados bajo el gate consumido.

## Ya resuelto

- Provider legal durable human-only/versioned/provider-ACK.
- Perfil legal provider-authoritative/no-code/rebrand-safe.
- V0.4 interina con counsel diferido, sin falsa aprobación.
- Materialización REAL `cxorbia-backend-dev` PASS: `4` Firestore create-only.
- Runtime legal provider-backed integrado y desplegado en `cxorbia-live-hr-dev`.
- Hosting protegido desplegado en `https://cxorbia-backend-dev.web.app`.
- `/api/tenants/**` routed al servicio DEV.
- Packaging Docker corregido antes del deploy para incluir runtime legal/provider.
- Smoke Cloud Run y Hosting fail-closed sin aceptación PASS.
- Provider readback post-deploy: acceptance count `0 → 0`.
- LegalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0` durante deploy.
- Browser bridge solo en `index-backend-dev.html`; production intacta.
- No `/app/modules` ni `/app/core` changes por este bloque.
- Aceptación automática sigue prohibida.

## Decisiones humanas cerradas — no volver a preguntar

TyA empresa mercantil individual Guatemala; Honduras gestionada desde Guatemala; contacto/NIT provider-editable; domicilio residencial restringido; raw evidence piso 60/default 90; rebranding dinámico; banco completo protegido; documentos mínimos; evidencias por proyecto; Provider Registry dinámico; Make/Gemini no activos inicialmente; arbitraje preferido B2B/no universal individual; counsel GT/HN diferido post-go-live.

## Pendiente ruta crítica I3

1. `HUMAN_PAULA_LEGAL_ACCEPTANCE_UI_CLICK` en `https://cxorbia-backend-dev.web.app`;
2. Paula inicia sesión con su cuenta canónica;
3. provider entrega V0.4 y digest exacto;
4. Paula marca manualmente las dos casillas y pulsa `Aceptar y continuar`;
5. registrar máximo `1` receipt legalAcceptance exact identity/version/digest/server timestamp/provider ACK;
6. provider readback + reload/new-tab confirma aceptación durable;
7. nueva continuación I3 para Admin/new Shopper, nunca request08;
8. Admin crea/edita un único Shopper nuevo;
9. Auth + claims + membership + profile/shopper + crosswalk exactos;
10. provider readback + login/reload/new-tab/segundo contexto.

## Counsel post-go-live

Resolver `GT-01..GT-08`, `HN-01..HN-06`, `X-01..X-06`. Cambio material → nueva versión + evaluación de reaceptación. No bloquea ahora.

## Claude / prototipo

Futuro UI no-code: Legal y cumplimiento, Evidencias y privacidad por proyecto, Provider Registry, white-label/rebranding y auditoría. No parchear módulos desde backend ni duplicar el runtime desplegado.

## Acción siguiente

`HUMAN_PAULA_LEGAL_ACCEPTANCE_UI_CLICK`.

No aceptación automática. No rerun bootstrap/deploy/request08. Sin merge/producción.
