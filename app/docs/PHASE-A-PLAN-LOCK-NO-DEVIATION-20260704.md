# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_PROFILE_FULL_FIRESTORE_WRITE_READBACK_PASS__31_IDENTITY_HOLD_PROVEN__WAITING_SEPARATE_PROTECTED_DEV_REDEPLOY_AUTHORIZATION__NO_PRODUCTION`

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
- HR live/auto-month PASS.

## 4. Corte6 perfil completo — WRITE/READBACK PASS
El bundle cifrado fue conciliado por identidad estable. Los120 perfiles exactos fueron materializados bajo autorización one-shot consumida.

Resultado:
-120 Firestore document writes exactos;
-118 documentos con cambios reales de campos +2 marker-only;
-329 valores escritos;
- readback120 docs/329 campos;
- mismatches0;
-31 missing canonical permanecen HOLD probado.

Campos escritos: username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2.

Auth writes/password resets0; Rules/Hosting/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos0; producción=false; merge=false.

## 5. Identidad pendiente31
Investigada por legacyShopperId exact, bridge técnico exacto/único y Auth determinístico + custom claim.0 resueltos. No crear/deduplicar por nombre/teléfono/email. Requiere bloque explícito posterior de alta/conciliación.

## 6. Fuente, password e histórico
Export vigente = source-of-truth para perfil actual; password visible solo desde valor legacy real; Firebase Auth = autoridad de autenticación; PII/password nunca en repo/logs.616 visitas y77 certificaciones canónicas prevalecen.

## 7. Corte6 human visual — aún abierto
La visual anterior falló por ruta source-safe. Runtime protegido ya está preparado: no se degrada a source-safe, no permite que watcher sobrescriba CX.data y usa shopperId + ciclo canónico incluido `submitida`.

Falta un redeploy DEV protegido separado y nueva validación humana Admin+Shopper. La autorización Firestore consumida no cubre Hosting/Cloud Run.

## 8. Gate vivo inmediato
`AUTORIZACIÓN SEPARADA REDEPLOY DEV PROTEGIDO → HUMAN VISUAL ADMIN+SHOPPER → ALTA/CONCILIACIÓN EXPLÍCITA31 HOLD → FREEZE C6`.

## 9. Julio/agosto coexistentes
No iniciar materialización agosto mientras Corte6 siga abierto. Después del freeze: refresh HR → resolver agosto HN si corresponde → materializar solo delta agosto.

## 10. Claude/prototipo
No rediseñar. Mantener UI aprobada. Backend/protected runtime debe entregar perfil real, incluido username/password legado cuando exista. No tocar módulos UI si el adapter puede cumplir el contrato.

## 11. Academia
Documentar source-safe vs protected, identidad/claims/shopperId, bridges reproducibles, autorización one-shot, write/readback, perfil completo operativo, secreto legacy vs Auth y histórico/certificación canónicos.

## 12. Estado seguro
Firestore one-shot consumido PASS; Auth/HR/legacy writes0; Auth password changes0; Rules/Hosting/Cloud Run/Storage/Make/Gemini/pagos0; merge=false; producción=false.
