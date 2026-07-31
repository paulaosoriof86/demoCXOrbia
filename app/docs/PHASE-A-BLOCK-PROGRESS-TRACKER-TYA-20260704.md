# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_TECH_REMOTE_PASS__HUMAN_VISUAL_FAIL_SHOPPER_IDENTITY_PROFILE_P0`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN.
- R17N:1,406/1,406;616 visitas;572 controles liquidación;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS. No reimportar/resetear por rutina.
- Firestore protegido shoppers340/340 y visitas616/616 con identidad real; perfiles referenciados194/194.

## 2. HR live / auto-month — PASS remoto
- Sheets API + lectura HR canónica PASS.
- 14 periodos /616 visitas /último2026-07.
- autodiscovery mensual provider activo.
- nueva pestaña válida se detecta sin configuración mensual manual.

## 3. Último one-shot DEV — consumido
- Cloud Run1/1, revisión `cxorbia-live-hr-dev-00008-8mf`.
- Hosting1/1, version `22e81c2b783f697a`.
- Remote technical decision `PASS_C6_LIVE_HR_AUTOMONTH_AND_SHOPPER_DISPLAY_DEV`.

No reutilizar autorización.

## 4. Human visual — FAIL / P0
Capturas confirman:
- Admin source-safe ve 208 nombres, pero perfil carece de username/credencial, contacto y datos adicionales;
- histórico visible por shopper parcial;
- KPI no entrega el nivel de detalle operativo requerido;
- Shopper entra como `Evaluador (sin identidad)`;
- `shopperId=null` bloquea Mi Perfil y Mis Visitas.

Causa raíz Shopper: `app/app.js::_isDevAccess()` no habilita el flujo de identidad en el host alojado de la ruta source-safe; `selectRole('shopper')` queda sin ID y fail-closed.

Causa de perfil: se intentó validar información completa sobre un overlay `display_name_only`. Esa ruta no es la consola protegida final.

## 5. Corrección requerida
- validar runtime protegido Auth/claims/Rules;
- Superadmin recibe perfil real completo según fuentes;
- Shopper solo su propio scope;
- recuperar datos adicionales de la plataforma vigente por export/import;
- username `nombre.apellido` preservado;
- contraseña inicial histórica tipo `Nombre123*`, sin almacenar password vigente en claro;
- histórico desde 616 visitas canónicas por shopperId;
- KPI por facetas/estados canónicos con drill.

## 6. Julio/agosto
No avanzar a materialización agosto hasta cerrar el P0 shopper/perfil. No copiar julio ni repetir histórico.

## 7. Siguiente bloque
`PROTECTED-RUNTIME READ-ONLY VALIDATION → PROFILE FIELD INVENTORY / LEGACY EXPORT RECONCILIATION → DELTA PLAN → AUTH/FIRESTORE GATES SEPARADOS → NUEVO REDEPLOY DEV CON AUTORIZACIÓN → HUMAN VISUAL → FREEZE C6`.

## 8. Claude/Academia
- Claude: corrección focalizada únicamente si el backend protegido entrega campos y la UI no los refleja; preservar fail-closed sin shopperId.
- Academia: login/identidad, credencial inicial vs vigente, Superadmin vs Shopper, perfil consolidado, historial y KPI drill.

## 9. Estado seguro
Después de la visual: provider writes/deploys nuevos0; Firestore/HR/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false.
