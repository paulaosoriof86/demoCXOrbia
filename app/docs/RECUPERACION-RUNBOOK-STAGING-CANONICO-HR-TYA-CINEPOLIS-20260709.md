# Runbook - Staging canonico HR TyA / Cinepolis source-safe

Fecha: 2026-07-09  
Bloque: staging canonico HR source-safe  
Estado: preparado, sin import real, sin writes.

## 1. Objetivo

Convertir la recuperacion forense de HR TyA/Cinepolis en un paso operativo seguro: un manifest source-safe que permita preparar staging canonico sin exponer PII, sin conectar base vieja, sin escribir Firestore y sin pedir de nuevo la HR.

## 2. Trabajo previo que recupera

Este runbook recupera el trabajo documentado en:

- `HR-FUENTE-VIVA-TYA-GOOGLE-SHEETS-20260703.md`;
- `RESULTADO-HR-SOURCE-PRIVATE-FULL-FLOW-20260703.md`;
- `LOGICAS-TYA-CINEPOLIS-HR-V6-V7_1-20260703.md`;
- `MAPEO-PLAN-IMPORTACION-TYA-V6-V7_1-20260703.md`;
- `RESULTADO-LOCAL-DRY-RUN-TYA-V6-V7_1-20260703.md`;
- `RESULTADO-SHOPPER-REFERENCE-REVIEW-SUMMARY-TYA-20260703.md`.

Conclusion recuperada: la lectura HR viva multi-tab ya fue probada localmente; el siguiente paso correcto es staging canonico, no pedir nuevamente fuente.

## 3. Archivos creados

- `backend/contracts/hr-canonical-staging-source-safe-phase-a-v1.json`
- `tools/contracts/tya-hr-canonical-staging-source-safe-manifest.mjs`
- `app/docs/RECUPERACION-RUNBOOK-STAGING-CANONICO-HR-TYA-CINEPOLIS-20260709.md`

## 4. Que produce el runner

El runner genera, bajo `.tmp/tya-hr-canonical-staging-source-safe/`:

- `hr-canonical-staging-source-safe-manifest.json`
- `hr-canonical-staging-source-safe-manifest.md`

El manifest contiene solamente metadata source-safe:

- tenantId;
- projectId;
- programId;
- sourceTitle;
- tabName;
- tabType;
- periodKey;
- country;
- expectedOperationalRows;
- observedRows si hay input opcional sanitizado;
- observedColumns si hay input opcional sanitizado;
- schemaStatus;
- rowCountStatus;
- importStatus;
- issues;
- auditRef.

## 5. Que NO produce

No produce:

- nombres de shoppers;
- telefonos;
- correos;
- DPI;
- banco;
- URL completa de HR;
- fileId;
- filas crudas;
- workbook;
- CSV;
- evidencias;
- tokens;
- writes Firestore;
- import real.

## 6. Tabs operativos esperados

El contrato usa los 28 tabs operativos ya documentados:

- JUNIO 25 / JUNIO 25 HN;
- JULIO 25 / JULIO 25 HN;
- AGOSTO 25 / AGOSTO 25 HN;
- SEPTIEMBRE 25 / SEPTIEMBRE 25 HN;
- OCTUBRE 25 / OCTUBRE 25 HN;
- NOVIEMBRE 25 / NOVIEMBRE 25 HN;
- DICIEMBRE 25 / DICIEMBRE 25 HN;
- ENERO 26 / ENERO 26 HN;
- FEBRERO 26 / FEBRERO 26 HN;
- MARZO 26 / MARZO 26 HN;
- ABRIL 26 / ABRIL 26 HN;
- MAYO 26 / MAYO 26 HN;
- JUNIO 26 / JUNIO 26 HN;
- JULIO 26 / JULIO 26 HN.

Dashboards excluidos:

- DASHBOARD;
- DASHBOARD HN.

## 7. Reglas de clasificacion

- Dashboard no crea visitas.
- `JUNIO 26 HN` queda en `review_required`.
- `JULIO 26` y `JULIO 26 HN` quedan como preparacion/no historico cerrado.
- Ningun tab queda importable automaticamente.
- Todo pasa por manifest, revision y gate antes de cualquier staging write.

## 8. Comando previsto

Modo sin input opcional:

```bash
node tools/contracts/tya-hr-canonical-staging-source-safe-manifest.mjs
```

Modo con reporte local sanitizado opcional, si existe en el entorno local de Paula:

```bash
node tools/contracts/tya-hr-canonical-staging-source-safe-manifest.mjs --input tmp/tya-hr-source-private-full-flow/report.json
```

El input opcional debe contener solo metadata sanitizada. No debe contener filas HR crudas ni PII.

## 9. Resultado esperado

Mientras no haya input local actual:

- debe generar manifest base con tabs esperados;
- `observedRows` puede quedar null;
- `schemaStatus` puede quedar `pending_current_observation`;
- `importableNow` debe ser 0;
- produccion sigue bloqueada.

Con input local sanitizado:

- compara tabs observados contra esperados;
- muestra conteos source-safe;
- marca diferencias como revision;
- mantiene importacion bloqueada.

## 10. Impacto Phase A

Este bloque acerca produccion real porque convierte la HR viva ya trabajada en una capa intermedia source-safe para:

- confirmar periodos;
- confirmar pais;
- excluir dashboards;
- revisar diferencias;
- preparar staging canonico;
- proteger datos sensibles;
- evitar demo data como fuente final.

## 11. Claude/prototipo

Pendientes concretos para Claude cuando se arme paquete corto:

- Proyecto debe tener seccion `Fuente de Hoja de Ruta`.
- Debe existir estado visual de `preview real`, `staging sanitizado`, `review_required`, `importado` y `produccion`.
- Cinépolis debe mostrarse como proyecto normal configurable.
- No se deben mostrar estados de HR real si solo hay manifest source-safe.
- Academia debe explicar import preview, errores de columnas y revision humana.

## 12. Clasificacion obligatoria

- Reusable CXOrbia: si. Patron source-safe para cualquier fuente externa de proyecto.
- Exclusivo cliente: parcial. Tabs y reglas actuales son TyA/Cinepolis.
- Claude/prototipo: si. Requiere UI de fuente HR configurable y estados honestos.
- Academia: si. Debe documentar configuracion HR, preview y errores.
- Sin impacto Claude: no.

## 13. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin import real.
- Sin Firestore writes.
- Sin HR writes.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Make/Gemini real.
