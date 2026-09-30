# Cambios P0 DEV root TyA source-safe preview fix

Fecha: 2026-07-09

## Archivos agregados/modificados

- Agregado: `app/core/tya-phase-a-source-safe-preview.js`
- Modificado: `app/index.html`
- Modificado: `app/sw.js`
- Modificado: `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml`
- Agregado: `app/docs/P0-DEV-ROOT-TYA-SOURCE-SAFE-PREVIEW-FIX-20260709.md`

## Problema

La URL DEV mostraba datos demo/comerciales, no TyA/Cinepolis. Ese smoke no era valido para Phase A.

## Resultado esperado

DEV root debe mostrar TyA/Cinepolis source-safe, periodo JUN 2026, 44 visitas, GT 34 / HN 10, sin PII ni datos sensibles.

## Seguridad

No se tocaron modulos UI. No se conecto base vieja. No se hicieron imports, writes, pagos, Make/Gemini ni produccion.
