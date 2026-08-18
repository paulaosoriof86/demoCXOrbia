# RESUMEN-PARA-CLAUDE.md

**Última sincronización:** 2026-08-18 17:26 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-INTEGRAL-PASS-15`  
**Estado:** `NO_FRONTEND_PATCH__I3_INTEGRAL_PASS_FROZEN__GO_LIVE_60__I4_NOT_STARTED`

## Estado Phase A

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS`; I4 `0/25`; I5 `0/15` = **60% completado / 40% pendiente**.

## Preservado / no reprocesar

- I1/I2 e I3 completo.
- Historical Shopper e I3.9/I3.10 frozen.
- TARGET_B Admin existente; no crear otro usuario.
- Rules I3.11C verificadas; no redeploy.
- HR authority `15` períodos / `660` visitas.
- Provider exact link `shp-57d2e3769946 -> TYA_GT_0C0BA8856E`, `materialized`, `tenant_adjudication`.
- Hosting identityMap PASS run `32194641563`; no repetir deploy.
- Staff/Admin final PASS run `32196648462`; no repetir I3.

## Qué quedó conectado y probado

La corrección reusable en `app/adapters/cxorbia-provider-identity-link-runtime-v1.js` ya está servida en DEV y exporta el link exacto/autoritativo al `CX.data.__identityMap` solo cuando el canonical existe. No usa fuzzy/nombre/email/teléfono, no crea identidades y no sobreescribe conflictos.

La observación Staff final confirmó:
- `CX.data.__identityMap['shp-57d2e3769946'] === 'TYA_GT_0C0BA8856E'`;
- identityMap size `209`;
- agosto canonical `2`;
- residual live `0`;
- reload y nueva pestaña estables;
- I3.4 postulación/HR PASS;
- I3.5 crosswalk exacto PASS;
- I3.6 Historical Shopper reuse PASS con acceso `0`;
- I3.7 legal durable receipt PASS;
- duplicateVisitKeys `0` y duplicateShopperIds `0` preservados desde el Staff run congelado anterior; el post-compose no muta shoppers/visits.

Evidencia final: run `32196648462`, job `95901931320`, artifact `9346121436`, digest `sha256:b3ccc4d9e45a6d42b6ab8a0dcb4cf8e9cfbe6b6ea8409c72524347c7df02189d`.

Safety: Historical Shopper `0`; Shopper credential selection `0`; user/password changes `0`; Auth/Firestore/HR/Rules/Storage writes `0`; Rules/Hosting/Cloud Run deploys `0`; Make/Gemini/payment `0`; merge/production false.

## Transporte del runner

Se corrigió un defecto metodológico del runner one-shot: `push` y `pull_request` compartían la misma clave de concurrencia y podían colisionar. Commit `84bd3bc571692074ce9e13fa50264ef17c6b55f2` separa la clave por `github.event_name`.

Esto es tooling reusable; no es parche frontend ni cambio de producto.

## Claude / prototipo

**No hay ajuste frontend que aplicar por I3.**

- `/app/modules`: sin cambios de producto en este cierre.
- `/app/core`: sin cambios de producto en este cierre.
- No crear workaround UI para identityMap.
- No reabrir autenticación/Admin/Shopper/Rules/Hosting desde frontend.
- `CX.data` conserva su interfaz; el cambio está en el adapter protegido de composición.

Si I4 revela una diferencia frontend reproducible, se documentará por archivo/módulo en ese bloque; no anticiparla ahora.

## Academia

I3 no introduce cambio visible de rutas, cursos, manuales, certificaciones o notificaciones. Registrar únicamente el cierre técnico y preservar material existente. No crear contenido nuevo hasta conocer el alcance exacto de I4.

## Pendiente real

I4 `0/25` e I5 `0/15`.

El source lock previo solo fija “pasar a I4” después de I3; no redefine aquí su primer subgate. Antes de cambiar producto/backend/provider, recuperar la definición exacta de I4 desde el plan canónico activo.

## Siguiente frontera

`RECOVER_CANONICAL_I4_SCOPE_FROM_ACTIVE_PLAN_LOCK__NO_EXECUTION_YET`.

No reabrir I3 ni iniciar provider/deploy/write/producción durante esa recuperación documental.
