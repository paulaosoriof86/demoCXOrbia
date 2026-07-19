# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

Fecha: 2026-07-18  
Estado: `R21_TECHNICAL_PASS_PENDING_FRONTEND_CORRECTION_AND_NEW_DEV_AUTHORIZATION`

## Repositorio y estado seguro

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- V159 está empalmada, pero no es `ACTIVE_BASELINE`.
- El Hosting DEV publicado sigue en R20, commit `68ac6513df24b307d46836c84ac15eb9ecd52648`, y fue `NO APROBADO` visualmente.
- R21 no está desplegado.
- Sin producción, importaciones ni escrituras operativas.

## Corte activo

`CORTE 0B — MOTOR CANÓNICO HISTÓRICO + TENANT/LOGIN`

La misma semántica se aplica a todos los periodos detectados. Mayo, junio y julio son muestras de regresión, no reglas especiales.

## Implementado y validado

### Historia y operación

- 14 periodos y 616 visitas, junio 2025–julio 2026.
- 44 visitas por periodo: 34 GT y 10 HN.
- Estados separados: asignación, disponibilidad, agenda, ejecución, cuestionario, submitido, liquidación y pago.
- `sin asignar` no equivale a `disponible`.
- `P1Q` bloquea por dependencia de la ventana anterior.
- WK/WKND y Q1/Q2 quedan normalizados.
- Submitido no equivale a liquidado ni pagado.

### Julio 2026

- 39 asignadas y 5 sin asignar.
- 4 disponibles y 1 bloqueada: MC. Santa Clara Q2.
- 35 programadas, 21 realizadas, 21 cuestionarios, 7 pendientes de submitido y 14 submitidas.
- Cero liquidaciones y pagos confirmados por inferencia.

### Tenant y login

- DEV: Admin, Cliente, Shopper, Operativo, Coordinador y Aliado.
- Rótulo técnico DEV: `Accesos de validación`.
- Producción TyA prevista inicialmente: Admin, Operativo y Shopper.
- Configuración futura: `Configuración > Tenant > Accesos y login`.
- Países, banderas, roles, autorregistro, Cliente y Academia quedan gobernados por tenant.

### Contratos públicos

- `CX.data.availableVisits()`.
- `CX.data.postulationEligibility(visit, proposedDate)`.
- Proyecto y periodo mantienen identidades separadas.

## Evidencia de gates

- Commit validado: `287cd0729c14ef9dfe63ce566c6bc2ff8604f2a0`.
- R18A run `29669393823`: éxito.
- Gates completos run `29669735189`: éxito.
- Artifact `8436913243`.
- Historia canónica R21, semántica, proyecto/periodo, roles y overlays: PASS.
- Advertencia no bloqueante: 209 referencias shopper frente a 216; no se crean ni eliminan identidades.

## Pendiente real

1. `app/core/router.js`: separar proyecto/periodo y agregar selectores por alcance.
2. `app/modules/visita-detalle.js`: consumir elegibilidad, bloquear fechas inválidas y no mostrar `null`.
3. `app/app.js`: login desde perfil tenant y bloque técnico oculto en producción.
4. Cliente: Academia separada de Capacitación.
5. Aplicar ese delta frontend directamente en la rama viva.
6. Ejecutar post-gates.
7. Solicitar autorización separada para nuevo Hosting DEV.
8. Repetir validación visual.
9. Congelar Corte 0B solo con `APROBADO`.

## Carril vinculante

`EXECUTION_LANE_READY → AUDITORÍA DELTA → GO o P0_PROVEN → APPLY_DELTA_DIRECTLY → COMMIT/PUSH → POST-GATES → VALIDACIÓN VISUAL → FREEZE`

Quedan prohibidos nueva rama/PR, composite previo obligatorio, workflow transportador y tareas manuales para Paula.

## Claude, Academia y clasificación

- Claude recibe únicamente los cuatro ajustes frontend localizados; no reinterpreta la HR.
- Academia debe explicar disponibilidad, dependencia, franja, ventana, rechazo, proyecto/periodo y accesos por tenant.
- Reusable: motor, contrato de postulación, selectores y login configurable.
- Exclusivo TyA: GT/HN, Q1/Q2 y token `P1Q`.

## Siguiente bloque exacto

`CORTE 0B.3 — CORRECCIÓN FRONTEND LOCALIZADA R21 + APPLY_DELTA_DIRECTLY + POST-GATES`

No iniciar Corte 1 ni producción antes del freeze.
