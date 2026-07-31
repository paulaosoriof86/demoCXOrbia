# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_PROFILE_FULL_V2_READONLY_PASS__WRITE_PLAN_PREPARED__WAITING_EXPLICIT_FIRESTORE_AUTHORIZATION__NO_DEPLOY__NO_PRODUCTION`

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
- Firestore protegido: shoppers340; visitas616/616 enlazadas por shopperId; perfiles referenciados194/194.

## 4. HR live y auto-month
HR se lee en vivo; autodiscovery mensual y fallback read-only permanecen PASS. Último periodo HR actual:2026-07. Nuevos meses nacen automáticamente al aparecer tabs mensuales válidas.

## 5. Corte6 human visual — P0 abierto
Visual anterior: Shopper sin shopperId en ruta source-safe y Admin sin perfil protegido completo. No restaurar `sh1`; identidad real se resuelve por Auth/claims + shopperId estable.

## 6. Protected runtime preparado
Protected lane no se degrada a source-safe; watcher no sobrescribe CX.data; histórico/KPI usa shopperId y ciclo canónico incluyendo `submitida`. Sin redeploy nuevo autorizado.

## 7. Perfil completo V2 — READ-ONLY PASS
El bundle V2 cifrado del export vigente se validó y comparó contra DEV con identidad `legacyShopperId exact`.

Resultado:
-151 registros fuente;
-120 exactos;
-31 missing canonical HOLD;
-0 ambiguos;0 badRecord;
-120 documentos existentes requieren cambios;
-329 valores de perfil planificados.

Campos a escribir sobre los120 exactos: username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2. Nombre, WhatsApp/teléfono, email, país y ciudad ya coinciden.

## 8. Transporte V2 y causa raíz
Primer intento read-only FAIL por checksum antes del provider: `part-007.txt` no era el chunk cifrado exacto. Se restauró el blob correcto y el retry terminó `PASS_C6_PROFILE_FULL_V2_READONLY`. La request seguía no consumida y no hubo provider writes durante el FAIL.

## 9. Fuente, password e histórico
- export vigente = source-of-truth para campos de perfil actual;
- password visible solo desde valor real legacy;
- Firebase Auth = autoridad de autenticación;
- PII/password nunca en repo/logs/evidencia source-safe;
-616 visitas y77 certificaciones canónicas prevalecen;
- no sobrescribir modelos canónicos con `certs/histCerts/visitas/activo/rating` legacy.

## 10. Identidad pendiente31
Los31 registros sin canonical exacto quedan HOLD. No crear ni deduplicar por nombre/teléfono/email. Deben resolverse con una identidad estable antes de declarar migración legacy completa.

## 11. Write plan preparado — NO autorizado
`backend/config/corte6-profile-full-firestore-write-plan-v2.json` + request disabled.

Máximo futuro:120 Firestore document writes /329 valores, únicamente sobre perfiles existentes exactos. Auth/password reset0; Rules/Hosting/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos0; producción=false; merge=false.

## 12. Gate vivo inmediato
`AUTORIZACIÓN FIRESTORE EXACTA MÁX120 DOC WRITES → WRITE DESDE BUNDLE CIFRADO + READBACK → REDEPLOY DEV PROTEGIDO AUTORIZADO → HUMAN VISUAL ADMIN+SHOPPER → RESOLVER31 HOLD → FREEZE C6`.

## 13. Julio/agosto coexistentes
No iniciar materialización agosto mientras Corte6 siga P0 abierto. Después del freeze: refresh HR → resolver agosto HN si corresponde → materializar solo delta agosto.

## 14. Claude/prototipo
No rediseñar. Mantener UI aprobada. El backend/protected runtime debe entregar perfil real, incluido username/password legado cuando exista. No tocar módulos UI si el adapter puede cumplir el contrato.

## 15. Academia
Documentar source-safe vs protected, identidad/claims/shopperId, merge por stable-ID, perfil completo operativo, secreto legado vs Auth, validación read-only antes de writes, histórico/certificación canónicos y hardening posterior.

## 16. Estado seguro
Read-only PASS; Firestore/HR/Auth/legacy writes0; Auth password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
