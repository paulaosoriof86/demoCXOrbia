# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-16 10:38 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_CONSUMED__LEGAL_V0_4_INTERIM_GOLIVE__MATERIALIZATION_PROVIDER_SOURCE_PASS__COUNSEL_DEFERRED_NONBLOCKING__SAME_CANDIDATE__GO_LIVE_35`

No nueva candidata/rama/PR/workflow. I1/I2 cerradas. I3 continúa por **ejecución provider real + aceptación humana durable + Admin/new Shopper**. Counsel GT/HN queda pendiente post-go-live y no bloquea la ruta crítica interina.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.  
Source lock actual: `app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md`.  
Candidata interina: `app/docs/CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.  
Registro counsel post-go-live: `app/docs/PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## No reprocesar

I1/I2, Auth owner/exact identity/Staff membership, Mis Visitas, HR authority y histórico request06 congelado. Reset histórico consumido. Request08 consumido. Toda continuación `passwordResets=0`; no access/reconcile/recovery histórico.

## Ya resuelto

- Provider legal durable human-only/versioned/provider-ACK source PASS.
- Perfil legal multi-tenant provider-authoritative/no-code.
- Rebranding separado de IP/titularidad.
- Domicilio residencial restringido.
- Evidencias/retención por proyecto.
- Provider Registry dinámico.
- V0.4 interina con counsel diferido, sin falsa aprobación jurídica.
- **Provider de materialización V0.4 source PASS** con contrato exacto y readback.
- Futuro bootstrap: `4` Firestore create-only = profile `1` + provider registry `1` + content/version `2`; acceptance/Auth/reset/historical `0`.
- Verificador bloquea placeholders, falso counsel, domicilio restringido y colisión.
- Command adapter permite `legal.acceptance.record` a roles autenticados solo como self-scoped + human-confirmed; otros permisos Shopper/Cliente siguen cerrados.
- CI técnico `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9`: run `31959900456`, job `95196342385`, SUCCESS.

## Decisiones humanas cerradas — no volver a preguntar

TyA empresa mercantil individual Guatemala; Honduras administrada desde Guatemala; NIT/contacto inicial confirmados y editables en provider; domicilio exacto restringido; raw evidence piso 60/default 90; rebranding dinámico; banco completo bajo controles; documentos mínimos; evidencias por proyecto; providers activos desde runtime/registry; Make/Gemini no activos inicialmente; arbitraje preferido B2B/no universal individual; counsel GT/HN diferido post-go-live.

## Pendiente ruta crítica I3

1. obtener gate exacto `PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`;
2. resolver/renderizar V0.4 con valores públicos iniciales TyA y SHA-256 final;
3. reutilizar/extender un carril existente para una sola ejecución DEV; no workflow nuevo;
4. materializar cuatro documentos y validar readback/digest;
5. wirear read model/runtime DEV sin localStorage authority;
6. mostrar versión completa y permitir solo aceptación humana;
7. registrar receipt exact identity/version/digest/server timestamp/provider ACK;
8. crear continuación I3 nueva, no request08;
9. Admin crea/edita un único Shopper nuevo;
10. Auth + claims + membership + profile/shopper + crosswalk exactos;
11. provider readback + login/reload/new-tab/segundo contexto.

## Infraestructura existente

`CXOrbia Phase A Firestore Materialization Executor` fue revisado: actualmente `execute` está limitado a emulator. No se confundirá ese validador con materialización real de `cxorbia-backend-dev`.

## Counsel post-go-live

Resolver después `GT-01..GT-08`, `HN-01..HN-06`, `X-01..X-06`. Un cambio material genera nueva versión y evaluación de reaceptación.

## Claude / prototipo

Futuro UI: `Legal y cumplimiento`, perfil mutable vs publicación, Evidencias y privacidad por proyecto, Provider Registry, white-label/rebranding y gate humano con casillas no premarcadas. No se parcheó `/app/modules` ni `/app/core` desde backend.

## Gate siguiente

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

No aceptación automática. No request08 rerun. Deploy/merge/producción mantienen gates posteriores.
