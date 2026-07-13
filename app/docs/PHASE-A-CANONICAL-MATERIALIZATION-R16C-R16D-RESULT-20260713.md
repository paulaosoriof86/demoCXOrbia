# Phase A — Materialización canónica R16C–R16D

Fecha: 2026-07-13  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Decisión ejecutiva

El plan base de materialización ya no confunde controles de liquidación por visita con filas financieras ni con pagos confirmados.

Se completó offline y source-safe la alineación de fuentes:

- HR viva TyA: fuente canónica de periodos, shoppers y visitas;
- R14C: fuente de control financiero;
- Firestore DEV: referencia existente, todavía no fuente canónica;
- certificaciones carryover: bloqueadas hasta tener fuente materializable;
- pagos: nunca inferidos.

Decisión R16D: `PASS_R14C_FINANCIAL_OVERLAY_REVIEW_PLAN_R16D`.

## R16C — diagnóstico de alineación

Decisión: `HOLD_CANONICAL_MATERIALIZATION_PLAN_NEEDS_R14C_OVERLAY_R16C`.

El plan base contenía:

- 1,415 operaciones source-safe;
- 1 tenant;
- 1 proyecto configurable `cinepolis`;
- 1 referencia de import HR;
- 14 periodos;
- 210 shoppers live source-safe;
- 616 visitas;
- 572 controles de liquidación por visita.

Hallazgo clave:

- los 572 registros no equivalen a 247 filas financieras;
- tampoco equivalen a pagos;
- faltaba aplicar la capa R14C por llave estable de visita;
- las 51 filas financieras no enlazadas debían permanecer en revisión;
- la cola financiera total era 92 al incluir 51 reconciliaciones, 37 evidencias ledger y 4 ítems de control de fuente.

No se generaron operaciones de pago ni certificación. No se infirió `paid` ni certificación aprobada.

Evidencia R16C:

- run: `29276802992`;
- artifact digest: `sha256:e617131b066eec845587b5e7be397e035d8756d7a072ec83530952633836ba64`.

## R16D — overlay financiero exacto y colas completas

Decisión: `PASS_R14C_FINANCIAL_OVERLAY_REVIEW_PLAN_R16D`.

Resultado final:

### Plan canónico

- operaciones: 1,415;
- lotes futuros planificados: 4, máximo 400 operaciones;
- hard stops: 0;
- tenant: 1;
- proyecto: 1;
- HR import reference: 1;
- periodos: 14;
- shoppers: 210;
- visitas: 616;
- controles de liquidación: 572.

### Finanzas

- filas R14C: 247;
- overlays exactos por `visitId`: 196;
- controles pendientes de enlace financiero exacto: 376;
- filas financieras en revisión: 51;
- evidencias ledger itemizadas: 37;
- ítems de control de fuente: 4;
- cola financiera total: 92;
- pagos confirmados o inferidos: 0.

Los 196 enlaces exactos actualizan únicamente el control financiero source-safe. Mantienen:

- `paymentControlOnly: true`;
- `paymentConfirmationStatus: not_confirmed`;
- `paid: false`;
- `paidAt: null`;
- `paymentBatchId: null`;
- fuente `r14c_control_row_unconfirmed`.

Los otros 376 controles permanecen como `pending_exact_source_link`; no se convierten en pago ni se eliminan.

### Shoppers

- shoppers live: 210;
- referencias históricas protegidas: 213;
- gap: 3;
- cola shopper: 1 ítem agregado que conserva el gap completo;
- sin match por nombre;
- sin fusión automática.

### Certificaciones

- shoppers candidatos carryover: 213;
- registros de fuente materializable: 0;
- cola: 1 ítem `source_required`;
- certificaciones inferidas: 0;
- operaciones de certificación: 0.

### Review queues

Las colas no entran en los futuros lotes de materialización:

- financiera: 92;
- shopper: 1 ítem / gap 3;
- certificación: 1 ítem / 213 shoppers pendientes de fuente.

## R16E — precheck listo, proveedor todavía bloqueado por cuota

El precheck offline del próximo comparador pasó:

`PASS_CANONICAL_PROVIDER_COMPARE_PRECHECK_R16E`.

Validó:

- plan R16D correcto;
- 1,415 operaciones;
- 196 overlays exactos;
- cola financiera 92;
- gap shopper 3;
- 213 certificaciones pendientes de fuente;
- 0 pagos confirmados;
- 0 hard stops.

El provider compare no se ejecuta nuevamente por ahora porque Firestore devolvió `RESOURCE_EXHAUSTED: Quota exceeded` durante R16/R16B.

Causa raíz operativa identificada:

- R15C, R15D y R16 estaban configurados inicialmente para dispararse con commits;
- cada ejecución repetía lecturas Firestore;
- esto consumió la cuota DEV.

Corrección aplicada:

- R15C pasó a manual-only;
- R15D pasó a manual-only;
- R16 pasó a manual-only;
- R16E es manual-only con confirmación exacta;
- los bloques offline R16C/R16D sí pueden seguir ejecutándose automáticamente porque no llaman proveedor.

No corresponde pedir a Paula crear otro proyecto, cambiar plan, limpiar Firebase ni ejecutar comandos. R16E se realizará una sola vez cuando la cuota esté disponible y exista autorización read-only para ese gate.

## Evidencia R16D y precheck R16E

- run: `29277665760`;
- artifact digest: `sha256:188df8a85ef9497c7004354eeb34d2b05442ef3f0959b1bd6abced607e596e76`;
- plan ID: `r16d_f471a6b486f3a269b0dd`;
- plan SHA-256: `afd6813a81004118bb11f44105c3b6d1e85453027891f327c55637d2fd8dc91a`.

## Siguiente bloque exacto

`R16E — MANUAL READ-ONLY PROVIDER COMPARISON AFTER QUOTA RESET`

Al ejecutarse debe:

1. reconstruir el plan R16D offline;
2. validar el precheck;
3. consultar únicamente documentos planificados por ID y campos allowlisted;
4. clasificar `create/update/noop/review`;
5. preservar documentos extra existentes, sin borrarlos;
6. excluir review/noop de lotes futuros;
7. producir paquete R17 de autorización, sin ejecutar materialización.

## Clasificación

- **Reusable CXOrbia:** separación entre settlement control, overlay financiero, pago confirmado, colas y materialización.
- **Exclusivo cliente:** 616 visitas, 210/213 shoppers, 247 filas R14C, 196 exactos y 92 ítems financieros.
- **Claude/prototipo:** sin P0 nuevo; mantener estados honestos y no presentar control como pago.
- **Academia:** enseñar fuente canónica, overlay, reviewQueue, confirmación de pago y cuota de proveedor.
- **Sin impacto Claude:** workflows manual-only, digests, queries allowlisted y gates de cuota.

## Estado seguro

- sin provider calls en R16C/R16D;
- sin writes o deletes;
- sin import;
- sin deploy;
- sin producción;
- sin pagos;
- sin certificaciones inferidas;
- sin PII;
- sin necesidad de acción manual de Paula en este momento.
