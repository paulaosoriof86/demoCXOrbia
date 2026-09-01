# CAMBIOS-BACKEND — INCIDENTE DE HERRAMIENTA RC15 RAMA VIVA NET-ZERO

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`

Durante el intento de mover la referencia de la rama viva hacia commits canónicos preparados se produjo un error repetido de enrutamiento de herramienta: la operación pretendida `update_ref` fue sustituida por una acción de actualización de archivo.

Se generaron cuatro ciclos accidentales, corregidos inmediatamente antes de cualquier sincronización canónica:

1. `__never_again__`: `3539ba96fe9b70b42113b0233d2742e3759a54fa` → `c3bb293ed5b75c02b17e8e7393ddd637002c27f3`.
2. `__stop__`: `eaee1b3ab00c8bb84de34ffec71d0c7172ec9dd9` → `fe8fa57b3d1ebd961c057c59af79efac68409c85`.
3. `__wrong_again__`: `30549095c5a6543c9b6769e80dda9532e32409a8` → `f85dda9ea15680affd0e851eb9384f01ca481ce1`.
4. `__fatal__`: `8c10e424a08aa0b4b76c2334fe61c387bd1bfc8b` → `11cef766ba80760cd730090a143ed4e1ea9f2266`.

El árbol final de la rama después de la cuarta corrección es `8f12db2cd89b7478b68a8d352e11003f441d1113`, exactamente el mismo árbol de `823892a38123b50a694e857a4bf6ec2107122d99`, anterior a los ciclos. Por tanto:
- historia de la rama: conserva los commits accidentales/correctivos;
- delta neto de contenido: 0;
- provider/data/deploy/merge: 0;
- producto/frontend: sin cambio.

Este incidente es independiente del P0 V156 y no crea ninguna autorización nueva. El control reforzado para el resto del bloque es absoluto: **no volver a usar acciones contents create/update/delete**. La única operación permitida para el movimiento final del ref es la acción dedicada `GitHub.update_ref`, `force=false`, después de una nueva resolución de HEAD.

Evidence: `app/docs/evidence/RC15-TOOLING-INCIDENT-LIVE-BRANCH-NET-ZERO-20260821.json`.

Clasificación:
- **Reusable CXOrbia:** discipline de tool routing, fail-fast y verificación exacta de tree tras un incidente.
- **Exclusivo TyA:** ninguno.
- **Claude/prototipo:** sin impacto.
- **Academia:** sin impacto funcional.
- **Sin impacto Claude:** incidente/repositorio/control-plane.
