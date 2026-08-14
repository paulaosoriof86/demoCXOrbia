# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-13 19:20 -06:00
**Estado:** `SHOPPER_P0_SOURCE_REPAIR_PASS__REAL_IDENTITY_UNIVERSE_AND_AUTH_E2E_PENDING`

## Cerrado en source-only

- Contrato único exacto reusable creado y alineado con las 11 llaves de activación Auth.
- Compositor HR y portal Shopper consumen el mismo contrato.
- Ambigüedades exactas pasan a review/fail-closed; nombre/correo/teléfono/similitud no resuelven identidad.
- Entry humano canónico ya no carga el snapshot empaquetado de julio ni el mutador source-safe pre-auth.
- Watcher HR humano espera Auth y se reactiva tras `backend-auth-ready`.
- E2E Firebase real preparado sin `CX.app.selectRole`.
- Gate source autoritativo run `31761257145`: SUCCESS, hard fails 0.

Evidencia: `app/docs/evidence/p0-exact-identity-contract-source-repair-pass-31761257145.json`.

## Pendiente P0 inmediato

1. Revalidar read-only el universo actual de principals Shopper efectivos, claims, perfiles protegidos y HR con `cxorbia-exact-identity-contract-v1`.
2. Cuantificar sin PII: principal con match exacto único, ambiguo y sin crosswalk/revisión; no asumir que los 228 Auth users ya están todos reconciliados.
3. Ejecutar un Shopper Firebase real por el formulario visible → Auth canónico → perfil Firestore → autoridad HR → identidad exacta → histórico.
4. En la misma sesión, verificar país/alcance, Visitas Disponibles, Reservas & Asignación, Mis Visitas, Academia, Certificación y beneficios según alcance real.
5. Solo si lo anterior da PASS, solicitar un gate separado para desplegar este source repair a DEV.
6. Después del deploy, ejecutar aceptación humana/regresión dirigida sobre el build nuevo; no reutilizar el build anterior rechazado.

## No hacer

No desplegar todavía. No crear candidata/rama/PR/workflow nuevos. No reimportar HR. No modificar Auth/claims/perfiles/passwords bajo el gate read-only. No deduplicar por nombre/correo. No pedir a Paula que pruebe otra vez el DEV actual como si contuviera este repair. No confundir `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE` con un E2E real ejecutado.

## Estado seguro

Producción, dominio oficial y merge intactos. En este bloque: provider reads 0, writes 0, deploy 0, Make/Gemini/pagos 0.
