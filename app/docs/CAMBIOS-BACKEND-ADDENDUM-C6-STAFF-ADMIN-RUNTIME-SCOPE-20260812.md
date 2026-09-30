# CAMBIOS BACKEND — ADDENDUM C6 STAFF/ADMIN RUNTIME SCOPE

**Fecha:** 2026-08-12 15:05 -06:00  
**Estado:** `SOURCE_CORRECTION_APPLIED__RUNTIME_PROOF_PENDING`

## Bloque

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

## Causa raíz reproducible

El action autorizado corresponde exclusivamente a Staff/admin, pero el carril vigente tenía dos dependencias superpuestas:

1. el selector privado resolvía Staff + Shopper y el Shopper detenía el carril con `HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194`;
2. aun corrigiendo ese selector, el runtime wrapper y las validaciones del workflow exigían Shopper/Client, por lo que el siguiente bloqueo era determinístico.

## Archivos modificados

1. `.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml`
   - deriva el action exacto desde `authorizationSource`;
   - propaga `CXORBIA_C6_ACTION`;
   - para el action exacto ejecuta únicamente el selector Staff;
   - no ejecuta selector Client ni exige Shopper/Client;
   - valida un bundle privado que contiene Staff y rechaza scope adicional;
   - valida el report Staff/admin-only;
   - conserva el carril acumulativo Staff+Shopper+Client para cualquier otro action.

2. `tools/qa/cxorbia-phase-a-existing-users-e2e-credentials-dynamic.mjs`
   - agrega un branch exclusivo para `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`;
   - reutiliza el selector histórico hasta resolver Staff y corta antes de HR/visitas/Shopper;
   - produce únicamente credencial privada Staff;
   - mantiene el selector dinámico Staff+Shopper sin cambio funcional fuera del action.

3. `tools/qa/tya-c6-dev-root-runtime-wrapper.mjs`
   - agrega scope exacto Staff/admin;
   - conserva gate de paridad de raíz;
   - transforma temporalmente el smoke humano para ejecutar únicamente Staff/admin sin modificar el smoke genérico fuente;
   - exige autenticación, rol Staff permitido, tres reloads y nueva pestaña estable;
   - omite Shopper, Client, domain, finance y reservations únicamente en este action;
   - preserva el runtime acumulativo original fuera del action.

4. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
   - registra causa raíz corregida, 88% certificado, 12% restante y Hosting DEV `0/1` consumido.

5. `app/docs/RESUMEN-PARA-CLAUDE.md`
   - registra que no hubo cambio frontend y que no debe generarse nueva candidata.

6. `app/docs/PENDIENTES-PROTOTIPO.md`
   - retira como pendiente el diagnóstico/corrección del selector y mantiene únicamente el proof remoto como siguiente frontera.

## Seguridad y gates

Esta corrección no ejecutó Hosting DEV ni provider writes. Contadores de este bloque:

- Hosting DEV: `0/1` consumido;
- Firestore writes: `0`;
- Auth writes: `0`;
- HR writes: `0`;
- Rules writes/deploy: `0`;
- Storage writes: `0`;
- Make calls: `0`;
- Gemini calls: `0`;
- pagos: `0`;
- segundo Exact Write: `0`;
- merge: `false`;
- producción: `false`.

## Impacto Phase A

Se elimina la causa raíz del bucle de credenciales/orquestación para el proof Staff, pero el porcentaje certificado se mantiene en **88% / 12% pendiente** hasta ejecutar el único Hosting DEV autorizado y obtener PASS remoto.

## Clasificación

- **Reusable CXOrbia:** persona-scope exacto por action y preservación fail-closed del comportamiento genérico.
- **Exclusivo cliente:** proof TyA Staff/admin en `cxorbia-backend-dev`.
- **Claude/prototipo:** sin cambio frontend.
- **Academia:** sin cambio de contenido hasta certificar runtime.
- **Sin impacto Claude:** QA/orquestación/selector/runtime interno.

## Siguiente acción exacta

Rearmar el request one-shot contra el HEAD corregido y ejecutar el mismo único Hosting DEV autorizado para `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.
