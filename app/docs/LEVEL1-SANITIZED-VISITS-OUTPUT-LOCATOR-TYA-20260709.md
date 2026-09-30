# Level 1 sanitized visits output locator TyA

Fecha: 2026-07-09  
Bloque: buscar/ubicar outputs locales para Level 1 visitas sanitizadas  
Estado: locator creado, no conectado, seguro.

## 1. Objetivo

Buscar outputs locales o ya generados que permitan construir Level 1 `sanitizedVisits` sin pedir de nuevo la HR, sin leer HR viva desde repo, sin PII y sin import real.

Este bloque responde a la prioridad de produccion real Phase A: pasar de Level 0 manifest-only a Level 1 visitas sanitizadas para que Paula pueda visualizar TyA/Cinepolis en DEV preview.

## 2. Archivos creados

- `backend/contracts/tya-level1-sanitized-visits-phase-a-v1.json`
- `tools/contracts/tya-level1-sanitized-visit-output-locator.mjs`
- `app/docs/LEVEL1-SANITIZED-VISITS-OUTPUT-LOCATOR-TYA-20260709.md`

## 3. Que hace el locator

El locator revisa rutas locales candidatas como:

- `.tmp/tya-hr-source-private-full-flow/report.json`
- `.tmp/tya-hr-source-private-full-flow/`
- `.tmp/tya-hr-canonical-staging-source-safe/hr-canonical-staging-source-safe-manifest.json`
- `.tmp/tya-minimal-sanitized-input/tya-minimal-sanitized-input-level0.json`
- `tmp/tya-hr-source-private-full-flow/report.json`
- `reports/tya-hr-source-private-full-flow/`
- `_reports/tya-hr-source-private-full-flow/`
- `_diagnosticos/tya-hr-source-private-full-flow/`
- `_review/tya-hr-source-private-full-flow/`

No llama Google Sheets ni HR. Solo ubica JSONs locales ya generados.

## 4. Que considera candidato Level 1

Un JSON es candidato Level 1 si:

- no contiene marcadores prohibidos de PII/secrets;
- contiene filas potenciales de visita;
- las filas tienen campos como `hrRowId`, `visitId`, `sourceTab` o `quincena`.

## 5. Que bloquea

Bloquea o alerta si detecta marcadores como:

- DPI;
- banco;
- telefono;
- email;
- nombre shopper crudo;
- HR URL privada;
- spreadsheetFileId;
- serviceAccountJson;
- evidencias crudas;
- Make webhook;
- Gemini API key.

## 6. Contrato Level 1

El contrato `tya-level1-sanitized-visits-phase-a-v1.json` define:

- campos obligatorios por visita;
- estados permitidos;
- reglas de conversion HR -> status;
- bloqueos conocidos;
- criterios GO/NO-GO para DEV preview.

## 7. Comando previsto

```bash
node tools/contracts/tya-level1-sanitized-visit-output-locator.mjs
```

Con ruta local extra:

```bash
node tools/contracts/tya-level1-sanitized-visit-output-locator.mjs --extra C:/ruta/local/al/reporte-sanitizado.json
```

## 8. Impacto real en Phase A / produccion

Este bloque no visualiza datos todavia, pero reduce el siguiente paso a una pregunta concreta:

- Si ya existe un output local sanitizado con filas, se valida y se usa para Level 1.
- Si no existe, se ejecuta localmente el generador HR source-safe/full-flow ya documentado, sin pedir HR otra vez.

## 9. Trabajo previo recuperado

Recupera:

- HR viva ya documentada;
- full-flow privado local ya ejecutado antes;
- staging canonico source-safe;
- minimal sanitized input Level 0;
- bridge real-data preview;
- runtime switch gate;
- bloqueos de dry-run.

## 10. Claude/prototipo

Pendientes derivados:

- UI debe distinguir Level 0 y Level 1.
- Level 1 puede mostrar visitas sanitizadas, no shoppers reales completos.
- Copy debe decir preview/staging, no importado/produccion.
- Academia debe explicar por que Level 1 no incluye PII.

## 11. Siguiente bloque

Crear validador/generador Level 1 desde un candidato encontrado o, si no existe, preparar comando local minimo para generar el reporte sanitizado desde HR viva ya documentada, sin exponer PII.

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
