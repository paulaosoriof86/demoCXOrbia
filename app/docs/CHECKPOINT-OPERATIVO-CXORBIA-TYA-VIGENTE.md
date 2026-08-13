# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-12 19:25 -06:00  
**Estado:** `C6_RUNTIME_11_STOP_RETRY_CANONICAL_B_ADMIN_PASS_TO_FRONTEND__SESSION_MEMBERSHIP_REAPPLY_ROOTCAUSE_PROVEN__SOURCE_REPAIR_PREFLIGHT_PASS__PHASE_A_88__NO_PRODUCTION`

## Estado vivo

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Exact Write V2: PASS cerrado/no repetible.
- Producción: intacta.
- Phase A certificado: **88%**; restante **12%**.

## Runtime 11

Request `c6-live-user-admin-membership-runtime-proof-20260812-11`, target `df1e966111ab5e5ea4b307d1c67941bd83df7294`, request commit `e63bb9d4af63126abce69e3954a136f2c7e4f8f9`.

- run: `31657144378`;
- job: `94313999305`;
- artifact: `9164843371`;
- digest: `sha256:cf8433f80bbc363eebc303a6dffda961c51f6180d16438f8a8d4d874d6c87d07`.

PASS demostrado antes del fallo:
- autorización y one-shot scope;
- `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT` v4 reforzado;
- selector exacto `B=admin`;
- `exactWriteCanonical=true`;
- `legacyCredentialBundleUsed=false`;
- Google Cloud DEV auth;
- source parity;
- Hosting DEV físico 1/1;
- remote parity exact=true, root 302/canonical 200;
- Auth/contexto `admin/staff/tya/cinepolis`;
- HR authority **15 periodos / 660 visitas / 211 shoppers**, duplicados=0;
- frontend handoff `entered` con `membershipVerified=true`;
- stale backend/Corte4 empty false;
- `appOn=true`, `loginHidden=true`.

El primer `waitReady` no cerró porque el snapshot final del mismo estado tenía `CX.session.user.membershipVerified=false` y `membershipSource=null` aunque el handoff ya había entrado. Por eso no hubo 3 reloads ni new-tab y M7 no puede certificarse todavía.

## Causa raíz demostrada

`C6_SESSION_MEMBERSHIP_METADATA_OVERWRITTEN_BY_BACKEND_BROWSER_AUTH_APP_ENTER_REAPPLY`

Secuencia reproducible por source + runtime:

1. `reconcile(ctx)` verifica el membership canónico y `publishSession()` escribe `membershipVerified=true`.
2. `finalizeStaffFrontend()` llama `CX.app.enter()`.
3. El wrapper existente de `app/core/backend-browser-auth.js` intercepta `CX.app.enter()` y ejecuta `applyCxSession(currentContext)`.
4. `applyCxSession()` hace `CX.session.clear()` y reconstruye `CX.session.user` desde claims; esa reconstrucción no incluye `membershipVerified`, `membershipSource` ni `entitlementMode` del documento canónico.
5. El shell permanece visible y el handoff ya había sido válido, pero la metadata de membership se pierde en `CX.session/RBAC`, exactamente el requisito que el smoke exige.

No hay nuevo fallo demostrado de credencial B, Auth, claims, membership document previo a enter, HR authority, Hosting, remote parity ni shell frontend.

## Reparación source-only posterior a STOP_RETRY

Sin segundo provider ni Hosting:

- `app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js` — commit `28f6a544f122b658d8ac2d47b4c9a89ebe09010e`:
  - después de `CX.app.enter()`, vuelve a `reconcile(verifiedCtx)` por el cache ya verificado;
  - republica membership sobre la sesión reconstruida;
  - fail-closed si no persiste;
  - no toca `/app/core` ni `/app/modules`.
- `tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs` — commit `e56a2371a474ed1c02f6bf16e763c8d190592f1d`:
  - exige el orden `CX.app.enter()` → republicación membership;
  - exige fail-closed post-enter y evidencia explícita.
- Source-only request commit `27a2a0105cfdbeffe5ee06a70b0f05767ef6de2c`.
- Source preflight run `31657552661`, job `94315231295`, artifact `9164940552`, digest `sha256:bc9b7f204673475d39e519d358cdaed596be015a5672b5ecdc07d270bc5c5acc`: **SUCCESS / PASS**.
- En ese source preflight: Google Cloud auth, selector provider, Hosting y runtime quedaron skipped; provider calls=0 y Hosting=0.

Evidencia durable: `app/docs/evidence/c6-live-user-admin-runtime-proof-31657144378.json`.

## STOP_RETRY y seguridad

- Runtime 11 Hosting: 1/1 consumido.
- Segundo Hosting/runtime 11: 0.
- Nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes: 0.
- Segundo Exact Write: 0.
- Source repair/preflight posterior: provider 0, Hosting 0.
- Credenciales/tokens expuestos: false.
- Merge: false.
- Producción: false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado runtime 11=+0%.** M7 es atómico y exige primera carga + 3 reloads + new-tab completos.

## Siguiente bloque exacto

No nueva auditoría general. No reabrir Exact Write V2, Auth340, SKIP13, MultiAuth, HR ni gates cerrados. La siguiente acción es una nueva autorización explícita para un único `HOSTING_RUNTIME_ONCE` Staff sobre el HEAD vivo final reparado, usando exclusivamente `B=admin` canónico. Con PASS de membership persistida post-enter y estabilidad 3 reloads/new-tab, cerrar M7 y llevar Phase A a **93%**, después continuar M8 → M9 → M10.

## Clasificación

- **Reusable CXOrbia:** metadata de autorización canónica debe sobrevivir cualquier rehidratación de sesión posterior a autenticación.
- **Exclusivo cliente:** principal Staff TyA B/admin en DEV.
- **Claude/prototipo:** no se modificó UI ni módulos frontend.
- **Academia:** sin cambio de contenido hasta M7 PASS.
- **Sin impacto Claude:** adapter/preflight/evidencia C6.
