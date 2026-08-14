# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-13 20:29 -06:00
**Estado vivo:** `SHOPPER_P0_READONLY_GATE_CONSUMED_HOLD_INCONCLUSIVE__V1_MAPPING_INVALIDATED__SOURCE_CHAIN_REPAIRED_PASS__REAL_E2E_PENDING__CUTOVER_BLOCKED`

## Fuentes vigentes

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
2. `app/docs/evidence/p0-exact-identity-readonly-gate-hold-and-source-repair-20260813.json` — evidencia prevalente del gate actual.
3. `backend/config/corte6-human-login-shopper-identity-audit.json` — request consumido/deshabilitado; `STOP_RETRY`.
4. `app/docs/evidence/p0-exact-identity-contract-source-repair-pass-31761257145.json` — antecedente source-repair inicial.
5. `app/docs/evidence/p0-shopper-postdeploy-forensic-rootcause-20260813.json` — causa raíz post-deploy original.
6. `app/docs/ACADEMIA-ADDENDUM-P0-SHOPPER-IDENTITY-CONTRACT-SOURCE-READY-20260813.md`.
7. `app/docs/CAMBIOS-BACKEND.md`.
8. `app/docs/PENDIENTES-PROTOTIPO.md`.
9. `app/docs/RESUMEN-PARA-CLAUDE.md`.
10. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`.
11. `backend/config/corte6-dev-root-entrypoint-hosting-execute.json` — deploy DEV previo consumido; no autoriza un segundo deploy.
12. PR #7.

## Estado operativo prevalente

El único gate DEV read-only autorizado se ejecutó una vez en run `31762716234`, job `94652243857`, y quedó **HOLD/inconcluso**. Se revisaron 231 Auth users, 209 principals Shopper efectivos, 340 perfiles Firestore, 616 visitas protegidas, 572 liquidaciones, 77 certificaciones y HR viva de 15 periodos / 660 visitas / 212 shoppers. No hubo writes ni deploy.

La salida v1 `62 unique / 137 unmapped / 10 ambiguous-review` **NO es un veredicto autoritativo del universo real**. El mismo run produjo evidencia independiente de 616 matches exactos de visita, 208 relaciones HR→shopper protegido y 194 shoppers protegidos con histórico. La revisión source-only demostró dos defectos del instrumento/cadena: el auditor v1 filtraba fuentes vinculadas antes de componer y el compositor no canonicalizaba el owner técnico de una fuente protegida antes de construir la relación HR. Por tanto está prohibido interpretar `137+10` como 147 identidades reales rotas.

El request quedó `enabled=false`, `consumed=true`, `STOP_RETRY`. Run de neutralización final `31763754714` terminó SUCCESS y omitió autorización, dependencias, credenciales, provider audit, selector, proxy y E2E; **no se ejecutó segundo provider read**.

El selector privado disponible correspondía al handoff histórico de 109 credenciales y no produjo una credencial Shopper vigente, por lo que el E2E real se **omitió**, no falló. Academia/Certificación real tampoco se validó.

La brecha source reusable sí quedó reparada después, sin proveedor: `app/adapters/tya-canonical-state-semantics-v2.js` canonicaliza owners de visitas/certificaciones/liquidaciones/postulaciones/aplicaciones/posts mediante `CX_EXACT_IDENTITY_CONTRACT` antes de la composición. Ambiguos/no resueltos permanecen fail-closed.

Gate source autoritativo posterior: workflow `CXOrbia Phase A Visual Smoke`, run `31763545130`, job `94654691101`, **SUCCESS**. Pasaron `PASS_P0_EXACT_IDENTITY_CONTRACT_SOURCE`, `PASS_P0_GLOBAL_COMPOSITION_SOURCE` y `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE`; smoke `GO_WITH_WARNINGS_VISUAL_SMOKE_POST_V96`, hard fails 0. Artifact `9205478201`, digest `sha256:12c5196203588c70ebe2f2ba86774f77965d7fbb5dbdcdb27007aa916272706a`.

**El source reparado todavía no está desplegado en DEV.** Producción, dominio oficial y merge permanecen intactos.

## Siguiente acción exacta

Bloque **source-only**: reconciliar el handoff privado vigente de un Shopper real sin crear/modificar contraseña ni tocar proveedor. Solo después, cualquier nueva revalidación del universo v2 y E2E Firebase real requerirá **una nueva autorización explícita one-shot**. Cero deploy hasta ese PASS real.
