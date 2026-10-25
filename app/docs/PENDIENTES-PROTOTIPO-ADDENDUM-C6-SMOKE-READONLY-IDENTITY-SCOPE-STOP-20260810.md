# PENDIENTES PROTOTIPO — ADDENDUM C6 SMOKE READ-ONLY IDENTITY/SCOPE STOP

**Fecha:** 2026-08-10

## Cerrado en este bloque

- lifecycle de credencial del smoke: corregido;
- gate source-only sintaxis/zero-writes/no-PII: PASS;
- población Auth DEV 228: reconfirmada;
- superficies Phase A source-side: 20/20 presentes;
- segundo provider attempt: no ejecutado.

## Pendiente real bloqueante

Adjudicación read-only focal de los outliers observados en el único snapshot runtime:

1. 5 grupos de provider email duplicado;
2. 4 usuarios habilitados con rol fuera de la familia aceptada por el bridge actual;
3. 1 Admin/Operaciones sin tenant scope esperado;
4. 1 Shopper sin target scope/shopperId completo.

No interpretar estos conteos como cuatro problemas independientes por persona; pueden solaparse. No hay autorización para revelar PII ni para corregirlos todavía.

## Lo que NO está pendiente

- no reabrir plan de 340;
- no repetir HashConfig readiness;
- no repetir PREWRITE;
- no repetir Activation Auth DEV;
- no crear proyecto Firebase nuevo;
- no tocar frontend para compensar scopes;
- no deploy/merge/producción.

## Secuencia a producción desde aquí

```text
ADJUDICACIÓN READ-ONLY DE OUTLIERS
→ si todos son esperados/no-acceso: NUEVO SMOKE READ-ONLY ÚNICO
→ si hay defecto real: REPAIR FOCAL CON GATE + READBACK
→ SMOKE ACUMULATIVO PASS
→ VALIDACIÓN HUMANA DE CHECKS BROWSER-ONLY
→ GATE/CUTOVER ESPECÍFICO DE PRODUCCIÓN
```

## P1/P2

Mejoras no bloqueantes de UI, PDFs, Excel y presentación permanecen fuera de este P0 operativo.

## Seguridad

Estado actual: Auth DEV 228 preservado; writes del bloque 0; producción intacta.
