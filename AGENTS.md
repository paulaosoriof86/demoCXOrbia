# CXOrbia — ejecución obligatoria

Este archivo se lee antes de cualquier acción en el repositorio.

## Fuentes prevalentes

Leer primero:

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
2. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`

Después leer el documento maestro de continuidad, los addenda vigentes, contratos, `CAMBIOS-BACKEND`, `RESUMEN-PARA-CLAUDE`, `PENDIENTES-PROTOTIPO`, source lock, tracker Phase A y PR #7.

## Destino fijo

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR: `#7`
- Prohibido `main`
- No nueva rama
- No nuevo PR

## Método obligatorio

`AUDITED_GO_READY_DIRECT_APPLY → APPLY_DELTA_DIRECTLY → EMPALMED_PENDING_POST_GATES → ACTIVE_BASELINE`

Aplicar el delta directamente, preservar backend/overlays/documentación, generar manifest/build-lock, crear commit verificable y ejecutar gates después.

## Carriles permitidos

### Checkout file-aware

ZIP extraído + checkout autenticado + rama viva + commit/push.

### Git nativo atómico autenticado

Se permite crear blobs, tree, commit y actualizar el ref exclusivamente como objetos internos de un único commit atómico cuando:

- parten del HEAD vivo verificado;
- los blobs provienen de la candidata auditada o de documentación reconciliada;
- el commit tiene al HEAD vivo como padre;
- la rama se actualiza por fast-forward sin force;
- no hay ramas, PR, workflows ni commits parciales;
- el diff y el HEAD posterior se verifican.

## Prohibiciones

- `incoming/`, plan JSON, `.cmd` o PowerShell para Paula;
- Contents API archivo por archivo como transporte;
- blobs/trees como transporte manual o fragmentado;
- workflows/Actions, Drive o Base64 como transportador;
- rama o PR nuevos;
- `main`;
- force update;
- reauditoría general;
- nueva candidata cuando la actual está GO;
- afirmar éxito sin commit/diff/HEAD verificables.

## Preservación

Backend, contratos, adapters, tools, overlays TyA, `CX.data`, multi-tenant, multi-proyecto, HR, histórico, shoppers, postulaciones, certificaciones, liquidaciones/pagos, sincronización, Academia, manuales, rutas por rol, notificaciones, UTF-8 y ausencia de secretos.

Cinépolis es proyecto configurable, nunca default ni lógica global.

## Estado seguro permanente

Sin merge, deploy, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos salvo gate y autorización expresa.

## Lock operativo

El estado específico de candidata, HEAD y siguiente bloque se toma únicamente de `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`. No hardcodear versiones aquí.
