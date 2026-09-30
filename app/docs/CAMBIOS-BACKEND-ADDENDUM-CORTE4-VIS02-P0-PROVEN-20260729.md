# CAMBIOS BACKEND — Corte 4 · P0-C4-VIS-02 PROVEN

**Fecha:** 2026-07-29  
**Estado:** `VISUAL_P0_PROVEN__NO_PATCH_AUTHORIZED__FREEZE_BLOCKED`

## Qué se verificó

La visual humana posterior al fix de P0-C4-VIS-01 confirmó que el no-fallback funciona: Firestore activo, fixtures demo ausentes y conteos 0/0/0/0.

Apareció un P0 nuevo e independiente:

`P0-C4-VIS-02 — EMPTY_BACKEND_ADMIN_SHELL_CRASH_AND_STALE_ROLE_RENDER`.

## Evidencia técnica

- `backend-cxdata-readonly-corte4.js` deja correctamente backend vacío.
- `router.js::buildRail()` no tolera `d.period() === undefined` y llama `keyOf(p)` con `p` vacío.
- `data.js::programKey/programBase` no aceptan `undefined`.
- `midia.js` también presupone periodo activo, por lo que un null-guard aislado en router no resuelve de raíz.
- `showLogin()` no limpia el rail/view previo; por eso un fallo al volver a Admin puede dejar visible el shell Shopper anterior.

## Impacto Phase A

Corte 4 no puede congelarse: un Firebase nuevo y vacío debe ser una condición válida y visible, no una pantalla blanca. No debe adelantarse Corte 5 para enmascarar el defecto con datos materializados.

## Clasificación

- **Reusable CXOrbia:** empty-backend debe ser first-class state del shell/core y nunca depender de que exista un proyecto.
- **Exclusivo cliente:** evidencia obtenida en `cxorbia-tya-dev-260729-c4`.
- **Claude/prototipo:** no nueva candidata; no tocar módulos UI por este P0.
- **Academia:** documentar estado vacío como condición operacional válida y diferenciada de error/fallback.
- **Sin impacto Claude:** provider/Firestore no requieren cambio.

## Seguridad

No se aplicó patch funcional ni se ejecutó Hosting adicional porque la autorización anterior estaba consumida y era exclusiva de P0-C4-VIS-01.
