# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-17 12:53 -06:00  
**Estado:** `NO_REPROCESS__CANONICAL_AUTHORITY_COMPOSITION_SOURCE_FIX_APPLIED__DEV_RUNTIME_VALIDATION_PENDING`

## Cerrado / congelado — NO REPETIR

- I1 PASS / I2 PASS.
- Historical Shopper run `31906391682` PASS; reset único consumido; `passwordResets=0`; no credential reload/reconcile/recovery.
- request08 consumido/no rerun.
- TARGET_B Admin password sign-in real PASS `32049054855`; Paula ingresó. No crear/rotar/reemplazar Admin.
- HR viva ya comprobada hasta AGO 2026: 15 periodos / 660 visitas; agosto 44 = GT 34 + HN 10.
- adapters Shopper V2, Finance V2, cumulative read model V2 y exact identity contract permanecen en la candidata viva; no restaurar módulos viejos ni crear candidata nueva.
- finanzas source-safe + histórico de pagos existentes: preservar; no reconstruir.

## Root cause source-only ya corregido

1. Scope membership `cinepolis` (proyecto raíz/programa) era comparado contra IDs de periodo `cinepolis-YYYY-MM`, dejando selector de Proyecto/Periodo vacío.
2. `tya-live-source-inplace-apply.js` generaba `hr-post-*` desde asignaciones HR y los presentaba como postulaciones.

Delta: `tya-phase-a-authority-compat-v1.js` + wiring en `index-backend-dev.html`. Source lock: `SOURCE-LOCK-PHASE-A-CANONICAL-AUTHORITY-REGRESSION-ROOT-CAUSE-SOURCE-PASS-20260817.md`.

## Pendiente real, en orden

1. validar el delta en runtime DEV sobre el mismo HEAD; no provider writes;
2. verificar Proyecto + 15 periodos y AGO activo;
3. verificar que Postulaciones use únicamente posts persistidos y que asignaciones HR sigan en Visitas/Reservas;
4. inspeccionar `identityReviewQueue`/aliases técnicos exactos de las 44 visitas de agosto reutilizando perfiles/crosswalk existentes; nunca nombre/email/teléfono/username como match;
5. validar Mi Perfil/Histórico Shopper sin repetir el histórico PASS ni resetear credenciales;
6. validar Finanzas mayo/junio/histórico ya existente y separar únicamente la fuente realmente faltante de agosto si la hubiera;
7. validar `cuestPend`, `sinSubmitir`, `fueraRango` contra HR + `tya-canonical-state-semantics-v2`;
8. ejecutar Phase A E2E y solo entonces avanzar a deploy final/producción bajo gate.

## P1 no bloqueante

NDA/confidencialidad se mostró dos veces en la prueba humana. No automatizar aceptación. Tratar como P1 mientras no impida login, persistencia de sesión ni rutas.

## Prohibiciones

No reimportar HR, no regenerar Shoppers, no alterar Auth/claims/perfiles/passwords históricos, no deduplicar por similitud, no reconstruir Finanzas, no nueva candidata/rama/PR, no deploy/merge/producción sin gate.
