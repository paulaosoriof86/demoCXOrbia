# Phase A runtime DEV GO request gate TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Preparar el gate previo para saber si corresponde pedir a Paula un GO explicito para runtime DEV preview. Este gate no activa runtime, no escribe, no importa, no despliega y no ejecuta pagos. Solo determina si ya se puede pedir autorizacion.

## Archivos agregados

- `backend/contracts/phase-a-runtime-dev-go-request-gate-v1.json`
- `tools/contracts/tya-phase-a-runtime-dev-go-request-gate.mjs`

## Decision clave

Un gate verde no equivale a autorizacion. El GO no puede inferirse. Debe existir autorizacion explicita de Paula con una frase exacta.

Frase requerida:

`Autorizo GO runtime DEV preview Phase A TyA`

Aun con esa frase, este gate no cambia runtime. Solo habilitaria preparar un paso separado/PR/gate para runtime DEV.

## Requisitos antes de pedir GO

- Readiness acumulado presente.
- Continuidad operacional presente.
- State machine presente.
- Acciones administrativas auditables presentes.
- Colas operativas presentes.
- Checkpoint real-data preview sin reproceso presente.
- Validador GO/NO-GO runtime DEV presente.
- Addendum Claude/prototipo presente.
- Pendientes prototipo presentes.
- Sin runtime, writes, imports, deploy, Make/Gemini, pagos reales ni datos sensibles.

## Hard stops

- Falta readiness acumulado.
- Falta contrato operacional.
- Falta validador runtime GO/NO-GO.
- Reabrir Level 0/1 sin causa real.
- Usar fixture como evidencia real.
- Usar `.tmp` derivado como fuente original.
- Datos sensibles en repo.
- Cambios UI/core desde backend.
- Runtime ya conectado.
- Writes ya habilitados.
- Falta plan rollback/smoke.
- GO ausente o ambiguo.

## Validador

Uso tecnico futuro:

```bash
node tools/contracts/tya-phase-a-runtime-dev-go-request-gate.mjs --out .tmp/tya-phase-a-runtime-dev-go-request-gate
```

Con GO explicito, solo para registrar la frase exacta en una corrida local/controlada:

```bash
node tools/contracts/tya-phase-a-runtime-dev-go-request-gate.mjs --paula-go "Autorizo GO runtime DEV preview Phase A TyA" --out .tmp/tya-phase-a-runtime-dev-go-request-gate
```

Este comando no cambia runtime.

## Interpretacion

### READY_TO_ASK_PAULA_GO_NO_RUNTIME_SWITCH

Se puede pedir autorizacion explicita. No se cambia runtime.

### PAULA_GO_RECORDED_READY_FOR_SEPARATE_RUNTIME_SWITCH_PR

La frase exacta fue registrada; el siguiente paso debe ser separado, con su propio gate/PR/runtime switch. No se cambia runtime automaticamente.

### NO_GO_RUNTIME_DEV_REQUEST_BLOCKED

No se puede pedir GO. Corregir solo causa raiz. No reiniciar Level 0/1 ni activar runtime.

## Impacto Claude/prototipo

Claude no debe interpretar este gate como integracion activa. Debe reflejarlo, si aplica, como estado de preparacion:

- listo para solicitar GO;
- pendiente GO Paula;
- runtime DEV no activo;
- writes bloqueados;
- sin sync real;
- sin pagos reales.

## Impacto Academia

Academia debe explicar:

- diferencia entre readiness, solicitud GO y runtime switch;
- por que un gate verde no autoriza produccion;
- por que se requiere frase explicita;
- por que runtime DEV es separado de produccion;
- por que rollback/smoke son obligatorios.

## Estado seguro

- Sin cambios en `/app/modules` o `/app/core`.
- Sin runtime conectado.
- Sin deploy.
- Sin produccion.
- Sin Firestore/Auth/Storage.
- Sin HR writes.
- Sin Make/Gemini.
- Sin correos/WhatsApp reales.
- Sin pagos reales.
- Sin import real.
- Sin datos sensibles.
