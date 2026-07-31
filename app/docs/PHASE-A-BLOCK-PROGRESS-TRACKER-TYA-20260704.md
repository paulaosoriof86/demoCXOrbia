# Phase A block progress tracker TyA

**Fecha original:** 2026-07-04  
**Última actualización:** 2026-07-31  
**Estado:** `C3_FROZEN__C5_1406_PASS__C6_PROFILE_FULL_READONLY_PASS__31_HOLD_PROVEN__WRITE_GATE_READY__WAITING_FIRESTORE_AUTH__NO_DEPLOY`

## 1. Cerrado/protegido
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406;616 visitas;572 controles liquidación;77 certificaciones. No repetir.
- Corte5 CX.data14 periodos/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS. No reimportar/resetear por rutina.
- HR live/auto-month PASS.

## 2. P0 visual Corte6 — abierto
Visual anterior: Shopper `shopperId=null`, Admin `display_name_only`, histórico/KPI incompletos. Corte6 requiere write/readback + redeploy protegido + nueva validación visual.

## 3. Perfil completo read-only — PASS
151 source records;120 exactos `legacyShopperId`;31 sin canonical;0 ambiguos/invalid;329 valores planificados. En los120 exactos:118 docs con cambios de campos +2 marker-only.

Campos: username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2. Nombre/WhatsApp/email/país/ciudad ya coinciden.

## 4. 31 HOLD investigados antes de write
- Auth bridge determinístico + validated custom claim:0 resueltos;2 sin username,10 username duplicado,19 sin Auth user.
- V3 technical-key exacto/único (`docId/sourceKey/shopperId/legacyId/externalId/externalShopperId/sourceId`) + Auth:0 resueltos;0 candidatos técnicos.

No existe vínculo canónico reproducible. No dedupe por nombre/teléfono/email ni creación silenciosa.

## 5. Runtime fix preparado — no deploy
Protected no se degrada a source-safe; watcher no sobrescribe CX.data; KPI/histórico usa shopperId y estados canónicos incluido `submitida`. No deploy nuevo autorizado.

## 6. Primer retry V2
Primer read-only FAIL por checksum antes del provider. `part-007` fue restaurado al blob exacto; retry PASS con request aún no consumida. Provider writes0.

## 7. Write gate listo — no autorizado
Plan/request rebasados sobre V3; executor y workflow one-shot listos. Antes del provider revalidan SHA,151/120/31,118+2 y329 valores. Máximo futuro120 Firestore document writes + readback total. Auth password resets0; resto providers/deploys0.

## 8. Fuente/precedencia
Export vigente manda para perfil actual y password legacy real; Firebase Auth sigue siendo autoridad de login. Las616 visitas y77 certificaciones canónicas prevalecen.

## 9. Gate actual
`AUTORIZACIÓN FIRESTORE EXACTA MÁX120 DOC WRITES → WRITE+READBACK → REDEPLOY DEV PROTEGIDO AUTORIZADO → VISUAL ADMIN+SHOPPER → ALTA/CONCILIACIÓN EXPLÍCITA31 HOLD → FREEZE C6 → AGOSTO`.

## 10. Julio/agosto
No materializar agosto hasta cerrar P0 Shopper/perfil y congelar Corte6. No copiar julio ni repetir histórico.

## 11. Claude/Academia
- Claude: preservar diseño; mostrar perfil real incluido username/password cuando backend protegido lo entregue; no inventar valores.
- Academia: stable-ID, bridges técnicos/Auth reproducibles, transporte cifrado, read-only antes de write, perfil vs histórico canónico.

## 12. Estado seguro
Read-only PASS; Firestore/Auth/HR/legacy writes0; Auth password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
