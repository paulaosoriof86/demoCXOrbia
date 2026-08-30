# CAMBIOS BACKEND — F10 LIVE CONTENT + MECHANISM SYNC — 2026-08-30

**STATE_SYNC_EPOCH:** `CXORBIA-20260830-F10-LIVE-ROW-CONTENT-PASS-MECHANISM-SYNC-14`  
**Estado:** `TECHNICAL_PASS_PENDING_OWNER_VISUAL_ACCEPTANCE`  
**NEXT:** `F10_OWNER_VISUAL_ACCEPTANCE_THEN_CLOSE_INCIDENT_OR_OPEN_FOCAL_VISUAL_DEFECT`

## Qué se verificó

1. El deploy F10 ya existente fue leído desde su artefacto: run `33289344796`, artefacto `9725498210`, Hosting release `1788058988151000`, version `958ed37dde65d592`, adapter correcto y 41 blobs remotos exactos con 0 mismatches.
2. Se reforzó el gate live: ya no valida solo KPIs agregados; calcula una firma operacional sanitizada por fila y exige SHA-256 exacto proveedor↔Admin live.
3. El run `33297606745` demostró que el digest de filas y los escalares pasaban, pero un check redundante comparaba objetos de países mediante `JSON.stringify`, sensible al orden de inserción. Fue clasificado como defecto del harness, no del producto.
4. Se corrigió ese check a comparación key/value. El run `33297814889`, artefacto `9727971958`, terminó `PASS_READONLY_POST_GATES` y `PASS_F10_LIVE_ADMIN_FRESH_CONTENT_EQUIVALENCE`.
5. El digest operacional exacto fue `a5a6d0bc1ed109e1c4088d09553e49c860f6d390d187859175c1fd2d19741bb0`; 44 filas, KPIs, resumen y países/estados coincidieron.
6. Se corrigió el control plane: request one-shot consumido/deshabilitado, overlay/documentos al mismo epoch, live overlay separado de la matriz predeploy, política permanente de certificación y validator de continuidad conectado al controlled runner existente.

## Archivos creados/tocados

- `tools/qa/tya-f10-live-admin-fresh-content-gate.mjs` — digest fila a fila y comparación de países order-independent.
- `tools/qa/cxorbia-controlled-runners-contract-core-v1.mjs` — preserva byte-for-byte la lógica anterior del gate controlado.
- `tools/qa/cxorbia-controlled-runners-contract-gate.mjs` — wrapper que ejecuta core + continuidad.
- `tools/continuity/validate-cxorbia-state-sync.js` — validador epoch 14.
- `.github/cxorbia-gate-requests/request.json` — terminalizado/consumido.
- `backend/config/cxorbia-phase-a-continuity-lock-postprod-overlay-v1.json` — cursor técnico PASS.
- `backend/config/cxorbia-f10-approved-module-authority-live-overlay-v1.json` — estado live posterior a matriz predeploy.
- `backend/contracts/cxorbia-f10-live-content-certification-policy-v1.json` — regla reusable.
- `app/docs/evidence/RC15-F10-LIVE-CONTENT-EQUIVALENCE-MECHANISM-SYNC-LATEST.json` — evidencia terminal técnica.
- índice, checkpoint, execution-state, source-lock, `CAMBIOS-BACKEND`, `RESUMEN-PARA-CLAUDE`, `PENDIENTES-PROTOTIPO` y sus mirrors raíz — sincronizados.
- nuevos addenda F10 20260830 para Claude/Pendientes/continuidad.

## Preservado

No se cambió ningún `app/modules/**`, `app/core/**`, `app/app.js`, entrypoint ni el adapter funcional F10 después del deploy. No hubo nuevo deploy, provider/business/Auth/Firestore/HR/Storage/Rules/payment writes, Make/Gemini, merge, rama o PR.

## Clasificación

- **Reusable CXOrbia:** certificación por row digest; revisión como trazabilidad; one-shot terminalizado; state-sync ejecutable en controlled runner.
- **Exclusivo TyA:** periodo agosto/Cinépolis, 660 visitas/15 periodos y los KPIs observados.
- **Claude/prototipo:** ningún cambio UI requerido por este cierre técnico. Posible mejora no bloqueante futura: `Candidatas a liquidación` separado de `Liquidadas`.
- **Academia:** sin cambio todavía. Tras aceptación visual, revisar glosario/manual de Realizada, Cuestionario pendiente, Submitida, Candidata a liquidación, Liquidada y Pagada.
- **Sin impacto Claude:** overlays, hashes, request, validator y mecanismo de QA.

## Pendiente real

Aceptación visual de Paula. Cliente/Cliente 360 permanece HOLD separado y no se mezcla con F10 HR/KPI.
