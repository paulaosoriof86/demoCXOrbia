# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_PROFILE_FULL_FIRESTORE_WRITE_READBACK_PASS__31_HOLD__WAITING_PROTECTED_DEV_REDEPLOY_AUTH`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN.
- R17N1,406/1,406;616 visitas;572 controles liquidación;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS. No reimportar/resetear por rutina.
- HR live/auto-month PASS.

## 2. Corte6 perfil completo — Firestore PASS
AuthorizationId `chat-20260731-c6-profile-full-firestore-write-01` consumida.

Ejecutado:120 Firestore doc writes exactos;118 field-change +2 marker-only;329 valores; readback120 docs/329 campos; mismatches0.

Auth/password reset0; deploys0; producción=false.

## 3. 31 identity HOLD
No resueltos por legacyShopperId exact, technical-key exacto/único ni Auth determinístico + claim.0 vínculos reproducibles; no usar nombre/teléfono/email. Alta/conciliación explícita posterior.

## 4. P0 visual Corte6 — pendiente
El write está cerrado, pero la visual previa falló. Runtime protegido está preparado sin deploy. Falta redeploy DEV separado y validación humana Admin+Shopper.

## 5. Fuente/histórico
Export vigente manda para perfil actual. Firebase Auth sigue siendo autoridad de login.616 visitas y77 certificaciones canónicas prevalecen.

## 6. Gate actual
`AUTORIZACIÓN SEPARADA REDEPLOY DEV PROTEGIDO → VISUAL ADMIN+SHOPPER → ALTA/CONCILIACIÓN EXPLÍCITA31 HOLD → FREEZE C6 → AGOSTO`.

## 7. Julio/agosto
No materializar agosto hasta cerrar Corte6. Después del freeze: refresh HR → resolver agosto HN si corresponde → materializar solo delta agosto.

## 8. Claude/Academia
- Claude: preservar diseño; backend protegido entrega perfil real; no inventar valores.
- Academia: one-shot authorization, exact stable-ID write, readback, separación perfil/histórico/Auth y HOLD explícito.

## 9. Estado seguro
Firestore authorization consumida PASS. Auth/HR/legacy writes0; Auth password changes0; Rules/Hosting/Cloud Run/Storage/Make/Gemini/pagos0; merge=false; producción=false.
