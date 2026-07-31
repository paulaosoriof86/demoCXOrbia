# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_PROFILE_FULL_READONLY_PASS__31_IDENTITY_HOLD_PROVEN__WRITE_GATE_READY__WAITING_EXPLICIT_FIRESTORE_AUTHORIZATION__NO_DEPLOY__NO_PRODUCTION`

## 1. Objetivo/arquitectura
TyA/Cinépolis como tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev`=DEV canónico; `tya-plataforma`=Hosting final. No crear Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA/ORIGEN PLATAFORMA → EXISTENCIA/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE/CONCILIACIÓN → WRITE PLAN → DRY-RUN → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN → CUTOVER`.

El prototipo manda. Un PASS técnico sin validación visual no congela un corte.

## 3. Cortes protegidos
- Corte1/2A/3 FROZEN; histórico14 periodos/616 visitas hasta julio.
- R17N1,406/1,406; no repetir.
- Corte5 CX.data PASS.
- Auth91/91, claims5/5 y Rules PASS; no reimportar/resetear por rutina.
- Firestore protegido: shoppers340; visitas616/616 enlazadas por shopperId; perfiles referenciados194/194.

## 4. HR live y auto-month
HR se lee en vivo; autodiscovery mensual y fallback read-only PASS. Último periodo HR:2026-07. Nuevos meses nacen automáticamente al aparecer tabs mensuales válidas.

## 5. Corte6 human visual — P0 abierto
Visual anterior: Shopper sin shopperId en ruta source-safe y Admin sin perfil protegido completo. No restaurar `sh1`; identidad real se resuelve por Auth/claims + shopperId estable.

## 6. Protected runtime preparado
Protected lane no se degrada a source-safe; watcher no sobrescribe CX.data; histórico/KPI usa shopperId y ciclo canónico incluido `submitida`. Sin redeploy nuevo autorizado.

## 7. Perfil completo — read-only PASS
Bundle cifrado del export vigente:151 registros;120 exactos `legacyShopperId`;31 sin canonical;0 ambiguos/invalid;329 valores de perfil. En los120 exactos,118 docs cambian campos y2 solo marker de procedencia.

Campos: username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2. Nombre/WhatsApp/email/país/ciudad ya coinciden.

## 8. Identidad pendiente31 — investigada antes del write
No se dejó el HOLD para después sin diagnóstico:
- bridge Auth determinístico + custom claim shopperId:0 resueltos;2 sin username,10 username duplicado,19 sin Auth user;
- bridge V3 por llave técnica exacta/única (`docId/sourceKey/shopperId/legacyId/externalId/externalShopperId/sourceId`) y luego Auth:0 resueltos;0 candidatos técnicos.

Por tanto los31 no tienen vínculo canónico reproducible. No crear/deduplicar por nombre/teléfono/email. Requieren bloque explícito posterior de alta/conciliación.

## 9. Transporte V2 y causa raíz
Primer read-only FAIL por checksum antes del provider: `part-007.txt` no era el chunk exacto. Se restauró el blob correcto y retry PASS con request aún no consumida. Provider writes0.

## 10. Fuente, password e histórico
Export vigente = source-of-truth para perfil actual; password visible solo desde valor legacy real; Firebase Auth = autoridad de autenticación; PII/password nunca en repo/logs. Las616 visitas y77 certificaciones canónicas prevalecen y no se sobrescriben con arrays/contadores legacy.

## 11. Write gate completo — NO autorizado
Plan/request rebasados sobre evidencia V3, executor y workflow one-shot listos. Antes del provider revalidan autorización, destino, SHA,151/120/31,118+2 docs y329 valores. Cualquier drift previo falla sin mutation. Readback obligatorio de todos los documentos/campos.

Máximo futuro:120 Firestore document writes sobre perfiles existentes exactos. Auth/password reset0; Rules/Hosting/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos0; producción=false; merge=false.

## 12. Gate vivo inmediato
`AUTORIZACIÓN FIRESTORE EXACTA MÁX120 DOC WRITES → WRITE+READBACK → REDEPLOY DEV PROTEGIDO AUTORIZADO → HUMAN VISUAL ADMIN+SHOPPER → ALTA/CONCILIACIÓN EXPLÍCITA31 HOLD → FREEZE C6`.

## 13. Julio/agosto coexistentes
No iniciar materialización agosto mientras Corte6 siga P0 abierto. Después del freeze: refresh HR → resolver agosto HN si corresponde → materializar solo delta agosto.

## 14. Claude/prototipo
No rediseñar. Mantener UI aprobada. Backend/protected runtime debe entregar perfil real, incluido username/password legado cuando exista. No tocar módulos UI si el adapter puede cumplir el contrato.

## 15. Academia
Documentar source-safe vs protected, identidad/claims/shopperId, bridges técnicos/Auth reproducibles, perfil completo operativo, secreto legacy vs Auth, validación read-only antes de writes, histórico/certificación canónicos y hardening posterior.

## 16. Estado seguro
Read-only gates PASS; Firestore/HR/Auth/legacy writes0; Auth password changes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
