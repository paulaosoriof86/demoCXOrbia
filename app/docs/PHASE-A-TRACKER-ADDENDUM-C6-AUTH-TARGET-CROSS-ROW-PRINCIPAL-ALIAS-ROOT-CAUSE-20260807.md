# PHASE A TRACKER — C6 AUTH TARGET CROSS-ROW PRINCIPAL ALIAS ROOT CAUSE

Fecha: 2026-08-07

## Cerrado

- SKIP13 13/13.
- Multi-Auth tenant adjudication.
- Lineage target `ac93...`: PASS exacto con bases `profile + visit`.
- Causa raíz del bloqueo repetitivo: `CROSS_ROW_EXISTING_AUTH_PRINCIPAL_ALIAS_IN_OLD_PREWRITE`.

## Estado Auth

El plan anterior de 340 filas se conserva como evidencia pero deja de ser ejecutable hasta root fix source-only. AuthExecuted=false.

## Próximo bloque

`C6 AUTH PLAN PRINCIPAL-UNIQUENESS ROOT FIX + PREWRITE REBUILD source-only`:

1. invariant global de principal existente único por profile row;
2. re-evaluación target-specific de `ac93...`;
3. si no existe principal target-specific y targetLogin es único, materializar CREATE_AUTH;
4. preservar peer como su propio UPDATE_AUTH;
5. recalcular 340 rows/counts/digest/población esperada;
6. corregir semántica de salt vacío legítimo manteniendo rollback exacto;
7. self-tests y simulación PREWRITE sin provider.

## Estado seguro

Cero writes, deploy, merge y producción. No repetir provider/password snapshot bajo el plan viejo.
