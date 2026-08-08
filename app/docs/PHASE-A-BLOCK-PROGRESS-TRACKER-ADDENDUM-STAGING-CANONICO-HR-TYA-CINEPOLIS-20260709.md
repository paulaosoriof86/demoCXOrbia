# Phase A tracker addendum - Staging canonico HR TyA / Cinepolis

Fecha: 2026-07-09  
Bloque completado: staging canonico HR source-safe  
Estado: seguro, no conectado.

## Archivos creados

- `backend/contracts/hr-canonical-staging-source-safe-phase-a-v1.json`
- `tools/contracts/tya-hr-canonical-staging-source-safe-manifest.mjs`
- `app/docs/RECUPERACION-RUNBOOK-STAGING-CANONICO-HR-TYA-CINEPOLIS-20260709.md`
- `app/docs/CAMBIOS-STAGING-CANONICO-HR-TYA-CINEPOLIS-20260709.md`
- `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-STAGING-CANONICO-HR-TYA-CINEPOLIS-20260709.md`

## Parte del plan Phase A que avanza

- HR real/source-safe.
- Proyecto Cinepolis como proyecto normal configurable.
- Import historico completo como control.
- Preparacion de staging canonico sin PII.
- Evitar demo data como fuente final de produccion.

## Pendientes backend derivados

1. Ejecutar runner con input local sanitizado si existe.
2. Crear bridge source-safe `real-data preview -> CX.data` en unico punto.
3. Preparar staging canonico DEV solo bajo gate.
4. Resolver issues bloqueantes: DPI, questionnaire_marks duplicado, shopper canonical mismatch, JUNIO 26 HN, liquidaciones con Excel externo.

## Pendientes Claude/prototipo derivados

1. Proyecto debe tener Fuente de Hoja de Ruta configurable.
2. UI debe distinguir demo/preview real/staging sanitizado/importado/produccion.
3. Cinepolis no debe hardcodearse.
4. Copy honesto: source-safe manifest no es import real.
5. Academia debe cubrir configuracion HR y errores de columnas.

## Impacto Academia

Academia debe incluir:

- como configurar HR de un proyecto;
- como probar conexion;
- diferencia entre preview, staging e import;
- errores por columnas cambiadas;
- revision humana por conflictos.

## Bloques intermedios agregados

- `real-data proof gate`.
- Recuperacion forense TyA/Cinepolis.
- Staging canonico HR source-safe.

## Siguiente bloque recomendado

Crear puente source-safe de datos reales hacia `CX.data` en un unico punto, sin tocar modulos UI y sin writes reales.

## Preguntas o insumos necesarios

Ninguno en este momento. No pedir HR de nuevo. Primero usar lo ya documentado y el input local sanitizado si esta disponible en entorno local cuando Paula pueda ejecutarlo.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin import real.
- Sin Firestore writes.
- Sin HR writes.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Make/Gemini real.
