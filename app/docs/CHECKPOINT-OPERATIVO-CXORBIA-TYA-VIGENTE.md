# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

Fecha: 2026-07-18  
Estado: `CORTE_0_POST_GATES_RERUN_PENDING_EVIDENCE`

## Repositorio y destino

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama: `docs-tya-v6-v71-audit`
- PR: `#7`, draft/open/no merge
- Prohibido: `main`, rama nueva, PR nuevo, nueva candidata o segundo empalme

## Runtime vigente

- V159 auditada y empalmada.
- Commit de empalme: `d47ea700f7e48a2b0ba31574a84b89c6a20f3449`.
- Manifest, build-lock y verificador presentes y reconciliados.
- Preflight estructural y semántico estático: PASS.
- P0 demostrado: no.
- Estado: `EMPALMED_PENDING_POST_GATES` / `TECHNICAL_PASS_PENDING_VISUAL`.
- V159 no es todavía `ACTIVE_BASELINE`.
- V131 permanece únicamente como última referencia visual congelada de rollback hasta el freeze de V159.

## Corte activo

`CORTE_0_V159_POST_EMPALME`

Secuencia restante:

`GATES POST-EMPALME → HOSTING DEV EXACTO → SMOKE REMOTO → VALIDACIÓN VISUAL → ACTIVE_BASELINE`

No se inicia otro corte, Firebase limpio, importación, Auth o producción antes de cerrar esta secuencia.

## Avance de este bloque

Se inspeccionó la evidencia sanitizada del intento anterior de Hosting DEV. El deploy no se ejecutó: catorce pasos previos pasaron y el flujo se detuvo en gates locales.

Causas demostradas:

1. Un builder temporal R18A asignaba la llave del periodo a `currentProjectId`, colapsando proyecto y periodo.
2. El builder canónico R15G ya mantiene proyecto `cinepolis` y periodo con llave propia.
3. El snapshot actual tiene 215 shoppers frente a la referencia auditada 216; la diferencia queda visible en revisión R11D y no autoriza inventar, completar, borrar o materializar identidades.
4. Registry, validadores y un checkpoint histórico todavía expresaban estados V110/V113/V131 y bloqueaban los gates aunque V159 ya estaba empalmada.

Correcciones directas:

- gate shopper: deriva visible como warning R11D; inconsistencias e identidades inventadas siguen bloqueando;
- `build-lock.js`: ruta del manifest V159 corregida;
- registry: V131 como rollback visual y V159 como runtime empalmado pendiente de post-gates/freeze;
- validadores de atomicidad y fast lane alineados con la transición real;
- checkpoint histórico V113/V114 marcado como superado;
- contrato y verificador Phase A actualizados a Corte 0 V159;
- checkpoint, CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES, Academia y tracker actualizados.

No se modificó frontend ni se reabrió el empalme.

## Gate activo

El commit `6e36f2f2f9621d90390e9215d2f3bfa0efdceb15` reactivó:

`.github/workflows/cxorbia-phase-a-source-safe-visual-smoke-tya.yml`

Solo se acepta evidencia sanitizada con `ok:true` y cero blockers en:

1. source semantics R15G;
2. smoke Admin, Shopper y Cliente;
3. proyecto, periodo, KPI e histórico.

No se afirma PASS antes de obtener esa evidencia.

## Autorización vigente

Autorizado exclusivamente:

- Hosting DEV exacto V159 en `cxorbia-backend-dev`;
- browser gate y smoke remoto.

No autorizado:

- Firestore/Auth/Storage/HR writes;
- importaciones;
- Make/Gemini;
- pagos;
- merge o producción.

## Siguiente acción exacta

1. Confirmar la evidencia sanitizada del rerun post-empalme.
2. Ejecutar `.github/workflows/cxorbia-phase-a-r15g-dev-root-deploy.yml` con `DEPLOY_DEV_ROOT_R15G`.
3. Publicar únicamente `hosting:cxorbia-dev`.
4. Ejecutar smoke remoto del mismo build.
5. Entregar URL y checklist visual a Paula.
6. Congelar V159 como `ACTIVE_BASELINE` solo después de validación visual sin P0.

## Bloqueo real restante

El conector GitHub disponible no expone `workflow_dispatch` y el runtime local no tiene credencial Firebase/Google. Esto bloquea únicamente la invocación manual de Hosting DEV; no reabre auditoría, empalme, frontend ni metodología.

## Clasificación

- Reusable CXOrbia: transición empalme→post-gates→freeze, fuentes canónicas únicas y deriva visible sin inventar datos.
- Exclusivo TyA/Cinépolis: proyecto `cinepolis`, 14 periodos, 616 visitas, 44 por periodo y revisión R11D 215/216.
- Claude/prototipo: sin tarea nueva; no pedir V160. Solo intervenir ante P0 frontend reproducible localizado.
- Academia: pendiente smoke por rol del mismo build V159 y validación de proyecto/periodo, fuentes, certificaciones, pagos y proveedores apagados.
- Sin impacto Claude: manifest, registry, validadores, checkpoints y gates técnicos.

## Estado seguro

Sin deploy ejecutado en este bloque, sin merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos. Sin base vieja conectada ni datos sensibles crudos agregados.
