# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `C6_PROTOTYPE_AUTOENTRY_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`.
- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Hosting site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción futura `tya-plataforma`: no tocada.

## 2. No reabrir
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- R17N1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones.
- Corte5 CX.data: Firestore,project `cinepolis`,14 periodos,616 visitas,currentPeriod `2026-07`,fallback=false PASS.
- Auth import/readback91/91: shopper88 + super1 + coordinador2; Auth17→108; resets/deletes/overwrite0.
- claims5/5 + Rules PASS.

## 3. Visual Corte6
Build1 rechazado: `Acceso seguro` paralelo.

Build2 rechazado: al seleccionar Administración/Coordinación aparecía `Usuario + Contraseña`, además fuera del viewport. El contrato canónico de `app.js` es perfil → `selectRole(...)` → `enter()` automático.

## 4. Corrección publicada
- preview humano restaura auto-entry;
- `CX.BACKEND.enabled=false` en la ruta humana;
- `humanVisualSourceSafe=true`;
- `humanCredentialPrompt=false`;
- HR source-safe read-only preservada;
- baseline `cinepolis`,14 periodos,616 visitas;
- Auth/RBAC/Rules permanecen en gates provider separados;
- mutaciones bloqueadas.

## 5. Ejecución
Gate estático: `29b7f9404a9c2f144145fe24d5cf048f753c1e75` → PASS.

Primer intento autorizado: fallo determinístico antes de deploy por mismatch de contrato entre decisión de preflight y direct-deploy. Se corrigió en `b9f5190babcc339735cda59291417df5aea6988f`; request seguía `hostingDeployExecutions=0`, `consumed=false`.

Reintento con la misma autorización:
`PASS_EXISTING_HOSTING_DEV_PROTOTYPE_AUTO_ENTRY_SOURCE_SAFE_REMOTE_VERIFIED`.

- request `corte6-prototype-autoentry-redeploy-20260730-03` consumido PASS;
- hosting deploy executions1;
- versión `sites/cxorbia-backend-dev/versions/95a1e49e5064c456`;
- release `sites/cxorbia-backend-dev/releases/1785452689852000`;
- entrypoint=true;
- prototypeAutoEntry=true;
- humanCredentialPrompt=false;
- sourceSafeVisual=true;
- periods14;
- visits616;
- projectId=`cinepolis`;
- Firebase Auth validated separately=true;
- preservedLegacyAuthUsers91.

Seguridad: nuevo Firebase0; nuevo Hosting0; Auth writes0; Firestore data writes0; Rules0; Storage0; HR0; legacy0; pagos0; Functions0; Make/Gemini0; merge=false; producción=false.

## 6. Gate vivo actual
`VALIDACIÓN VISUAL HUMANA DEL NUEVO BUILD AUTO-ENTRY/SOURCE-SAFE → SI APRUEBA: FREEZE CORTE6`.

No pedir password, PowerShell, scroll ni volver a probar builds rechazados.

## 7. Agosto
Después de FREEZE C6: `refresh HR → resolver Agosto HN → materializar solo delta agosto → smoke → preprod/cutover`. No rematerializar histórico.

## 8. Claude / Academia
- Claude: no nueva candidata, no `app/modules/*`, preservar auto-entry; provider/Auth no es UI de preview humano.
- Academia: DEV humano perfil→entrada automática; producción mantiene Auth real detrás del contrato operativo y recuperación de acceso.
