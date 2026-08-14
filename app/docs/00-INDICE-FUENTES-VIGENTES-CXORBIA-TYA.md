# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-13 19:07 -06:00
**Estado vivo:** `SHOPPER_P0_POSTDEPLOY_ACCEPTANCE_REJECTED__IDENTITY_CONTRACT_SPLIT_PROVEN__STALE_PREAUTH_BOOTSTRAP_PROVEN__CUTOVER_BLOCKED`

## Fuentes vigentes

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
2. `app/docs/evidence/p0-shopper-postdeploy-forensic-rootcause-20260813.json`
3. `app/docs/evidence/p0-shopper-auth-hr-dev-redeploy-pass-31758046539.json`
4. `app/docs/evidence/p0-shopper-canonical-auth-hr-handoff-source-pass-31749008509.json`
5. `app/docs/CAMBIOS-BACKEND.md`
6. `app/docs/PENDIENTES-PROTOTIPO.md`
7. `app/docs/RESUMEN-PARA-CLAUDE.md`
8. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`
9. `backend/config/corte6-dev-root-entrypoint-hosting-execute.json` — consumido/deshabilitado; 1/1 deploy.
10. `app/docs/evidence/p0-human-shopper-canonical-binding-failure-20260813.json`
11. `app/docs/evidence/m10-final-phase-a-freeze-31721769360.json`
12. PR #7.

## Estado operativo prevalente

El redeploy DEV del fix anterior fue técnicamente correcto (`31758046539`, exactamente 1 Hosting deploy, paridad remota PASS), pero la aceptación humana posterior volvió a fallar con el mismo Shopper. Por tanto el cierre anterior queda invalidado como causa raíz completa.

La auditoría forense source-only demuestra dos P0 estructurales:

1. **Contrato de identidad dividido:** la activación Auth resuelve propietarios con un conjunto amplio de llaves técnicas y fija `claim.shopperId` al id del documento de perfil Firestore; el compositor browser HR usa un conjunto más estrecho de aliases para construir `identityMap`. El crosswalk reconstruido durante activación Auth no fue materializado como contrato canónico reutilizable consumido por runtime.
2. **Bootstrap pre-auth obsoleto:** el entrypoint humano carga antes de Auth un snapshot source-safe empaquetado de julio y `tya-phase-a-source-safe-preview.js` lo escribe en `CX.data`; por eso el login todavía puede mostrar 616 visitas / julio 2026 antes de que HR viva tome autoridad.

La evidencia humana post-deploy confirma el patrón: Firestore transitorio muestra el perfil y país, luego HR viva llega correctamente con 15 periodos / 660 visitas, pero la identidad autenticada queda fuera del read model canónico. No corresponde reabrir UI ni deduplicar por nombre.

El marcador del único deploy autorizado fue neutralizado/consumido. Run de neutralización `31759552694` terminó SUCCESS con todos los pasos de proveedor/deploy omitidos; no existe autorización para un segundo deploy.

Producción oficial, merge, dominio oficial y writes de Auth/Firestore/HR/Rules/Storage permanecen intactos.

## Siguiente acción exacta

Preparar **reparación source-only genérica del contrato de identidad**, compartiendo una única semántica de llaves exactas entre migración/Auth/Firestore/runtime, y retirar el snapshot empaquetado del entrypoint humano canónico sin afectar el laboratorio source-safe. Añadir gate real Auth Shopper → perfil protegido → HR exacta → histórico, no `selectRole` ni fixture sintético. Cero deploy/proveedor/writes hasta gate separado.
