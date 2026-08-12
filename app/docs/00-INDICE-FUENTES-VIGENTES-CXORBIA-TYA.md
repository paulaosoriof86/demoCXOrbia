# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-12 15:58 -06:00  
**Estado vivo:** `C6_STAFF_ADMIN_SHELL_HEREDOC_ROOTCAUSE_FIXED__STOP_RETRY__PHASE_A_88__HOSTING_0_OF_1__NO_PRODUCTION`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Evidencia `app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-EXACT-WRITE-V2-LATEST.json` y request V2 consumido.
4. Evidencia del último proof C6: workflow `31644318836`, artifact `9160122511`, digest `sha256:909ef87970ece8fe972691765255e990b8c4314a8d154f26915f2c600c3c63ef`.
5. Contrato/executor V2 y private handoff PASS.
6. Provider snapshot rector `31518927950`.
7. Static/HR/Auth freezes vigentes.
8. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md`, `app/docs/PENDIENTES-PROTOTIPO.md` y mirrors raíz alineados.
9. Plan/tracker/Academia.
10. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

## Estado técnico vigente

- Exact Write V2: PASS y consumido; no segundo intento.
- Auth writes históricos del Exact Write: 14; Firestore writes: 16; deletes: 0.
- Canonical readback A/B/C/D/R4: PASS.
- Ocho históricos: disable/readback PASS.
- Rollback: no requerido; inversas verificables preservadas.
- Private credential boundary: memory-only; sin secretos manuales ni credenciales persistidas.
- Wiring Staff `Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend`: implementado en source.
- Run `31644318836`: selector Staff/admin PASS; fallo shell pre-deploy por heredoc indentado; STOP_RETRY aplicado.
- Commit source-only `f8efd98e92448739b458aa838cd1f6f8c6efbc6e`: elimina heredocs anidados frágiles y excluye `gha-creds-*.json` del clean-worktree gate.
- Hosting DEV consumido: 0/1.
- Nuevos HR/Rules/Storage/Make/Gemini/pagos/Auth/Firestore writes en este proof: 0.
- Merge/producción: false/false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado del último proof=+0%.**

## Siguiente acción exacta

No rerunear `31644318836` ni reutilizar su request.

Únicamente con nueva autorización puntual: crear un nuevo request one-shot bound al HEAD vivo que contenga `f8efd98e92448739b458aa838cd1f6f8c6efbc6e` y ejecutar máximo un Hosting DEV para:

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF → M7 → M8 → M9 → M10`.

No nuevo diagnóstico general, nueva candidata, nueva rama/PR, PowerShell para Paula ni repetición del Exact Write/gates cerrados sin drift reproducible.
