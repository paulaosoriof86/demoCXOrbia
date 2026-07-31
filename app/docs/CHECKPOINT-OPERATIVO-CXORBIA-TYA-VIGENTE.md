# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-31  
**Estado:** `C6_CUMULATIVE_HOSTING_PASS__WAITING_HUMAN_VISUAL_CUMULATIVE__31_HOLD__NO_PRODUCTION`

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

## 3. Visual humana anterior — FAIL acumulativo
PASS de acceso: auto-entry Admin y picker Shopper real. FAIL funcional: Dashboard JUL0, watcher HR deshabilitado, identidades/aliases/fixtures mezclados, perfiles parciales, Beneficios/Finanzas vacíos. Causa raíz: replace de `CX.data`, period IDs desalineados y watcher desactivado en full visual.

## 4. Corrección acumulativa — Hosting DEV PASS
Autorización `chat-20260731-c6-cumulative-human-visual-hosting-01` consumida PASS.

Ejecutado:
- 1 redeploy del Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`;
- Cloud Run redeploys0;
- decisión `PASS_EXISTING_HOSTING_DEV_CUMULATIVE_HR_PROFILE_FINANCE_REMOTE_READY`.

Preflight y remote smoke confirmaron:
- HR `fresh=1`, runtimeRead y sourceSafe activos;
- 616 visitas preservadas;
- auto-discovery mensual activo;
- overlay perfil/histórico Firestore por identidad técnica exacta;
- alias legacy suprimidos solo por `legacyShopperId` exacto;
- asset financiero canónico preservado;
- full-profile 401 sin sesión visual;
- sin credenciales Firebase humanas.

El primer disparo falló antes de provider mutation por un grep literal frágil del workflow. `hostingDeployExecutions` permaneció0; se corrigió el gate al marcador semántico real y se reejecutó bajo la misma autorización aún no consumida. No hubo deploy duplicado.

## 5. Gate humano actual
Una sola validación acumulativa debe comprobar conjuntamente:
1. Dashboard JUL con HR viva y auto-mes;
2. Shoppers con identidad humana correcta, perfil/username/pass/datos completos materializados cuando existan e histórico por shopperId;
3. portal Shopper usando la misma identidad seleccionada;
4. Beneficios con verdad financiera aprobada;
5. Finanzas Admin con verdad canónica restaurada.

La sesión visual temporal existente es válida hasta `2026-08-02T00:29:13Z`; no requiere otro deploy para este gate.

## 6. 31 identity HOLD
Siguen31 sin vínculo canónico reproducible; no crear ni emparejar por nombre/teléfono/email.

## 7. Siguiente bloque exacto
`HUMAN VISUAL ACUMULATIVA → PASS/FAIL → resolver/decidir 31 HOLD → FREEZE C6 → AGOSTO`.

## 8. Estado seguro
Durante este gate: Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0; Cloud Run deploys0; Hosting deploys1 autorizado; nuevos Firebase/Hosting0; PR#7 draft/open/no merge; producción intacta.
