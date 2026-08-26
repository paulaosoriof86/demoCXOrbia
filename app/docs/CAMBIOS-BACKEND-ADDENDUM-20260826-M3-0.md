# CAMBIOS-BACKEND — ADDENDUM M3-0 QUIESCENCE Y READBACK DIRECTO

**Fecha:** 2026-08-26  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**Bloque:** `M3_0_CONTROL_PLANE_QUIESCENCE_SINGLE_AUTHORITY_BARRIER`  
**Resultado:** `CLOSED_PASS_DIRECT_GITHUB_READBACK`  
**PRODUCTION_REAL_READINESS:** `69/100`

Este addendum es la actualización vigente de `CAMBIOS-BACKEND.md` para el bloque M3-0.

## Cierre causal

La prueba final quedó en `dc5fa6b12fb3eac4331661f14f60e58b62b23d34`: solo cambió quiescence lock y evidence. El HEAD remoto permaneció estable, PR #7 siguió cerrado/no mergeado y no apareció ningún child commit ni workflow histórico automático. GitHub creó exactamente el checkpoint esperado, run `32985873737`, pero su job `98231662272` permaneció `queued`, con cero steps y sin runner aunque el run fue marcado `failure`. Eso demuestra degradación del transporte Actions antes de ejecutar código, no un fallo del source gate.

La reparación definitiva desacopla M3 de Actions. El source-only gate pasa a `DIRECT_GITHUB_READBACK`, con `backend/config/cxorbia-m3-direct-readback-gate.json` y `tools/continuity/validate-cxorbia-m3-direct-readback.js`; GitHub Actions queda como telemetría no autoritativa.

Se preservan 22 workflows históricos en el blob inerte válido `5e33e90c4498f8f6bbbd8a0dda4d79a1ae393c96`. M1/M2/F0 continúan cerrados. CP011/CP108/CP142 continúan inertizados y quedan 27 residuales.

## Seguridad

Provider writes=0; business data=0; Auth=0; Firestore=0; Storage=0; HR=0; Rules=0; Hosting deploy=0; Cloud Run deploy=0; Make=0; Gemini=0; pagos=0; merge=false; frontend funcional=0. Functional source lock preservado `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

## Clasificación

- **Reusable CXOrbia:** readback directo como autoridad, CI como telemetría, lotes atómicos con receipts encadenados.
- **Exclusivo TyA:** rama viva, PR #7 y cola RC15 de 27 residuales.
- **Claude/prototipo:** sin cambio funcional frontend.
- **Academia:** sin impacto funcional.
- **Sin impacto Claude:** control-plane, validadores y evidence.

## Incidente de herramienta

Durante esta ejecución se creó accidentalmente la rama `__noop__` apuntando al HEAD de trabajo por una invocación errónea de `create_branch`. No contiene delta propio y no afecta rama viva, PR, provider ni producto. El conector disponible no expone borrado de refs; queda prohibido usarla y debe eliminarse administrativamente cuando exista una ruta autorizada de borrado.

## Siguiente

`M3_FINITE_QUEUE_BATCH_1`: familia finita → commit atómico → readback remoto directo → reducción exacta del residual → receipt encadenado → siguiente lote.
