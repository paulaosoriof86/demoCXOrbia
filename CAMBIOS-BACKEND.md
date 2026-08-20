# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-G2A-PRODUCTION-READONLY-PASS-48`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## 2026-08-20 — I5-G2-A · PRODUCTION REMOTE READ-ONLY PASS

### Resultado
Creado receipt `backend/config/cxorbia-g2a-production-readonly-smoke.json` con decisión `PRODUCTION_REMOTE_READONLY_SMOKE_PASS_WITH_FROZEN_SHOPPER_REUSE`; `productP0Proven=false`. Avance formal permanece 98/100 porque G2-B sigue siendo requisito de cierre.

### Ejecución real
- intento multirrol inicial run `32409360813`: `HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194`; clasificado `HARNESS_CREDENTIAL_STALE_HOLD_NOT_PRODUCT_P0`. La identidad/perfil/histórico exactos estaban presentes, pero el password one-shot histórico no es reconstruible read-only. No se autorizó ni ejecutó reset.
- Staff/Admin fresh production read-only: run `32411160766`, job `96561650457`, artifact `9422207911`, workflow PASS, gate exit 0, credencial Staff canónica seleccionada sin Shopper/Client y writes=0.
- Client fresh production read-only: run `32411411249`, job `96562450087`, artifact `9422287336`, `PASS_CLIENT_SINGLE_LOGIN_AND_ROUTE_RENDER`, login único, tenant `tya`, project `cinepolis`, `cli_dashboard` render, no legacy overlay, writes=0.
- Shopper: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY` reutilizado como FROZEN_REUSE, sin reprocess ni password reset.
- R3 preserva HR viva/corriente/histórico, shoppers/visitas y Finanzas; runtime funcional no cambió después del source lock.

### Corrección control-plane posterior
El primer RC drift gate posterior al cierre documental de G2-A falló con `canonical_continuity_validator_failed` / `machine control epoch/plan mismatch`. El resultado no demostró runtime drift ni P0: el validador seguía exigiendo que receipts terminales congelados de G1/R4 adoptaran el nuevo epoch G2-A. Se corrigió solo el control-plane para que los receipts terminales conserven su epoch de cierre dentro del mismo `PLAN_ID`, mientras el receipt G2-A sí debe coincidir con el epoch vivo. También se agregaron validaciones explícitas de G2-A PASS, límite de autorización G2-B, hard stop de no-rerun y sincronización de Phase A Lock/Go-Live Tracker. El RC drift gate posterior pasó (`run 32412134100`). Runtime funcional sin cambios.

Archivos tocados por esta corrección: `tools/continuity/validate-cxorbia-phase-a-continuity-lock.js`, `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`, `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` y este registro.

### Anti-bucle
El request Client actual queda consumido/disabled/noAutomaticRetry. G2-A queda terminal y `rerunG2AWithoutNewP0=false`.

### Seguridad
Business/data writes=0; Auth/Firestore/HR/Rules/Storage/Make/Gemini/payment writes=0; password reset=0; Hosting/Cloud Run deploy=0; rebuild=0; merge=false.

### Siguiente exacto
G2-B `LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE`, dentro de la misma plataforma visible para Paula, queda `PENDING_NARROW_WRITE_AUTHORIZATION`.

### Clasificación
- **Reusable CXOrbia:** composición de fresh role proofs + frozen exact identity evidence sin reset innecesario; clasificación explícita de harness stale; validador consciente de evidencia terminal por epoch.
- **Exclusivo TyA:** URL, tenant/project, HR/visitas/finanzas y perfiles TyA.
- **Claude/prototipo:** sin cambios UI/runtime; cualquier observación futura se documenta por módulo.
- **Academia:** sin cambio funcional en G2-A; revisar solo si G2-B demuestra diferencia real.
- **Sin impacto Claude:** receipts, continuity lock, requests, validator y docs.

## 2026-08-20 — I5-G2 · LIVE-IN-PLATFORM ACCEPTANCE LOCK

G1 permanece `PRODUCTION_CUTOVER_EXECUTED`; producción `https://cxorbia-backend-dev.web.app`; source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. G2-B es requisito de cierre: pruebas integrales con datos ficticios dentro de la misma plataforma productiva, visibles para Paula, prefijo `CXORBIA_E2E_SYNTH_`, cleanup y post-clean readback. El pedido de incorporar estas pruebas no autoriza sus writes; HR externo, Auth create/reset, pagos reales, Make/Gemini, deploy, rebuild y merge siguen no autorizados.
