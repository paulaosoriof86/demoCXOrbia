# CAMBIOS-BACKEND — Addendum I3.11B

Fecha: 2026-08-17
Estado al preparar fuente: `I3_11B_SOURCE_FIXED_PENDING_SINGLE_HOSTING_DEV_GATE`
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: `#7` abierto, sin merge

## Bloque autorizado

`I3.11B_IDENTITY_LINK_PRECOMPOSE_EXACT_BRIDGE_HOSTING_DEV_CLOSE`.

Límites: máximo 1 Hosting DEV; 0 Firestore Rules deploys; Staff read-only exclusivamente; 0 Historical Shopper; 0 Auth/user/password/claims/Firestore-data/HR/Finance/Storage/Make/Gemini/pagos writes; 0 Cloud Run; 0 merge; 0 producción. I3.9 e I3.10 se reutilizan congelados PASS y no se repite login ni cambio de contraseña del Shopper sintético.

## Causa raíz cerrada a nivel de fuente

`cxorbia-provider-identity-link-runtime-v1.js` ya leía `shopperIdentityLinks` antes del backend, pero el compositor acumulativo podía resolver el cruce antes de que el alias provider-backed quedara incorporado al perfil protegido. El documento exacto estaba disponible, pero no entraba como autoridad técnica pre-composición.

## Cambio focalizado

Se modifica únicamente el adapter provider-backed para instalar un bridge precompose exact-only sobre `CX_TYA_CUMULATIVE_READ_MODEL.compose`.

El bridge:
- usa solo links provider `active`, `periodIndependent=true`, `providerAck=true`;
- exige match técnico exacto y único del perfil protegido;
- reexpresa ese perfil con `canonicalShopperId` antes del compositor;
- conserva el live ID exclusivamente como alias técnico exacto;
- falla cerrado si no encuentra perfil o existe ambigüedad;
- no usa nombre, email, teléfono ni fuzzy matching;
- no escribe provider ni Firestore.

Se adapta el workflow existente `cxorbia-c6-dev-root-entrypoint-hosting.yml` al gate I3.11B: Hosting DEV una vez y validación integral Staff read-only posterior. No contiene comando de deploy de Firestore Rules y bloquea rerun (`GITHUB_RUN_ATTEMPT=1`).

## Archivos de este source-fix

- `app/adapters/cxorbia-provider-identity-link-runtime-v1.js`
- `.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml`
- este addendum
- `RESUMEN-PARA-CLAUDE-ADDENDUM-I3-11B-20260817.md`
- `PENDIENTES-PROTOTIPO-ADDENDUM-I3-11B-20260817.md`

## Evidencia previa preservada

I3.4 PASS, I3.6 PASS e I3.7 PASS en Staff read-only. I3.9 e I3.10 permanecen congelados PASS. El único fallo a cerrar es I3.5: `shp-57d2e3769946` todavía tenía 2 visitas agosto y `TYA_GT_0C0BA8856E` 0.

## Criterio de cierre

PASS integral exige simultáneamente:
- `identityMap['shp-57d2e3769946']='TYA_GT_0C0BA8856E'`;
- 2 visitas agosto canonical;
- 0 visitas agosto residuales;
- I3.4/I3.6/I3.7 PASS;
- I3.9/I3.10 solo reutilizados;
- todos los writes prohibidos en 0.

Hasta esa evidencia el avance formal permanece 35%. Con PASS integral sube directamente a 60%.

## Clasificación

- Reusable CXOrbia: bridge provider exact-only precompose y fail-closed.
- Exclusivo cliente: par de identidad TyA usado como prueba de cierre.
- Claude/prototipo: sin cambio UI; no parchear módulos.
- Academia: sin cambio de contenido; se preservan rutas/roles existentes.
- Sin impacto Claude: deploy gate, seguridad y readback técnico.
