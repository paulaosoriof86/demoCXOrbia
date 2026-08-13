# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-12 19:47 -06:00  
**Estado:** `C6_RUNTIME_12_PASS_M7__CANONICAL_B_ADMIN_FULL_STABLE__PHASE_A_93__NO_PRODUCTION`

## Estado vivo

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Producción: intacta.
- Exact Write V2: PASS cerrado/no repetible.
- C6/M7: **PASS cerrado** salvo drift nuevo reproducible.
- Phase A certificado: **93%**; restante **7%**.

## Runtime 12 — PASS

- Request: `c6-live-user-admin-membership-runtime-proof-20260812-12`.
- Request commit: `51e7a5e814bcb5e31c3cf06c81b358e65d918868`.
- Target HEAD: `8fcc29bc4ce48e7198b8ae55223817eae6052b06`.
- Run: `31658676280`.
- Job: `94318658180`.
- Artifact: `9165383310`.
- Digest: `sha256:a327b0d5e0a592d41417dce7ff934984ab51d3d5927dbee9ba774200eee5befe`.
- Workflow conclusion: `success`.
- Artifact decision: `PASS_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`.

PASS demostrado:
- `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT` v4;
- shell exacto `bash -n` PASS y heredoc anidado ausente;
- selector Staff canónico exacto `B=admin`;
- `exactWriteCanonical=true`;
- `legacyCredentialBundleUsed=false`;
- Google Cloud DEV auth;
- Hosting DEV físico `1/1`;
- remote parity exact=true, root 302 / canonical 200;
- Firebase Auth/contexto `admin / staff / tya / cinepolis`;
- membership canónica verificada y persistida en `CX.session/RBAC` después de `CX.app.enter()`;
- runtime de datos: **15 periodos / 660 visitas / 197 shoppers**, `2025-06 → 2026-08`;
- frontend handoff `entered` y stale provider-empty limpiado;
- primera carga PASS;
- **3 reloads PASS**;
- **new-tab PASS**;
- formulario canónico `#loginForm/#lgUser/#lgPass/#lgSubmit`;
- Shopper/Cliente fuera del alcance Staff y lógica genérica preservada.

## Cierre de la causa raíz anterior

Runtime 11 había demostrado que `app/core/backend-browser-auth.js` reconstruía `CX.session` dentro de `CX.app.enter()` y eliminaba la metadata de membership recién verificada. La reparación focal quedó en `app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js`: republica desde el cache de membership ya verificado después de la entrada y falla cerrado si no persiste.

Runtime 12 certifica que esa reparación funciona bajo primera carga, tres reloads y new-tab. No se requiere ni se autoriza reabrir C6 por ese defecto.

## Seguridad

Runtime 12:
- Auth writes nuevos `0`;
- Firestore writes nuevos `0`;
- HR/Rules/Storage writes `0`;
- Make/Gemini/pagos `0`;
- Cloud Run deploys `0`;
- segundo Exact Write `0`;
- segundo Hosting `0`;
- credenciales/tokens expuestos `false`;
- merge `false`;
- producción `false`.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=93% | restante=7% | avance certificado de Runtime 12: +5 puntos.**

## Siguiente bloque exacto

Continuar con `M8`, luego `M9` y `M10`, sin auditoría general y sin reabrir Exact Write/Auth340/SKIP13/MultiAuth/HR/M4/C6. Resolver el contrato exacto de cada milestone desde las fuentes vigentes antes de cualquier provider/write/deploy/merge/producción adicional.

## Clasificación

- **Reusable CXOrbia:** QA de una identidad canónica debe preservar membership/RBAC a través de entrada, reloads y nuevas pestañas.
- **Exclusivo cliente:** TyA DEV, principal canónico B/admin y datos operativos TyA.
- **Claude/prototipo:** sin cambios UI ni módulos frontend.
- **Academia:** cadena Auth→membership→HR→frontend ya certificada para Phase A.
- **Sin impacto Claude:** runtime QA, adapter backend y evidencia C6.
