# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `C6_P0_PROTOTYPE_AUTOENTRY_FIX_STATIC_PASS__PENDING_SINGLE_DEV_REDEPLOY_AUTH__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`.
- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Hosting site `cxorbia-backend-dev`,target `cxorbia-dev`.
- Producción futura `tya-plataforma`: no tocada.

## 2. No reabrir
- Corte3 `CXORBIA-TYA-CORTE3-V182-20260729` FROZEN.
- R17N 1,406/1,406; 616 visitas +572 controles liquidación +77 certificaciones.
- Corte5 CX.data: Firestore,project `cinepolis`,14 periodos,616 visitas,currentPeriod `2026-07`,fallback=false PASS.
- Auth import/readback91/91: shopper88 + super1 + coordinador2; Auth17→108; resets/deletes/overwrite0.
- claims5/5 + Rules PASS.

## 3. Estado de la visual Corte6
### Build 1 — rechazado
Mostraba `Acceso seguro` como gate paralelo.

### Build 2 — rechazado
Eliminó el gate paralelo, pero seguía interceptando el clic de perfil y añadía `Usuario + Contraseña` dentro de la tarjeta. La captura de Paula confirma además que el formulario queda parcialmente fuera del viewport.

El contrato original del prototipo sigue intacto en `app.js`: clic de rol → `selectRole(...)` → `enter()`. Por tanto el credential step era una alteración backend, no un requisito del producto.

## 4. Corrección vigente en rama
- Ruta humana DEV vuelve a auto-entry del prototipo.
- `CX.BACKEND.enabled=false` únicamente para esta ruta humana; así `backend-browser-auth.js` no intercepta el selector.
- `humanVisualSourceSafe=true` y `humanCredentialPrompt=false`.
- HR source-safe explícita/read-only se preserva en `CX.data`.
- Baseline de gate: proyecto `cinepolis`,14 periodos,616 visitas.
- Diagnóstico visual rotula source-safe/Auth validado por gate separado.
- Auth/RBAC/Rules provider permanece técnicamente validado y no se debilita.
- Todas las mutaciones siguen bloqueadas.

## 5. Gate estático del fix
`29b7f9404a9c2f144145fe24d5cf048f753c1e75` → `success · PREPARED_C6_PROTOTYPE_AUTO_ENTRY_NO_EXECUTE`.

No hubo service account, Hosting deploy ni provider writes. La autorización anterior continúa consumida.

## 6. Gate vivo actual
El Hosting DEV público aún sirve el build 2 rechazado. No pedir a Paula que lo vuelva a probar ni que use credenciales.

`AUTORIZACIÓN FRESCA DE 1 REDEPLOY FOCAL DEL MISMO HOSTING DEV → PRECHECK → DEPLOY1 → REMOTE SMOKE AUTO-ENTRY/SOURCE-SAFE → VISUAL PAULA → FREEZE CORTE6`.

## 7. Agosto
Después de FREEZE C6: `refresh HR → resolver Agosto HN → materializar solo delta agosto → smoke → preprod/cutover`. No rematerializar histórico.

## 8. Claude / Academia
- Claude: no nueva candidata, no `app/modules/*`, preservar auto-entry; provider/Auth no es UI de prueba humana.
- Academia: DEV humano perfil→entrada automática; producción mantiene Auth real detrás del contrato operativo y recuperación de acceso.

## 9. Estado seguro
Desde este P0: Auth writes0; Firestore data writes0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/Functions/Make/Gemini0; merge=false; producción=false.
