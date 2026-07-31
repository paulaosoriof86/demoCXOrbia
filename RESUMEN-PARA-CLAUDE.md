# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_P0_OPEN__PROTECTED_READONLY_PASS__USERNAME88_READY__PASSWORD68_PATTERN_VERIFIED_20_NONPATTERN__RUNTIME_FIX_PREPARED__NO_WRITE__NO_DEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS. No reimportar/resetear por rutina.
- PR#7 draft/open/no merge; producción intacta.

## 2. P0 visual
La visual anterior probó Shopper `shopperId=null`, Admin sobre `display_name_only` e histórico/KPI incompletos. Corte6 sigue abierto.

## 3. Protected read-only PASS
Firestore shoppers340: phone123, email39, username0, documento0, banco/pago0.

Auth108: claims Shopper con shopperId91; perfil existente91/91; missing0.

Histórico: 616/616 visitas con shopperId; 194 perfiles referenciados194/194; submitida545, cuestionario61, agendada4, realizada3, fuera_rango3.

## 4. Runtime fix preparado — no deploy
- protected lane no se degrada a source-safe;
- watcher source-safe no sobrescribe CX.data protegido;
- aliases de perfil toman solo datos reales;
- `visitsForShopper/shopperStats` protegidos usan histórico exacto y contemplan `submitida`;
- no sintetizar password.

Syntax/anti-regression PASS.

## 5. Username exacto
Handoff cifrado:
- shopper109;
- stable-ID exact88;
- Auth claim binding88/88;
- fill-missing username88;
- conflictos0;
- 21 sin perfil exacto HOLD.

Plan Firestore existe pero está disabled/unauthorized. No ejecutar sin autorización.

## 6. Password — dato nuevo
Verificación source-safe de hash contra patrón inicial `CapitalizedFirstName + 123*`:
- exactos88;
- patrón verificado68;
- no patrón20.

Claude no debe mostrar `Nombre123*` universalmente. Para 68 puede mostrarse estado `patrón inicial verificado`; los 20 deben preservar credencial histórica o pasar por reset Auth autorizado. Firebase Auth no devuelve plaintext vigente.

## 7. Perfil extra
La plataforma vigente guarda `tya_shoppers_extra` con datos como WhatsApp, email, país, ciudad, DPI y credenciales históricas. Recuperar valores reales solo desde el export ya entregado, mediante export/import seguro y match estable; nunca conectar RTDB legacy.

Teléfono/email ya existentes en Firestore deben aparecer en protected runtime.

## 8. Claude/prototipo
No nueva candidata ni rediseño. Cambios actuales son de integración `core/adapters`. Tocar módulo UI solo si protected runtime entrega bien el dato y la UI no lo refleja.

## 9. Siguiente bloque
`RECUPERAR/RECONCILIAR EXPORT PERFIL EXTRA → DELTA COMBINADO CON USERNAME88 → AUTORIZACIÓN FIRESTORE EXACTA → READBACK → REDEPLOY DEV AUTORIZADO → VISUAL PROTEGIDA → FREEZE C6`.

No avanzar a agosto antes del freeze.
