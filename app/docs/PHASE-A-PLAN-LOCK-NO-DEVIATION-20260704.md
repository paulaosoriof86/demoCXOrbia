# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_P0_OPEN__PROTECTED_PROFILE_AUTH_HISTORY_READONLY_PASS__88_USERNAME_DELTA_READY__RUNTIME_FIX_PREPARED__NO_WRITE__NO_DEPLOY__NO_PRODUCTION`

## 1. Objetivo/arquitectura
TyA/Cinépolis como tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev`=DEV canónico; `tya-plataforma`=Hosting final. No crear Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA/ORIGEN PLATAFORMA → EXISTENCIA/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE/CONCILIACIÓN → WRITE PLAN → DRY-RUN → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN → CUTOVER`.

El prototipo manda. Un PASS técnico sin validación visual no congela un corte.

## 3. Cortes protegidos
- Corte1/2A/3 FROZEN.
- R17N1,406/1,406;616 visitas +572 liquidaciones +77 certificaciones; no repetir.
- Corte5 CX.data 14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5 y Rules PASS; no reimportar/resetear por rutina.
- HR live/auto-month PASS.

## 4. P0 Corte6
La visual anterior demostró:
- Shopper sin shopperId en la ruta source-safe;
- Admin sobre `display_name_only`, no perfil protegido;
- histórico/KPI incompletos.

No congelar Corte6 hasta nueva visual protegida PASS.

## 5. Protected runtime — provider read-only PASS
Firestore shoppers340:
- phone123;
- email39;
- username0;
- documento0;
- banco/pago0.

Auth108:
- claims Shopper con shopperId91;
- claim→perfil existente91/91;
- missing0.

Histórico:
- visitas616/616 con shopperId;
- 194 shopperId distintos y perfiles194/194;
- submitida545, cuestionario61, agendada4, realizada3, fuera_rango3.

Gate `PASS_C6_PROTECTED_PROFILE_AUTH_HISTORY_READONLY`.

## 6. Fix runtime preparado, no desplegado
- protected lane ya no se fuerza a source-safe;
- watcher source-safe no sobrescribe CX.data protegido;
- aliases perfil consumen solo campos reales;
- `visitsForShopper/shopperStats` protegidos usan el histórico por shopperId y estados/facetas canónicos;
- incluye `submitida`;
- nunca sintetiza password.

Syntax + anti-regression PASS.

## 7. Username exacto
Desde el bundle cifrado usado para Auth:
- records shopper109;
- match exacto stable-ID88;
- binding exacto Auth claim→perfil88/88;
- `fill-missing username`88;
- conflictos0;
- 21 sin perfil exacto HOLD.

No hubo write. Materializar username88 requiere autorización Firestore específica.

## 8. Password
Firebase Auth no permite recuperar contraseña vigente. El handoff conserva hashes, no plaintext.

No almacenar password en JS/repo/Firestore. Contraseña inicial solo si se comprueba de forma segura; reset requiere autorización Auth específica.

## 9. Perfil extra de plataforma vigente
Teléfono/email ya materializados deben aparecer por protected runtime.

Campos adicionales ausentes hoy —documento, banco/pago y cualquier otro dato realmente aportado por shopper— se recuperan únicamente desde el export ya entregado, por export/import seguro y match estable. Nunca conectar base vieja ni deduplicar por nombre/teléfono.

## 10. Julio/agosto
Julio puede continuar. Agosto no se materializa hasta cerrar este P0 y congelar Corte6. Después se conecta source-of-truth platform-origin exacto y se ejecuta delta-only autorizado.

## 11. Gate vivo inmediato
`PREPARAR WRITE PLAN USERNAME88 SIN EJECUTAR + RECUPERAR/RECONCILIAR EXPORT PERFIL EXTRA → AUTORIZACIONES FIRESTORE/AUTH SOLO SI APLICAN → NUEVO REDEPLOY DEV AUTORIZADO → HUMAN VISUAL PROTEGIDA → FREEZE C6`.

## 12. Claude/prototipo
No rediseñar ni generar nueva candidata. Los fixes actuales son adapters/core de integración. Tocar módulo UI solo si el protected runtime entrega el dato correcto y la UI aún no lo refleja.

## 13. Academia
Documentar source-safe vs protected, Auth/claims/shopperId, perfil consolidado, credential status vs password vigente, export/import seguro e histórico/KPI canónico.

## 14. Estado seguro
Provider reads sí; Firestore/Auth/HR/legacy writes0; password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
