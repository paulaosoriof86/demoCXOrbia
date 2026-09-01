# Auditoria integral candidata V84 Claude - CXOrbia TyA

Fecha: 2026-07-04
Candidata auditada: `Prototype development request CXOrbia V84.zip`
Baseline comparado: `Prototype development request CXOrbia V83.zip`
Referencia anterior: `Prototype development request CXOrbia V82.zip`

## Decision

V84 no queda aceptada como source lock final. Es una candidata parcial util y mas avanzada que V83, pero todavia no cierra todos los P0 ni incorpora los bloques backend recientes que ya quedaron documentados. Se debe pedir V85 correctiva sobre V84.

## Resultado tecnico

- Archivos `app/` V83: 96.
- Archivos `app/` V84: 97.
- Archivos agregados: 1: `docs/ADDENDUM-V87-PHASE-A.md`.
- Archivos eliminados: 0.
- Archivos modificados: 3: `modules/academia.js`, `modules/postulaciones.js`, `modules/revision-admin.js`.
- JS revisados con `node --check`: 61.
- Fallas JS: 0.
- Scripts cargados por `index.html`: 61.
- Scripts locales: 59.
- Scripts locales faltantes: 0.
- Scripts duplicados: 0.

## Alcance real de cambios

- `modules/academia.js`: 1433 -> 1516 lineas; +/replace 94, -/replace 11.
- `modules/postulaciones.js`: 310 -> 312 lineas; +/replace 2, -/replace 0.
- `modules/revision-admin.js`: 79 -> 79 lineas; +/replace 4, -/replace 4.

## Que si soluciono V84

### 1. Revision admin

`modules/revision-admin.js` atiende el pendiente tecnico principal:

- agrega `r.status = estado`;
- pasa `projectId: p.id` en `R.set(...)`;
- guarda `hrRowId` desde `v.hrRowId || v.rowId || v.extId || ''`;
- cambia `Cuestionario: enviado` por `realizado/completado`.

Esto resuelve una parte P0 del paquete V83.

### 2. Academia: flujo financiero

`modules/academia.js` corrige parcialmente el error semantico introducido en V83:

- ya no afirma que cada visita realizada genera liquidacion candidata;
- aclara que la liquidacion candidata nace despues de revision + submitido;
- cambia varias referencias a cuestionario realizado/completado;
- mejora la ruta shopper sobre agenda, realizacion, cuestionario y Mis Beneficios;
- agrega ruta cliente para lectura estrategica de estados.

### 3. Postulaciones: boton Sync HR

`modules/postulaciones.js` agrega handler al boton `syncHR` con texto honesto: lectura preparada y sync real por backend cuando el gate este activo.

## Que no soluciono V84

### P0 todavia vivo

1. `modules/cuestionario-shopper.js` sigue diciendo: `marca la visita como cuestionario enviado`.
2. `modules/postulaciones.js` sigue diciendo `HR sincronizada` en al menos dos toasts visibles.
3. `modules/misvisitas.js` no fue tocado y sigue prometiendo sincronizacion de hoja de ruta y liquidacion.
4. `modules/dashboard.js` y `modules/postulaciones.js` siguen usando textos de `WhatsApp enviado`.
5. `modules/academia.js` conserva textos de `Sincronia automatica`, `sincroniza la HR externa` y `mueve la liquidacion`.
6. No aparecen `outboxStatus`, `mailboxId`, `formVersion` ni `availableFrom`, por lo que no incorporo los bloques backend mas recientes.
7. El nuevo documento `ADDENDUM-V87-PHASE-A.md` tiene versionado residual inconsistente: V84 contiene un addendum V87 con `Base: V86`.

## Conteo comparativo de senales

| Senal | V82 | V83 | V84 | Lectura |
|---|---:|---:|---:|---|
| `cuestionario enviado` | 10 | 10 | 9 | Mejora minima: baja de 10 a 9, pero sigue en flujo visible. |
| `HR sincronizada` | 3 | 3 | 3 | Sin mejora: siguen 3 apariciones, incluyendo toasts visibles. |
| `WhatsApp enviado` | 4 | 4 | 4 | Sin mejora: siguen 4 apariciones. |
| `sourceSafe` | 0 | 2 | 3 | Mejora leve por Academia/docs, no por UI profunda. |
| `manual_review_required` | 0 | 1 | 2 | Mejora leve por Academia/docs. |
| `assignment sync` | 0 | 0 | 1 | Aparece solo en addendum, no en flujo profundo. |
| `availableFrom` | 0 | 0 | 0 | No aparece; falta bloque visit lifecycle/reservas en Academia/UI. |
| `outboxStatus` | 0 | 0 | 0 | No aparece; falta notification outbox. |
| `mailboxId` | 0 | 0 | 0 | No aparece; falta email/user mailbox. |
| `formVersion` | 0 | 0 | 0 | No aparece; falta ficha dinamica/versionado. |
| `hrRowId` | 0 | 0 | 8 | Mejora en revision-admin. |
| `status=estado` | 0 | 0 | 1 | Mejora en revision-admin. |
| `projectId:p.id` | 5 | 5 | 6 | Mejora en revision-admin. |
| `liquidacion candidata` | 1 | 3 | 4 | Aparece con semantica mas correcta, pero quedan otros textos inconsistentes. |
| `genera liquidacion` | 1 | 1 | 3 | Mejora: nuevos textos aclaran que aun no genera liquidacion. |
| `cuestionario realizado/completado` | 1 | 1 | 3 | Mejora: aparece en Academia/revision-admin. |

## Evaluacion Academia

V84 mejora Academia mas que V83 porque agrega ruta Shopper y ruta Cliente, y corrige parcialmente el flujo financiero. Sin embargo, no cumple todavia el addendum de Academia profunda:

1. Faltan rutas completas para Ops, Superadmin/aliado y Finanzas frente a los bloques nuevos.
2. Los checklists siguen siendo principalmente visuales, no interactivos ni persistentes.
3. No aparece `availableFrom`; falta profundizar visit lifecycle/reservas.
4. No aparece `outboxStatus`; falta notification outbox.
5. No aparece `mailboxId`; falta email/user mailbox.
6. No aparece `formVersion`; falta ficha dinamica/versionado.
7. `assignment sync` aparece solo en addendum, no como contenido profundo del curso.
8. Conserva textos que prometen sincronia automatica, HR externa y liquidacion como si fueran reales.

## Decision para Claude

Pedir V85 correctiva sobre V84, sin rediseño libre. Debe conservar lo bueno de V84 y corregir P0 acumulados.

## Estado seguro de esta auditoria

- No se aplico ningun cambio frontend desde backend.
- No hubo deploy.
- No hubo merge.
- No se activo runtime.
- No se leyo ni importo fuente real.
- No se escribio Firestore, HR, Storage, Make, Gemini, correo ni pagos.
- No se procesaron datos sensibles.
