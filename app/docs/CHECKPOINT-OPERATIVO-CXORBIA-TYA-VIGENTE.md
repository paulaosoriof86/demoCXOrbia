# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-30  
**Estado:** `P0_PROVEN_C6_CREDENTIAL_CONTINUITY_GAP__AUTH_RULES_HOSTING_TECH_PASS__NO_PRODUCTION`

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
- R17N FINAL DEV: 1,406/1,406 Firestore data writes y readback, mismatch0.
- Materializado: foundation16 + perfiles125 + certificaciones77 + visitas616 + controles liquidación572.
- Corte 5 `CX.data`: P0 proyecto/periodo corregido; re-smoke PASS source=firestore, fallback=false, projects1, periods14, visits616, currentProjectId=`cinepolis`, currentPeriodId=`2026-07`.
- No repetir los 1,406 writes.

## 3. Corte 6 Auth/RBAC/Rules — PASS técnico
Autorización consumida: máximo 5 claim updates + deploy exclusivo de Firestore Rules.

Resultado:
- 5/5 custom-claim updates sobre usuarios existentes: 2 cliente +3 shopper con vínculo exacto;
- proyecto stale `tya`/`tya-piloto` → `cinepolis`;
- cuarto shopper sin vínculo exacto: no tocado;
- usuarios nuevos/password changes/deletes: 0/0/0;
- Auth readback: operadores ready7, clientes ready2, shoppers ready3;
- Firestore Rules release/readback SHA exacto PASS;
- Firestore data writes Corte6: 0.

## 4. Hosting DEV — PASS técnico, autorización 1/1 consumida
- mismo Firebase/Hosting existente;
- nuevo Firebase/Hosting: 0/0;
- release `sites/cxorbia-backend-dev/releases/1785431702100000`;
- version `sites/cxorbia-backend-dev/versions/b00728c729452665`, FINALIZED;
- remote proof/config/browser-auth/`index-backend-dev.html`: PASS;
- no redeploy adicional autorizado.

## 5. P0 demostrado — continuidad de credenciales
La visual DEV expuso un login nuevo `Correo + Contraseña`. Paula confirmó que ese flujo nunca había formado parte de su operación y que las pruebas anteriores no requerían conocer credenciales Firebase DEV.

Se ejecutó inventario source-safe read-only `CORTE6-CREDENTIAL-CONTINUITY-READONLY-LATEST.json`:
- `tenants/tya/shoppers`: 340 docs inventariados agregadamente;
- `user/username/login`: 0;
- `pass/password`: 0;
- `tenants/tya/users`: 0 docs;
- claves tenant relacionadas con login: 0;
- Firebase Auth: 17 users, 17 password provider, 17 con identificador email.

Conclusión: las 17 cuentas Auth actuales son identidades técnicas DEV; el backend canónico no recibió todavía la fuente legacy de `Usuario + Contraseña`. Forzar correo visible o crear `paula.osorio.f86@gmail.com` como solución generaría un segundo modelo de acceso y reproceso.

Documento rector: `CORTE6-P0-CONTINUIDAD-CREDENCIALES-LEGACY-A-FIREBASE-20260730.md`.

## 6. Contrato de acceso que se preserva
- Firebase Auth/claims siguen siendo necesarios como autoridad real.
- El usuario final no debe estar obligado a usar correo como identificador visible.
- Contrato objetivo: `Usuario + Contraseña`, con accesos/roles configurables y adapter interno a Firebase Auth.
- No guardar passwords/tokens en localStorage.
- No compartir credenciales por chat, repo, logs o artifacts.
- La fuente legacy de credenciales se recupera solo mediante export/import controlado; nunca conectando la base antigua al backend nuevo.

## 7. Gate vivo único
`EXPORT/INVENTARIO CREDENCIALES LEGACY SOURCE-SAFE → PLAN AUTH IMPORT IDEMPOTENTE → AUTORIZACIÓN PROVIDER ÚNICA → IMPORT/READBACK → LOGIN USUARIO+CONTRASEÑA → SMOKE ADMIN/OPS/CLIENTE/SHOPPER → FREEZE CORTE6`.

Hasta cerrar este P0 no corresponde pedir a Paula una credencial Firebase DEV ficticia ni crear una cuenta Gmail nueva.

## 8. Agosto
- Fuente materializada llega hasta julio 2026: 14 periodos/616 visitas.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- Después de FREEZE Corte6: refresh HR → resolver HOLD → materializar solo delta agosto.
- No rematerializar histórico.

## 9. Claude / prototipo
- No nueva candidata.
- Corrección focalizada pendiente en login/registro: preservar `Usuario + Contraseña` y dejar Firebase detrás del adapter.
- No reescribir `app/modules/*`.
- Backlog P1/P2 sigue no bloqueante: PDF sin gráfica, Excel sin formato final, reportKit/exportaciones y copy de fuentes.

## 10. Academia
Actualizar manuales/rutas con: autenticación provider real detrás del login del producto; usuario no equivale a email; tenant/proyecto/rol delimitan acceso; recuperación/cambio de contraseña; conflictos de identidad a revisión; nunca ampliar permisos silenciosamente.

## 11. Clasificación
- `Reusable CXOrbia`: adapter de identidad, Auth/claims, import idempotente, fail-closed.
- `Exclusivo cliente`: fuente legacy TyA y credenciales históricas.
- `Claude/prototipo`: UX focalizada login/registro.
- `Academia`: acceso, recuperación y scopes.
- `Sin impacto Claude`: inventarios source-safe, import/readback y gates.

## 12. Estado seguro
R17N previo: 1,406 Firestore data writes cerrados. Corte6: Auth claim writes5 ya autorizados; usuarios nuevos0; password changes0; Firestore data writes0; Rules release1 verificada; Hosting DEV1/1; inventario adicional read-only provider writes0; Storage/HR/legacy writes0; payments0; Make/Gemini0; merge=false; producción=false; credenciales crudas exportadas0.

## 13. Siguiente bloque exacto
`RECUPERAR FUENTE LEGACY DE CREDENCIALES POR EXPORT CONTROLADO, SIN CONECTAR BASE VIEJA → INVENTARIO/HASH-TYPE → PLAN AUTH IMPORT → AUTORIZACIÓN ÚNICA → IMPORT/READBACK → SMOKE → FREEZE → AGOSTO`.
