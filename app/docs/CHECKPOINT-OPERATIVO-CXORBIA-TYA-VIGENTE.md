# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `P0_PROVEN_C6_CREDENTIAL_CONTINUITY_GAP__SECURE_HANDOFF_PREPARED__WAITING_LEGACY_EXPORT__NO_PRODUCTION`

## 1. Repositorio y destinos fijos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Hosting DEV existente: site `cxorbia-backend-dev`, target `cxorbia-dev`.
- Hosting público final: `tya-plataforma`; no tocar todavía.
- No nueva base/Hosting/rama/PR/candidata.

## 2. Baseline que no se reabre
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL DEV: 1,406/1,406 Firestore data writes/readback, mismatch0.
- Materializado: foundation16 + perfiles125 + certificaciones77 + visitas616 + controles liquidación572.
- Corte 5 `CX.data`: P0 proyecto/periodo corregido; re-smoke PASS source=firestore, fallback=false, projects1, periods14, visits616, currentProjectId=`cinepolis`, currentPeriodId=`2026-07`.
- No repetir los 1,406 writes.

## 3. Corte 6 Auth/RBAC/Rules — PASS técnico
- Autorización consumida: máximo 5 claim updates + deploy exclusivo de Firestore Rules.
- 5/5 custom-claim updates: 2 cliente +3 shopper exactos.
- Cuarto shopper sin vínculo exacto: no tocado.
- Usuarios nuevos/password changes/deletes: 0/0/0.
- Readiness: operadores7, clientes2, shoppers3.
- Rules release/readback SHA exacto PASS.
- Firestore data writes Corte6: 0.

## 4. Hosting DEV — PASS técnico, 1/1 consumido
- mismo Firebase/Hosting existente;
- nuevo Firebase/Hosting: 0/0;
- release `sites/cxorbia-backend-dev/releases/1785431702100000`;
- version `sites/cxorbia-backend-dev/versions/b00728c729452665`, FINALIZED;
- remote proof/config/browser-auth/entrypoint explícito PASS;
- no redeploy adicional autorizado.

## 5. P0 demostrado — continuidad de credenciales
La visual DEV expuso `Correo + Contraseña`, pero el contrato histórico/funcional de TyA es `Usuario + Contraseña` conectado al proveedor Auth.

Inventario source-safe actual:
- backend canónico no contiene `user/username/login/pass/password` legacy;
- `tenants/tya/users`: 0 docs;
- Firebase Auth: 17 identidades técnicas email/password;
- no corresponde crear Gmail nuevo ni pedir a Paula que adopte esas cuentas.

Documento rector: `CORTE6-P0-CONTINUIDAD-CREDENCIALES-LEGACY-A-FIREBASE-20260730.md`.

## 6. Handoff seguro ya preparado
Documento: `CORTE6-CREDENTIAL-HANDOFF-SEGURO-PREPARADO-20260730.md`.

Preparado y validado:
- herramienta offline `tools/local/cxorbia-legacy-credential-inventory.html`;
- `PASS_C6_OFFLINE_CREDENTIAL_TOOL`;
- clave pública RSA-OAEP + clave privada de transporte cifrada; `PASS_C6_CREDENTIAL_HANDOFF_KEY`;
- plaintext de contraseña se convierte localmente a SHA-256 antes de cualquier archivo de salida;
- bundle sensible queda cifrado AES-256-GCM; no se escribe credencial/hash legible;
- dry-run provider read-only preparado para descifrar solo en memoria;
- login core fuente preparado como `Usuario + Contraseña` + identificador Firebase interno, aún sin nuevo deploy.

## 7. Mapping canónico para import
Read-only v2:
- colección shoppers: 340 docs;
- `legacyShopperId` presente en120;
- `sourceKey`125; `shopperId`126;
- `legacyShopperId` no coincide trivialmente con documentId/id/shopperId.

Regla: lookup exacto por campo `legacyShopperId`; 1 match=elegible; 0/>1=HOLD. Prohibido deducir por nombre.

## 8. Acción manual mínima inevitable
La fuente antigua no puede conectarse al backend nuevo. Para conservar las credenciales existentes se requiere un export JSON local de Realtime Database del proyecto legacy `tya-plataforma`. El JSON crudo no debe compartirse.

Flujo:
1. export JSON legacy local;
2. abrir herramienta offline;
3. seleccionar JSON;
4. generar resumen source-safe + bundle cifrado;
5. compartir solo esos dos resultados;
6. dry-run provider read-only automático.

## 9. Gate vivo único
`EXPORT JSON LEGACY LOCAL → HERRAMIENTA OFFLINE → RESUMEN SOURCE-SAFE + BUNDLE CIFRADO → DRY-RUN PROVIDER READ-ONLY → AUTORIZACIÓN ÚNICA AUTH IMPORT + HOSTING DEV LOGIN FIX → IMPORT/READBACK → SMOKE ADMIN/OPS/CLIENTE/SHOPPER → FREEZE CORTE6`.

## 10. Agosto
- Fuente materializada llega hasta julio 2026: 14 periodos/616 visitas.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- Después de FREEZE Corte6: refresh HR → resolver HOLD → materializar solo delta agosto.
- No rematerializar histórico.

## 11. Claude / prototipo
- No nueva candidata.
- Corrección focalizada: `Usuario + Contraseña`, Firebase detrás del adapter; no `app/modules/*`.
- Backlog P1/P2 no bloqueante: PDF sin gráfica, Excel sin formato final, reportKit/exportaciones y copy de fuentes.

## 12. Academia
Actualizar: identidad provider detrás del login, usuario ≠ email obligatorio, recuperación/cambio de contraseña, tenant/proyecto/rol, shopperId exacto y fail-closed.

## 13. Clasificación
- `Reusable CXOrbia`: adapter identidad, import idempotente, cifrado de handoff, Auth/claims, fail-closed.
- `Exclusivo cliente`: credenciales legacy TyA y Agosto HN.
- `Claude/prototipo`: UX focalizada de login/registro.
- `Academia`: acceso, recuperación y scopes.
- `Sin impacto Claude`: inventarios, cifrado, dry-run y gates.

## 14. Estado seguro
R17N previo: 1,406 Firestore data writes cerrados. Corte6: Auth claim writes5 ya autorizados; usuarios nuevos0; password changes0; Firestore data writes0; Rules release1; Hosting DEV1/1; preparación handoff provider writes0; Storage/HR/legacy0; payments0; Make/Gemini0; merge=false; producción=false; credenciales crudas repo/artifacts0.

## 15. Siguiente bloque exacto
`OBTENER EXPORT JSON LEGACY LOCAL Y PROCESARLO OFFLINE → DRY-RUN CIFRADO READ-ONLY → AUTORIZACIÓN ÚNICA IMPORT+HOSTING → SMOKE → FREEZE → AGOSTO`.
