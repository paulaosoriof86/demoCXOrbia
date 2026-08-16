# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-16 11:12 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_CONSUMED__LEGAL_V0_4_DEV_MATERIALIZATION_PASS__RUNTIME_SOURCE_WIRED__COUNSEL_DEFERRED_NONBLOCKING__SAME_CANDIDATE__GO_LIVE_35`

No nueva candidata/rama/PR/workflow. I1/I2 cerradas. I3 continúa por **deploy DEV + aceptación humana durable + Admin/new Shopper**. Counsel GT/HN queda pendiente post-go-live y no bloquea la ruta interina.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.  
Source lock actual: `app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-DEV-PASS-20260816.md`.  
Evidencia materialización: `app/docs/evidence/ITERATION3-LEGAL-V04-MATERIALIZATION-DEV-LATEST.json`.  
Candidata interina: `app/docs/CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## No reprocesar

- I1/I2.
- Historical Shopper run `31906391682`; reset único consumido; `passwordResets=0`; cero credential access/reconcile/recovery.
- Request08 `31909354336` / `95071998299`; consumido/no rerun.
- Request V0.4 `i3-legal-v04-dev-20260816-01`; consumido/no rerun/no automatic retry.
- Bootstrap Firestore V0.4 de cuatro documentos; ya ejecutado y leído de vuelta.

## Ya resuelto

- Provider legal durable human-only/versioned/provider-ACK.
- Perfil legal provider-authoritative/no-code/rebrand-safe.
- V0.4 interina con counsel diferido, sin falsa aprobación.
- **Materialización REAL `cxorbia-backend-dev` PASS**: run `31961266066`, job `95199496314`.
- Firestore exacto `4` create-only = profile `1` + Provider Registry `1` + legalContent/version `2`.
- Digest `58d16a736495065a7244f8018d95a1faa87eae9a00e36d7ffc65a41edd58f58d`.
- LegalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`.
- Runtime legal provider-backed wired en source al servicio DEV existente.
- Browser bridge wired solo a `index-backend-dev.html`.
- Production entrypoint intacto.
- No `/app/modules` ni `/app/core` changes por este bloque.
- Aceptación automática sigue prohibida.

## Hallazgo ya corregido

Intento previo `491042ba...` / run `31961173013` falló por YAML inválido antes de request/provider; cero IO/writes. No es pendiente abierto.

Run canónico source-wiring `31961999583` falló solo por `DURABLE_PLAN_NOT_INDEXED`; el índice reducido había omitido el addendum durable. Fuente restaurada documentalmente. No repetir materialización.

## Decisiones humanas cerradas — no volver a preguntar

TyA empresa mercantil individual Guatemala; Honduras gestionada desde Guatemala; contacto/NIT provider-editable; domicilio residencial restringido; raw evidence piso 60/default 90; rebranding dinámico; banco completo protegido; documentos mínimos; evidencias por proyecto; Provider Registry dinámico; Make/Gemini no activos inicialmente; arbitraje preferido B2B/no universal individual; counsel GT/HN diferido post-go-live.

## Pendiente ruta crítica I3

1. `PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`;
2. deploy/update únicamente DEV del servicio `cxorbia-live-hr-dev` y Hosting DEV necesario para servir el entrypoint protegido;
3. habilitar runtime env gate de legalAcceptance humano;
4. Paula inicia sesión por UI canónica;
5. current legal V0.4 llega desde provider y digest coincide;
6. Paula marca manualmente las casillas y pulsa aceptar;
7. exactamente `1` receipt legalAcceptance con actor exacto/version/digest/server timestamp/provider ACK;
8. reload/new-tab confirma aceptación durable;
9. crear continuación I3 nueva para Admin/new Shopper, nunca request08;
10. Admin crea/edita un único Shopper nuevo;
11. Auth + claims + membership + profile/shopper + crosswalk exactos;
12. provider readback + login/reload/new-tab/segundo contexto.

## Counsel post-go-live

Resolver `GT-01..GT-08`, `HN-01..HN-06`, `X-01..X-06`. Cambio material → nueva versión + evaluación de reaceptación. No bloquea ahora.

## Claude / prototipo

Futuro UI no-code: Legal y cumplimiento, Evidencias y privacidad por proyecto, Provider Registry, white-label/rebranding y auditoría. No parchear módulos desde backend.

## Gate siguiente

`PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`.

No bootstrap V0.4 otra vez. No aceptación automática. No request08. Sin merge/producción.
