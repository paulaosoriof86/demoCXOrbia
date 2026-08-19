# RESUMEN-PARA-CLAUDE.md

**Última sincronización:** 2026-08-18 21:11 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4A-PROVIDER-HOLD-SYNC-20`  
**Estado:** `NO_FRONTEND_PATCH__I3_FROZEN__GO_LIVE_60__I4A_PROVIDER_HOLD_CONSUMED__DEDICATED_TEST_IDENTITY_AUTH_NEXT`

## Estado Phase A

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS`; I4 `0/25` en curso/no puntuado; I5 `0/15` = **60% / 40%**.

## I4-A

El source canónico ya cubre portal/perfil/histórico/certification-status Shopper, membership/roles/scopes fail-closed, contrato protegido de administración Shopper y autoridad postulación/asignación proveniente de I3.

La identidad de prueba existente no pudo probarse desde evidencia congelada. La lectura provider/Auth read-only run `32208829234` tampoco encontró un principal con provenance explícita test/no histórica segura: `211` Shopper, `0` candidatos seguros. Ese gate está consumido y no se repite.

El fallo de comentario PR fue de infraestructura de publicación, no producto.

## Claude / prototipo

**No hay parche frontend nuevo.** `/app/modules` y `/app/core` no se tocaron. No convertir este HOLD en workaround UI.

Cuando exista la prueba visible I4-A, documentar únicamente defectos visibles reproducibles por archivo/módulo. Pendientes visibles a probar: documentos/instrucciones, visitas disponibles, control/estado de postulación, notificaciones y presentación de certificación nueva.

## Academia

Sin cambio funcional todavía. Solo después de evidencia visible se actualizarán manuales/cursos/rutas/notificaciones afectados.

## Siguiente frontera

`NEW_AUTH_REQUIRED_I4A_CREATE_DEDICATED_NONHISTORICAL_DEV_TEST_SHOPPER__PROTECTED_CONTRACT_NO_LOGIN`, seguido tras PASS por `NEW_AUTH_REQUIRED_I4A_SINGLE_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE`.
