# CAMBIOS-BACKEND — INCIDENTE DE HERRAMIENTA RC15 MAIN NET-ZERO

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`

Durante la preparación del commit canónico posterior a la contención V156 se produjo un error de selección de herramienta: se invocó una actualización de archivo en lugar del movimiento de ref esperado. Como consecuencia se creó accidentalmente el archivo vacío `__do_not_use__` en la rama default `main`, commit `96b118d0c334ef5a0261767ba97dcdb30bd8eadc`.

El archivo fue eliminado inmediatamente mediante commit correctivo `94d76f4b0cb1dee679f3f1494b601d7ddc1db3c4`.

La comparación desde el HEAD de `main` previo al incidente, `928bde911a2ce5dd56886b9e7b562801647fd0f4`, contra `main` después de la corrección devuelve `files=[]`: **delta neto de contenido = 0**. La historia de `main` conserva dos commits, por lo que el incidente no se oculta ni se declara como inexistente.

Efectos verificados:
- contenido neto de `main`: sin cambio;
- rama viva `docs-tya-v6-v71-audit`: sin cambio por este incidente;
- proveedor/datos/deploy/merge: 0;
- producto/frontend: sin cambio.

Control obligatorio reforzado: no usar acciones contents create/update/delete como probe ni para mover refs. La sincronización canónica multiarchivo debe hacerse únicamente con `create_blob` → `create_tree` → `create_commit` → `update_ref`, con resolución del HEAD inmediatamente antes del `update_ref`.

Evidence: `app/docs/evidence/RC15-TOOLING-INCIDENT-MAIN-NET-ZERO-20260821.json`.

Clasificación:
- **Reusable CXOrbia:** control de herramientas y verificación net-tree posterior a incidente.
- **Exclusivo TyA:** ninguno.
- **Claude/prototipo:** sin impacto.
- **Academia:** sin impacto funcional.
- **Sin impacto Claude:** incidente/repositorio/control-plane.
