# CAMBIOS BACKEND — V159 HOSTING DEV PASS

Fecha: 2026-07-18

## Resultado

V159 completó gates locales, Firebase Hosting DEV, prueba remota del build exacto y smoke remoto.

- Estado: `hosting_dev_remote_smoke_pass_pending_visual`.
- URL: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`.
- Workflow run: `29626385151`.
- Commit desplegado: `8cf166eea6a0ebd0b2c6221925671d04865999f0`.
- Hosting version: `projects/87461567267/sites/cxorbia-backend-dev/versions/c8add179fb326b6a`.
- Artefacto sanitizado: `8430697082`.
- Digest: `sha256:fbe071cf34561df95c6e4cffa393f3c6851d742eb8f00776c28a3354e4365692`.
- Blockers finales: `0`.
- P0 frontend demostrado: no.

## Causas raíz corregidas

1. **Proyecto y periodo colapsados.** `tya-source-safe-binding-build-r18a.mjs` quedó como compatibility entrypoint del binding canónico R15G. Proyecto `cinepolis` y periodo `cinepolis-YYYY-MM` permanecen separados.
2. **Estados perdidos en el adapter.** R15G conserva estados operativos, submitido, liquidación, pago, `financialControl`, evidencias y razones de revisión; no infiere pago.
3. **Junio validado con heurística obsoleta.** R18D expone el sobre financiero source-safe aprobado y el gate acepta únicamente evidencia canónica o control financiero protegido.
4. **Carril de deploy fragmentado.** Se creó `tools/release/tya-r15g-dev-root-deploy.sh` como ejecutor único; el workflow quedó como wrapper de autorización y runner.
5. **Carrera de propagación remota.** El ejecutor incorpora polling, cache-busting y validación exacta de build/commit antes del smoke remoto.
6. **Estado de gobierno incompleto.** Registry y contrato incorporan `hosting_dev_remote_smoke_pass_pending_visual`, sin congelar V159 antes de aprobación visual.

## Archivos principales

- `tools/release/tya-source-safe-binding-build-r18a.mjs`
- `tools/release/tya-source-safe-binding-build-r15g.mjs`
- `tools/release/tya-visible-overlays-build-r18d.mjs`
- `tools/qa/tya-project-period-kpi-history-gate.mjs`
- `tools/release/tya-r15g-dev-root-deploy.sh`
- `.github/workflows/cxorbia-phase-a-r15g-dev-root-deploy.yml`
- `.github/workflows/cxorbia-prototype-baseline-atomicity.yml`
- `backend/contracts/prototype-baseline-registry-v1.json`
- `backend/contracts/phase-a-live-execution-checkpoint-v1.json`
- `tools/qa/verify-prototype-baseline-atomicity.mjs`
- `tools/qa/verify-fast-lane-promotion-policy.mjs`
- `tools/qa/verify-phase-a-live-execution-checkpoint.mjs`

## Evidencia funcional

- 14 periodos.
- 616 visitas.
- 44 visitas por periodo activo.
- GT 34 y HN 10.
- Proyecto y periodo separados.
- Junio ejecutado con liquidación/pago pendiente.
- Pagos confirmados o inferidos: 0.
- Shoppers actuales: 215; referencia: 216; identidades inventadas: 0.

Resultados remotos:

- `PASS_WITH_WARNING_R15G_TYA_SOURCE_SEMANTICS`.
- `PASS_WITH_REVIEW_SOURCE_SAFE_VISUAL_SMOKE`.
- `PASS_TYA_PROJECT_PERIOD_KPI_HISTORY`.
- `PASS_WITH_REVIEW_R18D_VISIBLE_OVERLAYS`.

## Advertencias no bloqueantes

- Deriva shopper 215/216 bajo revisión R11D.
- HR DEV es snapshot fresco de build, no sincronización runtime live.
- Conteo shopper no visible en todos los módulos: P1, no P0.

## Siguiente acción

Paula valida visualmente el mismo build. Solo con `APROBADO` se congela V159 como `ACTIVE_BASELINE` y se continúa al Corte 1.

## Clasificación

- Reusable CXOrbia: binding canónico, sobre financiero, ejecutor único, polling y estado pre-freeze.
- Exclusivo TyA/Cinépolis: 14/616/44, GT/HN, junio y R11D 215/216.
- Claude/prototipo: sin tarea nueva confirmada.
- Academia: validación visual por rol pendiente.
- Sin impacto Claude: CI, registry, contratos, gates y documentación.

## Estado seguro

Hosting DEV ejecutado. Sin merge, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
