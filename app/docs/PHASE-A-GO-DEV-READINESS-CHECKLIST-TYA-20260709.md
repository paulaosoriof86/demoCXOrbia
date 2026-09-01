# Phase A GO DEV readiness checklist TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge
Contrato: `backend/contracts/phase-a-go-dev-readiness-checklist-v1.json`

## Objetivo

Consolidar el checklist minimo antes de pedir GO DEV explicito a Paula.

Este bloque no pide ejecucion manual. No activa DEV. No conecta base. No importa. No escribe.

## Carril

Carril D: GO DEV/backend real.

## No se reabre desde cero

Ya existe y se usa como base:

- baseline V91 y auditoria;
- checkpoints de continuidad;
- `CX.data` adapter plan;
- domain mapping source-safe;
- readiness pack;
- builder y comando futuro preparados;
- smoke precheck;
- GO/NO GO decision pack;
- DEV conditions;
- rollback/auditoria;
- reviewQueue/conflictos;
- guardrail anti-regreso.

## Checklist antes de pedir GO DEV

1. PR #7 confirmado open/draft/no merge.
2. Evidencia smoke humano/consola disponible si es necesaria para decidir.
3. Base nueva limpia definida como destino DEV.
4. Secrets fuera del repo.
5. Punto unico de switch de `CX.data` confirmado.
6. Compatibilidad de interfaz `CX.data` confirmada.
7. Ruta de input TyA source-safe definida.
8. Dry-run import definido antes de import real.
9. ReviewQueue y auditEvents confirmados.
10. Rollback/disable path confirmado.
11. Impacto Claude/prototipo documentado.
12. Impacto Academia documentado.
13. GO DEV explicito de Paula.

## Hard stops

No pedir ni ejecutar GO DEV si existe:

- dependencia de base vieja;
- falta de base limpia;
- falta de punto unico `CX.data`;
- payload sensible sin revisar;
- data demo como fuente final;
- resolucion silenciosa de conflictos;
- necesidad de reescribir modulos UI;
- Make/Gemini/Auth/Storage live sin gate;
- confusion entre GO DEV y GO produccion.

## Permitido solo despues de GO DEV

Solo con GO DEV explicito se puede preparar o ejecutar en DEV:

- recursos backend limpios de DEV;
- adapter en modo DEV controlado;
- dry-run import source-safe;
- registros DEV si el gate lo permite;
- auditEvents;
- reviewQueue DEV.

## No autorizado aunque exista GO DEV

GO DEV no autoriza:

- deploy produccion;
- pagos reales;
- copiar base vieja;
- subir datos sensibles;
- sobrescribir HR silenciosamente;
- hardcodear Cinépolis como logica global.

## Impacto Phase A

Este checklist acerca la salida real porque separa preparacion documental de activacion DEV. Evita pedir pasos manuales antes de tener claro que el siguiente bloqueo real es autorizacion, evidencia local o fuente source-safe.

## Claude/prototipo

Claude debe representar GO DEV como estado separado de produccion. Si el prototipo muestra readiness, debe diferenciar:

- preparado;
- pendiente validacion local;
- pendiente GO DEV;
- DEV activo;
- bloqueado;
- no produccion.

## Academia

Academia debe explicar:

- diferencia entre GO DEV y GO produccion;
- por que la base debe ser limpia;
- por que `CX.data` tiene punto unico de switch;
- por que se hace dry-run antes de import;
- por que reviewQueue y auditEvents son obligatorios;
- por que no se usan datos demo como fuente final.

## Necesidad de Paula

No necesito accion manual de Paula en este bloque.

Solo se necesitara Paula si se llega a uno de estos puntos:

- autorizar GO DEV;
- entregar o ubicar fuente TyA source-safe local si no esta disponible;
- ejecutar smoke/consola si aparece un bloqueo que GitHub no puede resolver;
- confirmar una decision operativa no documentada.

## Estado seguro

Documento/contrato solamente. No cambia UI/core, no activa runtime, no importa, no escribe, no despliega, no produce y no usa datos sensibles.
