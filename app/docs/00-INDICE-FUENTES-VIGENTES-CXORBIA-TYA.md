# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-13 05:21 -06:00  
**Estado vivo:** `M8_PASS__PHASE_A_96__M9_PROVIDER_PRECUTOVER_NEXT__NO_PRODUCTION`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Evidencia M8: `app/docs/evidence/m8-human-validation-rollback-ready-31694998731.json`.
4. M8 run `31694998731`, job `94430661554`, artifact `9178957729`, digest `sha256:296a404470dc692d2b01679550d2e19b3429ca281f7c9333655ebf3bb8b1f85b`.
5. Evidencia M7 Runtime 12: `app/docs/evidence/c6-live-user-admin-runtime-proof-31658676280.json` y run `31658676280`.
6. C6 Staff Exact Write V2 canonical readback PASS, cerrado/no repetible.
7. CAMBIOS/RESUMEN/PENDIENTES y Phase A tracker vigentes.
8. Fuentes maestras/addenda activos y PR #7 sobre la rama viva `docs-tya-v6-v71-audit`.

## Estado técnico vigente

- Phase A: **96% certificado / 4% restante**.
- `M7=5/5 COMPLETE`; `M8=3/3 COMPLETE`.
- M8 decisión: `PASS_M8_HUMAN_VALIDATION_ROLLBACK_READY_READONLY`.
- Principal `B=admin`; contexto `admin / staff / tya / cinepolis`; membership verificada.
- HR viva: **15 periodos / 660 visitas**, `2025-06 → 2026-08`.
- Perfiles protegidos=197; identity-map=211; identity review=0.
- Duplicate visit keys=0; duplicate shopper IDs=0.
- Rutas PASS: dashboard, proyectos, visitas, postulaciones, cert, financiero, aprendizaje.
- Dos reconciliaciones HR frescas PASS, sin altas/bajas de visit keys.
- Financiero/Beneficios por rol PASS.
- Errores page/HTTP/request=0.
- Gate humano de confidencialidad validado como comportamiento esperado; consentimiento no registrado por QA.
- Source/build lock preservado; runtime app parity con M7=true.
- Rollback readiness: `READY_FAIL_CLOSED_FOR_M9_PROVIDER_CAPTURE`.

## Seguridad

Provider writes=0; Hosting deploys=0; Cloud Run deploys=0; nuevos Auth/Firestore/HR/Rules/Storage writes=0; Make/Gemini/pagos=0; browser-local consent writes QA=0; credenciales/tokens expuestos=false; merge=false; producción=false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=3/3 | M9=0/3 | M10=0/1`

**Phase A=96% | restante=4% | delta certificado M8=+3 puntos.**

## Siguiente acción exacta

Continuar inmediatamente con M9, sin reabrir M7/M8: capturar read-only la release/version productiva vigente, verificar rollback soportado por el proveedor y preparar el bind exacto a los bytes/source-lock M8. Si esos controles pasan, solicitar/usar únicamente el gate explícito de una promoción productiva. Después M10 smoke/freeze final.
