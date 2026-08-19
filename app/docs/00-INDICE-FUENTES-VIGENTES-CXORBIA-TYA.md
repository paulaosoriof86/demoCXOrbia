# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Última sincronización:** 2026-08-18 19:44 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4A-SOURCE-READINESS-HOLD-18`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I3_FROZEN_PASS__GO_LIVE_60__I4A_READINESS_HOLD__TEST_SHOPPER_RESOLUTION_NEXT__NO_PRODUCTION`

## Orden de lectura obligatorio

1. `app/docs/CXORBIA-EXECUTION-STATE.json`
2. `app/docs/SOURCE-LOCK-CXORBIA-TYA.md`
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`
5. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`
6. PR #7 vivo

## Carril único

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Estado formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS` frozen; I4 `0/25` in progress/not scored; I5 `0/15` = **60% completado / 40% pendiente**.

## I4-A — Shopper lifecycle readiness

Alcance canónico: documentos/instrucciones; certificaciones históricas/nuevas; disponibles; postulación; asignación; perfiles/roles/scopes; notificaciones; histórico.

Decisión: `HOLD_I4A_SOURCE_READINESS__VISIBLE_SHOPPER_LIFECYCLE_COVERAGE_NOT_YET_PROVEN`.

La evidencia canónica inspeccionada prueba identidad/perfil exactos, certificación visible, histórico y membership/scopes; la evidencia I3 congelada prueba autoridad de postulación vs asignación HR. No prueba todavía de extremo a extremo la experiencia visible Shopper para documentos/instrucciones, disponibles, acción de postulación, notificaciones y presentación de certificación nueva. Esto no demuestra ausencia ni bug de producto.

## Frozen / no reprocesar

I1/I2/I3 completo; Historical Shopper; TARGET_B Admin; Rules/provider/Hosting/Staff I3.11C; HR `15/660`; Finance V2/historical; legal V0.4.

## Siguiente frontera exacta

`I4A_RESOLVE_EXISTING_NONHISTORICAL_TEST_SHOPPER_IDENTITY_FROM_FROZEN_EVIDENCE__READONLY_NO_LOGIN`

Solo resolver una identidad Shopper de prueba/no histórica ya existente desde evidencia congelada. Sin login, selección de credencial, creación/reset de usuario, provider/data writes, deploy, merge o producción.

## Anti-loop

Un bloque → una causa → un siguiente gate. No ampliar búsqueda si el siguiente gate ya está definido. I3 no se reabre.
