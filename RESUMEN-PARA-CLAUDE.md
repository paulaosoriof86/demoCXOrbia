# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_FULL_V2_READONLY_PASS__WRITE_GATE_READY__WAITING_EXPLICIT_FIRESTORE_AUTHORIZATION__NO_DEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- HR live/auto-month PASS.
- PR#7 draft/open/no merge; producción intacta.

## 2. P0 visual
La visual anterior probó Shopper `shopperId=null`, Admin sobre `display_name_only` e histórico/KPI incompletos. Corte6 sigue abierto hasta write/readback + redeploy protegido + visual humana.

## 3. Protected runtime
Firestore shoppers340; Auth shopper claims con shopperId91 y perfil existente91/91; histórico616/616 con shopperId; perfiles referenciados194/194.

Runtime fix preparado sin deploy: protected lane no se degrada a source-safe, watcher no sobrescribe CX.data protegido y `visitsForShopper/shopperStats` usa histórico exacto incluyendo `submitida`.

## 4. Perfil completo autorizado como contrato operativo
La consola autenticada debe mostrar el perfil completo disponible hoy en la plataforma anterior, incluidos datos personales, username y password legado real. No sintetizar password. Firebase Auth sigue siendo autoridad de autenticación.

No exponer PII/password en repo, logs ni evidencia source-safe.

## 5. V2 read-only — PASS
Bundle V2 cifrado reconciliado contra DEV. Gate `PASS_C6_PROFILE_FULL_V2_READONLY`.

Resultado:151 registros;120 match exactos `legacyShopperId`;31 missing canonical HOLD; ambiguos0; badRecord0;120 perfiles exactos con cambios;329 valores planificados.

Campos a escribir: username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2. Nombre, teléfono/WhatsApp, email, país y ciudad ya coinciden y no requieren write.

## 6. Primer intento V2 — causa raíz corregida
El primer read-only falló antes del provider por checksum de `part-007.txt`. Se restauró exactamente el blob original; la request seguía no consumida. Retry PASS; provider writes0 en el FAIL.

## 7. Write gate completo preparado — NO autorizado
Listos en rama viva:
- `backend/config/corte6-profile-full-firestore-write-plan-v2.json`;
- `backend/config/corte6-profile-full-firestore-write-request-v2.json` disabled;
- `tools/release/cxorbia-corte6-profile-full-firestore-write-v2.mjs`;
- `.github/workflows/cxorbia-corte6-profile-full-firestore-write-v2.yml`.

El workflow solo puede avanzar si request+plan contienen autorización exacta. Antes de escribir revalida destino, bundle SHA,151/120/31,329 valores y desglose por campo. Máximo120 Firestore document writes sobre perfiles existentes exactos, seguido de readback de todos los documentos/campos. Cualquier drift previo = FAIL sin mutation.

Los31 missing canonical permanecen HOLD. Auth/password reset0; Rules/Hosting/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos0; producción=false; merge=false.

## 8. Precedencia
El export vigente manda para perfil actual. Las616 visitas y77 certificaciones canónicas siguen siendo autoridad; `certs/histCerts/visitas/activo/rating` legacy no las sustituyen.

## 9. Claude/prototipo
No nueva candidata ni rediseño. La UI ya contempla usuario/contraseña; backend protegido debe entregar valores reales cuando existan. Tocar módulos UI solo si el adapter entrega el dato correctamente y la UI aun no lo refleja.

## 10. Siguiente gate
`AUTORIZACIÓN FIRESTORE EXACTA MÁX120 DOCUMENT WRITES → WRITE IN-MEMORY DESDE BUNDLE CIFRADO → READBACK → REDEPLOY DEV PROTEGIDO AUTORIZADO → HUMAN VISUAL ADMIN+SHOPPER → RESOLVER31 HOLD → FREEZE C6 → AGOSTO`.
