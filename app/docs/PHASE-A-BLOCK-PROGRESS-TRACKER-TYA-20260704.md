# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_PROFILE_WRITE_PASS__HUMAN_VISUAL_AUTH_DESVIO__NO_CREDENTIAL_FIX_PREPARED__WAITING_CLOUDRUN_HOSTING_AUTH__31_HOLD`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406;616 visitas;572 liquidaciones;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.

## 2. Hallazgo P0 metodológico
Human visual fue desviada al protected browser-auth aunque Paula no dispone de credenciales técnicas. Ese carril vuelve a quedar como gate provider, no como acceso humano.

## 3. Fix preparado
- human visual conserva auto-entry del prototipo;
- full profile se servirá read-only desde el Cloud Run DEV existente con token visual temporal opaco;
- sin token=401;
- frontend full visual carga datos en memoria sin Firebase browser credentials;
- picker DEV shopper real ya existente queda habilitado;
- watcher HR no sobrescribe ese carril;
- módulos UI intactos.

No hay provider deploy nuevo todavía.

## 4. Gate pendiente
`AUTORIZACIÓN MÁXIMO1 CLOUD RUN DEV +1 HOSTING DEV → SMOKE → ENLACE TEMPORAL SIN CREDENCIALES → ADMIN+SHOPPER HUMAN VISUAL`.

Provider writes permitidos en ese gate:0 Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos.

## 5. 31 identity HOLD
No resueltos por llaves estables ni Auth claims. No usar nombre/teléfono/email. Requieren alta/conciliación explícita posterior.

## 6. Julio/agosto
No materializar agosto hasta cerrar/freeze Corte6.

## 7. Claude/Academia
- Claude: no rediseño ni cambio de módulos; fix backend/core/adapters DEV.
- Academia: separar human QA auto-entry de Auth provider y documentar token visual temporal server-side.

## 8. Gate actual
`AUTORIZACIÓN 1x CLOUD RUN +1x HOSTING DEV NO-CREDENTIAL VISUAL → REMOTE SMOKE → HUMAN VISUAL → 31 HOLD → FREEZE C6 → AGOSTO`.
