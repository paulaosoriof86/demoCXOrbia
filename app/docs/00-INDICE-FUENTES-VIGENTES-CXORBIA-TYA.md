# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-12 19:25 -06:00  
**Estado vivo:** `C6_RUNTIME_11_STOP_RETRY_CANONICAL_B_ADMIN_PASS_TO_FRONTEND__SESSION_MEMBERSHIP_REAPPLY_ROOTCAUSE_PROVEN__SOURCE_REPAIR_PREFLIGHT_PASS__PHASE_A_88__NO_PRODUCTION`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Evidencia runtime 11 + reparación: `app/docs/evidence/c6-live-user-admin-runtime-proof-31657144378.json`.
4. Runtime 11: run `31657144378`, job `94313999305`, artifact `9164843371`, digest `sha256:cf8433f80bbc363eebc303a6dffda961c51f6180d16438f8a8d4d874d6c87d07`.
5. Post-repair source preflight: run `31657552661`, job `94315231295`, artifact `9164940552`, digest `sha256:bc9b7f204673475d39e519d358cdaed596be015a5672b5ecdc07d270bc5c5acc`.
6. C6 Staff Exact Write V2 canonical readback PASS, cerrado/no repetible.
7. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md`, `app/docs/PENDIENTES-PROTOTIPO.md` y addenda/mirrors vigentes.
8. Plan/tracker/Academia.
9. PR #7 y HEAD vivo de `docs-tya-v6-v71-audit` (resolver siempre en vivo).

## Estado técnico vigente

- Phase A: **88% certificado / 12% restante**.
- Runtime 11 consumió 1/1 Hosting y quedó `STOP_RETRY`; no se repite ese provider run.
- `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT` v4 reforzado PASS antes de provider.
- Selector canónico PASS: `canonicalTargetAlias=B`, `staffRole=admin`, `exactWriteCanonical=true`, `legacyCredentialBundleUsed=false`.
- Hosting DEV físico: 1/1.
- Remote parity: `PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY`, exact=true, root 302/canonical 200.
- Auth/contexto real: `admin / staff / tya / cinepolis`.
- HR authority viva: **15 periodos / 660 visitas / 211 shoppers**, `2025-06 → 2026-08`, duplicados=0.
- Frontend handoff alcanzó `entered`, `membershipVerified=true`, stale backend/Corte4 empty limpiados, `appOn=true`, `loginHidden=true`.
- El smoke falló porque, después de ese PASS, `CX.session.user.membershipVerified` quedó `false`/`membershipSource=null` antes de terminar el primer `waitReady`.

## Causa raíz demostrada runtime 11

`C6_SESSION_MEMBERSHIP_METADATA_OVERWRITTEN_BY_BACKEND_BROWSER_AUTH_APP_ENTER_REAPPLY`

La causa está en la interacción entre el adapter de membership y el wrapper existente de `app/core/backend-browser-auth.js`:

1. El adapter reconcilia correctamente `tenants/tya/users/{uid}` y publica membership canónica en `CX.session`.
2. Luego llama `CX.app.enter()`.
3. El wrapper de backend Auth intercepta `CX.app.enter()` y ejecuta `applyCxSession(currentContext)`.
4. `applyCxSession` hace `CX.session.clear()` y reconstruye `CX.session.user` solo desde claims, eliminando `membershipVerified`, `membershipSource` y metadata de entitlement publicada inmediatamente antes.
5. El shell entra correctamente, pero el contrato pedido exige que membership permanezca en `CX.session/RBAC`; por eso el smoke falla correctamente.

Esto demuestra que runtime 11 **sí resolvió el problema previo del principal equivocado**: B/admin canónico autenticó, membership/hand-off llegó a `entered`, HR cargó y el shell fue visible. El único bloqueo restante de M7 está localizado en la persistencia de metadata de membership después de `CX.app.enter()`.

## Reparación source-only aplicada y certificada

- `app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js`, commit `28f6a544f122b658d8ac2d47b4c9a89ebe09010e`:
  - después de `CX.app.enter()`, ejecuta `reconcile(verifiedCtx)` por el **cache ya verificado** para republicar la membership sobre la sesión reconstruida;
  - fail-closed `FRONTEND_HANDOFF_MEMBERSHIP_LOST_AFTER_APP_ENTER` si no queda persistida;
  - evidencia `sessionMembershipRepublishedAfterAppEnter=true`;
  - cero cambios en `/app/modules` o `/app/core`.
- `tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs`, commit `e56a2371a474ed1c02f6bf16e763c8d190592f1d`:
  - exige que la republicación ocurra después de `CX.app.enter()`;
  - bloquea cualquier regresión de orden o ausencia de fail-closed.
- Source preflight post-repair run `31657552661`: **PASS**; Google auth/provider/Hosting quedaron skipped, provider calls=0.

## Seguridad

Desde runtime 11:
- Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes nuevos: `0`;
- segundo Exact Write: `0`;
- segundo Hosting runtime 11: `0`;
- source repair/preflight posteriores: provider `0`, Hosting `0`;
- secretos/tokens expuestos: `false`;
- merge: `false`;
- producción: `false`.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado runtime 11=+0%.** M7 permanece atómico hasta PASS de primera carga + 3 reloads + new-tab.

## Siguiente acción exacta

No más auditoría general ni reapertura de Auth/Exact Write/HR. Se requiere una nueva autorización explícita para **un único `HOSTING_RUNTIME_ONCE`** bound al HEAD vivo final reparado, con el mismo principal canónico `B=admin`, preflight v4 PASS y sin bundle legacy. Con PASS de membership persistida post-enter + 3 reloads + new-tab, cerrar inmediatamente M7 (+5 puntos: Phase A 93%) y continuar M8 → M9 → M10.
