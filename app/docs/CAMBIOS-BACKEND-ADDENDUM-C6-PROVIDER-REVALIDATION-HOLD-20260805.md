# CAMBIOS BACKEND — Addendum C6 Provider Revalidation HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Reusable CXOrbia · Exclusivo cliente TyA · Sin impacto Claude UI

## Archivos tocados

- `.github/workflows/cxorbia-c6-shopper-deterministic-suffix-readonly.yml`: restaurado carril provider read-only y congelado después del único run para impedir reejecución accidental.
- `backend/config/corte6-shopper-deterministic-suffix-readonly-request.json`: autorización one-shot materializada y luego consumida con HOLD.
- `app/docs/evidence/CORTE6-SHOPPER-DETERMINISTIC-SUFFIX-PROVIDER-REVALIDATION-HOLD-LATEST.json`: evidencia agregada source-safe.
- `app/docs/SOURCE-LOCK-C6-DETERMINISTIC-SUFFIX-PROVIDER-REVALIDATION-HOLD-20260805.md`: source lock del resultado.
- documentación acumulativa del bloque: índice, checkpoint, resumen Claude, pendientes, Academia, tracker y PR #7.

## Resultado técnico

- paridad de crosswalk: `101 mapped / 8 unmapped`, PASS;
- plan generado: `340` filas, una operación primaria por perfil;
- HOLD residual: 12 apellidos source-safe sin resolver + 1 empate multi-Auth;
- clasificación recalculada: `65 grupos / 142 identidades activas`;
- sufijos: 89 de longitud 4, ninguno de 6/8, cero colisiones de sufijo o target;
- plan no ejecutable: `readyForAuthRepair=false`.

## Seguridad

Provider reads: `1`. Provider writes y todos los writes operativos: `0`. Deploy, merge y producción: `0/false`.

## Pendiente exacto

Clasificación source-only de los 13 HOLD y reconciliación técnica de `65/142` contra `64/141`, sin nuevas lecturas provider.
