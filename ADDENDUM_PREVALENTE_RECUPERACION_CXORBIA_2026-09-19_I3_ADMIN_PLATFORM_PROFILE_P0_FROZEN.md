# ADDENDUM PREVALENTE — I3 P0 ADMIN / PLATFORM-ONLY SHOPPER VISIBILITY

**ID:** CXORBIA-I3-P0-ADMIN-PLATFORM-PROFILE-20260919  
**Estado:** FROZEN — P0_PROVEN / FIX_COMPOSED / CERTIFICATION_REQUIRED  
**Iteración:** I3 — FUNCTIONAL CLOSURE  
**Producción:** DO_NOT_TOUCH

## Evidencia causal

Run 264 (`35474748670`) ejecutó la suite viva estabilizada sobre el source certificado `751d01397bcd85903456e5cb78e3e5ce41161b17`.

PASS material: Shopper GT, Shopper HN, nombre con tilde, nombre compuesto, histórico/KPIs, reserva y Cliente. Los cuatro shoppers sintéticos tuvieron provider ACK, login visible y cleanup/readback de ausencia. Build=0, deploy=0, HR writes=0.

Primer fallo real: `FUNCTIONAL_DEFECT:ADMIN_FIXTURE_VISIBILITY_OR_SCOPE`.

El owner probado es `app/adapters/tya-cumulative-read-model-v2.js`: el compositor construía `result.shoppers` únicamente a partir de shoppers base HR y enviaba perfiles protegidos sin crosswalk HR a `platformOnlyProfiles`/review queue con `unmatchedProfilesExcludedFromOperationalList:true`. El bridge asigna `CX.data.shoppers=result.shoppers` y el módulo Admin Shoppers renderiza esa colección. Por eso un shopper creado válidamente por provider podía autenticarse y ver su propio perfil, pero no aparecer al Admin.

## Corrección única permitida

Candidata de producto: `6bcbc1df70c29c2ad3ad57ecfa906917e6372ace`  
Tree: `fa044d1527ccad25508c709043eeda2a829bae2e`

El compositor presenta a roles autorizados solamente perfiles platform-only significativos cuyo `projectIds` contiene el `hr.currentProjectId` activo.

Invariantes:
- no convierte el perfil platform-only en identidad HR;
- marca `__platformOnlyProfile=true`, `__hrIdentityPresent=false`, `__hrOwnedOperational=false`;
- mantiene el perfil en identity review mientras no exista crosswalk HR exacto;
- excluye perfiles de otros proyectos;
- no crea visitas ni altera campos HR-managed;
- visitas/KPIs del perfil se derivan únicamente de visitas realmente compuestas;
- no usa fuzzy matching;
- no escribe HR;
- no toca producción.

Regresión automática añadida en `backend/runtime/hr-live-service/test/cxorbia-gate7-operational-assignment.test.mjs` para comprobar visibilidad project-scoped, campos de identidad, cero KPIs inventados, cero duplicados y exclusión cross-project.

## Camino de cierre

Un solo movimiento de rama publicará product successor + control successor. El workflow canónico debe ejecutar:

`certify exact source → same-run 10-case live fixtures → Gate21 same artifact`.

No habrá segundo build entre certificación y Gate21. Si las 10 pruebas vivas no pasan, clasificar únicamente el primer fallo reproducible y no abrir otra candidata paralela.
