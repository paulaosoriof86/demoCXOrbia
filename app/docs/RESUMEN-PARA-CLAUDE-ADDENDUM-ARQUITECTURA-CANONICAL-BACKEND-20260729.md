# RESUMEN PARA CLAUDE — Corrección arquitectura backend TyA

**Fecha:** 2026-07-29  
**Estado:** `NO_NUEVA_CANDIDATA__PRESERVAR_FIXES_CORE__BACKEND_CANONICAL_CORRECTED`

## Contexto vinculante
- Legacy TyA Consultores actual = plataforma a retirar; solo datos útiles limpios.
- `cxorbia-backend-dev` = backend DEV canónico de CXOrbia con TyA como primer tenant; NO es legacy.
- `cxorbia-tya-dev-260729-c4` = sandbox técnico usado para probar empty-backend/fail-closed; NO es destino de materialización.
- Hosting público actual de TyA se conserva para el cutover final.

## Qué debe preservar Claude
- fail-closed sin demo/localStorage;
- backend vacío como estado válido;
- null-safety proyecto/período;
- limpieza de DOM/shell al cambiar rol;
- entrypoint sin assets inexistentes;
- gate de integridad de scripts.

## Qué NO debe hacer Claude
- no crear nueva candidata por esta corrección;
- no modificar `app/modules` por la distinción de backends;
- no reintroducir datos demo para ocultar faltantes;
- no asumir que `cxorbia-backend-dev` debe vaciarse o reemplazarse;
- no hardcodear Cinépolis como producto global.

## Pendiente real
Backend hará inventario read-only de `cxorbia-backend-dev` y reutilizará lo ya existente. Luego solo se traerá el delta legacy necesario, principalmente shoppers/certificaciones.

## Clasificación
- Reusable CXOrbia: sí.
- Exclusivo TyA: identidad legacy/backend/Hosting.
- Academia: migración incremental/cutover.
