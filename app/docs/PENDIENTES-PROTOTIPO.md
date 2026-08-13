# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-13 13:29 -06:00
**Estado:** `HUMAN_SHOPPER_P0_OPEN__STOP_RETRY__SECOND_PROVIDER_READ_NOT_AUTHORIZED`

La calificación técnica DEV permanece preservada, pero la aceptación funcional humana está rechazada.

## P0 inmediato

El Shopper real autentica, pero `Mi Perfil` no resuelve la identidad contra el read model canónico y la vista autenticada no carga el contexto HR esperado. Evidencia: `app/docs/evidence/p0-human-shopper-canonical-binding-failure-20260813.json`.

El único diagnóstico read-only autorizado falló en run `31735473752` sin dejar artifact ni causa raíz persistida. El request fue neutralizado y no se ejecutó segundo intento. Evidencia: `app/docs/evidence/p0-human-shopper-readonly-run-failure-31735473752.json`.

## Antes de cualquier nuevo provider read

- Corregir source-only el mecanismo diagnóstico para que capture el error aun si el proceso falla.
- Separar la recuperación offline del usuario visible Admin B de la lectura del Shopper.
- Solo si todavía es necesaria otra lectura, solicitar un gate explícito nuevo.

## Después de resolver el P0

- Repetir validación humana Shopper: perfil, país, histórico, disponibles, reservas/asignación, mis visitas y Academia según alcance.
- Validar Admin/Operaciones.
- Ejecutar E2E sintético bajo gate separado.
- Evaluar cutover real únicamente después de PASS humano y funcional.

No crear candidata nueva ni rediseñar frontend; no inferir identidades por nombre.
