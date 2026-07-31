# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_P0_OPEN__EXPORT_RECOVERED__PROFILE_HANDOFF_READY__USERNAME88_READY__RUNTIME_FIX_PREPARED__NO_WRITE__NO_DEPLOY__NO_PRODUCTION`

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
- HR se lee en vivo.
- Lectura abierta/read-only es válida; `Restricted` no es requisito técnico de lectura DEV.
- `fresh=1` y metadata provider descubren tabs mensuales válidas.
- Nueva pestaña mensual debe crear/detectar periodo automáticamente.
- Fallback GViz permanece read-only/fail-closed.
- Sheets API + HR canónica reader: PASS.
- último periodo HR actual:2026-07.

## 5. Último redeploy DEV
One-shot anterior consumido. No reutilizar autorización. Producción permanece intacta.

## 6. Corte6 human visual — FAIL/P0
La validación humana demostró:
- sesión Shopper sin shopperId en ruta source-safe;
- Mi Perfil/Mis Visitas fail-closed;
- Admin source-safe no era el perfil protegido final;
- username/contacto/campos adicionales e histórico/KPI no estaban completos.

No restaurar `sh1`; identidad real debe resolverse por Auth/claims + shopperId estable.

## 7. Protected runtime read-only
Provider read-only confirma:
- shoppers340; phone123; email39; username0;
- Auth shopper claims con shopperId91 y perfiles existentes91/91;
- visitas616/616 con shopperId; perfiles referenciados194/194;
- submitida545 y resto del ciclo canónico presentes.

Runtime fix preparado sin deploy para usar protected lane real y no ser sobrescrito por source-safe.

## 8. Username/password
Username: 88 matches exactos stable-ID + Auth claims; fill-missing88; conflictos0; 21 HOLD.

Password: 68/88 verifican patrón inicial histórico;20/88 no. Firebase Auth no entrega plaintext vigente. No mostrar ni resetear un patrón universal.

## 9. Export de perfil extra
El export vigente ya entregado `tya-plataforma-default-rtdb-export (6).json` fue recuperado desde File Library. No pedirlo de nuevo.

Schema real confirma username, teléfono/WhatsApp, email, país/ciudad/departamento y, según registro, DPI, dirección, fecha de nacimiento, certificaciones/historial, términos y metadata de cuenta.

Recuperación solo por export/import. Nunca conectar base vieja.

## 10. Reconciliación por contrato
Reconciliador v2:
- match solo ID técnico estable → `legacyShopperId`;
- no nombre/teléfono/email como llave;
- fill-missing-only;
- conflicto/no unicidad → HOLD;
- pass/password y UID legacy excluidos.

Clasificación:
- operativos candidatos: username, phone, email, country, city, department;
- sensibles HOLD: document/DPI, address, birthDate;
- evidence-only: certs/histCerts, visitas, estado, términos, aprobación/origen, rating.

Las 77 certificaciones y616 visitas canónicas prevalecen sobre arrays/contadores legacy.

## 11. Seguridad de PII
Las Rules actuales permiten leer `/shoppers/{id}` a roles operador. Por tanto DPI/dirección/fecha de nacimiento no se escriben en ese documento sin un storage/RBAC protegido explícito. La UI no sustituye Rules.

## 12. Handoff cifrado por frontera de herramienta
File Library puede inspeccionar el export pero no entrega un path/bytes al runner. Se preparó:
- tool OFFLINE que excluye password/UID y cifra valores de perfil;
- runner que descifra solo en memoria y compara Firestore read-only;
- workflow read-only que persiste únicamente evidencia source-safe;
- request esperando el bundle cifrado.

No hay provider write ni deploy asociado a este handoff.

## 13. Julio/agosto coexistentes
Julio puede seguir operando, pero no iniciar materialización agosto mientras Corte6 siga P0 abierto. Agosto platform-origin se conectará por source-of-truth exacto; no copiar julio.

## 14. Gate vivo inmediato
`BUNDLE CIFRADO DEL EXPORT EXISTENTE → READ-ONLY RECONCILIATION → DELTA OPERATIVO COMBINADO CON USERNAME88 → WRITE PLAN/DRY-RUN → AUTORIZACIÓN FIRESTORE EXACTA → READBACK → REDEPLOY DEV AUTORIZADO → HUMAN VISUAL → FREEZE C6`.

## 15. Claude/prototipo
No rediseñar. Cambios frontend solo focalizados si protected runtime entrega el dato y la UI no lo refleja. Mantener fail-closed sin shopperId y no inventar contraseña.

## 16. Academia
Documentar source-safe vs protected, identidad/claims/shopperId, match estable, PII/Rules, credencial inicial vs vigente, perfil consolidado, histórico y KPI drill.

## 17. Estado seguro
Provider writes0; Firestore/HR/Auth/legacy writes0; Rules/Hosting/Cloud Run deploys nuevos0; Storage/Make/Gemini/pagos0; merge=false; producción=false.
