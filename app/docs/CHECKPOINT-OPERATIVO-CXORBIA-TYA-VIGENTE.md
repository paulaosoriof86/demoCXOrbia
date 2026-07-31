# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_HUMAN_VISUAL_FAIL_PARTIAL__CUMULATIVE_HR_PROFILE_FINANCE_FIX_PREPARED__HOSTING_GATE_WAITING_AUTH__31_HOLD__NO_PRODUCTION`

## 1. Repositorio/destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Base `release/cxorbia-tya-rc-20260630`.
- DEV `cxorbia-backend-dev`; Hosting DEV `cxorbia-backend-dev` target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocada.

## 2. Baseline protegida — no reabrir
- Corte3 FROZEN; R17N 1,406/1,406;616 visitas +572 controles liquidación +77 certificaciones. No repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore:120 docs/329 campos WRITE+READBACK PASS, mismatches0.
- Finanzas/pagos canónicos source-safe previamente aprobados permanecen autoridad.

## 3. Resultado real de la visual humana
### PASS
- acceso Admin sin credenciales Firebase;
- picker DEV Shopper real visible y navegable.

### FAIL/P0 acumulativo
- Dashboard JUL2026 mostró0 aunque `_visitas` conserva616;
- full visual deshabilitó watcher HR viva;
- lista Shopper mezcló identidades correctas con fixtures, aliases y referencias técnicas;
- perfiles correctos no siempre recibieron campos/credenciales/histórico esperados;
- Beneficios y Finanzas aparecieron vacíos.

Corte6 no se congela.

## 4. Causa raíz
- full visual reemplazaba `CX.data` en vez de superponer;
- period IDs de la capa protegida podían no coincidir con el periodo activo HR, dejando `CX.data.visitas()` en0;
- watcher HR estaba expresamente deshabilitado para `cxHumanFullVisual`;
- los340 documentos Shopper Firestore se trataban como listado humano crudo, incluyendo aliases/fixtures/referencias técnicas;
- la base financiera canónica no se perdió: quedó sin visitas del periodo activo por la ruptura anterior.

## 5. Fix acumulativo preparado — no desplegado
- `tya-dev-full-visual-bridge.js`: HR viva conserva periodos/visitas; Firestore es overlay exacto por IDs; preserva alias de perfil, username/pass, PII, historial y facetas sin nombre-matching.
- aliases legacy se ocultan únicamente por vínculo exacto `legacyShopperId` hacia otro perfil canónico.
- fixtures demo y referencias técnicas sin identidad operacional se excluyen del append humano.
- visitas protegidas enriquecen por `visitId` y preservan el `projectId/periodId` HR.
- certificaciones/liquidaciones protected no reemplazan las fuentes canónicas ya aprobadas.
- `tya-live-source-refresh-watch.js`: human full visual vuelve a mantener `fresh=1`, polling, foco y visibility; reaplica perfil después del refresh.
- `/app/modules/*` intacto.

## 6. Gate preparado
`backend/config/corte6-cumulative-human-visual-hosting-request.json` está `enabled=false`, `consumed=false`, sin autorización.

Si se autoriza, máximo:
- 1 redeploy del Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`;
- Cloud Run redeploy0;
- Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0;
- nuevo Firebase/Hosting0; merge=false; producción=false.

El workflow dedicado valida antes del deploy que HR `fresh=1` conserve616 visitas + auto-discovery y que full-profile siga401 sin sesión visual.

## 7. Siguiente bloque exacto
`1x HOSTING DEV CUMULATIVO → REMOTE SMOKE → UNA SOLA HUMAN VISUAL ACUMULATIVA: DASHBOARD HR + SHOPPER LIST/FICHA/HISTÓRICO + SHOPPER PORTAL + BENEFICIOS + FINANZAS → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

## 8. 31 identity HOLD
Siguen31 sin vínculo canónico reproducible; no crear ni emparejar por nombre/teléfono/email.

## 9. Estado seguro
Desde la visual fallida no hubo provider mutation adicional. PR#7 draft/open/no merge; producción intacta.
