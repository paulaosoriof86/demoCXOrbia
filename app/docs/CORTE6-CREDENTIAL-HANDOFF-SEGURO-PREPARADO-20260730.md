# Corte 6 — handoff seguro de credenciales legacy preparado

**Fecha:** 2026-07-30  
**Estado:** `P0_CREDENTIAL_CONTINUITY__SECURE_HANDOFF_PREPARED__WAITING_LEGACY_EXPORT__NO_PROVIDER_WRITE`

## Objetivo
Cerrar el P0 de continuidad de credenciales sin pedir nuevas cuentas a Paula, sin exponer contraseñas/hashes y sin conectar la base legacy al backend nuevo.

## Evidencia que fija el contrato
- El handoff original de desarrollo estableció que **el login actual patrón usuario/clave se conecta a Firebase Auth**; no indicó reemplazarlo por correo visible obligatorio.
- El legacy TyA usa `tya_shoppers_extra` y `tya_users` y el flujo shopper muestra `Usuario + Contraseña`.
- El backend canónico no contiene todavía campos `user/username/login/pass/password` de la fuente legacy.
- Firebase Auth DEV actual contiene 17 identidades técnicas email/password; no son el contrato final.

## Preparado en repo
1. `tools/local/cxorbia-legacy-credential-inventory.html`
   - totalmente offline;
   - lee un export JSON local;
   - nunca hace fetch/API/provider writes;
   - genera inventario source-safe;
   - convierte contraseña plaintext a SHA-256 en el navegador o conserva SHA-256 legacy ya presente;
   - no escribe contraseña cruda a disco;
   - cifra el bundle con AES-256-GCM y envuelve la clave con RSA-OAEP-3072-SHA256.
2. `backend/secure/corte6-credential-handoff-public.json`
   - solo clave pública y fingerprint; sin secretos.
3. `backend/secure/corte6-credential-handoff-private.enc.json`
   - clave privada de transporte cifrada en repositorio;
   - solo el runner con el secreto DEV existente puede recuperarla;
   - no contiene credenciales legacy.
4. `tools/qa/cxorbia-corte6-credential-handoff-dryrun.mjs`
   - descifra únicamente en memoria;
   - compara Auth actual + shoppers canónicos;
   - mapea shopper exclusivamente por `legacyShopperId` exacto;
   - rechaza 0/>1 coincidencias, duplicados y colisiones Auth;
   - no persiste plan sensible ni hashes.
5. `.github/workflows/cxorbia-corte6-credential-handoff-dryrun.yml`
   - se activa únicamente cuando exista el bundle cifrado esperado;
   - provider read-only; writes=0;
   - publica solo evidencia agregada.
6. `app/core/backend-browser-auth.js`
   - fuente preparada, NO desplegada de nuevo;
   - contrato visible `Usuario + Contraseña`;
   - identificador Firebase sintético determinístico interno;
   - Firebase Auth/claims continúan como autoridad;
   - no correo técnico visible.

## Gates verificados
- `PASS_C6_OFFLINE_CREDENTIAL_TOOL`.
- `PASS_C6_CREDENTIAL_HANDOFF_KEY`.
- `PASS_C6_AUTH_MAPPING_CAPABILITY_READONLY`.

## Mapping canónico comprobado
Inventario read-only v2:
- shoppers en colección: 340;
- `legacyShopperId` presente: 120;
- `sourceKey`: 125;
- `shopperId`: 126;
- los `legacyShopperId` NO coinciden trivialmente con document ID/id/shopperId.

Regla de migración: buscar internamente por campo `legacyShopperId`; una coincidencia exacta = elegible; 0 o >1 = HOLD. Nunca usar nombre como llave.

## Acción manual mínima inevitable
La única intervención de Paula que no puede eliminarse sin violar el lock es obtener un **export JSON** desde la fuente legacy. La base antigua no se conecta al backend nuevo y el JSON crudo no se comparte.

Flujo local:
1. exportar JSON legacy desde la consola de la base antigua;
2. abrir la herramienta offline;
3. seleccionar el JSON;
4. descargar `CXORBIA-CORTE6-CREDENTIAL-INVENTORY-SOURCE-SAFE.json` y `CXORBIA-CORTE6-CREDENTIAL-BUNDLE-ENCRYPTED.json`;
5. compartir únicamente esos dos resultados. El segundo es ciphertext.

## Lo que NO se hace
- no crear `paula.osorio.f86@gmail.com` como workaround;
- no resetear passwords por rutina;
- no pedir credenciales DEV técnicas;
- no conectar la base vieja;
- no subir JSON crudo;
- no exponer password/hash/username/email en GitHub, logs o artifacts;
- no provider import sin autorización expresa posterior;
- no Hosting adicional sin autorización expresa posterior.

## Siguiente gate
`RECIBIR BUNDLE CIFRADO + RESUMEN SOURCE-SAFE → DRY-RUN PROVIDER READ-ONLY → CONTAR ELEGIBLES/HOLDS/COLISIONES → AUTORIZACIÓN ÚNICA AUTH IMPORT + HOSTING DEV LOGIN FIX → IMPORT/READBACK → SMOKE → FREEZE CORTE6 → AGOSTO`.

## Estado seguro
Este bloque de preparación: provider writes=0; Auth writes=0; Firestore data writes=0; Rules deploy adicional=0; Hosting deploy adicional=0; legacy writes=0; producción=false; merge=false; credenciales crudas repo/artifacts=0.
