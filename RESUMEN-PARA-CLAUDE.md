# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_P0_OPEN__EXPORT_RECOVERED__PROFILE_HANDOFF_READY__USERNAME88_READY__RUNTIME_FIX_PREPARED__NO_WRITE__NO_DEPLOY__NO_PRODUCTION`

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

Syntax/anti-regression PASS previo. No deploy nuevo autorizado.

## 5. Username exacto
Handoff cifrado:
- shopper109;
- stable-ID exact88;
- Auth claim binding88/88;
- fill-missing username88;
- conflictos0;
- 21 sin perfil exacto HOLD.

Plan Firestore existe pero está disabled/unauthorized. No ejecutar sin autorización.

## 6. Password
Verificación source-safe de hash contra patrón inicial `CapitalizedFirstName + 123*`:
- exactos88;
- patrón verificado68;
- no patrón20.

No mostrar `Nombre123*` universalmente. Firebase Auth no devuelve plaintext vigente. Los 20 no patrón no se deben resetear por rutina.

## 7. Export perfil extra — recuperado
File Library volvió a responder y se recuperó el export vigente ya entregado `tya-plataforma-default-rtdb-export (6).json` del 2026-07-30. No pedirlo de nuevo.

El schema real contiene, según cada registro: username/user, WhatsApp, email, país, ciudad, departamento, DPI, dirección, fecha de nacimiento, certs/histCerts, términos, aprobación/origen de cuenta y metadata histórica.

No conectar RTDB legacy.

## 8. Reconciliación v2
`tools/qa/cxorbia-corte6-profile-extra-export-readonly.mjs`:
- match solo ID técnico estable → `legacyShopperId`;
- no nombre/teléfono/email como llave;
- fill-missing, nunca overwrite;
- excluye metadata `_eliminados`;
- password/UID legacy excluidos;
- separa operacional / sensible / evidence-only.

Operacionales candidatos: username, phone, email, country, city, department.

Sensibles HOLD: document/DPI, address, birthDate. No colocarlos en `/shoppers/{id}` mientras las Rules actuales permitan leer ese documento a todos los roles operador.

Evidence-only: certs/histCerts, visitas, activo/estado, términos, aprobación/origen, rating. Las 77 certificaciones y 616 visitas canónicas siguen siendo autoridad.

## 9. Handoff cifrado listo
Se preparó el puente sin PII cruda:
- `tools/local/cxorbia-corte6-profile-extra-handoff.html` procesa OFFLINE y cifra el perfil; excluye password/pass y UID legacy;
- `tools/qa/cxorbia-corte6-profile-extra-handoff-dryrun.mjs` descifra solo en memoria y compara Firestore read-only;
- `.github/workflows/cxorbia-corte6-profile-extra-readonly.yml` se dispara únicamente cuando exista el bundle cifrado;
- `backend/config/corte6-profile-extra-readonly-request.json` espera el bundle y prohíbe todos los writes/deploys.

La frontera pendiente es File Library → bytes ejecutables: File Library permite inspeccionar el export, pero no entrega filesystem path al runner. No transcribir PII ni conectar legacy para sortearlo.

## 10. Claude/prototipo
No nueva candidata ni rediseño. Cambios actuales son backend/tools/integración. Tocar módulo UI solo si protected runtime entrega bien el dato y la UI no lo refleja.

El módulo actual muestra `Contraseña`; no llenar ese campo con un valor inventado. Si se requiere un ajuste de copy/estado de credencial, documentarlo focalizadamente.

## 11. Siguiente bloque
`BUNDLE CIFRADO DEL EXPORT EXISTENTE → READ-ONLY RECONCILIATION AUTOMÁTICA → DELTA OPERATIVO COMBINADO CON USERNAME88 → AUTORIZACIÓN FIRESTORE EXACTA → READBACK → REDEPLOY DEV AUTORIZADO → VISUAL PROTEGIDA → FREEZE C6`.

No avanzar a agosto antes del freeze.
