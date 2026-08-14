# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-13 19:20 -06:00
**Estado:** `SHOPPER_P0_BACKEND_SOURCE_REPAIR_PASS__NO_UI_REDESIGN__REAL_AUTH_E2E_PENDING`

El P0 Shopper no se resolvió parcheando UI. La causa forense fue una incompatibilidad backend entre el universo técnico usado para activar Firebase Auth y el que el browser utilizaba después para cruzar perfil protegido con HR, además de un snapshot viejo que se cargaba pre-auth en el entrypoint humano.

## Backend ya corregido source-only

Se creó `app/adapters/cxorbia-exact-identity-contract-v1.js` como contrato reusable. Comparte con Auth exactamente 11 llaves técnicas: `shopperId`, `legacyShopperId`, `legacyId`, `externalShopperId`, `externalId`, `sourceId`, `sourceKey`, `hrRowId`, `personId`, `profileId`, `shopperDocId`.

El compositor `tya-cumulative-read-model-v2.js` y el portal `tya-canonical-shopper-portal-v2.js` consumen ese contrato. No se permite adjudicación por nombre, correo, teléfono o similitud; ambigüedad exacta queda fail-closed/revisión.

El entrypoint humano `index-backend-dev.html` ya no carga el snapshot empaquetado `data/tya-hr-source-safe-periods.js` ni el mutador `core/tya-phase-a-source-safe-preview.js`. Esos archivos se preservan para laboratorio/preview explícito. La ruta humana declara `preAuthOperationalData:'none'` y el watcher HR espera Auth antes de iniciar lectura operacional.

Gate source autoritativo: run `31761257145`, job `94647914674`, SUCCESS; `PASS_P0_EXACT_IDENTITY_CONTRACT_SOURCE`, `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE`, smoke local hard fails 0. Evidencia: `app/docs/evidence/p0-exact-identity-contract-source-repair-pass-31761257145.json`.

## Para Claude

- **No crear candidata ni rediseñar módulos.**
- No hardcodear TyA/Cinépolis como solución general.
- No volver a introducir snapshot/demo/source-safe como estado operacional previo a Auth en el entrypoint humano.
- No unir identidades por nombre/correo/teléfono/username.
- Preservar las rutas y UX del prototipo; la integración backend debe entregar identidad canónica exacta.
- Academia/Certificación no requiere rediseño por este P0; solo revalidación funcional una vez que la identidad real quede probada.
- El build DEV visible actual todavía es el deploy anterior cuya aceptación Shopper fue RECHAZADA. **El source repair PASS no está desplegado todavía.**

## Pendiente backend real

El E2E `tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs` está source-ready pero no ha autenticado contra Firebase en este bloque. Falta gate read-only para revalidar el universo real Auth/claims/perfiles/HR y ejecutar un Shopper real → perfil → HR → histórico/Academia/Certificación. Después, y solo si PASS, gate separado de deploy DEV.

Producción, merge, dominio oficial y writes permanecen bloqueados/cero.
