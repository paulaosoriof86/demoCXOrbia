# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_PROFILE_WRITE_PASS__PROTECTED_SESSION_CONTINUITY_HOSTING_PASS__WAITING_HUMAN_VISUAL_REFRESH_NO_REPROMPT__31_HOLD`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406;616 visitas;572 liquidaciones;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.

## 2. Login repetitivo — root fix + Hosting PASS
La causa raíz fue persistencia Auth `SESSION` dentro del protected runtime/browser-auth. Se aplicó persistencia Firebase Auth `LOCAL` protected-only, sin credenciales embebidas ni bypass claims/Rules y con logout explícito real.

Authorization `chat-20260731-corte6-protected-session-continuity-redeploy-02` consumida PASS.

-1 Hosting DEV redeploy exacto;
- decisión `PASS_EXISTING_HOSTING_DEV_PROTECTED_SESSION_CONTINUITY_REMOTE_VERIFIED`;
- version `1e8c37163e7451be`;
- release `1785515981786000`;
- continuity asset/persistence LOCAL/protected runtime/Auth bridge/Firestore adapter/profile bridge/history KPI remote PASS;
- provider writes/deploys adicionales0; producción=false; merge=false.

## 3. Validación objetivo
Ahora corresponde: login real una sola vez → refresh sin nuevo prompt → Admin perfil completo/KPI/histórico → Shopper real.

## 4. 31 identity HOLD
No resueltos por llaves estables ni Auth claims. No usar nombre/teléfono/email. Requieren alta/conciliación explícita posterior.

## 5. Julio/agosto
No materializar agosto hasta cerrar/freeze Corte6.

## 6. Claude/Academia
- Claude: no rediseño ni cambio de módulos por este P0; fix backend/core.
- Academia: separar autenticación inicial de continuidad de sesión QA protegida.

## 7. Gate actual
`1 LOGIN REAL → REFRESH SIN RE-PROMPT → HUMAN VISUAL ADMIN+SHOPPER → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.
