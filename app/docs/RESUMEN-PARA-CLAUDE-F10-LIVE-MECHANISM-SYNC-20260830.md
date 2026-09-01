# RESUMEN PARA CLAUDE — F10 LIVE MECHANISM SYNC — 2026-08-30

**STATE_SYNC_EPOCH:** `CXORBIA-20260830-F10-LIVE-ROW-CONTENT-PASS-MECHANISM-SYNC-14`  
**F10:** `TECHNICAL_PASS_PENDING_OWNER_VISUAL_ACCEPTANCE`  
**NEXT:** `F10_OWNER_VISUAL_ACCEPTANCE_THEN_CLOSE_INCIDENT_OR_OPEN_FOCAL_VISUAL_DEFECT`

## HARD PRESERVE

No restaurar V182 ni modificar por F10 `app/modules/**`, `app/core/**`, `app/app.js` o entrypoint. La matriz base conserva 41 blobs exactos y el live overlay confirma 41/41 después del deploy, 0 mismatches.

El único cambio funcional F10 servido es `app/adapters/tya-canonical-state-semantics-v2.js`, blob `941051c96a26017363acfc72f7e88edbe70c68ba`. Separa lifecycle histórico de evidencia operacional directa.

## Resultado live

Run `33297814889`: 44 filas de agosto con digest operacional idéntico entre provider fresh y Admin live, KPIs exactos 44/30/14/4/4/1/30/0. Las revisiones de los dos refresh fueron diferentes de forma esperada; ya no se usa igualdad de revision token como prueba de contenido.

No hay ajuste frontend requerido para cerrar técnicamente este incidente. La única mejora visual opcional ya conocida es mostrar `Candidatas a liquidación` separado de `Liquidadas`, sin cambiar el significado de esta última.

Cliente/Cliente 360 permanece como HOLD separado y no debe mezclarse con F10.

Academia/manuales: esperar aceptación visual; luego alinear definiciones de hitos si corresponde.
