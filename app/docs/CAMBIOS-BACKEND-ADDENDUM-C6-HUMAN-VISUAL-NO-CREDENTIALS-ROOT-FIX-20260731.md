# CAMBIOS BACKEND — Corte 6 human visual sin credenciales · corrección de raíz

**Fecha:** 2026-07-31  
**Estado:** `SUPERSEDED_BY_CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-FULL-VISUAL-REDEPLOY-PASS-20260731.md`

## Hallazgo y corrección metodológica
La validación humana de Paula nunca debía depender de conocer credenciales Firebase. El contrato correcto separa:
- human visual DEV: auto-entry del prototipo, sin prompt de credenciales;
- Firebase Auth/claims/Rules: gate técnico/provider separado.

El desvío fue convertir el carril protegido Firebase en requisito para la visual humana. La persistencia `LOCAL` se conserva como mejora técnica del carril protegido, pero queda superseded como mecanismo de human visual.

## Corrección implementada
Se prepararon y posteriormente se desplegaron bajo autorización one-shot:
- `backend/runtime/hr-live-service/dev-visual.mjs`: proxy read-only server-side sobre Firestore usando la identidad técnica del Cloud Run existente; requiere sesión visual temporal opaca por header; sin token falla401.
- `backend/runtime/hr-live-service/server.mjs`: enruta `view=full-profile` al proxy; HR source-safe normal permanece intacta.
- `backend/runtime/hr-live-service/Dockerfile`: incluye el módulo.
- `app/adapters/tya-dev-full-visual-bridge.js`: carga full-profile en memoria sin Firebase browser credentials; token solo en fragment/sessionStorage y se retira de la URL.
- `app/adapters/tya-live-source-refresh-watch.js`: no sobrescribe CX.data en este carril.
- `app/index-backend-dev.html`: carga el bridge.
- `app.js` conserva auto-entry Admin y picker DEV de shopper real; `/app/modules/*` intactos.

## Resultado posterior
Ver `CAMBIOS-BACKEND-ADDENDUM-C6-HUMAN-FULL-VISUAL-REDEPLOY-PASS-20260731.md` y `evidence/CORTE6-HUMAN-FULL-VISUAL-REDEPLOY-LATEST.json`.

Authorization `chat-20260731-corte6-human-full-visual-no-credential-01` consumida PASS:
- Cloud Run redeploys1;
- Hosting redeploys1;
- decisión `PASS_EXISTING_DEV_CLOUD_RUN_HOSTING_NO_CREDENTIAL_FULL_VISUAL_REMOTE_READY`;
- provider data writes0; no merge; no producción.

## Clasificación
- **Reusable CXOrbia:** human QA separado de provider Auth + proxy read-only temporal.
- **Exclusivo cliente:** datos TyA materializados/31 HOLD.
- **Claude/prototipo:** sin rediseño ni cambios de módulos UI.
- **Academia:** autenticación de proveedor vs acceso temporal de QA.
- **Sin impacto Claude:** runtime/backend/adapters DEV y gate de despliegue.
