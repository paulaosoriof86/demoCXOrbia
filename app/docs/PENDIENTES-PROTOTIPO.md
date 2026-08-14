# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-13 19:07 -06:00
**Estado:** `SHOPPER_P0_POSTDEPLOY_ACCEPTANCE_REJECTED__GENERIC_IDENTITY_CONTRACT_REPAIR_PENDING`

## P0 vigente

La aceptación humana del Shopper **falló después del redeploy técnicamente PASS**. El problema ya no se clasifica como simple temporización del portal.

La auditoría forense demuestra:
- Auth y el perfil Firestore funcionan lo suficiente para mostrar el Shopper transitorio.
- HR viva funciona y llega a 15 periodos / 660 visitas.
- La identidad se pierde al componer HR porque el runtime no consume el mismo universo de llaves técnicas que usó la activación Auth.
- Los perfiles protegidos sin crosswalk runtime exacto se excluyen como `no_exact_hr_crosswalk`.
- El login humano sigue sembrando `CX.data` con un snapshot source-safe empaquetado de julio antes de Auth, causando 616 visitas / periodo 2026-07 en pantalla.

Evidencia: `app/docs/evidence/p0-shopper-postdeploy-forensic-rootcause-20260813.json`.

## Pendiente real inmediato

1. Consolidar source-only un contrato único de identidad exacta reutilizable para todos los tenants/proyectos.
2. Hacer que migración/activación Auth y compositor runtime consuman exactamente la misma semántica de llaves/crosswalk.
3. No persistir ni aceptar un Auth Shopper si `claim.shopperId` no puede llegar a exactamente un perfil protegido y exactamente una identidad HR operacional cuando el proyecto usa HR.
4. Sacar el snapshot source-safe empaquetado del entrypoint humano canónico; conservarlo solo en laboratorio/preview explícito.
5. Reemplazar el smoke de cierre por E2E real de Shopper Firebase Auth → perfil Firestore → HR live → histórico/certificación/visitas.
6. Solo después del PASS source-only solicitar el gate mínimo de provider read-only necesario para reconciliar el universo real; no escribir ni redeployar todavía.

## No hacer

No rehacer UI, no crear candidata/rama/PR, no reimportar HR, no deduplicar por nombre/correo, no parchear únicamente a TyA, no reutilizar el smoke sintético como prueba de aceptación y no ejecutar un segundo deploy bajo el gate ya consumido.

Producción, merge y dominio oficial permanecen bloqueados.
