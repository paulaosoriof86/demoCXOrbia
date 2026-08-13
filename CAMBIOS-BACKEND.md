# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-12 19:48 -06:00  
**Estado:** `C6_RUNTIME_12_PASS_M7__PHASE_A_93__NO_PRODUCTION`

## Bloque ejecutado

Se ejecutó el one-shot autorizado `HOSTING_RUNTIME_ONCE` para `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`, exclusivamente con el principal canónico Exact Write V2 `B=admin`.

## Resultado Runtime 12 — PASS

Request `c6-live-user-admin-membership-runtime-proof-20260812-12` → commit `51e7a5e814bcb5e31c3cf06c81b358e65d918868` → run `31658676280` / job `94318658180` / artifact `9165383310` / digest `sha256:a327b0d5e0a592d41417dce7ff934984ab51d3d5927dbee9ba774200eee5befe`.

Decisión artifact: `PASS_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`.

PASS demostrado:
- `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT` v4;
- selector canónico `canonicalTargetAlias=B`, `staffRole=admin`;
- `exactWriteCanonical=true`, `legacyCredentialBundleUsed=false`;
- Hosting DEV físico **1/1** y remote parity exact=true;
- Firebase Auth/contexto `admin/staff/tya/cinepolis`;
- membership `tenants/tya/users/self` verificada y persistida después de `CX.app.enter()`;
- runtime de datos **15 periodos / 660 visitas / 197 shoppers**, `2025-06 → 2026-08`;
- frontend handoff `entered`;
- primera carga + **3 reloads + new-tab PASS**.

## Seguridad

Nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0; segundo Hosting=0; segundo Exact Write=0; credenciales/tokens expuestos=false; merge=false; producción=false.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=0/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=93% | RESTANTE=7% | DELTA CERTIFICADO RUNTIME 12=+5%.**

## Siguiente frontera exacta

`M8 → M9 → M10`. No reabrir C6/M7 ni gates cerrados sin drift reproducible. Resolver los contratos exactos de los milestones restantes desde fuentes vigentes antes de cualquier provider/write/deploy/merge/producción.

## Clasificación

- **Reusable CXOrbia:** membership/RBAC persistente a través de entrada/reloads/new-tab.
- **Exclusivo cliente:** TyA DEV B/admin.
- **Claude/prototipo:** sin ajuste frontend.
- **Academia:** cadena Staff real certificada.
- **Sin impacto Claude:** QA/evidencia/backend.
