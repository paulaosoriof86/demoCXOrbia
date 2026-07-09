# Cambios Phase A anti-regreso y anti-desvio guardrail TyA

Fecha: 2026-07-09

## Archivos agregados

- `app/docs/PHASE-A-ANTI-REGRESO-DESVIO-GUARDRAIL-TYA-20260709.md`
- `backend/contracts/phase-a-anti-regreso-desvio-guardrail-v1.json`

## Objetivo

Evitar que bloques futuros marquen como pendiente desde cero algo ya trabajado, reinicien Phase A, regresen a versiones anteriores, pidan datos ya documentados o se desvien de TyA.

## Regla nueva

Antes de listar pendientes o avanzar, se debe revisar:

1. documentos maestros y addenda vigentes;
2. checkpoint acumulado Phase A;
3. auditoria de efectuado/pendiente Phase A;
4. `CAMBIOS-BACKEND.md`;
5. `RESUMEN-PARA-CLAUDE.md`;
6. PR #7 actual.

## Reporte obligatorio por bloque

Cada bloque debe cerrar con:

- que hice;
- que ya estaba hecho y no se reabrio;
- que avance aporta a Phase A;
- pendiente real por carril;
- siguiente bloque exacto;
- estado seguro;
- bloqueos o fallos de herramienta.

## Estado seguro

Documento/contrato solamente. No cambia UI/core, no activa runtime, no importa, no escribe, no despliega, no produce y no usa datos sensibles.
