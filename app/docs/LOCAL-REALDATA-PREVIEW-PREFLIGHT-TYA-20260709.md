# Local real-data preview preflight TyA

Fecha: 2026-07-09  
Bloque: paquete local minimo para Paula cuando tenga computador  
Estado: creado, no conectado, seguro.

## 1. Objetivo

Reducir trabajo manual cuando Paula tenga computador, ejecutando una cadena segura para preparar DEV real-data preview de TyA/Cinepolis sin PII, sin deploy, sin import real y sin runtime switch automatico.

Este bloque sigue enfocado en produccion real Phase A con informacion real/sanitizada TyA.

## 2. Archivo creado

- `tools/contracts/tya-local-realdata-preview-preflight.mjs`

## 3. Que ejecuta

El preflight orquesta:

1. Locator de outputs Level 1.
2. Generador Level 0 desde manifest/documentacion.
3. Validador Level 0.
4. Generador Level 1 si se entrega `--input`.
5. Validador Level 1 si se genero.
6. Validador del bridge real-data preview.
7. Validador del runtime switch gate.
8. Validador del rollback/smoke plan.

## 4. Que NO hace

No hace:

- llamadas a HR/Google Sheets;
- lectura de URL privada desde repo;
- Firestore writes;
- Auth/Storage/Make/Gemini;
- import real;
- deploy;
- runtime switch;
- cambios en modulos UI;
- commit de PII.

## 5. Comando sin input

Este comando solo genera Level 0, busca candidatos locales y valida gates seguros:

```bash
node tools/contracts/tya-local-realdata-preview-preflight.mjs
```

## 6. Comando con input sanitizado local

Si el locator encuentra o Paula tiene un reporte sanitizado local:

```bash
node tools/contracts/tya-local-realdata-preview-preflight.mjs --input .tmp/tya-hr-source-private-full-flow/report.json
```

Con ruta personalizada:

```bash
node tools/contracts/tya-local-realdata-preview-preflight.mjs --input C:/ruta/local/reporte-sanitizado.json
```

## 7. Salidas

Genera bajo `.tmp/tya-local-realdata-preview-preflight/`:

- locator reports;
- Level 0 payload;
- Level 0 validation;
- Level 1 payload si aplica;
- Level 1 validation si aplica;
- bridge validation;
- runtime switch validation;
- rollback/smoke validation;
- `local-realdata-preview-preflight-report.json`;
- `local-realdata-preview-preflight-report.md`.

## 8. Interpretacion

### GO_LOCAL_PREFLIGHT_COMPLETED_NO_RUNTIME

La cadena segura corrio sin bloquear. No significa produccion ni runtime switch.

### NO_GO_LOCAL_REALDATA_PREFLIGHT

Hay problema de scripts, input, campos prohibidos o validaciones base.

### Level 0 generado

Proyecto/periodos/source readiness. No visitas reales.

### Level 1 generado

Visitas sanitizadas para DEV preview. No shoppers completos ni produccion.

## 9. Impacto real en Phase A / produccion

Este bloque deja el camino listo para que, cuando exista o se ubique un output sanitizado local, se pueda avanzar rapidamente a validar visualizacion TyA/Cinepolis en DEV preview sin reiniciar ni pedir HR de nuevo.

## 10. Trabajo previo recuperado

Recupera:

- HR viva multi-tab;
- full-flow local previo;
- Level 0 manifest-only;
- locator Level 1;
- generador Level 1;
- bridge real-data preview;
- runtime switch gate;
- rollback/smoke checklist;
- bloqueos de dry-run.

## 11. Claude/prototipo

Pendientes derivados:

- UI debe diferenciar Level 0, Level 1, staging, importado y produccion.
- Level 1 no debe mostrarse como import real.
- Cinépolis debe seguir como proyecto normal configurable.
- Academia debe explicar preflight, niveles y revision.

## 12. Siguiente bloque

Con computador, ejecutar el preflight. Si se valida Level 1, preparar solicitud de GO para runtime DEV preview. Si no se valida, revisar reporte y corregir solo causa raiz.

## 13. Estado seguro

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
