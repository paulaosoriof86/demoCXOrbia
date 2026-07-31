# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_P0_OPEN__FULL_PROFILE_SCOPE_AUTHORIZED__V2_HANDOFF_READY__NO_PROVIDER_WRITE__NO_DEPLOY`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN.
- R17N1,406/1,406;616 visitas;572 controles liquidación;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS. No reimportar/resetear por rutina.
- HR live/auto-month PASS.

## 2. P0 visual Corte6 — abierto
Visual anterior: Shopper `shopperId=null`, Admin `display_name_only`, histórico/KPI incompletos. Corte6 no se congela todavía.

## 3. Protected runtime read-only — PASS
Firestore shoppers340; phone123; email39. Auth108; shopper claims con shopperId91; perfiles91/91. Histórico616/616 con shopperId;194 perfiles194/194.

## 4. Runtime fix preparado — no deploy
Protected no se degrada a source-safe; watcher no sobrescribe CX.data; KPI/histórico usa shopperId y estados canónicos. No deploy nuevo autorizado.

## 5. Username/Auth
Username:109 records;88 exactos stable-ID + claim; plan88; conflictos0;21 HOLD. Auth91/91 permanece cerrado.

## 6. Perfil completo — alcance autorizado
La parte operativa autenticada debe ver el perfil completo del shopper como está hoy en la plataforma anterior, incluidos datos personales, username y password legado. Endurecimiento posterior no bloquea Corte6.

## 7. Handoff V1 — no usar para write
V1 recibido:282 filas,151 registros cifrados,130 IDs duplicados; password excluido. Fuente final de write: NO.

## 8. V2 listo
- fusiona duplicados por ID estable;
- prioriza child RTDB cuyo key coincide con ID y luego mayor completitud;
- conserva conflictos cifrados;
- incluye PII/username/password;
- runner descifra solo en memoria;
- identity match únicamente `legacyShopperId exact`;
- evidencia solo conteos;
- export vigente manda para campos de perfil;
-616 visitas y77 certificaciones canónicas no se sobrescriben con metadata legacy.

## 9. Gate actual
`BUNDLE V2 COMPLETO → READ-ONLY V2 → WRITE PLAN EXACTO PERFIL COMPLETO + USERNAME → AUTORIZACIÓN FIRESTORE → READBACK → REDEPLOY DEV AUTORIZADO → VISUAL → FREEZE C6`.

## 10. Julio/agosto
No materializar agosto hasta cerrar P0 Shopper/perfil y congelar Corte6. No copiar julio ni repetir histórico.

## 11. Claude/Academia
- Claude: preservar diseño; mostrar datos reales de perfil incluido password cuando backend protegido los entregue; no inventar valores.
- Academia: stable-ID merge, transporte cifrado, perfil operativo completo, secreto legado vs Auth, evidencia sin valores y hardening posterior.

## 12. Estado seguro
Provider writes0; Firestore/Auth/HR/legacy writes0; password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
