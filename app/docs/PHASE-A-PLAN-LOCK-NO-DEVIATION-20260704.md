# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_P0_OPEN__FULL_PROFILE_SCOPE_AUTHORIZED__V2_HANDOFF_READY__WAITING_V2_ENCRYPTED_BUNDLE__NO_PROVIDER_WRITE__NO_DEPLOY__NO_PRODUCTION`

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
- Firestore protegido: shoppers340 y visitas616/616 enlazadas por shopperId; perfiles referenciados194/194.

## 4. HR live y auto-month
HR se lee en vivo; autodiscovery mensual y fallback read-only permanecen PASS. Último periodo HR actual:2026-07.

## 5. Último redeploy DEV
One-shot anterior consumido. No reutilizar autorización. Producción permanece intacta.

## 6. Corte6 human visual — FAIL/P0
La validación humana demostró sesión Shopper sin shopperId en ruta source-safe, Mi Perfil/Mis Visitas fail-closed y Admin sin perfil protegido completo. No restaurar `sh1`; identidad real debe resolverse por Auth/claims + shopperId estable.

## 7. Protected runtime read-only
Provider read-only confirma shoppers340; phone123; email39; Auth shopper claims con shopperId91 y perfiles91/91; visitas616/616 con shopperId; perfiles194/194. Runtime fix preparado sin deploy.

## 8. Username/Auth
Username:88 matches exactos stable-ID + Auth claims; plan88; conflictos0;21 HOLD. Auth91/91 no se reabre.

## 9. Perfil completo — decisión operativa vigente
Paula autorizó que el rol operativo autenticado vea el perfil completo del shopper como existe hoy en la plataforma anterior, incluidos datos personales, username y password legado visible. El hardening posterior no bloquea Phase A.

La información sensible nunca se escribe en repo/logs/evidencia source-safe. Se transporta cifrada y solo se materializa en provider bajo el gate Firestore correspondiente.

## 10. Export vigente
`tya-plataforma-default-rtdb-export (6).json` del 2026-07-30 está recuperado en File Library. Nunca conectar la RTDB legacy; usar solo export/import.

## 11. Handoff V1 invalidado para write
El V1 recibido reportó rawRows282, encryptedRecords151 y duplicateStableIds130, además de excluir password. No materializar desde ese bundle porque puede perder información del mismo ID y contradice el alcance completo autorizado.

## 12. Handoff/reconciliación V2
- agrupa únicamente por ID técnico estable y fusiona duplicados del mismo ID;
- la variante cuya llave RTDB coincide exactamente con el ID tiene prioridad; luego mayor completitud;
- conflictos se conservan dentro del cifrado y solo salen como conteos;
- incluye perfil completo, PII, username y password cifrados;
- runner descifra solo en memoria y hace match únicamente `legacyShopperId exact`;
- export vigente es source-of-truth para campos de perfil;
- cambios de perfil pueden refrescar valores existentes cuando difieran de la fuente vigente;
- histórico/certificaciones canónicas permanecen autoridad:616 visitas +77 certificaciones no se sobrescriben con contadores/arrays legacy;
- una copia `legacyProfileCurrent` puede preservarse para fidelidad del origen sin sustituir los modelos canónicos.

## 13. Password visible
El password legado del export puede poblar el campo visible del perfil protegido para paridad operacional. Firebase Auth sigue siendo la autoridad de login; no se infiere ni sintetiza password y no se exporta en evidencia.

## 14. Gate vivo inmediato
`GENERAR BUNDLE V2 COMPLETO → READ-ONLY V2 → WRITE PLAN EXACTO PERFIL COMPLETO + USERNAME → AUTORIZACIÓN FIRESTORE EXACTA → READBACK → REDEPLOY DEV AUTORIZADO → HUMAN VISUAL → FREEZE C6`.

## 15. Julio/agosto coexistentes
No iniciar materialización agosto mientras Corte6 siga P0 abierto. Después del freeze: refresh HR → resolver agosto HN → materializar solo delta agosto.

## 16. Claude/prototipo
No rediseñar. Mantener UI aprobada. El backend/protected runtime debe entregar nombre, datos personales, username y password reales del export cuando existan. No inventar valores y no tocar módulos UI si el adapter puede cumplir el contrato.

## 17. Academia
Documentar source-safe vs protected, identidad/claims/shopperId, merge por stable-ID, perfil completo operativo, secreto legado vs Auth, evidencia sin valores, histórico/certificación canónicos y hardening posterior.

## 18. Estado seguro
Provider writes0; Firestore/HR/Auth/legacy writes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
