# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-12  
**Estado vivo:** `C6_STAFF_SINGLE_VISIBLE_FORM_QA_ROOTCAUSE_FIXED__STOP_RETRY__PHASE_A_88__HOSTING_1_OF_1__NO_PRODUCTION`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Evidencia C6 Staff Exact Write V2 y request consumido; no repetir.
4. Evidencia vigente del último proof Staff: `app/docs/evidence/c6-live-user-admin-runtime-proof-31646324988.json`.
5. Workflow `31646324988`, artifact `9160870076`, digest `sha256:e92ec72789ded9db63346bb6b1ca39e71861b4a28b14e35558940124f7e7782b`.
6. Contrato/executor V2, private handoff y provider snapshot rectores ya cerrados.
7. Static/HR/Auth freezes vigentes.
8. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md`, `app/docs/PENDIENTES-PROTOTIPO.md` y mirrors raíz alineados.
9. Plan/tracker/Academia.
10. PR #7 y HEAD vivo de `docs-tya-v6-v71-audit`.

## Estado técnico vigente

- Exact Write V2: PASS y consumido; no segundo intento.
- Auth writes históricos del Exact Write: 14; Firestore writes: 16; deletes: 0.
- Canonical readback A/B/C/D/R4: PASS.
- Wiring Staff `Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend`: implementado en source, todavía no certificado de extremo a extremo en runtime.
- Run `31646324988`: request/source/selector PASS; Hosting DEV PASS; root parity `PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY`; runtime Staff FAIL antes de envío de credenciales.
- Hosting DEV autorizado y físicamente consumido: **1/1**.
- Causa raíz: `QA_HARNESS_CONTRACT_DRIFT` entre el formulario canónico único `#loginForm/#lgUser/#lgPass/#lgSubmit` y el overlay legado esperado por el smoke.
- Commit source-only `5c9663dd6b1174cf8d59186484eb09e83316e862`: QA Staff alineado al formulario canónico; Shopper/Client genérico preservado; cero rerun/deploy posterior.
- Nuevos HR/Rules/Storage/Make/Gemini/pagos/Auth/Firestore writes en este proof: 0.
- Segundo Exact Write: 0.
- Segundo intento: 0.
- Merge/producción: false/false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado del último proof=+0%.**

## Siguiente acción exacta

No rerunear `31646324988`, no reutilizar su request y no ejecutar otro Hosting con la autorización ya consumida.

El source está preparado para un nuevo one-shot `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`, pero requiere autorización explícita nueva que habilite otro Hosting DEV. Solo tras PASS continuar `M7 → M8 → M9 → M10`.

No nuevo diagnóstico general, nueva candidata, nueva rama/PR, PowerShell para Paula ni repetición del Exact Write/gates cerrados sin drift reproducible.
