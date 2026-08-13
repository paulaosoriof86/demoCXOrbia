# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-13 05:31 -06:00  
**Estado vivo:** `M9_PRECUTOVER_PASS__PHASE_A_96__AWAIT_EXPLICIT_CUTOVER_GATE__NO_PRODUCTION_MUTATION`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Evidencia M9 pre-cutover: `app/docs/evidence/m9-provider-precutover-readiness-31695760214.json`.
4. M9 pre-cutover: run `31695760214`, job `94433057739`, artifact `9179228696`, digest `sha256:83233d83fa56e3ca1f1afb437fccdce16fd368efbb362e0ffb1db51afede95c1`.
5. Evidencia M8: `app/docs/evidence/m8-human-validation-rollback-ready-31694998731.json` y run `31694998731`.
6. Evidencia M7 Runtime 12 y C6 Staff Exact Write V2 canonical readback PASS, cerrados.
7. CAMBIOS/RESUMEN/PENDIENTES y Phase A tracker vigentes.
8. Fuentes maestras/addenda activos y PR #7 sobre `docs-tya-v6-v71-audit`.

## Estado técnico vigente

- Phase A: **96% certificado / 4% restante**.
- `M7=5/5 COMPLETE`; `M8=3/3 COMPLETE`; `M9=0/3 PRECUTOVER_READY`.
- M9 provider decision: `PASS_M9_PROVIDER_PRECUTOVER_READINESS_READONLY`.
- Estrategia: `PROMOTE_EXISTING_CLEAN_PROJECT`.
- M8 source/build bind: target `62edaf552c2a62a8964671f691d600a417ae63f8`, build `ecc725866acc3eb8`, aggregate SHA `ecc725866acc3eb8aab292000be3ec31d1c46b5c14a53c8889fa7d6716a997e2`.
- Runtime drift después de M8=0.
- Release pre-cutover: `sites/cxorbia-backend-dev/releases/1786585552096000`.
- Version rollback capturada: `sites/cxorbia-backend-dev/versions/a9670bb8a19862cd`, `FINALIZED`.
- Rollback readiness: `READY_CAPTURED_FINALIZED_VERSION_PROVIDER_METHOD_VERIFIED`.
- Provider writes/deploys/production mutation=0.

## Seguridad

Authenticated Hosting GETs=2; provider writes=0; Hosting deploys=0; Cloud Run deploys=0; nuevos Auth/Firestore/HR/Rules/Storage writes=0; Make/Gemini/pagos=0; rollback execution=false; merge=false; production mutation=false; credenciales/tokens expuestos=false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=3/3 | M9=0/3 | M10=0/1`

**Phase A=96% | restante=4%.**

## Siguiente acción exacta

La preparación técnica pre-cutover está cerrada. El único bloqueo vigente antes de producción es la autorización explícita `M9_EXPLICIT_CUTOVER_ONE_PRODUCTION_PROMOTION`. No ejecutar despliegue ni rollback sin ese gate. Al PASS del cutover: Phase A 99%; luego M10 smoke/freeze final → 100%.
