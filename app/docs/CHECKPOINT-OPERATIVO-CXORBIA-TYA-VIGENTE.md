# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_PROFILE_WRITE_PASS__HUMAN_VISUAL_AUTH_DESVIO_CONFIRMED__NO_CREDENTIAL_FULL_VISUAL_FIX_PREPARED__WAITING_1X_CLOUD_RUN_1X_HOSTING_AUTH__31_HOLD__NO_PRODUCTION`

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

## 3. Corrección metodológica confirmada
La validación humana no debe pedir credenciales Firebase a Paula. El contrato vigente separa human visual auto-entry de Auth/claims/Rules como gate técnico/provider. El intento de usar protected browser-auth como requisito humano fue un desvío.

La persistencia LOCAL desplegada sigue siendo válida para pruebas técnicas del carril protegido, pero **no es el mecanismo de acceso de Paula**.

## 4. Fix no-credential preparado — no desplegado
- Cloud Run existente `cxorbia-live-hr-dev`: módulo `dev-visual.mjs` preparado para lectura Firestore server-side read-only con token temporal opaco; sin token devuelve401.
- Hosting DEV: bridge `tya-dev-full-visual-bridge.js` preparado para cargar perfil completo en memoria sin login Firebase visible.
- Auto-entry Admin del prototipo se preserva.
- `app.js` conserva picker DEV de shopper real; el bridge habilita ese guard solo en el carril full visual.
- Watcher HR source-safe no puede sobrescribir CX.data en ese carril.
- `/app/modules/*` intacto.

## 5. Gate preparado
Request `backend/config/corte6-human-full-visual-redeploy-request.json` está `enabled=false`, `consumed=false`, sin autorización ni execute marker.

Siguiente autorización exacta, si Paula la concede:
- máximo 1 redeploy del Cloud Run DEV existente `cxorbia-live-hr-dev`;
- máximo 1 redeploy del Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`;
- cero Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes;
- sin nuevo Firebase/Hosting, merge ni producción.

## 6. Después del gate
`REMOTE SMOKE → ENLACE TEMPORAL SIN CREDENCIALES → ADMIN PERFIL COMPLETO/KPI/HISTÓRICO → SHOPPER PICKER REAL/MÓDULOS → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

## 7. 31 identity HOLD
Siguen31 sin vínculo canónico reproducible; no crear ni emparejar por nombre/teléfono/email.

## 8. Estado seguro
No se ejecutó ningún provider mutation en este fix preparado. PR#7 draft/open/no merge; producción intacta.
