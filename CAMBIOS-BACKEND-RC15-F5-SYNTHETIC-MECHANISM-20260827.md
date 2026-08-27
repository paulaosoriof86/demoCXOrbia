# CAMBIOS BACKEND — RC15 F5 mecanismo sintético corregido — 2026-08-27

## Bloque
F5 — preparación source-only de aceptación sintética integral.

## Corrección de continuidad
Se descartó la interpretación provisional que separaba un proyecto Firestore sintético. La autoridad canónica vigente exige `tenantId=tya`, `projectId=cinepolis` y aislamiento mediante `CXORBIA_E2E_SYNTH_*` + `syntheticRequestId`.

## Reparación materializada
- `backend/runtime/cxorbia-f5-synthetic-acceptance-provider-v1.mjs`
  - reutiliza el provider G2-B canónico sobre `tya/cinepolis`;
  - agrega `SEED`, `READBACK`, `CLEANUP` y validación post-clean;
  - exige IDs sintéticos exactos y tagging por request;
  - bloquea colisiones con documentos no sintéticos;
  - cleanup elimina solo documentos del request sintético exacto.
- `backend/runtime/hr-live-service/g2b-synthetic-runtime.mjs`
  - conserva el endpoint canónico `tya/cinepolis`;
  - agrega operaciones `SEED`, `READBACK`, `CLEANUP` y `POST_CLEANUP_READBACK`;
  - usa autoridad F5 fresca por variables de entorno;
  - no habilita writes por source: sigue requiriendo gate runtime explícito.
- `backend/config/cxorbia-f5-synthetic-acceptance-authority.json`
  - registra F5 source-ready;
  - runtime promotion permanece `authorized=false`.
- `app/docs/evidence/RC15-F5-SYNTHETIC-MECHANISM-PREFLIGHT-LATEST.json`
  - registra preflight corregido y counters cero.

## Verificación
- `node --check` provider: PASS.
- `node --check` runtime: PASS.
- JSON authority/evidence válido.
- UTF-8 sin BOM.

## Seguridad
Cloud Build, Cloud Run update, Hosting deploy, Firestore/Auth/Storage/HR externa/datos reales/pagos/Rules/Make/Gemini/merge: 0.

`PRODUCTION_REAL_READINESS` permanece 81/100. F5 no sube a 86 hasta ejecución integral, cleanup y post-clean readback PASS.

## Siguiente exacto
`F5_SOURCE_MECHANISM_READY_AWAITING_EXPLICIT_RUNTIME_PROMOTION_AUTHORIZATION`.

## Clasificación
- Reusable CXOrbia: sí — exact-tag synthetic seed/cleanup/readback.
- Exclusivo cliente: `tya/cinepolis`.
- Claude/prototipo: sin cambio frontend.
- Academia: sin impacto funcional aún.
- Sin impacto Claude: backend/runtime/control-plane.
