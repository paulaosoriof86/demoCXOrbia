# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_P0_OPEN__FULL_PROFILE_SCOPE_AUTHORIZED__V2_HANDOFF_READY__WAITING_V2_ENCRYPTED_BUNDLE__NO_PROVIDER_WRITE__NO_DEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- PR#7 draft/open/no merge; producción intacta.

## 2. P0 visual
La visual anterior probó Shopper `shopperId=null`, Admin sobre `display_name_only` e histórico/KPI incompletos. Corte6 sigue abierto.

## 3. Protected read-only PASS
Firestore shoppers340; phone123; email39. Auth shopper claims con shopperId91 y perfil existente91/91. Histórico616/616 con shopperId; perfiles referenciados194/194.

## 4. Runtime fix preparado — no deploy
Protected lane no se degrada a source-safe; watcher no sobrescribe CX.data protegido; `visitsForShopper/shopperStats` usa histórico exacto e incluye `submitida`. No deploy nuevo autorizado.

## 5. Username/Auth
Handoff cifrado previo: shopper109; stable-ID exact88; Auth claim binding88/88; username plan88; conflictos0;21 HOLD. Auth91/91 permanece cerrado.

## 6. Alcance de perfil actualizado por Paula
El perfil operativo autenticado debe mostrar la información completa disponible hoy en la plataforma anterior, incluyendo datos personales, username y password legado visible. El hardening puede hacerse después y no bloquea este corte.

No exponer valores personales/credenciales en repo, logs o evidencia. El transporte sigue cifrado y el provider write continúa sujeto a gate exacto.

## 7. Export vigente
File Library recuperó `tya-plataforma-default-rtdb-export (6).json` del 2026-07-30. No pedirlo otra vez y nunca conectar la RTDB legacy.

## 8. V1 recibido — no usar para write
El bundle V1 recibido está cifrado, pero el resumen source-safe reportó 282 filas,151 registros cifrados y130 IDs estables duplicados; además V1 excluía pass/password. No materializar desde ese bundle porque dejaría el perfil incompleto y podría conservar una variante antigua.

## 9. V2 listo
- `tools/local/cxorbia-corte6-profile-full-handoff-v2.html`: procesa el mismo export offline, fusiona duplicados por ID estable y cifra perfil completo incluidos PII/username/password.
- `tools/qa/cxorbia-corte6-profile-full-handoff-dryrun-v2.mjs`: descifra solo en memoria y compara Firestore por `legacyShopperId exact`.
- `.github/workflows/cxorbia-corte6-profile-full-readonly-v2.yml`: provider read-only; persiste solo evidencia sin valores.
- `backend/config/corte6-profile-full-readonly-v2-request.json`: espera el bundle V2; provider writes/deploys0.

El export vigente es source-of-truth para campos de perfil. Las616 visitas y77 certificaciones canónicas no se sustituyen con contadores/arrays legacy.

## 10. Password
Puede migrarse el password legado real del export para mostrarlo en el perfil protegido. Firebase Auth sigue siendo la autoridad de autenticación. No inferir ni sintetizar password; no poner valores en código/docs/logs.

## 11. Claude/prototipo
No nueva candidata ni rediseño. La UI actual ya contempla usuario/contraseña en la ficha Shopper; el backend debe entregar el valor real cuando exista. Tocar módulos UI solo si el adapter protegido entrega correctamente el dato y aun así no se refleja.

## 12. Siguiente bloque
`GENERAR BUNDLE V2 COMPLETO DEL MISMO EXPORT → READ-ONLY V2 AUTOMÁTICO → WRITE PLAN EXACTO PERFIL COMPLETO + USERNAME → AUTORIZACIÓN FIRESTORE → READBACK → REDEPLOY DEV AUTORIZADO → VISUAL PROTEGIDA → FREEZE C6`.

No avanzar a agosto antes del freeze.
