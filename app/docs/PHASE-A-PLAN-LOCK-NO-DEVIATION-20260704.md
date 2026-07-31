# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_HUMAN_VISUAL_FAIL__P0_SHOPPER_IDENTITY_NULL__ADMIN_PROFILE_INCOMPLETE__NO_NEW_DEPLOY__NO_PRODUCTION`

## 1. Objetivo/arquitectura
TyA/Cinépolis como tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev`=DEV canónico; `tya-plataforma`=Hosting final. No crear Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA/ORIGEN PLATAFORMA → EXISTENCIA/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE/CONCILIACIÓN → WRITE PLAN → DRY-RUN → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN → CUTOVER`.

El prototipo manda. Un PASS técnico sin validación visual no congela un corte.

## 3. Cortes protegidos
- Corte1/2A/3 FROZEN.
- Histórico14 periodos/616 visitas hasta julio.
- R17N1,406/1,406; no repetir.
- Corte5 CX.data PASS.
- Auth91/91, claims5/5 y Rules PASS; no reimportar/resetear por rutina.
- Firestore protegido: shoppers340/340 y visitas616/616 con identidad real; perfiles referenciados194/194.

## 4. HR live y auto-month
- HR se lee en vivo.
- Lectura abierta/read-only es válida; `Restricted` no es requisito técnico de lectura DEV.
- `fresh=1` y metadata provider descubren tabs mensuales válidas.
- Nueva pestaña mensual debe crear/detectar periodo automáticamente.
- Fallback GViz permanece read-only/fail-closed.
- Sheets API + HR canónica reader: PASS.
- último periodo HR actual:2026-07.

## 5. Último redeploy DEV
One-shot `chat-20260731-c6-live-hr-shopper-display-dev-redeploy-01` consumido:
- Cloud Run1/1, revisión `cxorbia-live-hr-dev-00008-8mf`;
- Hosting1/1, version `sites/cxorbia-backend-dev/versions/22e81c2b783f697a`;
- remote technical PASS:14 periodos/616 visitas/auto-month/208 identidades display-only.

No reutilizar autorización.

## 6. Corte6 human visual — FAIL/P0
La validación humana demostró un P0 que impide Phase A Shopper:
- sesión Shopper entra sin shopperId;
- Mi Perfil/Mis Visitas fallan cerrado;
- Admin source-safe muestra nombres pero no perfil operativo completo;
- username/credencial/contacto/campos adicionales faltan;
- histórico por shopper visible incompleto;
- KPI/drill no satisface operación.

Causa Shopper reproducible: `app/app.js::_isDevAccess()` no habilita el flujo de identidad en el host alojado de la ruta source-safe y el click cae a `selectRole('shopper')` sin ID.

No restaurar `sh1`; identidad real debe resolverse por Auth/claims + shopperId estable.

## 7. Regla de datos de shopper
- source-safe público puede enmascarar PII;
- Superadmin/Admin autenticado debe ver los datos necesarios para operar;
- Shopper autenticado solo su propio perfil/scope;
- Cliente no hereda PII shopper.

Perfil consolidado desde backend protegido: nombre, username, estado credencial, WhatsApp/teléfono, correo, ubicación, documento, datos de pago si existen, certificaciones, historial, postulaciones, liquidaciones/pagos y datos agregados por shopper.

## 8. Credenciales
TyA conserva username `nombre.apellido` y contraseña inicial histórica tipo `Nombre123*`.

Firebase Auth no devuelve contraseña vigente. No almacenar password recuperable en JS/repo/Firestore público. Mostrar username + estado de credencial; legacy/inicial solo con evidencia segura. Reset requiere autorización Auth específica.

## 9. Migración desde plataforma vigente
La plataforma actual/legacy puede aportar datos adicionales de `tya_shoppers_extra`, pero solo mediante export/import.

`EXPORT → PARSER POR CONTRATO → MATCH POR ID/EVIDENCIA ESTABLE → REVIEW CONFLICTOS → DELTA → WRITE GATED`.

No conectar base vieja. No dedupe solo por nombre/teléfono. No overwrite silencioso.

## 10. Histórico/KPI
- histórico individual sale de las616 visitas canónicas por shopperId;
- KPI usa facetas/estados canónicos y drill a filas reales;
- estados legacy estrechos no deben subcontar `submitida` u otras etapas canónicas.

## 11. Julio/agosto coexistentes
Julio puede seguir operando, pero no iniciar materialización agosto mientras el P0 Shopper/perfil siga abierto. Agosto platform-origin se conectará por source-of-truth exacto; no copiar julio.

## 12. Gate vivo inmediato
`PROTECTED-RUNTIME READ-ONLY VALIDATION → PROFILE FIELD INVENTORY / LEGACY EXPORT RECONCILIATION → EXACT DELTA PLAN → AUTH/FIRESTORE WRITE GATES SEPARADOS SI APLICAN → NUEVO REDEPLOY DEV SOLO CON AUTORIZACIÓN → HUMAN VISUAL → FREEZE C6`.

## 13. Claude/prototipo
No rediseñar. Cambios frontend solo focalizados y documentados si el backend protegido ya entrega los datos pero la UI no los refleja. Mantener fail-closed sin shopperId.

## 14. Academia
Documentar source-safe vs consola protegida, identidad/claims/shopperId, credencial inicial vs vigente, permisos por rol, perfil consolidado, histórico y KPI drill.

## 15. Estado seguro
Después de la visual: provider writes/deploys nuevos0; Firestore/HR/Auth/Rules/Storage/legacy/payments/Make/Gemini writes0; merge=false; producción=false.
