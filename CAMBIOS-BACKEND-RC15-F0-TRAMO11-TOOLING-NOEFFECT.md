# CAMBIOS-BACKEND — RC15 tooling · NO-EFFECT INCIDENTS TRAMO 11/12

**Fecha:** 2026-08-22  
**Bloque:** continuidad F0 Tramo 11 → 12  
**Estado:** `NO_EFFECT_CORRECTED`

Durante la preparación y continuidad documental de F0 ocurrieron tres llamadas erróneas rechazadas por GitHub antes de afectar la rama viva:

1. `create_commit` con `tree_sha="dummy"`: HTTP 422 por formato inválido.
2. `create_commit` con `tree_sha=0000000000000000000000000000000000000000`: HTTP 422 porque el tree no existe.
3. `create_file` sobre path `SHOULD_NOT_USE` apuntando a branch inexistente `nope`: HTTP 404 `Branch nope not found`.

Las tres llamadas tienen efecto neto cero: no crearon archivo, commit, branch ni ref; no dispararon workflow; no produjeron provider/data/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos/deploy/merge ni cambio funcional de source.

La regla operativa queda reafirmada: para sincronización canónica multiarchivo o documental usar exclusivamente `create_blob → create_tree → create_commit → update_ref(force=false)` después de readback del HEAD vivo. `create_file`, `update_file` y `delete_file` quedan prohibidos para probes o movimiento de refs.

La publicación válida previa del Tramo 11 se realizó con el flujo atómico obligatorio y dejó HEAD `9f74ad773ea411da49683830bf41e337b2c1ec50` antes de este addendum. Este incidente no cambia los hallazgos RC15, el source lock, el proveedor ni Phase A.
