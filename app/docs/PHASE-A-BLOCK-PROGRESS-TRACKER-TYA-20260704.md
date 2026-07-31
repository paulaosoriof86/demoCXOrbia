# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_P0_OPEN__PROTECTED_PROFILE_AUTH_HISTORY_READONLY_PASS__USERNAME88_READY__NO_WRITE__NO_DEPLOY`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN.
- R17N 1,406/1,406;616 visitas;572 controles liquidación;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS. No reimportar/resetear por rutina.
- HR live/auto-month PASS.

## 2. P0 visual Corte6 — abierto
La visual anterior demostró:
- Shopper `shopperId=null` en la ruta source-safe;
- Admin veía `display_name_only`, no el perfil protegido;
- histórico/KPI incompletos.

Corte6 no se congela todavía.

## 3. Protected runtime read-only — PASS
Firestore:
- shoppers340;
- phone123;
- email39;
- username0;
- documento0;
- banco/pago0.

Auth:
- users108;
- shopper claims con shopperId91;
- perfiles existentes91/91.

Histórico:
- visitas616/616 con shopperId;
- shopperIds distintos194;
- perfiles194/194;
- submitida545, cuestionario61, agendada4, realizada3, fuera_rango3.

Gate GitHub: `PASS_C6_PROTECTED_PROFILE_AUTH_HISTORY_READONLY`.

## 4. Corrección runtime preparada — no desplegada
- carril protected ya no se degrada a source-safe;
- watcher HR source-safe no sobrescribe CX.data protegido;
- aliases de perfil leen solo datos reales existentes;
- KPI/histórico protegido usa estados/facetas canónicos e incluye `submitida`;
- password no se sintetiza.

Syntax/anti-regression PASS.

## 5. Username exacto — delta read-only listo
Desde el bundle cifrado ya usado por Auth:
- registros shopper109;
- match estable exacto88;
- binding Auth claim→perfil88/88;
- fill-missing username exacto88;
- conflictos0;
- 21 sin perfil exacto: HOLD.

No hubo writes. Materialización requiere autorización Firestore específica.

## 6. Perfil extra de plataforma vigente
Teléfono/email ya presentes en Firestore se recuperan al usar protected runtime. Documento/banco/otros datos adicionales deben reconciliarse desde el export ya entregado por export/import seguro; nunca conexión runtime a legacy.

El acceso a ese export desde File Library está temporalmente bloqueado por error del servicio de recuperación; no se pide reenvío mientras podamos recuperar el insumo existente.

## 7. Julio/agosto
No materializar agosto hasta cerrar P0 Shopper/perfil y congelar Corte6. No copiar julio ni repetir histórico.

## 8. Siguiente bloque
`WRITE PLAN USERNAME88 SIN EJECUTAR + RECUPERAR/RECONCILIAR EXPORT PERFIL EXTRA → AUTORIZACIONES EXACTAS SI APLICAN → REDEPLOY DEV → VISUAL PROTEGIDA → FREEZE C6`.

## 9. Claude/Academia
- Claude: preservar diseño; cambios actuales están en adapters/core de integración, no en módulos UI.
- Academia: source-safe vs protected, claims→shopperId, perfil consolidado, password vigente no recuperable, KPI por facetas canónicas.

## 10. Estado seguro
Provider reads sí; Firestore/Auth/HR/legacy writes0; password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
