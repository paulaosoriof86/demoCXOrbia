# Paquete Claude - V82 source lock + Phase A actualizado

Fecha: 2026-07-04

## Decision para Paula

No conviene pasar un candidato nuevo libre todavia.

La ruta recomendada es entregar a Claude este paquete y pedir una V83 ultra-controlada sobre V82 source lock, sin tocar backend y sin reabrir V80/V81.

Si Claude ya genero un nuevo ZIP antes de leer este paquete, Paula debe pasarlo primero a ChatGPT/backend para auditoria forense contra V82 source lock y contra este paquete, antes de aceptarlo como nuevo baseline.

## Baseline obligatoria

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama: `docs-tya-v6-v71-audit`
- PR: #7 draft/open/no merge
- Source lock vivo: V82
- Documento source lock: `app/docs/V82-SOURCE-LOCK-EMPALME-CONTINUIDAD-TYA-20260704.md`
- Auditoria V82: `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V82-CLAUDE-20260704.md`
- Tracker Phase A: `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`

## Estado de V82

V82 queda aceptada como baseline viva/source lock de trabajo.

Resuelve lo critico:

1. Wizard con enum canonico `interna`, `externo_general`, `externo_visita`.
2. `qMode()` y `visitLinkField:'questionnaireLink'`.
3. Defaults Phase A restaurados en wizard.
4. Cuestionario con 5 campos de link por visita.
5. Revision admin con estados canonicos y estructura backend-ready parcial.
6. Bloqueo de `submitido_registered` sin nota en HR-driven.
7. `plantilla lista` sin duplicado.
8. Documentacion interna V82 en `app/docs`.
9. Sintaxis JS validada en auditoria: 61 archivos OK, 0 fallas.

## Pendientes V82 que Claude debe corregir sin tocar nada mas

### 1. `app/modules/cuestionario-shopper.js`

Cambiar texto externo:

- Actual: `marca la visita como cuestionario enviado`.
- Debe quedar: `marca el cuestionario como realizado/completado`.

Mantener:

- `questionnaireLink`;
- `cuestionarioUrl`;
- `linkCuestionario`;
- `urlCuestionario`;
- `hrQuestionnaireLink`;
- aviso si falta link externo;
- no caer a formulario interno si el proyecto exige link externo por visita.

### 2. `app/modules/revision-admin.js`

Corregir:

1. Cambiar `Cuestionario: enviado` por `Cuestionario: realizado/completado`.
2. Al guardar, agregar alias/campo `status=estado`.
3. Pasar `projectId:p.id` al `R.set(...)`.
4. Guardar `hrRowId:v.hrRowId||v.rowId||v.extId||''` cuando exista.
5. Para HR-driven, el bloqueo de `submitido_registered` debe pedir explicitamente nota/referencia HR, no solo una nota generica.

Mantener:

- estados canonicos:
  - `pending_review`;
  - `in_review`;
  - `needs_correction`;
  - `approved_for_submitido`;
  - `submitido_registered`;
  - `rejected`;
  - `hr_conflict`;
  - `cancelled`;
- labels visibles en espanol;
- fallback `CX.data.revisiones` / `localStorage`;
- estructura backend-ready parcial;
- no prometer HR write real.

### 3. `app/modules/misvisitas.js`

Cambiar comentario/aiBox que digan:

- `sincroniza estado`;
- `sincroniza la hoja de ruta`.

Usar texto honesto:

- `prepara la actualizacion`;
- `notifica al equipo`;
- `se reflejara en HR cuando el sync este activo (pendiente backend)`.

### 4. `app/modules/postulaciones.js`

Cambiar los dos toasts que aun dicen:

- `HR sincronizada`.

Por:

- `se reflejara en HR cuando el sync este activo (pendiente backend)`.

## Nuevos pendientes derivados de backend Phase A

Backend agrego bloque seguro de liquidaciones/Cinepolis source-safe preview.

Documentos relacionados:

- `app/contracts/liquidation-cinepolis-source-safe-preview-phase-a.tya.contract.json`
- `tools/migration/tya-liquidation-cinepolis-source-safe-preview-validator.mjs`
- `app/docs/LIQUIDATIONS-CINEPOLIS-SOURCE-SAFE-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-LIQUIDACIONES-CINEPOLIS-SOURCE-SAFE-PREVIEW-TYA-20260704.md`
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-LIQUIDACIONES-CINEPOLIS-PREVIEW-VALIDATOR-20260704.md`

Claude debe reflejar estos pendientes en prototipo sin tocar backend.

### Mis beneficios

Debe mostrar al shopper:

- honorario;
- Boleto;
- Combo;
- reembolso total;
- total;
- estado: pendiente, programado, pagado, revision o conflicto;
- historial permitido.

No mostrar:

- banco;
- DPI;
- NDA;
- notas internas;
- auditoria financiera interna.

### Admin / Liquidaciones

Debe permitir/ver:

- corte junio como liquidaciones/pagos pendientes, no visitas pendientes;
- separacion entre visita realizada, cuestionario realizado, revision, submitido, liquidacion y pago;
- seleccion manual de items para lote;
- items elegibles no seleccionados;
- items en revision manual/conflicto;
- no marcar pago como real si no hay referencia estable o confirmacion manual.

### Movimientos

Cada movimiento debe conservar:

- lote asociado (`batchId` o referencia visible equivalente);
- item asociado (`paymentItemId` o referencia visible equivalente);
- shopper;
- visita/HR row;
- honorario;
- Boleto;
- Combo;
- total;
- moneda;
- fuente;
- estado.

El pago de lote no debe borrar la trazabilidad individual.

### Textos honestos

Mientras los gates sigan apagados, no usar textos como:

- pagado real;
- HR sincronizada;
- correo enviado real;
- Make ejecutado;
- importacion real;
- Gemini real.

Usar:

- preparado;
- preview;
- pendiente backend;
- requiere autorizacion;
- revision manual;
- conflicto.

## Academia que Claude debe profundizar

Claude debe tratar Academia como modulo profundo, editable e interactivo, no como texto superficial.

Actualizar o crear:

1. Ruta shopper: Mis beneficios, honorario, reembolso, Boleto, Combo y estados de pago.
2. Ruta admin: corte junio, liquidaciones, lotes, Boleto/Combo y revision manual.
3. Ruta ops: conciliacion historica y conflictos.
4. Manual de datos sensibles en pagos.
5. Checklist antes de preparar lote.
6. Checklist antes de marcar pagado.
7. Checklist antes de publicar beneficios shopper.
8. Glosario:
   - `sourceSafe`;
   - `sourceVisitRef`;
   - `sourcePaymentRef`;
   - `candidate_ready`;
   - `candidate_pending_submitido`;
   - `manual_review_required`;
   - `held_for_conflict`;
   - `batchId`;
   - `paymentItemId`;
   - `movementId`;
   - Boleto;
   - Combo;
   - `reimbursementTotal`.

Academia debe explicar botones, pasos, estados, errores frecuentes, validacion esperada y que hacer cuando algo falla.

## Lo que Claude NO debe tocar

- `tools/migration`.
- `app/contracts`.
- `app/core` backend adapter / bridges / gates.
- Firestore rules.
- Auth real.
- Storage real.
- Make real.
- Gemini real.
- WhatsApp API real.
- Correo real.
- Pagos reales.
- Importacion real.
- Datos reales o sensibles.
- Base vieja.
- Runners backend.

## Regla de entrega esperada de Claude

Claude debe entregar una V83 ultra-controlada que:

1. Parte de V82 source lock.
2. Corrige solo los pendientes listados.
3. No reescribe modulos completos si no es necesario.
4. No borra avances V82.
5. No revierte wizard, cuestionario, revision admin ni `plantilla lista`.
6. Actualiza documentacion interna del prototipo:
   - `app/docs/ADDENDUM-V83-PHASE-A.md` o equivalente;
   - `app/docs/RESUMEN-PARA-CLAUDE.md`;
   - `app/docs/PENDIENTES-PROTOTIPO.md`.
7. Mantiene todos los estados reales como preparados/pendientes si backend no esta activo.

## Auditoria que hara ChatGPT/backend cuando Paula entregue V83

Antes de aceptar V83 se debe auditar:

1. Archivos agregados/eliminados/modificados contra V82.
2. `index.html` y scripts cargados.
3. Sintaxis JS.
4. Rutas duplicadas o modulos huerfanos.
5. Que no reaparezcan textos `cuestionario enviado`.
6. Que no reaparezcan textos `HR sincronizada`.
7. Que `revision-admin.js` tenga `status`, `projectId:p.id` y `hrRowId`.
8. Que Mis beneficios/Liquidaciones/Movimientos no prometan pago real.
9. Que Academia no sea superficial.
10. Que no toque backend protegido.

## Estado seguro actual

- Sin deploy.
- Sin merge.
- Sin produccion.
- Sin Firestore writes reales.
- Sin HR writes reales.
- Sin pagos reales.
- Sin Make/Gemini/WhatsApp/correo real.
- Sin runtime backend conectado.
- PR #7 sigue draft/open.
