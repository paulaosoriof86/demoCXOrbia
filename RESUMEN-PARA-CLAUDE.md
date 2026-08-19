# RESUMEN-PARA-CLAUDE.md

**Última sincronización:** 2026-08-18 19:58 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4A-TEST-SHOPPER-PROVENANCE-HOLD-19`  
**Estado:** `NO_FRONTEND_PATCH__I3_FROZEN__GO_LIVE_60__I4A_TEST_SHOPPER_PROVENANCE_HOLD__AUTH_NEXT`

## Estado Phase A

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS`; I4 `0/25` en curso/no puntuado; I5 `0/15` = **60% completado / 40% pendiente**.

## I4-A — Shopper lifecycle

Alcance canónico: documentos/instrucciones; certificaciones históricas/nuevas; disponibles; postulación; asignación; perfiles/roles/scopes; notificaciones; histórico.

Readiness previo ya probó en adapters la identidad/perfil/histórico/certification-status y membership/scopes; I3 congelado aporta autoridad postulación/asignación.

## Bloque actual

Se intentó resolver desde evidencia congelada una identidad Shopper de prueba/no histórica ya existente, sin login ni provider read.

Decisión: `HOLD_I4A_TEST_SHOPPER_PROVENANCE__NONHISTORICAL_STATUS_NOT_REPRODUCIBLY_ESTABLISHED`.

La evidencia source-safe conserva fingerprints, cardinalidades y procedencia pero deliberadamente no exporta raw login/email/UID ni un `shopperId` DEV individual demostrado como test/no histórico. Los aliases/IDs de planes source-safe son plantillas no conectadas. No se debe elegir una identidad por memoria, nombre o semejanza.

## Claude / prototipo

**No hay parche frontend.** `/app/modules` y `/app/core` permanecen intactos. Este HOLD es de evidencia/provenance, no una falla UI demostrada.

Solo si una futura observación visible reproducible demuestra un defecto real se documentará el handoff por archivo/módulo.

## Academia

Sin cambios todavía. No se ha validado ni modificado comportamiento visible de documentos/instrucciones, certificación nueva o notificaciones; por tanto no corresponde actualizar manuales/cursos en este bloque.

## Siguiente frontera

`NEW_AUTH_REQUIRED_I4A_EXISTING_SHOPPER_IDENTITY_CLASSIFICATION_DEV_READONLY_NO_LOGIN`

Debe clasificar un principal Shopper existente mediante metadata provider/Auth read-only, sin login, credenciales, perfil/histórico, writes, deploy, merge ni producción. Requiere autorización explícita antes de ejecutarse.
