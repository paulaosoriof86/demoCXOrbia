# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-12 16:41 -06:00  
**Estado vivo:** `C6_STAFF_ACTION_METADATA_SUFFIX_ROOTCAUSE_PROVEN__STOP_RETRY__PHASE_A_88__HOSTING_0_OF_1_THIS_RUN__NO_PRODUCTION`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Evidencia C6 Staff Exact Write V2 y request consumido; no repetir.
4. Evidencia vigente del último intento Staff: `app/docs/evidence/c6-live-user-admin-runtime-proof-31647758560.json`.
5. Workflow `31647758560`, job `94285159177`, artifact `9161420264`, digest `sha256:38136897ad4a6c973577bbf4f608afa4ee03466370d7feb2183570c1cc908594`.
6. Repair QA Staff `5c9663dd6b1174cf8d59186484eb09e83316e862`.
7. Contrato/executor V2, private handoff, provider snapshot y freezes Static/HR/Auth ya cerrados.
8. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md`, `app/docs/PENDIENTES-PROTOTIPO.md` y mirrors raíz.
9. Plan/tracker/Academia.
10. PR #7 y HEAD vivo de `docs-tya-v6-v71-audit`.

## Estado técnico vigente

- Exact Write V2: PASS y consumido; no segundo intento.
- Auth writes históricos del Exact Write: 14; Firestore writes: 16; deletes: 0.
- Canonical readback A/B/C/D/R4: PASS.
- Wiring Staff: implementado; runtime end-to-end aún no certificado.
- Repair QA Staff `5c9663...`: vigente y no alcanzado por el último run.
- Run `31647758560`: checkout/autorización/GCP/tooling PASS; fallo en selector privado antes de Hosting.
- Artifact: action resuelta `null`; stage genérico `select_existing_credentials_v6__HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194`.
- Causa raíz: `REQUEST_ACTION_METADATA_SUFFIX_DRIFT`.
- Request 05 añadió `_single_visible_login_form` después del token de action; el workflow usa `authorizationSource.endsWith(exactAction)` y por eso tomó rama genérica en vez de Staff-only.
- Hosting de esta autorización físicamente consumido: **0/1**; autorización cerrada por `STOP_RETRY`.
- Nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes: 0.
- Segundo Exact Write/segundo intento: 0/0.
- Merge/producción: false/false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado del último intento=+0%.**

## Siguiente acción exacta

No rerunear `31647758560` ni reutilizar request 05.

Se requiere nueva autorización explícita para un nuevo one-shot Staff. El request deberá quedar bound al HEAD vivo y `authorizationSource` debe terminar exactamente en `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`, sin sufijo posterior. Verificar action resuelta exacta antes de selector/deploy. Solo tras PASS continuar `M7 → M8 → M9 → M10`.

No nuevo diagnóstico general, nueva candidata, nueva rama/PR, PowerShell para Paula ni repetición de gates cerrados sin drift reproducible.
