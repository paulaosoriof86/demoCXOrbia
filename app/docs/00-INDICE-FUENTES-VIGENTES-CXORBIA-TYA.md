# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-12 19:48 -06:00  
**Estado vivo:** `C6_RUNTIME_12_PASS_M7__CANONICAL_B_ADMIN_FULL_STABLE__PHASE_A_93__NO_PRODUCTION`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Evidencia Runtime 12: `app/docs/evidence/c6-live-user-admin-runtime-proof-31658676280.json`.
4. Runtime 12: run `31658676280`, job `94318658180`, artifact `9165383310`, digest `sha256:a327b0d5e0a592d41417dce7ff934984ab51d3d5927dbee9ba774200eee5befe`.
5. C6 Staff Exact Write V2 canonical readback PASS, cerrado/no repetible.
6. CAMBIOS/RESUMEN/PENDIENTES y mirrors vigentes.
7. Phase A tracker/plan/Academia.
8. PR #7 y HEAD vivo de `docs-tya-v6-v71-audit`.

## Estado técnico vigente

- Phase A: **93% certificado / 7% restante**.
- `M7=5/5 COMPLETE`; C6 runtime cerrado salvo drift nuevo reproducible.
- Runtime 12: `PASS_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`.
- Preflight Staff v4: PASS.
- Principal exacto `B=admin`; `exactWriteCanonical=true`; `legacyCredentialBundleUsed=false`.
- Hosting DEV físico 1/1; remote parity exact=true, root 302 / canonical 200.
- Auth/contexto `admin / staff / tya / cinepolis`.
- Membership `tenants/tya/users/self` verificada y persistida post-`CX.app.enter()`.
- Datos runtime: **15 periodos / 660 visitas / 197 shoppers**, `2025-06 → 2026-08`.
- Frontend handoff `entered`; stale provider empty limpiado.
- Primera carga + **3 reloads + new-tab PASS**.

## Seguridad

Nuevos Auth/Firestore/HR/Rules/Storage writes=0; Make/Gemini/pagos=0; Cloud Run deploys=0; segundo Exact Write=0; segundo Hosting=0; credenciales/tokens expuestos=false; merge=false; producción=false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=93% | restante=7% | delta certificado Runtime 12=+5 puntos.**

## Siguiente acción exacta

Continuar inmediatamente `M8 → M9 → M10`, sin auditoría general ni reapertura de gates cerrados. Resolver la definición canónica exacta de cada milestone desde las fuentes vigentes; no inventar su alcance.
