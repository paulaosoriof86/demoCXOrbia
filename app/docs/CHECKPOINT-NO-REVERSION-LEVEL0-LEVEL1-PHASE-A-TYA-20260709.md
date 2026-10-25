# Checkpoint no reversion Level 0 / Level 1 Phase A TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Registrar explicitamente que no se deben revertir ni repetir procesos ya superados de Level 0 / Level 1 dentro del camino Phase A TyA, y que el trabajo debe continuar encaminado al plan de produccion real controlada sin usar fixtures ni outputs derivados como evidencia real.

## Estado consolidado

- Level 0 manifesto/source-safe queda reconocido como superado para readiness de proyecto/periodos.
- Level 1 ya habia sido trabajado previamente dentro del pipeline; no se debe reiniciar metodologia ni volver a pedir HR/reglas/shoppers/certificaciones ya documentadas.
- La verificacion reciente solo expuso que algunas corridas locales estaban recuperando fixtures sinteticos u outputs derivados, por lo que se reforzaron los gates para no confundir eso con real-data preview.
- El siguiente avance debe continuar desde el flujo HR source-safe/full-flow documentado y los outputs originales seguros, no desde reprocesos manuales.

## Guardrails contra reversion

- No revertir `tools/contracts/tya-minimal-sanitized-input-from-manifest.mjs`.
- No revertir `tools/contracts/tya-local-level1-recovery-preflight.mjs`.
- No volver a aceptar `tools/migration/synthetic-fixtures/phase-a/*` como evidencia real-data.
- No volver a aceptar `.tmp` generado por recoveries/preflights anteriores como fuente original Level 1 real.
- No reabrir desde cero Level 0 si ya esta GO.
- No pedir nuevamente HR, reglas, shoppers, certificaciones o liquidaciones ya trabajadas sin revisar documentos maestros, addenda y outputs existentes.
- No activar runtime DEV, imports, Firestore writes, HR writes, Make/Gemini, pagos, deploy o produccion sin GO expreso y gates finales.

## Clasificacion de impacto

- Reusable CXOrbia: patron de no reversion de gates y separacion entre fixture, output derivado y fuente real sanitizada.
- Exclusivo cliente TyA: continuidad Phase A TyA/Cinepolis con HR como fuente operacional.
- Claude/prototipo: no mostrar como real aquello que sea fixture/demo/preview tecnico; conservar copy honesto.
- Academia: explicar Level 0, Level 1, Level 2, fixtures, outputs derivados y fuente real sanitizada como conceptos separados.
- Sin impacto Claude directo: cambios de scripts/backend sin tocar modulos UI.

## Estado seguro

- Sin cambios en `/app/modules` o `/app/core` por este checkpoint.
- Sin runtime conectado.
- Sin deploy.
- Sin produccion.
- Sin Firestore/Auth/Storage.
- Sin HR writes.
- Sin Make/Gemini.
- Sin correos/WhatsApp reales.
- Sin pagos reales.
- Sin import real.
- Sin datos sensibles.

## Siguiente linea de trabajo

Continuar con produccion real Phase A controlada desde el flujo HR source-safe/full-flow y contratos ya documentados, evitando repetir Level 0/1 salvo como validacion puntual de no regresion.