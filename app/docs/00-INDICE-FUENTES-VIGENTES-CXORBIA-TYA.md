# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-11 18:45 -06:00  
**Estado vivo:** `PASS_C6_STAFF_PRIVATE_EXECUTION_HANDOFF_SOURCE_ONLY__DOC_ALIGNMENT_PASS__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

## Prevalencia actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. Handoff PASS source lock/evidence/contract/envelope/runtime.
4. D rebase PASS y private recovery exacta.
5. Exact-write STOP/prewrite y provider snapshot `31518927950`.
6. Static/HR/Auth freezes vigentes.
7. `app/docs/CAMBIOS-BACKEND.md`, `app/docs/RESUMEN-PARA-CLAUDE.md`, `app/docs/PENDIENTES-PROTOTIPO.md`.
8. Mirrors raíz de esos tres documentos, que deben ser idénticos en estado operativo, porcentaje y siguiente acción.
9. Plan/tracker/Academia.
10. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

## Control antidesalineación

`DOC_ALIGNMENT_PASS_20260811`.

Si una copia raíz y su equivalente `app/docs/` divergen en estado, porcentaje o siguiente acción, el estado es `BLOCK_DOC_ALIGNMENT`: reconciliar documentos antes de abrir otro diagnóstico funcional. Una divergencia documental nunca autoriza repetir D rebase, snapshot, Auth340, SKIP13, MultiAuth, HR, M4/static gate ni private handoff ya cerrados.

## Estado técnico vigente

- Auth protegido: 228.
- M4=5/5; M5=4/8; M6=5/5.
- Provider snapshot rector: `31518927950`.
- Exact-write budget preservado: Auth máximo 14 / Firestore máximo 16 / deletes 0.
- Handoff: A/B/C cifrado y memory-only; D determinístico.
- Provider/Auth/Firestore/HR/Rules/Storage writes del handoff: 0.
- Producción: false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=4/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=84% | restante=16%.** Alineación documental: `+0%` funcional.

## Siguiente acción exacta

`C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE V2 AUTHORIZATION → exact write único → readback acumulativo → rollback verificable → wiring → M7 → M8 → M9 → M10`.

No nuevo diagnóstico general, nueva candidata, nueva rama/PR, PowerShell para Paula ni reejecución de gates cerrados sin drift reproducible.
