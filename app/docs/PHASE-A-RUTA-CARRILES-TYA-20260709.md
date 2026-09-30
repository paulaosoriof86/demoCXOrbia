# Phase A ruta por carriles TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

No asumir si Paula tiene o no computador. Solo pedir accion manual cuando sea realmente necesaria para avanzar y no exista forma segura de resolverlo desde GitHub o documentacion.

## Regla

- No asumir disponibilidad ni falta de computador.
- No pedir acciones manuales por defecto.
- Avanzar primero desde GitHub, contratos y documentos.
- Si una validacion local es imprescindible, pedir un solo bloque claro y minimo.
- No ofrecer rutas alternativas ni pasos extra.

## Carril A - Ya hecho o documentado

No reabrir desde cero:

- Baseline V91 y auditoria.
- Checkpoints de continuidad.
- `CX.data` adapter plan.
- Domain mapping source-safe.
- Readiness pack.
- Builder y comando futuro preparados.
- Smoke precheck.
- GO/NO GO decision pack.
- DEV conditions.
- Rollback/auditoria.
- ReviewQueue/conflictos.
- Guardrail anti-regreso.

## Carril B - Claude/prototipo

Pendiente real:

- Copy honesto.
- Academia profunda.
- Consolidacion visual si aplica.
- Estados honestos para integraciones no activas.

Backend solo documenta; no toca UI/core.

## Carril C - Validacion local

Solo pedir a Paula si es imprescindible:

- Smoke humano/consola.
- Error real de navegador.
- Validacion local source-safe.
- Evidencia visual bloqueante.

## Carril D - DEV/backend real

Requiere GO DEV explicito:

- Base nueva limpia.
- Auth/Firestore/Storage por gates.
- Adapter `CX.data` habilitado.
- Dry-run import.
- Import real con GO.
- Writes auditados.
- ReviewQueue real.
- Make/Gemini con gates.

## Carril E - Produccion

Requiere GO separado:

- Merge.
- Deploy.
- Produccion.
- Pagos reales.

## Siguiente bloque

Mientras no exista necesidad real de validacion local, continuar desde GitHub/documentacion con el siguiente carril de preparacion segura.

## Estado seguro

Documento solamente. No cambia UI/core, no activa runtime, no importa, no escribe, no despliega, no produce y no usa datos sensibles.
