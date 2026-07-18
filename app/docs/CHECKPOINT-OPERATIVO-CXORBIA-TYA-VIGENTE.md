# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

Fecha: 2026-07-17  
Estado: `HOSTING_DEV_AUTHORIZED_READY_TO_DISPATCH`

## Repositorio y destino

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama: `docs-tya-v6-v71-audit`
- PR: `#7`, draft/open/no merge
- Prohibido: `main`, rama nueva, PR nuevo

## Baseline candidata

- V159 empalmada
- Commit de empalme: `d47ea700f7e48a2b0ba31574a84b89c6a20f3449`
- Manifest, build-lock y verificador: presentes
- Preflight estructural y semántico estático: PASS
- P0 demostrado: no
- `ACTIVE_BASELINE`: pendiente Hosting DEV, browser smoke y validación visual

## Reconciliación del desvío cerrada

Se restauraron exactamente al checkpoint previo al intento fallido:

- `.github/workflows/cxorbia-phase-a-r15g-dev-root-deploy.yml`
- `.github/workflows/cxorbia-phase-a-r18d-visible-overlays-smoke.yml`
- `tools/qa/tya-source-semantics-r15g-gate.mjs`

Commits de restauración verificables:

- `e59dd6b4dd2f7f8289285ffe839d3d5d03969924`
- `19b2fb6a085acd9e1f21c63f457e4e5eff6e180f`
- `1419b11e8d1e87dbe6856fe50c9be86ca9f99120`

Evidencia de reconciliación:

- checkpoint técnico anterior: `d5fb26dab1610a400514430d6ad731f75234a092`
- HEAD reconciliado: `1419b11e8d1e87dbe6856fe50c9be86ca9f99120`
- comparación neta `d5fb26d...1419b11`: cero archivos modificados
- archivos runtime V159: no modificados por el incidente
- segunda candidata/segundo empalme: no ocurrió

## Autorización vigente

Paula autorizó exclusivamente publicar el build V159 exacto en Firebase Hosting DEV `cxorbia-backend-dev` y ejecutar gate browser y smoke remoto.

No autorizó Firestore, Auth, Storage, HR writes, importaciones, Make, Gemini, pagos, merge ni producción.

## Siguiente acción exacta

Ejecutar el workflow manual existente:

`.github/workflows/cxorbia-phase-a-r15g-dev-root-deploy.yml`

sobre `docs-tya-v6-v71-audit` con confirmación:

`DEPLOY_DEV_ROOT_R15G`

El workflow restaurado contiene:

1. checkout de la rama viva;
2. gates de baseline y fuente source-safe;
3. gate browser proyecto/periodo/KPI/histórico;
4. smoke Admin, Shopper y Cliente;
5. validación de acceso exclusivo a Hosting;
6. deploy solo de `hosting:cxorbia-dev`;
7. smoke remoto;
8. limpieza de credencial;
9. evidencia sanitizada.

Después corresponde entregar la URL DEV para revisión visual de Paula y congelar V159 como `ACTIVE_BASELINE` si no existe P0.

## Bloqueo de ejecución disponible

El conector GitHub de esta sesión no expone `workflow_dispatch` y el runtime local no tiene credencial Firebase/Google. La restauración y documentación sí quedaron ejecutadas directamente en la rama viva; el deploy todavía no se afirma como realizado.

## Clasificación

- Reusable CXOrbia: separación estricta entre empalme, deploy y validación visual.
- Exclusivo cliente: Hosting DEV TyA y conteos source-safe del proyecto Cinépolis.
- Claude/prototipo: sin tarea nueva; Claude solo interviene ante P0 frontend reproducible.
- Academia: pendiente smoke por rol y validación de rutas/manuales/notificaciones.
- Sin impacto Claude: restauración de workflows/gate y bloqueo de dispatch.

## Estado seguro

Sin deploy ejecutado, sin merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
