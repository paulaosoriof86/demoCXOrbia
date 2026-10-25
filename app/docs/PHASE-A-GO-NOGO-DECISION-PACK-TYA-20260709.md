# Phase A GO/NO GO decision pack TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge
Contrato: `backend/contracts/phase-a-go-nogo-decision-pack-v1.json`

## Objetivo

Definir como se decidira `GO`, `GO_WITH_WARNINGS`, `NO_GO` o `HOLD` cuando exista un smoke humano/consola futuro autorizado.

Este documento evita que una validacion visual positiva se confunda con produccion real, deploy, merge, runtime, import, escritura HR, proveedores activos o pagos reales.

## Estado actual

Este bloque es solo documental.

No ejecuta smoke, no pide computador, no activa runtime, no cambia `/app/modules`, no cambia `/app/core`, no ejecuta builder, no importa datos, no escribe proveedores, no activa Make/Gemini, no hace deploy, no produccion, no pagos reales y no agrega datos sensibles.

## Decisiones posibles

### GO

Significa que el smoke humano futuro no encontro bloqueadores criticos para continuar con el siguiente paso controlado de RC Phase A.

Permite preparar el siguiente paso RC controlado y seguir documentacion segura.

No permite por si solo merge, deploy, produccion, runtime switch, imports, escrituras reales, integraciones reales ni pagos reales.

### GO_WITH_WARNINGS

Significa que no hay blocker duro, pero quedan warnings documentados.

Permite documentar warnings y continuar solo preparacion no destructiva.

No permite merge, deploy, produccion, runtime switch, integraciones reales, imports ni pagos.

### NO_GO

Significa que aparecio al menos un bloqueador critico.

Permite documentar causa raiz, corregir solo la causa puntual si se autoriza y repetir el gate o smoke relevante.

No permite refactor amplio, repetir Level 0/1 sin causa documentada, merge, deploy, produccion, runtime, imports, writes ni pagos.

### HOLD

Significa que no hay evidencia suficiente, la evidencia es ambigua o no es source-safe.

Permite pedir solo el insumo puntual faltante si no esta documentado y continuar documentacion segura.

No permite asumir GO ni afirmar validacion completada.

## Evidencia minima futura

Cuando se ejecute el smoke humano futuro, la decision necesita:

- rutas criticas revisadas;
- consola sin errores criticos o nota humana equivalente;
- copy honesto;
- ausencia de datos sensibles visibles;
- Academia administrable o pendiente honesto;
- readiness/diagnostico como preview/source-safe/gate-off;
- finanzas/liquidaciones/pagos sin prometer pago real;
- Cinépolis como proyecto configurable, no hardcode global.

## Hard stops

La decision debe ser `NO_GO` o `HOLD` si aparece:

- pantalla blanca;
- error JS critico que bloquea navegacion;
- ruta critica bloqueada;
- copy que afirma envio/sync/import/pago real con gate apagado;
- datos sensibles visibles o commiteados;
- intento de activar proveedor real sin GO explicito;
- junio tratado como visitas pendientes en vez de liquidaciones/pagos;
- Cinépolis hardcodeado como producto global;
- evidencia faltante, ambigua o no source-safe.

## Regla antirreproceso

Un `NO_GO` no autoriza reiniciar el plan.

Debe tratarse asi:

1. Identificar causa raiz.
2. Confirmar si es backend, Claude/prototipo, datos, gate, smoke o entorno.
3. Corregir solo lo puntual.
4. Documentar el cambio.
5. Repetir solo el gate o smoke relevante.
6. Mantener Phase A y no volver a Level 0/1 salvo causa real documentada.

## Impacto Claude/prototipo

Claude debe entender que GO visual no es produccion, no activa providers reales, no importa datos, no paga, no sincroniza HR y no reemplaza decision explicita de Paula.

Warnings deben mostrarse como warnings, no como resueltos. NO GO debe generar correccion puntual, no rediseño general.

## Impacto Academia

Academia debe explicar:

- que significa GO/NO GO;
- diferencia entre smoke, readiness, runtime y produccion;
- por que un GO no autoriza pago/import/deploy;
- como leer blockers y warnings;
- que hacer ante NO GO;
- que evidencia puede revisarse sin exponer datos privados;
- por que no se repite Level 0/1 sin causa real.

## Clasificacion

- Reusable CXOrbia: decision GO/NO GO por cliente/proyecto, antirreproceso, hard stops, evidencia source-safe y autorizaciones separadas.
- Exclusivo TyA: junio como liquidaciones/pagos, Cinépolis como primer proyecto TyA configurable.
- Claude/prototipo: copy de estados, badges de warnings/blockers, representacion honesta de GO/NO GO.
- Academia: manuales/checklists sobre decision, evidencia, warnings y blockers.
- Sin impacto Claude: contrato JSON y documentacion interna de decision.

## Siguiente bloque sugerido

Preparar el paquete de autorizacion futura `GO runtime DEV` solo como documento de condiciones, sin activarlo y sin pedir datos privados.

## Estado final

Decision pack documentado. No ejecuta nada y no cambia runtime.
