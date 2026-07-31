# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_FULL_V2_READONLY_PASS__WRITE_PLAN_PREPARED__WAITING_EXPLICIT_FIRESTORE_AUTHORIZATION__NO_DEPLOY__NO_PRODUCTION`

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
Bundle V2 cifrado recibido y reconciliado automáticamente contra DEV. Gate final `PASS_C6_PROFILE_FULL_V2_READONLY`.

Resultado:
- registros V2:151;
- match exacto `legacyShopperId`:120;
- missing canonical:31 HOLD;
- ambiguos0; badRecord0;
- perfiles exactos con cambios:120;
- campos planificados:329;
- password presente en fuente149;
- perfiles fuente con DPI/dirección/fecha nacimiento27.

Campos a escribir en los120 exactos:
- username113;
- pass118;
- depto2;
- dpi17;
- direccion1;
- fecha_nac2;
- accepted_terms72;
- aprobacionCuenta2;
- registroOrigen2.

Nombre, teléfono/WhatsApp, email, país y ciudad ya coinciden en esos120 y no requieren write.

## 6. Primer intento V2 — causa raíz corregida
El primer read-only falló antes del provider por checksum. `part-007.txt` no coincidía con el chunk cifrado original. Se restauró exactamente el blob esperado; la request seguía no consumida. El retry terminó PASS. No hubo provider writes en el FAIL.

## 7. Write plan preparado — NO autorizado
`backend/config/corte6-profile-full-firestore-write-plan-v2.json`:
- máximo120 Firestore document writes sobre perfiles existentes exactos;
-329 valores de perfil;
-31 missing canonical quedan HOLD, no se crean ni emparejan silenciosamente;
- Auth/password reset0;
- Rules/Hosting/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos0;
- producción=false; merge=false.

El export vigente manda para perfil actual. Las616 visitas y77 certificaciones canónicas siguen siendo autoridad; `certs/histCerts/visitas/activo/rating` legacy no las sustituyen.

## 8. Claude/prototipo
No nueva candidata ni rediseño. La UI ya contempla usuario/contraseña; backend protegido debe entregar valores reales cuando existan. Tocar módulos UI solo si el adapter entrega el dato correctamente y la UI aun no lo refleja.

## 9. Siguiente gate
`AUTORIZACIÓN FIRESTORE EXACTA MÁX120 DOCUMENT WRITES → WRITE IN-MEMORY DESDE BUNDLE CIFRADO → READBACK → REDEPLOY DEV PROTEGIDO AUTORIZADO → HUMAN VISUAL ADMIN+SHOPPER → RESOLVER 31 HOLD → FREEZE C6 → AGOSTO`.
