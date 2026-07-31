# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_PROFILE_FULL_V2_READONLY_PASS__WRITE_PLAN_READY__WAITING_FIRESTORE_AUTH__NO_DEPLOY`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN.
- R17N1,406/1,406;616 visitas;572 controles liquidación;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS. No reimportar/resetear por rutina.
- HR live/auto-month PASS.

## 2. P0 visual Corte6 — abierto
Visual anterior: Shopper `shopperId=null`, Admin `display_name_only`, histórico/KPI incompletos. Corte6 requiere write/readback + redeploy protegido + nueva validación visual.

## 3. Perfil completo V2 read-only — PASS
`PASS_C6_PROFILE_FULL_V2_READONLY`.

- source records151;
- exact `legacyShopperId`120;
- missing canonical31 HOLD;
- ambiguos0 / badRecord0;
- docs exactos con cambios120;
- campos planificados329.

Campos: username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2. Nombre/WhatsApp/email/país/ciudad ya coinciden en los120.

## 4. Runtime fix preparado — no deploy
Protected no se degrada a source-safe; watcher no sobrescribe CX.data; KPI/histórico usa shopperId y estados canónicos incluido `submitida`. No deploy nuevo autorizado.

## 5. Seguridad/identidad
- perfil export vigente manda para campos actuales;
- password visible solo desde valor real legacy;
- Firebase Auth sigue siendo autoridad de login;
-616 visitas y77 certificaciones canónicas prevalecen;
-31 missing canonical no se crean ni se emparejan por nombre/teléfono/email.

## 6. Primer retry V2
Primer read-only FAIL por checksum antes del provider. Se identificó `part-007` incorrecto, se restauró el blob exacto y se reintentó con request aún no consumida. Retry PASS; provider writes0.

## 7. Write gate preparado — no autorizado
- plan `backend/config/corte6-profile-full-firestore-write-plan-v2.json`;
- request disabled `backend/config/corte6-profile-full-firestore-write-request-v2.json`.

Máximo futuro:120 Firestore document writes /329 valores. Auth password resets0; resto proveedores/deploys0.

## 8. Gate actual
`AUTORIZACIÓN FIRESTORE EXACTA MÁX120 DOC WRITES → WRITE+READBACK → REDEPLOY DEV PROTEGIDO AUTORIZADO → VISUAL ADMIN+SHOPPER → RESOLVER31 HOLD → FREEZE C6 → AGOSTO`.

## 9. Julio/agosto
No materializar agosto hasta cerrar P0 Shopper/perfil y congelar Corte6. No copiar julio ni repetir histórico.

## 10. Claude/Academia
- Claude: preservar diseño; mostrar perfil real incluido username/password cuando backend protegido lo entregue; no inventar valores.
- Academia: stable-ID, transporte cifrado, validación read-only previa a writes, profile source vs histórico canónico y hardening posterior.

## 11. Estado seguro
Read-only PASS; Firestore/Auth/HR/legacy writes0; Auth password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
