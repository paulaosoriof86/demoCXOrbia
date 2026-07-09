# Generator - Minimal sanitized input from manifest TyA

Fecha: 2026-07-09  
Bloque: generador de input minimo desde manifest/source-safe  
Estado: creado, no conectado, seguro.

## 1. Objetivo

Crear un generador seguro para producir un payload Level 0 `manifestOnly` a partir de la estructura HR TyA/Cinepolis ya documentada y/o desde el manifest source-safe si existe localmente.

Este bloque mantiene el enfoque en produccion real Phase A, pero sin fingir que ya hay visitas/shoppers reales visibles. Level 0 solo permite validar proyecto, periodos y bloqueantes.

## 2. Archivo creado

- `tools/contracts/tya-minimal-sanitized-input-from-manifest.mjs`

## 3. Que produce

Bajo `.tmp/tya-minimal-sanitized-input/`:

- `tya-minimal-sanitized-input-level0.json`
- `tya-minimal-sanitized-input-level0-report.json`
- `tya-minimal-sanitized-input-level0.md`

## 4. Fuente usada

Usa:

- `backend/contracts/hr-canonical-staging-source-safe-phase-a-v1.json`
- `backend/contracts/tya-minimal-sanitized-input-phase-a-v1.json`
- manifest local opcional si existe.

Si no se entrega manifest local, genera Level 0 desde los 28 tabs operativos ya documentados.

## 5. Que incluye el payload Level 0

Incluye:

- projectConfig TyA/Cinepolis;
- periods desde tabs HR documentados;
- issues bloqueantes obligatorios;
- meta source-safe.

No incluye todavia:

- visitas reales fila por fila;
- shoppers reales;
- certificaciones mapeadas;
- liquidaciones candidatas reales.

## 6. Bloqueantes incluidos

El payload generado incluye estos issues:

- sensitive_shopper_data_policy;
- questionnaire_marks_duplicate_postulations;
- shopper_canonical_mismatch;
- junio_26_hn_review_required;
- liquidations_require_finance_crosscheck.

## 7. Comando previsto

Sin manifest local:

```bash
node tools/contracts/tya-minimal-sanitized-input-from-manifest.mjs
```

Con manifest local source-safe:

```bash
node tools/contracts/tya-minimal-sanitized-input-from-manifest.mjs --manifest .tmp/tya-hr-canonical-staging-source-safe/hr-canonical-staging-source-safe-manifest.json
```

## 8. Impacto real en Phase A / produccion

Avanza porque produce el primer input validable para el bridge `real-data preview -> CX.data`, usando informacion real/documentada de TyA/Cinepolis sin PII.

No autoriza produccion ni visualizacion final porque Level 0 no contiene visitas reales fila por fila.

## 9. Trabajo previo recuperado

Recupera:

- HR viva multi-tab;
- 28 tabs operativos;
- dashboards excluidos;
- proyecto Cinepolis normal configurable;
- reglas de bloqueos recuperadas de dry-run;
- shopper review pending;
- liquidaciones con cruce financiero externo;
- certificaciones preservadas como regla.

## 10. Claude/prototipo

Pendientes derivados:

- UI debe distinguir Level 0 manifest-only de visitas reales.
- No debe mostrar datos reales si solo hay Level 0.
- Proyecto puede mostrarse como configurado/preview, no como importado.
- Academia debe explicar niveles de preview.

## 11. Siguiente bloque

Crear Level 1 usando input sanitizado de visitas si se recupera de reportes locales o se genera desde un export sanitizado ya disponible. No pedir HR de nuevo; primero ubicar outputs/reports existentes.

## 12. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin runtime switch.
- Sin modulos modificados.
- Sin import real.
- Sin Firestore writes.
- Sin HR writes.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Make/Gemini real.
