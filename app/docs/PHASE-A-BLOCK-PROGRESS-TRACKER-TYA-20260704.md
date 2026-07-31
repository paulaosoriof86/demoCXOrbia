# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_PROFILE_WRITE_PASS__PROTECTED_HOSTING_PASS__LOGIN_REPRO_P0__SESSION_CONTINUITY_FIX_PREPARED__WAITING_HOSTING_AUTH__31_HOLD`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406;616 visitas;572 liquidaciones;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.

## 2. Protected Hosting DEV anterior
Redeploy protegido anterior PASS técnico; autorización consumida.

## 3. P0 visual detectado
La validación humana volvió a mostrar Usuario/Contraseña al seleccionar Administración/Coordinación. Causa raíz: persistencia Auth `SESSION` repetía el gate interactivo dentro del ciclo de QA.

## 4. Corrección preparada
- overlay protected-only para persistencia Firebase Auth `LOCAL`;
- config `persist:'local'` + `reuseAuthenticatedSession:true`;
- carga antes de browser-auth;
- sin credenciales embebidas ni bypass claims/Rules;
- logout explícito sigue cerrando sesión.

No hay redeploy nuevo todavía.

## 5. Validación objetivo
Después de 1x Hosting DEV autorizado: login real una sola vez → refresh sin nuevo prompt → Admin perfil completo/KPI/histórico → Shopper real.

## 6. 31 identity HOLD
No resueltos por llaves estables ni Auth claims. No usar nombre/teléfono/email. Requieren alta/conciliación explícita posterior.

## 7. Julio/agosto
No materializar agosto hasta cerrar/freeze Corte6.

## 8. Claude/Academia
- Claude: no rediseño ni cambio de módulos por este P0; fix backend/core.
- Academia: separar autenticación inicial de continuidad de sesión QA protegida.

## 9. Gate actual
`NUEVA AUTORIZACIÓN 1x HOSTING DEV SESSION CONTINUITY → REMOTE SMOKE → LOGIN REAL 1 VEZ → REFRESH SIN RE-PROMPT → HUMAN VISUAL → 31 HOLD → FREEZE C6 → AGOSTO`.
