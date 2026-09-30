# Paquete localizado para Claude — Corte 2A ciclo shopper y operación canónica

Fecha: 2026-07-22  
Estado: `READY_FOR_CLAUDE_FRONTEND_DELTA`  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama viva de destino posterior: `docs-tya-v6-v71-audit`  
PR existente: `#7` draft/open/no merge

## 1. Regla de continuidad

Corte 1 / M1 ya está congelado como `FROZEN_WITH_DOCUMENTED_P1_P2` sobre el build funcional DEV `67c0943260f076f5686284ac509458ed5fd34dbd`.

No reabrir ni reinterpretar:

- lectura HR viva de 14 periodos / 616 visitas;
- variantes de encabezado R20;
- proyecto y periodo separados;
- refresco in-place sin `location.reload()`;
- `fresh=1` fail-closed;
- una sola `sourceRevision` para Admin, Cliente, Shopper y reportes;
- canary de asignación/cuestionario;
- coherencia transversal de KPI;
- portal shopper retirando visitas asignadas desde HR;
- cero pagos inferidos.

No crear otra arquitectura, otra fuente, snapshots hardcodeados, excepciones por julio, rama o PR.

## 2. Archivos frontend autorizados

### A. `app/modules/visitas.js`

Corregir únicamente:

1. La tabla, filtros, detalle, drilldowns y exportación deben consumir facets canónicas (`data.visitFacets(v)` / buckets existentes), no `v.estado` crudo como única verdad.
2. Mantener separados: asignación, agenda, ejecución, cuestionario, submitido, liquidación y pago.
3. El estado visible debe ser comercial y coherente con Dashboard; no mostrar categorías incompatibles entre sí.
4. Honorario, boleto, combo/reembolso u otro monto ausente debe verse como `Pendiente de fuente` o `—`; solo mostrar cero cuando la fuente confirme cero.
5. La exportación debe usar exactamente la misma proyección visible y la misma `sourceRevision`.
6. No tocar watcher, lectura HR, periodos, KPI canónicos ni reportes de Cliente.

### B. `app/modules/postulaciones.js`

Corregir únicamente:

1. Reasignar debe mostrar shopper actual, fecha y franja vigentes.
2. Debe exigir una decisión explícita:
   - conservar fecha y franja;
   - cambiar fecha y franja;
   - dejar pendiente de agendamiento.
3. Cambiar fecha/franja requiere validación; nunca borrar, inventar o sustituir silenciosamente.
4. Implementar `Exportar` para el alcance filtrado visible y periodo activo, con revisión de fuente y columnas autorizadas.
5. Sustituir `undefined`, `null` u otros literales técnicos por `Dato protegido`, `No disponible` o referencia source-safe según rol.
6. No afirmar `HR sincronizada` ni ejecutar writes reales. En modo read-only solo puede indicar cambio preparado/en memoria/pendiente de sincronización autorizada.
7. Preservar filtros, histórico explícito, permisos, trazabilidad y eventos existentes.

### C. `app/core/tya-phase-a-source-safe-preview.js`

Solo si es indispensable para evitar el falso cero:

- preservar `null`/ausencia en `honorario`, `boleto` y `comboAmt`;
- no convertir valores ausentes a `0`;
- no alterar IDs, periodos, estados canónicos, shoppers ni sourceRevision.

Este punto es de contrato/adaptación; no introducir lógica de UI.

## 3. Contrato obligatorio

Leer y cumplir:

- `backend/contracts/phase-a-corte2a-shopper-operation-canonical-v1.json`.
- `app/docs/VALIDACION-VISUAL-Y-LOCK-ANTI-REGRESION-CORTE1-M1-20260722.md`.

## 4. Evidencia exigida en la candidata

Entregar delta localizado con:

- archivos modificados y justificación;
- cero cambios fuera del alcance salvo dependencia demostrada;
- prueba de que no existe `location.reload()` nuevo;
- prueba de que no hay conteos/periodos hardcodeados;
- prueba de que tabla, filtros y exportación usan la misma proyección canónica;
- prueba de los tres caminos de reasignación;
- prueba de Exportar Postulaciones con filtro y periodo activo;
- prueba de ausencia distinta de cero;
- manifest/build-lock/verificador de la candidata.

## 5. Criterios de rechazo P0

Solo se considera P0 si la candidata:

- impide iniciar la app;
- rompe una ruta esencial;
- pierde datos/funciones críticas;
- expone secreto o dato sensible;
- activa write/deploy/proveedor/pago/producción no autorizado;
- rompe lectura HR, periodos, canary, coherencia transversal o marketplace shopper.

P1/P2 se documentan y no bloquean el empalme.

## 6. Método posterior obligatorio

Cuando Claude entregue la candidata:

`EXECUTION_LANE_READY → auditoría delta localizada → GO/P0_PROVEN → APPLY_DELTA_DIRECTLY sobre docs-tya-v6-v71-audit → commit/push atómico → manifest/build-lock/verificador → gates M1 + Corte2A → Hosting DEV autorizado → validación visual → freeze Corte 2A`.

No nueva rama, no nuevo PR, no PowerShell para Paula, no paquete transportador y no reconstrucción paralela.
