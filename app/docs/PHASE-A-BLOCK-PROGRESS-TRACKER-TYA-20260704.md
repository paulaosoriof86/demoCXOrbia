# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_LIVE_HR_AUTOMONTH_SHOPPER_DISPLAY_DEV_PASS__PENDING_HUMAN_VISUAL`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN.
- R17N:1,406/1,406;616 visitas;572 controles liquidación;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS. No reimportar.
- Firestore protegido shoppers340/340 y visitas616/616 con identidad real, placeholders0.

## 2. HR live / auto-month — PASS remoto
- Google Sheets API y lectura HR canónica PASS.
- runtime refresca metadata mensual automáticamente;
- 14 periodos / 616 visitas / último `2026-07`;
- `tabRegistryAutoDiscovery=true`;
- `tabRegistryMode=live_provider_metadata_auto_refresh`;
- nueva pestaña mensual válida entra sin configuración mensual por chat.

## 3. Corte 6 redeploy DEV — cerrado técnicamente
Autorización one-shot consumida:
- Cloud Run DEV `1/1`, revisión `cxorbia-live-hr-dev-00008-8mf`;
- Hosting DEV `1/1`, version `22e81c2b783f697a`;
- decisión `PASS_C6_LIVE_HR_AUTOMONTH_AND_SHOPPER_DISPLAY_DEV`.

No reutilizar esta autorización.

## 4. Shopper DEV
- auto-entry preservado;
- `humanCredentialPrompt=false`;
- 208 identidades operativas display-name-only disponibles;
- sin teléfono/correo/DPI/banco/credenciales;
- `app/modules/*` sin cambios.

Pendiente: validación humana de nombres en Administración y selector/módulos del rol Shopper.

## 5. Julio/agosto
Julio sigue operable mientras agosto puede existir platform-origin antes de HR. HR aún no tiene tabs agosto.

Pendiente operacional: conectar source-of-truth exacto de agosto; luego delta-only Firestore con autorización nueva. No copiar julio.

## 6. Siguiente bloque
`VALIDACIÓN HUMANA SHOPPER → FREEZE CORTE 6 SI PASS → FUENTE EXACTA AGOSTO → DELTA-ONLY AUTORIZADO → READBACK/SMOKE → PREPROD/CUTOVER`.

## 7. Claude/Academia
- Claude: preservar UX, no nueva candidata, no `app/modules/*`; integración actual es adapters/runtime/entrypoint DEV.
- Academia: auto-month, ADC provider, open-read vs open-write, identidad operativa mínima vs PII sensible, one-shot deploy.

## 8. Estado seguro
Firestore/HR/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; proyectos/Hosting nuevos0; merge=false; producción=false.
