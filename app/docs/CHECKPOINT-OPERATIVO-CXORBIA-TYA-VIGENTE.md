# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_LIVE_HR_AUTOMONTH_AND_SHOPPER_DISPLAY_DEV_PASS__PENDING_HUMAN_VISUAL__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Hosting `cxorbia-backend-dev` target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. Baseline protegida — no reabrir
- Corte3 FROZEN.
- R17N 1,406/1,406; 616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 CX.data: cinepolis,14 periodos,616 visitas,currentPeriod2026-07,Firestore/fallback=false PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar.
- Firestore protegido: shoppers340/340 y visitas616/616 con nombre real; placeholders0; perfiles referenciados194/194.

## 3. Regla operacional definitiva
- HR se lee en vivo.
- HR abierta/read-only es válida; no exige `Restricted` para lectura DEV.
- Una pestaña mensual válida nueva se detecta automáticamente y genera/incorpora periodo sin configuración por chat.
- Julio puede seguir ejecutándose mientras agosto/mes siguiente ya tiene visitas platform-origin.
- Plataforma-origin puede anteceder HR; al aparecer HR se reconcilia por IDs estables + `assignmentSource`/`assignmentSyncStatus`; nunca por nombre.

## 4. Corte 6 — redeploy DEV PASS
Autorización `chat-20260731-c6-live-hr-shopper-display-dev-redeploy-01`: **consumida**.

Exactamente:
- Cloud Run DEV redeploy: `1`;
- Hosting DEV redeploy: `1`.

Cloud Run:
- revisión `cxorbia-live-hr-dev-00008-8mf`.

Hosting:
- release `sites/cxorbia-backend-dev/releases/1785467713768000`;
- version `sites/cxorbia-backend-dev/versions/22e81c2b783f697a`.

Decisión remota: `PASS_C6_LIVE_HR_AUTOMONTH_AND_SHOPPER_DISPLAY_DEV`.

## 5. HR live / auto-month — PASS remoto
Smoke:
- 14 periodos;
- 616 visitas;
- último HR `2026-07`;
- `tabRegistryAutoDiscovery=true`;
- `tabRegistryMode=live_provider_metadata_auto_refresh`.

La metadata mensual se refresca desde Google Sheets en cada lectura fresca. En Cloud Run se usa ADC con el runtime service account; no se incrusta llave privada.

## 6. Shopper visible para validación humana
El preview aprobado mantiene auto-entry y `humanCredentialPrompt=false`.

La ruta DEV muestra únicamente identidad operativa mínima procedente de HR viva:
- nombre operativo;
- shopperId estable;
- país y métricas source-safe.

Remote smoke: `operationalDisplayIdentityCount=208`.

Siguen excluidos teléfono/WhatsApp, correo, DPI/ID, banco/cuentas, credenciales, observaciones privadas y workbook crudo. El endpoint source-safe normal sigue enmascarado.

Esto permite validar lista de shoppers y flujo Shopper sin volver a introducir el P0 de credenciales.

## 7. Julio/agosto
HR aún no tiene tabs agosto. Eso no bloquea la arquitectura: agosto puede existir platform-origin y luego conciliarse cuando HR aparezca.

Pendiente real: recuperar/conectar el source-of-truth exacto de las visitas agosto disponibles antes de cualquier Firestore delta. No copiar julio ni inventar IDs/ubicaciones/estado.

## 8. Gate inmediato
`HUMAN VISUAL ADMIN: NOMBRES SHOPPER + SHOPPER ROLE PICKER/MÓDULOS`.

Si PASS: `FREEZE CORTE 6 → FUENTE EXACTA AGOSTO PLATFORM-ORIGIN → DELTA-ONLY → AUTORIZACIÓN FIRESTORE ESPECÍFICA → READBACK/SMOKE → PREPROD/CUTOVER`.

La autorización de redeploy ya está consumida y no puede reutilizarse.

## 9. Estado seguro
Firestore/HR/Auth/Rules/Storage/Make/Gemini/pagos writes0; proyectos/Hosting nuevos0; merge=false; producción=false. Histórico/Auth91 preservados.
