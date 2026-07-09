# Phase A anti-regreso y anti-desvio guardrail TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Evitar que la conversacion, ChatGPT, Claude o cualquier bloque futuro vuelva a marcar como pendiente desde cero algo ya trabajado, se desvie del plan Phase A o reinicie metodologia.

## Regla operativa obligatoria antes de responder o avanzar

Antes de listar pendientes, proponer siguiente bloque, pedir informacion o ejecutar cambios, se debe revisar y respetar:

1. Documento maestro y addenda vigentes del proyecto.
2. `app/docs/PHASE-A-ACCUMULATED-CONTINUITY-CHECKPOINT-TYA-20260709.md`.
3. `app/docs/PHASE-A-PLAN-AUDIT-EFFECTED-PENDING-TYA-20260709.md`.
4. `CAMBIOS-BACKEND.md`.
5. `RESUMEN-PARA-CLAUDE.md`.
6. PR #7 estado actual.

## Semaforo para clasificar cualquier actividad

Toda actividad debe clasificarse en una de estas categorias antes de llamarla pendiente:

- Hecho/documentado: ya existe como contrato, doc, gate, script, checkpoint o empalme.
- Preparado pero no ejecutado: existe el plan o herramienta, falta correrlo con GO o computador.
- Pendiente de autorizacion: requiere GO explicito de Paula.
- Pendiente Claude/prototipo: requiere UI/prototipo y no debe tocarse desde backend.
- Pendiente backend real: requiere base limpia, adapter, import, writes o proveedor real.
- Bloqueado por seguridad: no se puede ejecutar sin cumplir gates.
- No corresponde a Phase A: debe posponerse.

## Reglas anti-regreso

- No marcar `CX.data adapter` como pendiente desde cero: ya hay contrato/plan; falta habilitacion futura.
- No marcar source-safe domain mapping/readiness como pendiente desde cero: ya fue trabajado; falta consolidacion final o ejecucion segun GO.
- No marcar builder local/comando unico como pendiente desde cero: ya esta preparado; falta ejecucion local si aplica.
- No marcar reviewQueue/conflictos como pendiente desde cero: ya esta documentado; falta implementacion real posterior.
- No marcar rollback/auditoria como pendiente desde cero: ya esta documentado; falta implementacion real posterior.
- No marcar smoke/GO como no preparado: ya esta preparado; falta ejecucion humana/consola y decision explicita.
- No reiniciar Level 0/1 sin causa nueva, verificable y documentada.
- No volver a versiones anteriores si V91 sigue siendo baseline viva.

## Reglas anti-desvio

- Mantener Phase A TyA como prioridad.
- Mantener HR como fuente operacional.
- Mantener Cinépolis como proyecto configurable, no logica global.
- Mantener junio como liquidaciones/pagos, no visitas pendientes.
- Preservar certificaciones ya presentadas.
- Conservar shoppers historicos.
- Resolver conflictos con reviewQueue, no por nombre visual.
- No tocar `/app/modules` ni `/app/core` desde backend salvo autorizacion y documentacion especifica.
- No activar Firestore/Auth/Storage/HR/Make/Gemini/import/pagos/deploy sin GO explicito.

## Formato obligatorio de reporte al usuario

Cada bloque debe cerrar con:

1. Que hice.
2. Que ya estaba hecho y no se reabrio.
3. Que avance aporta al plan Phase A.
4. Que queda pendiente real por carril.
5. Que sigue exactamente.
6. Estado seguro.
7. Bloqueos o fallos de herramienta, si los hubo.

## Siguiente bloque por defecto mientras Paula esta sin computador

Preparar ruta de ejecucion Phase A por carriles:

- Carril A: ya hecho/documentado.
- Carril B: Claude/prototipo.
- Carril C: computador/smoke humano.
- Carril D: GO DEV/base limpia/adapter/import dry-run.
- Carril E: produccion/merge/deploy.

## Estado seguro

Documento guardrail solamente. No cambia UI/core, no activa runtime, no importa, no escribe, no despliega, no produce y no usa datos sensibles.
