# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-13 20:31 -06:00
**Estado:** `SHOPPER_P0_GATE_CONSUMED_HOLD_INCONCLUSIVE__SOURCE_CHAIN_REPAIR_PASS__CURRENT_PRIVATE_CREDENTIAL_HANDOFF_PENDING`

Cerrado: contrato exacto reusable; entry humano sin snapshot pre-auth; HR condicionada a Auth; linked-owner gap PROVEN y repaired; regresión `profile → alias → protected visit → hrRowId → HR` PASS; source run `31763545130` SUCCESS; provider gate consumido 1/1; run disabled `31763754714` confirmó cero segundo provider read.

No usar como verdad: `62 unique / 137 unmapped / 10 ambiguous-review`. Esa salida v1 quedó invalidada como veredicto del universo por defectos demostrados del harness/cadena. No declarar 147 shoppers rotos.

Evidencia real útil del mismo read: 231 Auth users, 209 principals Shopper, 340 perfiles, HR 15/660/212, y evidencia independiente 616 matches exactos / 208 relaciones HR→protegido / 194 shoppers protegidos con histórico.

## Pendiente inmediato

1. `SOURCE_ONLY_CURRENT_SHOPPER_CREDENTIAL_HANDOFF_RECONCILIATION`: localizar/reconciliar un handoff privado Shopper vigente usando material ya existente; cero provider read, cero password reset/cambio, cero PII en repo.
2. Confirmar que el selector deja de depender del bundle histórico de 109 credenciales.
3. Después solicitar nueva autorización one-shot para auditor v2 global + E2E Firebase Shopper real.
4. En el mismo E2E validar perfil, país/alcance, histórico, visitas, reservas, Academia, Certificación y beneficios.
5. Solo tras PASS real solicitar deploy DEV separado y luego aceptación/regresión.

No repetir provider read consumido, no desplegar, no reimportar HR, no cambiar claims/perfiles/passwords, no deduplicar por nombre/correo y no pedir retest sobre el DEV actual.

Estado seguro: provider read executions 1; writes 0; password changes/resets 0; deploy 0; Make/Gemini/pagos 0; merge false; producción false.

Evidencia: `app/docs/evidence/p0-exact-identity-readonly-gate-hold-and-source-repair-20260813.json`.
