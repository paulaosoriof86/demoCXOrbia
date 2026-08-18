# CAMBIOS-BACKEND — Addendum I3.11B

Fecha: 2026-08-17
Estado vigente: `I3_11B_QA_READINESS_RACE_PROVEN_SOURCE_FIX_PENDING_NO_MORE_DEPLOY`
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

## Intento pre-provider no consumido

El primer request I3.11B (`2035bb04f2c1e7d23973f018b46dca402a70f6a6`) quedó en HOLD antes de Hosting: el validador exigía erróneamente `provider < composer`, mientras `index-backend-dev.html` carga correctamente `composer < provider < protected authority bridge`. El paso de validación ocurre antes del comando de Hosting, por lo que este HOLD no consume el único deploy autorizado.

Se corrigió únicamente el validador del workflow en `ff20779942db0d2e36f66b4684bcfdfa4552208b` para reflejar el orden real. No se habilitó retry del run fallido; el workflow conserva `GITHUB_RUN_ATTEMPT=1`.

## Nueva causa raíz del bucle demostrada — readiness del harness

La adjudicación Staff-only posterior (`run 32096259040`, `job 95588223408`, artifact `9310057053`) demuestra un segundo problema independiente del producto: el harness de browser declara `waitReady()` antes de que se cumplan las condiciones que `validate()` exige inmediatamente después.

La evidencia capturada al fallar muestra simultáneamente:
- Auth Staff `admin` y namespace `staff` correctos;
- membership verificada;
- handoff frontend `entered` y verificado;
- autoridad HR aplicada;
- 15 periodos, 660 visitas y 214 shoppers;
- proyecto `cinepolis` y periodo `cinepolis-2026-08` activos;
- `dataStatus=ready`, `dataMode=connected`;
- app encendida y login oculto;
- 0 duplicados de visitas y shoppers;
- autoridad de postulaciones lista;
- 0 visitas residuales de agosto bajo `shp-57d2e3769946` en esa captura;
- pero router/view/selectores todavía no montados y runtime legal todavía cargando.

El error exacto fue `staff_first_ROUTER_SHELL_NOT_MOUNTED`. El archivo `tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs` espera en `waitReady()` Auth/membership/HR/data/app/login, pero no espera router shell, view, selectores, legal settlement ni —en modo I3 extendido— la estabilización del `identityMap`. Luego `validate()` exige esos estados de inmediato. Esto produce un falso negativo de carrera y puede convertir una ejecución todavía en transición en un HOLD formal.

Esta capa explica por qué varias iteraciones parecían volver a encontrar otra causa tras un fix real: se mezclaron un bug de producto con un bug de observación/readiness del gate.

## Circuit breaker definitivo

Desde este hallazgo queda bloqueado repetir el patrón `nuevo deploy → snapshot temprano → nuevo diagnóstico`.

Siguiente y única corrección permitida antes de otra adjudicación:
1. corregir `waitReady()` para que su frontera sea igual o más estricta que `validate()`;
2. esperar router shell, view, selectores y estado legal estable;
3. en `extendedI3`, esperar también el cruce exacto `shp-57d2e3769946 → TYA_GT_0C0BA8856E`, 2 visitas agosto canonical y 0 residuales, o agotar el timeout y capturar entonces un fallo estable real;
4. ejecutar después una sola prueba Staff read-only sin Hosting, sin Rules y sin provider writes;
5. si el estado estable no converge, detenerse sobre esa única evidencia y no volver a desplegar ni a rehacer diagnóstico amplio.

Hasta recuperar evidencia exacta del run I3.11B que determine el contador efectivo de Hosting, se asume conservadoramente que no hay autorización disponible para otro Hosting. No se hará otro deploy por inferencia.

## Adjudicación Staff-only — seguridad

La ejecución `32096259040` no tocó Historical Shopper y mantuvo en cero Auth/user/password/Firestore/HR/Rules/Storage/Make/Gemini/pagos/deploys/merge/producción. El fallo 403 al intentar comentar el PR ocurrió después de generar/subir evidencia y es telemetría del workflow; no es causa del fallo de producto.

## Archivos de este source-fix

- `app/adapters/cxorbia-provider-identity-link-runtime-v1.js`
- `.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml`
- este addendum
- `RESUMEN-PARA-CLAUDE-ADDENDUM-I3-11B-20260817.md`
- `PENDIENTES-PROTOTIPO-ADDENDUM-I3-11B-20260817.md`

## Evidencia previa preservada

I3.4 PASS, I3.6 PASS e I3.7 PASS en Staff read-only antes de la ejecución afectada por la carrera. I3.9 e I3.10 permanecen congelados PASS. La ejecución afectada por readiness no se usa para declarar regresión de I3.4/I3.7 porque no alcanzó el estado estable que el propio validador exige. I3.6 continuó PASS incluso en esa ejecución.

## Criterio de cierre

PASS integral exige simultáneamente, ya sobre estado estable:
- `identityMap['shp-57d2e3769946']='TYA_GT_0C0BA8856E'`;
- 2 visitas agosto canonical;
- 0 visitas agosto residuales;
- I3.4/I3.6/I3.7 PASS;
- I3.9/I3.10 solo reutilizados;
- todos los writes prohibidos en 0.

Hasta esa evidencia el avance formal permanece 35%. Con PASS integral sube directamente a 60%.

## Clasificación

- Reusable CXOrbia: bridge provider exact-only precompose, fail-closed y regla de readiness observable alineada con validación.
- Exclusivo cliente: par de identidad TyA usado como prueba de cierre.
- Claude/prototipo: sin cambio UI; no parchear módulos.
- Academia: sin cambio de contenido; se preservan rutas/roles existentes.
- Sin impacto Claude: deploy gate, seguridad, readback técnico y corrección del harness QA.
