# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__HUMAN_VISUAL_AUTH_DESVIO_CONFIRMED__NO_CREDENTIAL_FULL_VISUAL_FIX_PREPARED__WAITING_1X_CLOUD_RUN_1X_HOSTING_AUTH__31_HOLD__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.

## 2. P0 actual — human visual no debe depender de credenciales Firebase
Confirmado: Paula no dispone de credenciales técnicas y la visual humana debía conservar auto-entry. El protected browser-auth fue usado erróneamente como requisito humano.

La persistencia LOCAL desplegada queda como mejora del carril técnico, pero no resuelve ni debe resolver el acceso humano.

## 3. Fix preparado, no desplegado
- proxy Firestore server-side read-only con token visual temporal, sin token=401;
- bridge frontend DEV que carga perfil completo sin username/password Firebase;
- auto-entry Admin existente preservado;
- picker DEV existente para shopper real habilitado en el carril full visual;
- watcher HR no sobrescribe el payload full visual;
- cero cambios en `/app/modules/*`.

Request de provider `corte6-human-full-visual-redeploy-request.json` está disabled y sin autorización.

## 4. Validación visual pendiente después del gate
- Admin/Coordinación: perfil completo, username/password legacy real cuando exista, teléfonos/WhatsApp, DPI y demás campos materializados;
- KPI shopper con drill/detail;
- histórico completo por shopperId incluyendo `submitida`;
- Shopper/Evaluador: picker real DEV y módulos propios sin credenciales Firebase visibles.

## 5. 31 perfiles sin canonical — HOLD probado
No resolvibles por legacy exacto, llaves técnicas ni Auth determinístico+claim. No emparejar por nombre/teléfono/email. Requieren alta/conciliación explícita.

## 6. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 7. Agosto
No ejecutar delta agosto hasta cerrar/freeze Corte6.

## 8. Siguiente bloque
`AUTORIZACIÓN 1x CLOUD RUN DEV + 1x HOSTING DEV NO-CREDENTIAL VISUAL → REMOTE SMOKE → HUMAN VISUAL ADMIN+SHOPPER → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

Producción/merge siguen bloqueados.
