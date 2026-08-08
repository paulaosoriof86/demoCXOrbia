# CAMBIOS BACKEND — ADDENDUM CORTE 0B R20 HISTÓRICO

Fecha: 2026-07-18  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: `#7`, draft/open/no merge  
Estado: `IMPLEMENTED_PENDING_GATES_AND_VISUAL`

## 1. Motivo

La validación visual de V159 demostró que las reglas HR estaban documentadas, pero no existía una única implementación consumida por Dashboard, fases, listados, Shopper y Finanzas. Además, algunos campos podían quedar asociados por encabezados parciales y valores de fecha inválidos podían influir en estados.

La corrección no se limita a mayo, junio y julio. El motor nuevo se aplica a todos los periodos que detecte la HR multi-tab; si temporalmente una fuente anterior no puede leerse, el mínimo aceptable es todo el año vigente. Mayo/junio/julio quedan como pruebas de regresión.

## 2. Archivos creados

### `tools/hr-source/tya-canonical-visit-state-r20.mjs`

- Motor canónico source-safe por visita.
- Separa asignación, agenda, ejecución, cuestionario, submitido, liquidación y pago.
- Valida fechas ISO antes de contarlas.
- No acepta valores inválidos como evidencia operativa.
- Cierra la cadena por evidencia posterior sin inventar fechas.
- Convierte contradicciones en `reviewRequired`.
- Produce facets y resumen por todos los periodos.

### `backend/contracts/phase-a-hr-canonical-visit-state-r20-v1.json`

- Contrato de fuente de verdad.
- Define consumidores obligatorios, progresión monotónica y prohibiciones.
- Prohíbe lógica especial por mes y derivar finanzas desde `estado` solamente.

### `backend/config/tya-tenant-runtime-profile.source-safe.json`

- Perfil source-safe del tenant TyA.
- Países GT/HN.
- Proyecto activo Cinépolis.
- Proyecto y periodo separados.
- Roles visibles en login: Admin, Operativo y Shopper.
- Cliente/coordinador/aliado ocultos hasta habilitación explícita.
- Persistencia Firestore/Auth permanece apagada.

### `tools/qa/tya-canonical-history-reconciliation-r20-gate.mjs`

- Recorre todos los periodos presentes.
- Recalcula y compara facets por visita.
- Comprueba resúmenes por periodo.
- Bloquea cadenas no monotónicas, pagos sin candidato financiero y conflictos ocultos.
- Registra año vigente, periodo más antiguo/nuevo y filas en revisión.

## 3. Archivos modificados

### `tools/hr-source/tya-build-live-hr-source-safe-r15g.mjs`

- Ejecuta el builder multi-tab vigente.
- Normaliza fechas.
- Aplica R20 a todas las visitas.
- Regenera shoppers como referencias protegidas sin inventar perfil, rating o estado.
- Genera `periodOperationalSummary` para todo el histórico detectado.
- Expone conteos separados y `historyScope: all_detected_hr_periods`.
- Falla si la historia canónica no pasa.

### `tools/release/tya-source-safe-binding-build-r15g.mjs`

- El adapter de build transporta los estados R20 a `CX.data`.
- Agrega `visitFacets`, buckets canónicos, `visitContract`, `periodKpis` e histórico reciente.
- Liquidaciones ya no derivan pago desde `v.estado`.
- Submitido sin fuente financiera se representa como `Pend. pago · cruce financiero`.
- Reconciliación visible de fases desde facets canónicos.
- Comparativo trimestral usa periodos reales disponibles.
- Aplica perfil de tenant/login a la vista DEV.
- No modifica los archivos fuente de `app/modules/**` ni `app/core/**`.

### `tools/qa/tya-source-semantics-r15g-gate.mjs`

- Conserva nombre por compatibilidad de workflow, pero valida R20.
- Exige motor `r15g+r20`, cobertura histórica, resúmenes por periodo, buckets y perfil de tenant.
- Sigue declarando que snapshot de build no equivale a sync live.

### Fuentes maestras

- `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
- `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
- `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`

Quedaron actualizadas para exigir composite, gates y visualización antes de futuros empalmes y para ampliar Corte 0B a todo el histórico HR.

## 4. Reglas canónicas implementadas

1. Sin shopper real: pendiente por asignar/disponible según elegibilidad.
2. Shopper sin fecha programada válida: pendiente de programar.
3. Fecha programada válida sin evidencia de ejecución: pendiente de realizar.
4. Realizada sin cuestionario: pendiente de cuestionario.
5. Cuestionario sin submitido: pendiente de submitido TyA.
6. Submitido: ciclo operativo completo y candidato a liquidación.
7. Submitido no equivale a liquidado ni pagado.
8. Liquidación y pago requieren fuente financiera independiente.
9. Control HR contradictorio no sobrescribe silenciosamente shopper/fechas: pasa a revisión.
10. La misma regla rige todos los meses, países y periodos.

## 5. Evidencia pendiente

Todavía no se afirma PASS runtime. Falta:

- ejecutar builder contra HR viva vigente;
- ejecutar gates R20;
- revisar filas `reviewRequired` y columnas ambiguas;
- confirmar todos los periodos y al menos todo 2026;
- construir nuevo Hosting DEV bajo autorización específica;
- repetir validación visual.

## 6. Impacto Phase A

Avanza Corte 0B de reglas dispersas a una máquina canónica reusable. Todavía no congela Corte 0B ni habilita Corte 1.

## 7. Clasificación

- **Reusable CXOrbia:** motor de estados ortogonales, histórico dinámico, gates, perfil tenant/login y composite pre-empalme.
- **Exclusivo TyA/Cinépolis:** alias de columnas, fuente HR, GT/HN, reglas Q1/Q2 y controles financieros documentados.
- **Claude/prototipo:** consumir contrato, selectores por rol, Academia Cliente y Manual como documento.
- **Academia:** actualizar rutas, manuales, estados, errores y validaciones.
- **Sin impacto Claude:** builder, contratos, gates, reportes y documentación técnica.

## 8. Estado seguro

Sin merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos. No se conectó base vieja ni se agregó PII.
