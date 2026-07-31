# CAMBIOS BACKEND — Corte 6 human visual sin credenciales · corrección de raíz

**Fecha:** 2026-07-31  
**Estado:** `C6_PROFILE_WRITE_PASS__HUMAN_VISUAL_AUTH_DESVIO_CONFIRMED__NO_CREDENTIAL_FULL_VISUAL_FIX_PREPARED__WAITING_1X_CLOUD_RUN_1X_HOSTING_AUTH__31_HOLD__NO_PRODUCTION`

## Hallazgo y corrección metodológica
La validación humana de Paula nunca debía depender de conocer credenciales Firebase. El contrato previo ya separaba:
- human visual DEV: auto-entry del prototipo, sin prompt de credenciales;
- Firebase Auth/claims/Rules: gate técnico/provider validado por separado.

El desvío fue convertir el carril protegido Firebase en requisito para la visual humana. La persistencia `LOCAL` no resuelve la ausencia deliberada de credenciales humanas; por tanto ese enfoque queda **superseded para human visual**. El carril protegido se conserva como gate técnico.

## Corrección preparada
Sin provider mutation todavía:
- `backend/runtime/hr-live-service/dev-visual.mjs`: proxy read-only server-side sobre Firestore usando la service account del Cloud Run existente; requiere token visual temporal opaco por header; el hash/expiración son configurables y el token crudo no se commitea.
- `backend/runtime/hr-live-service/server.mjs`: enruta `view=full-profile` al proxy; sin token falla 401; HR source-safe normal permanece intacta.
- `backend/runtime/hr-live-service/Dockerfile`: incluye el módulo.
- `app/adapters/tya-dev-full-visual-bridge.js`: human visual full-profile sin Firebase browser credentials; token solo en fragment/sessionStorage y se retira de la URL; aplica perfil completo/visitas/postulaciones/certificaciones/liquidaciones en memoria.
- `app/adapters/tya-live-source-refresh-watch.js`: no sobrescribe CX.data en este carril.
- `app/index-backend-dev.html`: carga el bridge.
- El flujo existente `app.js` conserva auto-entry Admin y el picker DEV de shopper real; no se modifica ningún `/app/modules/*`.

## Seguridad operativa del fix
- full-profile no queda público: sin token temporal devuelve 401;
- el token crudo no está en repo y expira;
- browser no necesita username/password Firebase;
- Firebase Auth/claims/Rules no se eliminan ni se debilitan: continúan como gate técnico separado;
- cero Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes;
- no producción, no merge.

## Gate preparado
Request `backend/config/corte6-human-full-visual-redeploy-request.json` permanece `enabled=false`, `consumed=false`, sin autorización. Se reutiliza el workflow backend existente `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml`, ahora disparado únicamente por execute marker posterior a autorización.

El gate solicitado será máximo:
1. 1 redeploy del Cloud Run DEV existente `cxorbia-live-hr-dev`;
2. 1 redeploy del Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`;
3. remote smoke fail-closed + assets;
4. enlace temporal human visual sin credenciales → Admin + shopper picker → perfil/KPI/histórico.

## Clasificación
- **Reusable CXOrbia:** separar human QA de provider Auth y usar proxy server-side read-only con sesión visual temporal.
- **Exclusivo cliente:** datos TyA materializados; no lógica especial Cinépolis fuera de configuración.
- **Claude/prototipo:** sin rediseño ni cambios en módulos UI.
- **Academia:** diferencia entre autenticación de proveedor y acceso temporal de QA humano.
- **Sin impacto Claude:** runtime/backend/adapters DEV y gate de despliegue.
