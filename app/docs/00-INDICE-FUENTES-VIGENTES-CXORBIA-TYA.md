# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-12 18:36 -06:00  
**Estado vivo:** `C6_RUNTIME_10_ROOTCAUSE_PROVEN_WRONG_STAFF_CREDENTIAL_LANE__SOURCE_REPAIR_APPLIED__PHASE_A_88__NO_PRODUCTION`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Evidencia runtime 10: `app/docs/evidence/c6-live-user-admin-runtime-proof-31652523820.json`.
4. C6 Staff Exact Write V2 canonical readback PASS, cerrado/no repetible.
5. Reparación source-only del selector Staff canónico posterior a runtime 10.
6. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md`, `app/docs/PENDIENTES-PROTOTIPO.md` y mirrors raíz.
7. Plan/tracker/Academia.
8. PR #7 y HEAD vivo de `docs-tya-v6-v71-audit`.

## Estado técnico vigente

- Phase A: **88% certificado / 12% restante**.
- Runtime 10 consumió 1/1 Hosting y quedó STOP_RETRY después de provider; no se repite ese run.
- PASS previo demostrado: preflight v4, `bash -n`, keyboard submit, Google Cloud DEV auth, source parity, Hosting DEV, remote parity, Auth/contexto `coordinador/staff/tya/cinepolis` y HR viva **15 periodos / 660 visitas / 211 shoppers**.
- Frontera runtime 10: membership no verificada y handoff bloqueado.

## Causa raíz ahora demostrada source-only

El runtime Staff estaba probando la identidad equivocada respecto del Exact Write V2:

- Exact Write V2 materializó/certificó cuatro principals canónicos: `A=super`, `B=admin`, `C=ops`, `D=ops`, todos `TYA_COMPLETE` y `projectIds=[cinepolis]`.
- El selector usado por runtime 10 leía el bundle **legacy** `corte6-credential-bundle.enc.json`, reconstruía contraseñas legacy por candidatos y aceptaba `super/admin/ops/coordinador`.
- En runtime 10 ese selector eligió `staffRole=coordinador`.
- Por tanto, el smoke no estaba ejercitando necesariamente ninguno de los principals A/B/C/D cuyo `tenants/tya/users/{uid}` había sido creado/certificado por Exact Write V2. Eso explica de forma directa que el contexto Auth/HR pudiera pasar mientras `membershipVerified=false`.

Clasificación: `C6_STAFF_RUNTIME_SELECTOR_NOT_BOUND_TO_EXACT_WRITE_CANONICAL_PRINCIPAL`.

## Reparación source-only aplicada

- `tools/qa/cxorbia-c6-canonical-staff-admin-e2e-credential.mjs`: nuevo selector Staff exacto, ligado a alias `B`, rol `admin`, handoff privado y la misma derivación HKDF usada por Exact Write V2; no usa bundle legacy ni password guessing.
- `tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs`: la acción Staff exacta enruta únicamente al selector canónico; Shopper/Cliente genérico permanece preservado.
- `tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs`: preflight v4 reforzado para exigir alias B/admin, private handoff, derivación Exact Write V2 y prohibir bundle/password guessing legacy en la ruta Staff.

Commits source-only: `41cbdda28ed85531590d6ebe8b73b26751189e4e`, `172d56780b25f749870644db9727a76e2dfd0981`, `670810930de72929407fe0b3c83c78232aa3856c`.

No se modificó `/app/modules` ni UI visual. Desde runtime 10 no hubo nuevo provider, Hosting, Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes, Exact Write, merge ni producción.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | avance técnico de esta iteración: causa raíz demostrada + ruta Staff corregida; avance porcentual certificado: +0% hasta runtime PASS.**

## Siguiente acción exacta

No más auditoría general ni diagnóstico abierto. Ejecutar un nuevo `HOSTING_RUNTIME_ONCE` Staff únicamente después de autorización explícita de provider, bound al HEAD vivo final, con `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT` v4 reforzado antes de provider. El selector debe reportar `canonicalTargetAlias=B`, `staffRole=admin`, `exactWriteCanonical=true`, `legacyCredentialBundleUsed=false`. Con PASS real de membership→authority→frontend + 3 reloads + new-tab se cierra M7 y se continúa inmediatamente M8 → M9 → M10.
