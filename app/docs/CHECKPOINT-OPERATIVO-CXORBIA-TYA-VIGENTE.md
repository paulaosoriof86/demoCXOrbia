# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_HUMAN_VISUAL_FAIL__P0_SHOPPER_IDENTITY_NULL__ADMIN_PROFILE_INCOMPLETE__NO_NEW_DEPLOY__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Cloud Run `cxorbia-live-hr-dev`; Hosting `cxorbia-backend-dev` target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. Baseline protegida — no reabrir
- Corte3 FROZEN.
- R17N 1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 CX.data: cinepolis,14 periodos,616 visitas,currentPeriod2026-07,Firestore/fallback=false PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- Firestore protegido: shoppers340/340, nombres reales340/340; visitas616/616 con shopperId/nombre real; perfiles referenciados194/194.

## 3. Último redeploy DEV — PASS técnico
Autorización `chat-20260731-c6-live-hr-shopper-display-dev-redeploy-01`: consumida.

- Cloud Run redeploy1; revisión `cxorbia-live-hr-dev-00008-8mf`.
- Hosting redeploy1; version `sites/cxorbia-backend-dev/versions/22e81c2b783f697a`; release `sites/cxorbia-backend-dev/releases/1785467713768000`.
- Remote:14 periodos,616 visitas,auto-month PASS,208 identidades display-only.

No reutilizar autorización.

## 4. Human visual — FAIL
Las capturas de Paula prueban:

### Admin
- nombres reales operativos visibles;
- 208 shoppers display-only;
- `Usuario` y `Contraseña` vacíos;
- teléfono/correo y otros campos faltantes;
- perfiles aparecen incompletos;
- histórico individual visible incompleto;
- KPI/drill no satisface el detalle operativo requerido.

### Shopper
- sesión entra como `Evaluador (sin identidad)`;
- `shopperId=null`;
- Mi Perfil: identidad no verificable;
- Mis Visitas: fail-closed por ausencia de shopperId.

Resultado: **P0_PROVEN** y Corte6 NO FROZEN.

## 5. Causa raíz Shopper
En `app/app.js`, el botón Shopper usa `pickShopperDev()` solo si `_isDevAccess()` es true. La ruta alojada `cxorbia-backend-dev.web.app` no satisface la allowlist/flags actuales del human preview; el flujo cae a `selectRole('shopper')` sin ID y, correctamente, no inventa `sh1` fuera de demo.

La corrección no es restaurar fallback ficticio: debe resolver identidad real por Auth/claims + shopperId estable.

## 6. Causa raíz perfil Admin
La ruta visual actual es HR source-safe y fue desplegada con scope `display_name_only`. No puede ser la consola final de Superadmin para PII/perfil completo.

La vista operativa final debe usar runtime protegido Firestore/Auth/Rules. Superadmin ve los datos reales autorizados; Shopper solo su propio scope; Cliente no ve PII de shoppers.

## 7. Perfil requerido
Consolidar, si la fuente los contiene: nombre, username, estado de credencial, WhatsApp/teléfono, correo, ubicación, edad/sexo, documento, datos de pago, estado/certificación, datos agregados por shopper, postulaciones, histórico completo, liquidaciones/pagos.

La plataforma vigente tiene export de `tya_shoppers_extra`; migrar solo mediante export/import, nunca conectar base vieja. Conflictos a review; no match solo por nombre/teléfono.

## 8. Credenciales
Regla TyA: username `nombre.apellido`; contraseña inicial histórica tipo `Nombre123*`.

Firebase Auth no permite recuperar la contraseña actual. Mostrar username + estado de credencial; contraseña legacy/inicial solo con evidencia segura. Reset al patrón requiere autorización Auth separada. Nunca contraseña en claro en repo/JS público.

## 9. Histórico/KPI
Histórico = 616 visitas canónicas enlazadas por shopperId. KPI debe usar estados/facetas canónicas y drill real, no filtros legacy estrechos.

## 10. Siguiente bloque exacto
`PROTECTED-RUNTIME READ-ONLY VALIDATION → PROFILE FIELD INVENTORY / LEGACY EXPORT RECONCILIATION → DELTA PLAN EXACTO → AUTH/FIRESTORE GATES SI APLICAN → NUEVO REDEPLOY DEV SOLO CON AUTORIZACIÓN → HUMAN VISUAL → FREEZE C6`.

No iniciar agosto antes de cerrar este P0.

## 11. Documentación
Causa raíz y alcance: `CAMBIOS-BACKEND-ADDENDUM-C6-VISUAL-FAIL-SHOPPER-IDENTITY-PROFILE-20260731.md`.

Root `RESUMEN-PARA-CLAUDE.md` y `PENDIENTES-PROTOTIPO.md` sincronizados.

## 12. Estado seguro
Desde esta visual: provider writes/deploys nuevos0; Firestore/HR/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false. Histórico/Auth91 preservados.
