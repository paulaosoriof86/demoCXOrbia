# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

Fecha: 2026-07-18  
Estado: `CORTE_0_POST_GATES_RERUN_PENDING_EVIDENCE`

## Repositorio y destino

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama: `docs-tya-v6-v71-audit`
- PR: `#7`, draft/open/no merge
- HEAD de trabajo documentado: `0196cfdd6bde8e0730db647717638f70949a95d9`
- Prohibido: `main`, rama nueva, PR nuevo, nueva candidata o segundo empalme

## Runtime vigente

- V159 está auditada y empalmada.
- Commit de empalme: `d47ea700f7e48a2b0ba31574a84b89c6a20f3449`.
- Manifest, build-lock y verificador: presentes y reconciliados.
- Preflight estructural: PASS.
- Preflight semántico estático: PASS.
- P0 demostrado: no.
- Estado de V159: `EMPALMED_PENDING_POST_GATES` / `TECHNICAL_PASS_PENDING_VISUAL`.
- `ACTIVE_BASELINE`: todavía no; requiere gates de runtime, Hosting DEV, smoke remoto y aceptación visual.
- V131 permanece únicamente como última referencia visual congelada de rollback hasta el freeze de V159.

## Corte activo

`CORTE_0_V159_POST_EMPALME`

Secuencia obligatoria restante:

`GATES POST-EMPALME → HOSTING DEV EXACTO → SMOKE REMOTO → VALIDACIÓN VISUAL → ACTIVE_BASELINE`

No se inicia otro corte, Firebase limpio, importación, Auth o producción antes de cerrar esta secuencia.

## Trabajo ejecutado en este bloque

Se inspeccionó la evidencia sanitizada del intento anterior de Hosting DEV V159. El deploy no llegó a ejecutarse: catorce pasos previos pasaron y el flujo se detuvo en los gates locales.

Hallazgos exactos:

1. El builder temporal R18A usado en ese intento asignaba el identificador del periodo a `currentProjectId`, colapsando proyecto y periodo.
2. El builder canónico R15G ya preservaba la separación correcta: proyecto `cinepolis` y periodo con llave propia.
3. La fuente reciente traía 215 shoppers frente a la referencia auditada 216. La diferencia debe quedar visible en revisión R11D, pero no equivale a identidad inventada ni autoriza completar, borrar o materializar shoppers.
4. El registro de baseline, los validadores atómicos y un checkpoint histórico seguían expresando estados V110/V113/V131 anteriores y bloqueaban los gates aunque V159 ya estaba físicamente empalmada.

Correcciones aplicadas directamente:

- `tools/qa/tya-source-semantics-r15g-gate.mjs`: deriva shopper visible como warning R11D; inconsistencias, vacío o identidades inventadas siguen bloqueando.
- `app/core/build-lock.js`: ruta del manifest V159 corregida a `app/docs/MANIFEST-V159-EMPALME-DIRECTO-20260717.json`.
- `backend/contracts/prototype-baseline-registry-v1.json`: V131 como rollback visual congelado y V159 como runtime empalmado pendiente de post-gates/freeze.
- `tools/qa/verify-prototype-baseline-atomicity.mjs`: transición V159 previa al freeze validada sin declararla activa antes de tiempo.
- `tools/qa/verify-fast-lane-promotion-policy.mjs`: política alineada con runtime V159 y preservación del árbol completo.
- `app/docs/PHASE-A-LIVE-EXECUTION-CHECKPOINT-TYA-20260713.md`: histórico marcado `SUPERADO_NO_USAR_COMO_ESTADO_OPERATIVO`.
- `backend/contracts/phase-a-live-execution-checkpoint-v1.json`: contrato vivo actualizado a Corte 0 V159.
- `tools/qa/verify-phase-a-live-execution-checkpoint.mjs`: ahora valida únicamente índice, plan y checkpoint canónicos.

Commits principales del saneamiento:

- `3132d9280d57895a93d11fe168d5ebe63471937a`
- `28132969a6c317976ac2d109afafdb4d44f3f9cb`
- `d042245bcb7de507b27b1be0c8f78f64a9cd3ef2`
- `1392e88fa76f02745ace3cd46e4bdaf5fe726192`
- `037e79d192774c45abf04c78441297053a967128`
- `d50f87de964eda1ea2455869e0dffc370a6088d6`
- `a86126144359dbf8ba7168f62774d0a817354ad8`
- `39dc2fbb69323702ab0535f990eda983ee129c1f`
- `6e36f2f2f9621d90390e9215d2f3bfa0efdceb15`

Documentación actualizada:

- `CAMBIOS-BACKEND-ADDENDUM-V159-PREFLIGHT-SEMANTICO-20260717.md` — `dd5454d0f6a8d2b1e0c62feaf5960888332b725c`.
- `RESUMEN-PARA-CLAUDE-ADDENDUM-V159-PREFLIGHT-SEMANTICO-20260717.md` — `793d80110c324b3b2e8200e6322c470f819008ee`.
- `PENDIENTES-PROTOTIPO-ADDENDUM-V159-PREFLIGHT-SEMANTICO-20260717.md` — `38d64bd9149b2905cf10ee19d5b2a9b9aa634581`.
- `ACADEMIA-IMPACT-V159-EMPALME-DIRECTO-20260717.md` — `dd8e72850a9ee88bd35db91d9d262da5520a5245`.
- `PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-V159-GO-20260717.md` — `0196cfdd6bde8e0730db647717638f70949a95d9`.

No se modificaron módulos frontend ni se reabrió el empalme.

## Gate en curso

El commit `6e36f2f2f9621d90390e9215d2f3bfa0efdceb15` volvió a activar el workflow canónico:

`.github/workflows/cxorbia-phase-a-source-safe-visual-smoke-tya.yml`

La evidencia solo puede aceptarse cuando los tres reportes sanitizados indiquen `ok:true`:

1. source semantics R15G;
2. smoke Admin, Shopper y Cliente;
3. proyecto, periodo, KPI e histórico.

No se declara PASS antes de obtener esa evidencia.

## Autorización vigente

Paula autorizó exclusivamente publicar el build V159 exacto en Firebase Hosting DEV `cxorbia-backend-dev` y ejecutar gate browser y smoke remoto.

No autorizó Firestore, Auth, Storage, HR writes, importaciones, Make, Gemini, pagos, merge ni producción.

## Siguiente acción exacta

1. Confirmar resultado sanitizado del rerun post-empalme.
2. Aceptar únicamente `ok:true` sin blockers; warnings R11D quedan documentados y no autorizan datos inventados.
3. Ejecutar el workflow manual restaurado `.github/workflows/cxorbia-phase-a-r15g-dev-root-deploy.yml` con `DEPLOY_DEV_ROOT_R15G`.
4. Publicar solo `hosting:cxorbia-dev`.
5. Ejecutar smoke remoto sobre el mismo build.
6. Entregar URL DEV y checklist visual a Paula.
7. Congelar V159 como `ACTIVE_BASELINE` solo después de `APROBADO` o ausencia de P0.

## Bloqueo real restante

El conector GitHub disponible no expone `workflow_dispatch` y el runtime local no tiene credencial Firebase/Google. Esto bloquea únicamente la invocación manual de Hosting DEV; no reabre auditoría, empalme, frontend ni metodología.

## Clasificación

- Reusable CXOrbia: estado transicional `empalmed_pending_post_gates`, freeze visual separado, deriva de conteos visible sin inventar datos y fuentes canónicas únicas.
- Exclusivo TyA/Cinépolis: proyecto `cinepolis`, 14 periodos, 616 visitas, 44 por periodo y revisión R11D del conteo shopper.
- Claude/prototipo: sin tarea nueva todavía; no pedir V160. Solo enviar hallazgo si el runtime demuestra P0 frontend reproducible y archivo/módulo responsable.
- Academia: validar por rol en el mismo build V159; reflejar proyecto vs periodo, fuente source-safe, revisión humana, certificaciones, liquidación vs pago y proveedores apagados.
- Sin impacto Claude: reconciliación de manifest, registros, validadores, checkpoints y gates técnicos.

## Estado seguro

Sin deploy ejecutado en este bloque, sin merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos. Sin base vieja conectada y sin datos sensibles crudos agregados.
