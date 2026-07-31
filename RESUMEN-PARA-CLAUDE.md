# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__HUMAN_VISUAL_AUTH_DESVIO_CONFIRMED__NO_CREDENTIAL_FULL_VISUAL_FIX_PREPARED__WAITING_1X_CLOUD_RUN_1X_HOSTING_AUTH__31_HOLD__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS, mismatches0.
- PR#7 draft/open/no merge; producción intacta.

## 2. Corrección metodológica human visual
Paula no dispone de credenciales técnicas Firebase y la human visual nunca debía exigirlas. El contrato correcto ya existente separa:
- human visual DEV: auto-entry del prototipo;
- Auth/claims/Rules: validación técnica/provider separada.

La persistencia LOCAL del protected runtime queda válida para pruebas técnicas, pero no es requisito para la visual humana.

## 3. Fix preparado — no desplegado
Backend/core/adapters únicamente:
- `backend/runtime/hr-live-service/dev-visual.mjs`: lectura Firestore server-side read-only bajo token temporal opaco; sin token falla401;
- `server.mjs` enruta `view=full-profile`;
- `app/adapters/tya-dev-full-visual-bridge.js`: carga perfil completo en memoria sin pedir credenciales Firebase al humano;
- `tya-live-source-refresh-watch.js`: no pisa ese carril;
- `index-backend-dev.html`: carga el bridge;
- `app.js` no se modifica y conserva auto-entry Admin + picker DEV de shopper real.

No rediseñar ni tocar `/app/modules/*` por este punto.

## 4. Contrato visual después del próximo gate
Un enlace temporal DEV permitirá:
- click Administración/Coordinación → entrada directa, sin usuario/contraseña Firebase;
- Shoppers → perfil completo real, incluido username/password legacy cuando exista, teléfonos/WhatsApp, DPI y campos materializados;
- KPI con detalle + histórico completo;
- click Shopper/Evaluador → picker DEV de shopper real ya existente → portal con shopperId real de QA.

Firebase Auth/claims/Rules siguen siendo autoridad/gate técnico y no se eliminan.

## 5. Provider gate pendiente
Request `backend/config/corte6-human-full-visual-redeploy-request.json` está `enabled=false`, sin autorización.

Solo requiere, si Paula autoriza:
-1 Cloud Run DEV existente `cxorbia-live-hr-dev`;
-1 Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`;
-0 Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes;
-sin nuevo proyecto/Hosting, merge ni producción.

## 6. 31 identity HOLD
Continúan31 sin vínculo canónico reproducible. No usar nombre/teléfono/email ni creación silenciosa.

## 7. Siguiente gate
`AUTORIZACIÓN 1x CLOUD RUN + 1x HOSTING DEV NO-CREDENTIAL VISUAL → REMOTE SMOKE → HUMAN VISUAL ADMIN+SHOPPER → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.
