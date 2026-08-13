# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-13 09:56 -06:00  
**Estado vivo:** `M9_ROLLBACK_PASS__PHASE_A_96__M9_OPEN`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. `app/docs/evidence/m9-production-cutover-rollback-20260813.json`.
4. Rollback PASS: run `31717685287`, job `94506445934`, artifact `9187949832`, digest `sha256:03d45b6abee5d8c9075c994c84b8d70f0d27ef2b0186898bb7c341d645cf68f5`.
5. Primera tentativa M9: run `31717205489`, job `94504821122`, artifact `9187783814`, digest `sha256:fa83bf4237a71f9c818e82134570d47d0de97185cafa1a91a51fb2d86dc241e1`.
6. Evidencia M9 pre-cutover y M8 PASS.
7. CAMBIOS/RESUMEN/PENDIENTES y tracker vigentes.
8. Fuentes maestras/addenda activos y PR #7.

## Estado técnico vigente

- Phase A: **96% certificado / 4% restante**.
- M7=5/5 COMPLETE; M8=3/3 COMPLETE; M9=0/3 OPEN; M10=0/1.
- La única promoción productiva autorizada fue consumida una vez.
- El smoke inmediato no certificó M9 porque el runner era específico del carril DEV.
- El rollback autorizado quedó verificado con PASS.
- Versión live restaurada: `a9670bb8a19862cd`.
- Segunda promoción=0; merge=false.

## Siguiente acción exacta

Validar una entrada productiva read-only con instrumentación separada del carril DEV. No certificar M9 ni repetir la promoción con el gate consumido.
