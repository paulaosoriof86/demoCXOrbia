# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-13 14:16 -06:00
**Estado:** `P0_SHOPPER_EXACT_IDENTITY_SOURCE_FIX_APPLIED__DEV_DEPLOY_PENDING__CUTOVER_BLOCKED`

## P0 Shopper — reparación source-only aplicada

La aceptación humana de Paula demostró que un Shopper real autenticaba y veía el menú, pero `Mi Perfil` mostraba `La identidad de esta sesión no está vinculada al read model canónico.` El laboratorio, al mismo tiempo, sí leía HR viva completa. Este P0 continúa siendo el bloqueador del go-live real.

Se aisló un defecto reproducible en `app/adapters/tya-canonical-shopper-portal-v2.js`: el portal resolvía la sesión únicamente con `identityMap[rawShopperId] || rawShopperId` y podía renderizar el bloqueo antes de que terminara la reconciliación Auth → Firestore protegido → HR viva. Ese comportamiento no cubría todas las llaves técnicas exactas ya admitidas por los contratos de identidad y convertía una reconciliación todavía pendiente en un falso bloqueo visual.

Commit de reparación: `d435d33fbf548b8021ad5604acc4b2686f75d6b5`.

### Cambio focal

- El resolver Shopper ahora usa exclusivamente relaciones técnicas exactas: `id`, `shopperId`, `legacyShopperId`, `legacyId`, `sourceId`, `sourceKey`, `externalShopperId`, `canonicalLegacyIds`, `legacyLiveShopperIds`, `sourceShopperIds`, `hrShopperIds`, `externalShopperIds`, `identityAliases`, `aliases`, `exactAliases` y aliases técnicos de crosswalk/identity/profile.
- Se soporta lookup directo, `identityMap` forward y relación exacta inversa cuando es única.
- Si existe más de una coincidencia exacta, se bloquea como ambigua; nunca se une por nombre, correo o coincidencia visual.
- Si la autoridad HR aún no terminó de aplicar, `Mi Perfil` muestra estado de validación y fuerza la reconciliación read-only; al recibir `cx:protected-auth-hr-authority-ready`, vuelve a renderizar con `CX.data` ya compuesto.
- El alias resuelto se conserva solo en memoria dentro de `CX.data.__identityMap`; no existe write a proveedor.
- Se eliminó la exposición visual de contraseña/credencial cruda en esta superficie y se muestra `Protegida`.

### Gate de regresión source-only

Se amplió `tools/qa/tya-phase-a-visual-smoke.mjs` en commit `9ca59feb68583ec1de3ccf590e6b9ea6c0f2fd5b` con una prueba browser-only que exige:

1. ID canónico directo → PASS.
2. HR/live ID → canonical por identityMap → PASS.
3. alias técnico exacto (`sourceKey`) → PASS.
4. dos perfiles con el mismo alias exacto → BLOCKED por ambigüedad.
5. nombres iguales sin llave técnica → NO RESUELVE.

El gate no usa proveedores, no importa datos y no escribe base.

## Diagnóstico/provider anterior preservado

El único provider-read P0 autorizado fue run `31735473752`; falló sin persistir la causa y se considera consumido. No se repitió. La recuperación offline del Admin B sí produjo internamente `PASS_P0_ADMIN_B_VISIBLE_LOGIN_RECOVERED_OFFLINE` con `providerReads=0`, pero su artifact no persistió por el fallo instrumental `tee_target_directory_missing`.

El request offline heredado sigue pendiente de neutralización documental: el intento de actualizarlo fue bloqueado por la herramienta. No se afirma que haya quedado neutralizado en HEAD actual y no se volverá a tocar como parte del fix funcional sin necesidad.

## Seguridad

Desde el hallazgo P0: cero Auth/Firestore/HR/Rules/Storage writes, cero Make/Gemini/pagos, cero merge, cero producción y cero cutover real. El fix actual es source-only y todavía NO está desplegado en Hosting DEV.

## Siguiente bloque exacto

Cerrar el nuevo smoke source-only. Si PASS, desplegar exclusivamente los commits del fix P0 a `cxorbia-backend-dev` bajo autorización específica de Paula, repetir inmediatamente la misma validación humana Shopper y solo después continuar Admin/Operaciones y E2E.

## Clasificación

- **Reusable CXOrbia:** resolución de identidad humana exacta, fail-closed por ambigüedad y espera explícita de autoridad antes de renderizar histórico.
- **Exclusivo cliente:** Shopper TyA/Cinépolis, HR e histórico.
- **Claude/prototipo:** no rediseñar; la reparación vive en adapter y preserva módulos.
- **Academia:** ruta Shopper se revalida después del deploy DEV.
- **Sin impacto Claude:** gate source-only y seguridad.
