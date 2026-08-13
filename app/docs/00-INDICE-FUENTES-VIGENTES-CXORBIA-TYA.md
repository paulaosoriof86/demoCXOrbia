# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-12 19:47 -06:00  
**Estado vivo:** `C6_RUNTIME_12_PASS_M7__CANONICAL_B_ADMIN_FULL_STABLE__PHASE_A_93__NO_PRODUCTION`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Evidencia runtime 12: `app/docs/evidence/c6-live-user-admin-runtime-proof-31658676280.json`.
4. Runtime 12: run `31658676280`, job `94318658180`, artifact `9165383310`, digest `sha256:a327b0d5e0a592d41417dce7ff934984ab51d3d5927dbee9ba774200eee5befe`.
5. C6 Staff Exact Write V2 canonical readback PASS, cerrado/no repetible.
6. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md`, `app/docs/PENDIENTES-PROTOTIPO.md` y mirrors vigentes.
7. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`, plan/Academia.
8. PR #7 y HEAD vivo de `docs-tya-v6-v71-audit` (resolver siempre en vivo).

## Estado técnico vigente

- Phase A: **93% certificado / 7% restante**.
- `M7=5/5 COMPLETE` y C6 runtime queda cerrado salvo drift nuevo reproducible.
- Runtime 12: `PASS_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`.
- Preflight Staff v4: PASS antes de provider.
- Selector canónico: `canonicalTargetAlias=B`, `staffRole=admin`, `exactWriteCanonical=true`, `legacyCredentialBundleUsed=false`.
- Hosting DEV físico: **1/1**; segundo deploy automático: 0.
- Remote parity: `PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY`, exact=true, root 302 / canonical 200.
- Auth/contexto: `admin / staff / tya / cinepolis`.
- Datos runtime: **15 periodos / 660 visitas / 197 shoppers**; rango `2025-06 → 2026-08`.
- Membership canónica: `membershipVerified=true`, `membershipSource=tenants/tya/users/self`, persistida después de `CX.app.enter()`.
- Frontend handoff: `entered`; stale provider empty limpiado.
- Primera carga: PASS; **3 reloads estables: PASS; new-tab estable: PASS**.
- Shopper/Cliente: no ejecutados dentro de este gate Staff; lógica genérica preservada.

## Cierre M7

El bloqueo de Runtime 11 quedó resuelto: la membership verificada se republica después del `CX.app.enter()` que reconstruye `CX.session`. Runtime 12 demuestra que la metadata permanece en `CX.session/RBAC` y sobrevive primera carga, tres reloads y new-tab.

Decisión canónica: `PASS_M7_C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

No reabrir C6, Exact Write V2, private handoff, provider snapshot, Auth340, SKIP13, MultiAuth, HR ni M4 sin drift nuevo reproducible.

## Seguridad

Runtime 12:
- Auth writes nuevos: `0`;
- Firestore writes nuevos: `0`;
- HR/Rules/Storage writes: `0`;
- Make/Gemini/pagos: `0`;
- Cloud Run deploys: `0`;
- segundo Exact Write: `0`;
- segundo Hosting: `0`;
- credenciales/tokens expuestos: `false`;
- merge: `false`;
- producción: `false`.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=93% | restante=7% | delta certificado runtime 12=+5 puntos.**

## Siguiente acción exacta

Continuar inmediatamente con `M8 → M9 → M10`, sin auditoría general ni reapertura de gates cerrados. Antes de ejecutar cualquier provider/write/deploy/merge/producción adicional, resolver la definición canónica exacta del milestone correspondiente desde las fuentes vigentes; no inventar alcance.
