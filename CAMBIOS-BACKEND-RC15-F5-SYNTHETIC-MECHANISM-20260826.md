# CAMBIOS BACKEND — RC15 F5 mecanismo sintético — 2026-08-26

## Bloque
F5 — aceptación sintética integral. Preflight y reparación source-only del mecanismo antes del primer write.

## Hallazgo causal
El preflight contra HEAD `d37c2aeb8e5dd2a200ec7eabff8f5d8bcb7e5ae7` encontró tres defectos de mecanismo que obligan a fail-closed antes de cualquier dato sintético:

1. **split-brain de projectId:** el plan/request canónico aísla F5 en `CXORBIA_E2E_SYNTH_CINEPOLIS_2026`, mientras el runtime/provider existente exige `cinepolis` también para el comando y por tanto no puede ejecutar el escenario congelado en su proyecto aislado;
2. **cleanup ausente:** el runtime existente no ofrece seed, cleanup ni post-clean readback, aunque F5 exige cleanup total + readback cero-residuo para PASS;
3. **request histórico fijo:** el runtime existente mantiene `i5-g2b-live-synthetic-acceptance-20260820-01`, por lo que no puede vincular una autoridad F5 fresca sin source drift.

No se degradó el plan ni se ejecutó contra `cinepolis` para “hacerlo pasar”.

## Reparación materializada en source
- `backend/runtime/cxorbia-f5-synthetic-acceptance-provider-v1.mjs`
  - separa control project `cinepolis` de data project aislado `CXORBIA_E2E_SYNTH_CINEPOLIS_2026`;
  - exige IDs `CXORBIA_E2E_SYNTH_*`;
  - soporta `SEED`, `ASSIGN`, `CONFIRM`, `CHECK_IN`, `SUBMIT_RESULT`, `REVIEW_RESULT`, `APPROVE_RESULT`, `READBACK` y `CLEANUP`;
  - cleanup elimina únicamente documentos con `testSynthetic=true`, prefix exacto y `syntheticRequestId` exacto;
  - falla cerrado ante colisión, tag inválido, scope/actor inválido o residuo post-clean;
  - no contiene integración HR externa, Auth write, pago, Rules, Storage, Make ni Gemini.
- `backend/runtime/hr-live-service/g2b-synthetic-runtime.mjs`
  - conserva endpoint bajo control scope `tya/cinepolis`;
  - enruta datos al proyecto sintético aislado;
  - sustituye request histórico fijo por request+authorization frescos suministrados por env gate;
  - expone `POST_CLEANUP_READBACK` y devuelve FAIL si queda cualquiera de los artefactos explícitos.
- `backend/config/cxorbia-f5-synthetic-acceptance-authority.json`
  - registra autorización sintética vigente de la conversación;
  - deja `runtimePromotion.authorized=false`: esta reparación no autoriza Build/Cloud Run/Hosting.
- `app/docs/evidence/RC15-F5-SYNTHETIC-MECHANISM-PREFLIGHT-LATEST.json`
  - evidencia causal y counters cero.

## Gates ejecutados
- `node --check` sobre ambos módulos: PASS.
- parse JSON de authority/evidence: PASS.
- UTF-8 sin BOM: requerido y verificado antes de blob.

## Estado de seguridad
Provider reads/writes, synthetic writes, deploy, Cloud Build, Cloud Run update, Hosting deploy, Firestore/Auth/HR/Rules/Storage/pagos/Make/Gemini y merge: **0**.

`PRODUCTION_REAL_READINESS` permanece **81/100**. F5 no está PASS y no sube a 86 hasta ejecución sintética completa + cleanup + post-clean readback.

## Siguiente exacto
Después del commit/readback source-only: `F5_SOURCE_MECHANISM_REPAIRED_AWAITING_EXPLICIT_RUNTIME_PROMOTION_AUTHORIZATION`.

## Clasificación
- Reusable CXOrbia: sí — patrón isolated synthetic project + exact-tag cleanup + post-clean fail-closed.
- Exclusivo cliente: tenant `tya` y control project `cinepolis`.
- Claude/prototipo: sin cambio frontend.
- Academia: sin cambio funcional; evidencia de aceptación permanece pendiente de F5 real.
- Sin impacto Claude: source/runtime backend y control-plane.
