# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_PROFILE_WRITE_PASS__HUMAN_VISUAL_PARTIAL_FAIL__CUMULATIVE_FIX_PREPARED__WAITING_HOSTING_AUTH__31_HOLD`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406;616 visitas;572 liquidaciones;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.
- Finanzas/pagos canónicos source-safe preservados.

## 2. Human visual no-credential
Acceso PASS: auto-entry Admin + picker Shopper real.

Composición FAIL/P0: Dashboard JUL0, watcher HR deshabilitado, lista Shopper con aliases/fixtures/refs, perfil/histórico incompleto, Beneficios/Finanzas vacíos.

## 3. Causa/fix preparado
- full visual reemplazaba CX.data; ahora será overlay acumulativo;
- HR viva conserva periodo/visitas/auto-mes;
- Firestore agrega perfil/histórico por ID exacto;
- finanzas/pagos canónicos siguen autoridad;
- watcher HR vuelve a estar activo y reaplica overlay;
- aliases solo se suprimen por `legacyShopperId` exacto;
- módulos UI intactos.

No hay nuevo provider deploy todavía.

## 4. Gate pendiente
`AUTORIZACIÓN MÁXIMO1 HOSTING DEV EXISTENTE → PREFLIGHT HR616/AUTO-MONTH + FULL-PROFILE401 → DEPLOY → REMOTE SMOKE → HUMAN VISUAL ACUMULATIVA`.

Cloud Run0; Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0.

## 5. 31 identity HOLD
No resueltos por llaves estables ni Auth claims. No usar nombre/teléfono/email. Requieren decisión/conciliación explícita posterior.

## 6. Julio/agosto
No materializar agosto hasta cerrar/freeze Corte6. HR live/auto-month continúa siendo requisito acumulativo.

## 7. Claude/Academia
- Claude: no cambio de módulos; fix backend/adapters DEV.
- Academia: composición acumulativa HR viva + perfil protegido + finanzas canónicas.

## 8. Gate actual
`1x HOSTING DEV ACUMULATIVO → HUMAN VISUAL ÚNICA HR+SHOPPER+BENEFICIOS+FINANZAS → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.
