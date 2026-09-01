# CAMBIOS-BACKEND — M3 MECHANISM REPAIR V2 — 2026-08-25

**Bloque:** `M3_MECHANISM_CERTIFICATION_V2`  
**Master plan:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1` FROZEN  
**Phase A:** `98/100`  
**Clasificación:** Reusable CXOrbia + Sin impacto Claude + Sin impacto Academia funcional.

## Causa raíz reproducida

- Run `32908444518`: el checkpoint legacy produjo `FUNCTIONAL_SOURCE_DRIFT` después de 17 pasos source-safe PASS porque `verify-phase-a-live-execution-checkpoint.mjs` consultaba el lock funcional en la ruta pre-M3 y delegaba al validador continuity superseded.
- Run `32908444528`: el provider preflight se autoejecutó en M3 y falló `G2B_SOURCE_FIREWALL_GATE_MISSING` contra el source-fix histórico `1d2cfecb...`; esa comprobación pertenece a M4/F3.
- Efectos observados de ambos fallos: provider/data/deploy/G2-B/merge = 0.

## Archivos tocados en V2

- `.github/workflows/cxorbia-phase-a-live-checkpoint.yml`: convertido al único gate automático M3 source-only, sin provider access.
- `.github/workflows/cxorbia-live-hr-provider-capability-preflight.yml`: retenido como `workflow_dispatch` histórico/inert durante M3.
- `tools/qa/verify-phase-a-live-execution-checkpoint.mjs`: actualizado a estado M3, `productionState.functionalSourceLock` y validadores M3.
- `backend/config/cxorbia-validator-authority.json`: autoridad v3; checkpoint M3 activo y provider preflight fuera de fase.
- `app/docs/evidence/RC15-M3-MECHANISM-CERTIFICATION-LATEST.json`: evidencia v2.
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`, `CHECKPOINT-OPERATIVO...`, `EXECUTION-STATE...`, `SOURCE-LOCK...`: mirrors actualizados.
- `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`: continuidad obligatoria actualizada.

## Preservado

No se modifica master plan congelado, source funcional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`, frontend, datos, Auth, Firestore, Storage, HR, Rules, Make, Gemini, pagos, Cloud Run, Hosting ni merge. CP011/CP142 siguen inertizados; quedan 28 residuales M3.

## Gate de cierre

La reparación V2 no se declara certificada por escritura. Debe materializarse en un único commit Git, resolverse por readback y pasar `cxorbia-phase-a-live-checkpoint.yml` sobre ese SHA exacto. Solo entonces se registra `MECHANISM_CERTIFIED_PASS`.
