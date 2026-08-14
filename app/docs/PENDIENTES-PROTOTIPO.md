# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-13 20:26 -06:00
**Estado:** `SHOPPER_P0_GATE_CONSUMED_HOLD_INCONCLUSIVE__SOURCE_CHAIN_REPAIR_PASS__CURRENT_PRIVATE_CREDENTIAL_HANDOFF_PENDING`

## Cerrado / demostrado

- Contrato único exacto reusable con las 11 llaves de Auth: PASS source.
- Entry humano sin snapshot operacional pre-auth: PASS source.
- HR humana condicionada a Auth: PASS source.
- Brecha exacta de linked owner reproducida source-only: PROVEN.
- Canonicalización reusable de owner protegido antes de composición: APPLIED.
- Regresión `profile → alias → protected visit → hrRowId → HR`: `PASS_P0_GLOBAL_COMPOSITION_SOURCE`.
- Run source `31763545130`: SUCCESS, hard fails 0.
- Único provider read autorizado: consumido 1/1; STOP_RETRY activo; no segundo intento.

## Resultado que NO debe usarse como verdad

La salida v1 `62 unique / 137 unmapped / 10 ambiguous-review` quedó **invalidada como veredicto del universo real** por defectos demostrados del harness/cadena. No existe evidencia suficiente para declarar 147 shoppers rotos.

La misma ejecución sí produjo evidencia independiente de 616 matches exactos de visitas, 208 relaciones HR→shopper protegido y 194 shoppers protegidos con histórico. Esto tampoco demuestra por sí solo que los 209 principals Auth estén todos reconciliados: hará falta una futura validación v2, con nueva autorización.

## Pendiente P0 inmediato

1. **Source-only:** localizar/reconciliar el handoff privado vigente de credenciales Shopper usando material ya existente; no proveedor, no reset/cambio de contraseña, no PII en repo.
2. Confirmar que el selector ya no depende únicamente del bundle histórico de 109 credenciales.
3. Solo después solicitar una nueva autorización one-shot para ejecutar auditor v2 con composición global exacta + un Shopper Firebase real.
4. En ese E2E real verificar perfil, país/alcance, histórico, Visitas Disponibles, Reservas, Mis Visitas, Academia, Certificación y beneficios según alcance real.
5. Solo tras PASS real solicitar gate separado de deploy DEV.
6. Después del deploy, hacer aceptación humana/regresión dirigida sobre el build nuevo.

## No hacer

No repetir el provider read consumido. No usar `137+10` como backlog real. No desplegar todavía. No crear candidata/rama/PR/workflow nuevo. No modificar contraseñas/claims/perfiles. No reimportar HR. No deduplicar por nombre/correo. No pedir retest humano sobre el DEV actual, que aún contiene el build anterior rechazado.

## Estado seguro

Provider read executions 1; provider writes 0; Auth/Firestore/HR/Rules/Storage writes 0; password changes/resets 0; deploy 0; Make/Gemini/pagos 0; merge false; producción false.

Evidencia: `app/docs/evidence/p0-exact-identity-readonly-gate-hold-and-source-repair-20260813.json`.
