# Level 1 sanitized visits from output TyA

Fecha: 2026-07-09  
Bloque: generador Level 1 desde reporte HR source-safe/sanitizado  
Estado: creado, no conectado, seguro.

## 1. Objetivo

Crear el generador que transforma un output local existente y sanitizado en un payload Level 1 con visitas sanitizadas para DEV preview.

Este bloque mantiene el rumbo correcto: no pide HR de nuevo, no llama Google Sheets y no conecta runtime; usa outputs ya generados o que Paula pueda generar localmente con herramientas seguras.

## 2. Archivo creado

- `tools/contracts/tya-level1-sanitized-visits-from-output.mjs`

## 3. Que hace

Toma un JSON local de entrada con filas o visitas sanitizadas y genera:

- `tya-minimal-sanitized-input-level1.json`
- `tya-level1-sanitized-visits-report.json`
- `tya-level1-sanitized-visits-report.md`

## 4. Entrada aceptada

El input puede contener arrays con nombres flexibles:

- visits;
- rows;
- sanitizedVisits;
- visitRows;
- hrRows;
- operationalRows;
- tabs[].rows;
- tabs[].visits;
- tabs[].sanitizedRows;
- tabs[].operationalRows.

El generador no exige formato unico porque los reportes previos pueden variar.

## 5. Salida Level 1

Cada visita generada incluye:

- visitId;
- hrRowId;
- projectId;
- periodId;
- sourceTab;
- country;
- cityRef;
- branchRef;
- quincena;
- timeBand;
- availableFrom;
- scheduledDate;
- completedDate;
- questionnaireCompletedDate;
- submittedAt;
- status;
- shopperRef;
- assignmentSource;
- assignmentSyncStatus;
- reviewRequired.

## 6. Reglas de status

El generador deriva estados seguros:

- sin shopper: pending_assignment;
- shopper sin fecha programada: pending_schedule;
- programada sin realizada: scheduled;
- realizada sin cuestionario: completed_pending_questionnaire;
- cuestionario sin submitido: questionnaire_pending_submit;
- submitido sin liquidacion final: submitted_liquidation_candidate;
- liquidado/control pago: liquidation_payment_control;
- JUNIO 26 HN: review_required;
- JULIO 26/JULIO 26 HN: preparation_not_closed.

## 7. Protecciones

Bloquea si el input o payload generado contiene marcadores de:

- DPI;
- banco;
- telefono;
- email;
- nombre shopper crudo;
- HR URL privada;
- spreadsheetFileId;
- serviceAccountJson;
- evidencias crudas;
- webhooks;
- tokens;
- Gemini API key.

## 8. Comando previsto

Con output local sanitizado:

```bash
node tools/contracts/tya-level1-sanitized-visits-from-output.mjs --input .tmp/tya-hr-source-private-full-flow/report.json
```

Con payload Level 0 ya generado:

```bash
node tools/contracts/tya-level1-sanitized-visits-from-output.mjs --input .tmp/tya-hr-source-private-full-flow/report.json --level0 .tmp/tya-minimal-sanitized-input/tya-minimal-sanitized-input-level0.json
```

## 9. Impacto real en Phase A / produccion

Este bloque es el paso que permite pasar de manifest-only a visitas sanitizadas reales en DEV preview.

No conecta runtime ni autoriza produccion, pero deja lista la herramienta para construir el input que alimentara el bridge `real-data preview -> CX.data`.

## 10. Trabajo previo recuperado

Recupera:

- HR viva multi-tab;
- full-flow local previo;
- Level 0 manifest-only;
- contrato Level 1;
- reglas HR/Q1/Q2;
- bloqueantes de dry-run;
- Cinepolis como proyecto normal configurable.

## 11. Claude/prototipo

Pendientes derivados:

- UI debe diferenciar Level 1 de import real.
- Level 1 puede mostrar visitas sanitizadas, pero no shoppers completos.
- Copy debe decir preview/staging.
- Academia debe explicar que Level 1 excluye PII y requiere revision antes de import.

## 12. Bloqueos

- Falta ejecutar con output local sanitizado.
- Runtime switch sigue bloqueado.
- Produccion bloqueada.
- Shoppers completos, certificaciones mapeadas y liquidaciones reales quedan para Level 2.

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
