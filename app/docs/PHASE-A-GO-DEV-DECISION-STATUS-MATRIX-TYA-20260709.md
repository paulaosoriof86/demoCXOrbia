# Phase A GO DEV decision status matrix TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge
Contrato: `backend/contracts/phase-a-go-dev-decision-status-matrix-v1.json`

## Objetivo

Clasificar el estado actual frente a las opciones de decision GO DEV, sin pedir accion manual todavia.

## Resultado de decision actual

Decision actual: `need_local_evidence_before_ready_to_request_go_dev`.

Esto significa:

- no hay GO DEV autorizado;
- DEV no esta activo;
- produccion no esta autorizada;
- no hay hard stop conocido por documentacion;
- falta evidencia local/smoke o equivalente antes de pedir GO DEV con precision.

## Matriz de estado

| Item | Estado | Lectura |
|---|---|---|
| PR #7 | ready | Open, draft, no merge. |
| Baseline V91 | ready | Baseline y PR body documentados. |
| Gates automatizados | ready_on_prior_head | PR body registra gates success en head previo. |
| Smoke humano/consola | pending_evidence | El PR mantiene smoke humano/consola como siguiente bloque antes de RC. |
| Base nueva limpia | pending_go_dev | Solo se prepara/crea despues de GO DEV explicito. |
| Secrets fuera del repo | ready_as_policy | Politica documentada; secrets reales no se piden todavia. |
| `CX.data` punto unico | prepared_not_executed | Plan listo, no habilitado. |
| Input TyA source-safe | pending_evidence_or_later_input | No pedir hasta que sea necesario para dry-run o GO DEV. |
| Dry-run import | prepared_not_executed | Plan listo, no ejecutado. |
| ReviewQueue/auditEvents | ready_as_contract | Documentado como contrato. |
| Rollback/disable path | ready_as_contract | Documentado como contrato. |
| Claude/Academia | documented | Addenda/documentos creados. |
| Hard stops | no_known_hard_stop_from_docs | Estado sigue documental, sin runtime/write/deploy. |

## Interpretacion

No estamos en `blocked` porque no se encontro un hard stop nuevo en la documentacion revisada.

No estamos en `ready_to_request_go_dev` porque el PR todavia indica que falta smoke humano/consola focalizado antes de avanzar a RC Phase A controlada.

No se pide ese smoke en este bloque porque la regla vigente dice que las acciones manuales solo se piden cuando sean el siguiente bloqueo real e imprescindible.

## Que se puede seguir haciendo sin Paula

Todavia se puede preparar desde GitHub/documentacion:

- paquete unico minimo para smoke humano si llega a ser necesario;
- definicion del input source-safe esperado para dry-run;
- checklist de base limpia DEV sin crear recursos;
- matriz de hard stops GO DEV;
- paquete corto para Claude con estados GO DEV/no produccion.

## Que pedir a Paula solo si se vuelve necesario

Solo pedir:

- ejecutar smoke humano/consola focalizado si es el siguiente bloqueo real;
- autorizar GO DEV explicito;
- ubicar fuente TyA source-safe si se necesita para dry-run;
- confirmar una decision operativa no documentada.

## Impacto Phase A real

Este bloque evita pedir GO DEV prematuramente y evita pedir ejecucion manual sin necesidad inmediata.

Tambien confirma que el siguiente salto real no es mas documentacion abstracta: el borde actual es evidencia focalizada o autorizacion, no rehacer contratos desde cero.

## Backend reusable

Patron reusable:

- matriz de decision por carril;
- separar ready/prepared/pending evidence/pending GO/blocked;
- pedir manual solo cuando sea bloqueo real;
- evitar que DEV se confunda con produccion;
- no reabrir contratos ya preparados.

## Claude/prototipo

Claude debe mostrar estados honestos si existe una vista de readiness:

- ready;
- prepared not executed;
- pending evidence;
- pending GO DEV;
- blocked;
- no production.

## Academia

Academia debe explicar:

- diferencia entre evidencia local y autorizacion;
- diferencia entre GO DEV y produccion;
- por que no se pide una accion manual si aun se puede avanzar desde documentacion;
- por que una matriz evita reprocesos.

## Necesidad de Paula

No necesito nada de Paula en este bloque.

## Estado final

Matriz de estado GO DEV documentada. Sin runtime, sin base conectada, sin import, sin writes, sin deploy y sin produccion.
