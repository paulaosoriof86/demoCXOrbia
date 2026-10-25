# Validación visual Corte 4 — P0 PROVEN / resolución técnica pendiente de revalidación humana

**Fecha:** 2026-07-29  
**Estado:** `P0_TECHNICALLY_FIXED__REMOTE_REVALIDATION_PASS__HUMAN_VISUAL_PENDING`

## Evidencia visual inicial de Paula

La URL inicial de Hosting DEV abrió correctamente, pero el runtime publicado incumplió el contrato de Corte 4:

- pantalla de acceso mostró `Demo comercial · datos ficticios`;
- status visible: `Fuente: localStorage/demo`;
- status visible: `Auth: pendiente`;
- status visible: `Proyecto: proyecto retail`;
- status visible: `Proyectos: 3 · Visitas: 108 · Shoppers: 18 · Postulaciones: 48`;
- al entrar como Administración aparecieron `Proyecto Retail`, `Proyecto Banca`, `Proyecto Restaurantes` y KPIs/demo;
- el Dashboard Operativo mostró datos ficticios.

Esto contradijo `fallbackToMockOnReadError=false`, `fallbackToLocalStorageOnEmpty=false` y `emptyBackendMustRenderAsEmpty=true`.

## P0 reproducible

`P0-C4-VIS-01 — FORBIDDEN_DEMO_FALLBACK_ON_AUTH_PENDING`

## Causa raíz localizada

El principal temporal de Auth del protected smoke había sido correctamente eliminado. Sin esa credencial, la ruta genérica de `backend-firebase.js` marcaba `localStorage/demo`. El guard Corte 4 reaccionaba demasiado tarde para impedir el primer render de fixtures y el status visual también interpretaba el error como demo.

## Corrección focalizada autorizada

Autorización consumida:

`Autorizo corrección focalizada de P0-C4-VIS-01 y un único Hosting DEV de revalidación de Corte 4, sin data writes ni producción`

Archivos runtime modificados:

- `app/core/backend-config-preview-dev.js`;
- `app/core/backend-cxdata-readonly-corte4.js`;
- `app/core/backend-preview-status.js`.

No se tocaron módulos UI.

## Resultado de gates

Diagnóstico local read-only final:

- commit `58f227e2d67c0efa15c363e19e2cbcfea91e19b8`;
- `cxorbia/c4p0vis01-diagnostic=success`;
- `cxorbia/c4p0local-pass=success`.

Revalidación remota:

- deployed source `424eca2ae5a7cd6f240dfc97b17048f3c124eb2c`;
- `cxorbia/c4p0vis01-revalidation=success`;
- `cxorbia/c4p0vis01-deploys1=success`;
- exactamente 1 Hosting-only deploy para esta autorización.

El browser remoto comprobó:

- conteos proyectos/visitas/shoppers/postulaciones = `0/0/0/0`;
- `CX.dataSource.mode=connected`;
- fixtures=false;
- `CX.BRAND.demoMode=false`;
- `fallbackUsed=false` desde estado inicial;
- ausencia de `Proyecto Retail`, `Proyecto Banca`, `Proyecto Restaurantes`, `Demo comercial · datos ficticios` y `Fuente: localStorage/demo`;
- entrada al shell admin mantiene estado vacío.

## URL nueva para Paula

`https://cxorbia-tya-dev-260729-c4.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&p0vis01=424eca2ae5a7cd6f240dfc97b17048f3c124eb2c`

## Estado actual

El P0 está técnicamente corregido y revalidado por navegador remoto, pero Corte 4 no se congela hasta la revalidación visual humana de Paula.

Si la nueva visual no demuestra otro P0: `FREEZE CORTE 4 → IAM temporal a Viewer → CORTE 5`.

Data writes/producción/merge de este bloque: `0`.
