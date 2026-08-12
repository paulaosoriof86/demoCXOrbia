# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-12 12:00 -06:00  
**Estado vivo:** `PASS_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE_V2_READBACK__PHASE_A_88`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Evidencia `app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-EXACT-WRITE-V2-LATEST.json` y request V2 consumido.
4. Contrato/executor V2 y private handoff PASS.
5. Provider snapshot rector `31518927950`.
6. Static/HR/Auth freezes vigentes.
7. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md`, `app/docs/PENDIENTES-PROTOTIPO.md` y mirrors raíz alineados.
8. Plan/tracker/Academia.
9. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

## Estado técnico vigente

- Exact Write V2: PASS y consumido; no segundo intento.
- Auth writes: 14; Firestore writes: 16; deletes: 0.
- Canonical readback A/B/C/D/R4: PASS.
- Ocho históricos: disable/readback PASS.
- Rollback: no requerido; inversas verificables preservadas.
- Private credential boundary: memory-only; sin secretos manuales ni credenciales persistidas.
- HR/Rules/Storage/Make/Gemini/pagos: 0 writes.
- Deploy/merge/producción: 0/false/false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12%.**

## Siguiente acción exacta

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_LOCALIZED → M7 → M8 → M9 → M10`.

No nuevo diagnóstico general, nueva candidata, nueva rama/PR, PowerShell para Paula ni repetición del exact write/gates cerrados sin drift reproducible.
