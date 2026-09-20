# ADDENDUM PREVALENTE — I3 DEEP FORENSIC ROOT CAUSE FROZEN
Fecha: 2026-09-19
Proyecto: CXORBIA RECOVERY — GO-LIVE
Iteración: I3 FUNCTIONAL CLOSURE
Estado al congelar: HOLD
Producción: DO_NOT_TOUCH

## 1. Propósito y prevalencia
Este addendum congela la auditoría forense profunda ejecutada después de Run 267. Prevalece sobre interpretaciones previas que trataron los fallos 245–267 como una secuencia de defectos independientes del producto. No reabre I0–I2 ni gates PASS. No autoriza I4.

## 2. Candidata de producto congelada
Product source SHA: 6bcbc1df70c29c2ad3ad57ecfa906917e6372ace
Product tree SHA: fa044d1527ccad25508c709043eeda2a829bae2e
Entre este product source y HEAD 63c2395ec26bd741205a4491dff19e06c8cec4f6 no existe drift de runtime-product; los tres commits posteriores sólo afectan workflow/control/evidencia.
Run 267 certificó con PASS Steps 1–27, incluido Step 23 exhaustive Admin/Shopper GT/Shopper HN/Client acceptance, Gate20, package, upload y cleanup.

## 3. Causa raíz profunda demostrada
Clasificación: RELEASE_COMPOSITION_FAILURE.
Código canónico: I3_CONTROL_PLANE_MULTI_AUTHORITY_AND_RUNTIME_TEST_RECOMPOSITION.

La causa sistémica no es un filename faltante ni Auth global. La capa de certificación acumuló múltiples autoridades y reimplementaciones:
1. workflow I3 mutable durante la certificación;
2. human acceptance y live fixtures con lifecycles Auth/browser independientes;
3. live fixtures generadas en runtime desde un .mjs.gz y reescritas por Python mediante anchors textuales;
4. política product-drift distinta entre certify/live-fixtures/Gate21;
5. allowlist HEAD^..HEAD heredado del modo fixtures-only;
6. ruta legacy [i3-live-fixtures-only] incompatible con el modelo same-run actual;
7. manifest con contrato credentialRule hardcodeado v1 mientras la autoridad congelada vigente es v2;
8. Gate21 sin hash/binding explícito de PASS_I3_LIVE_FIXTURES_V2 10/10;
9. pasos if:always producen FAIL secundarios cuando un preflight no generó evidencia.

## 4. Evidencia histórica mínima
- El workflow de certificación registra 195 modificaciones entre 2026-09-02 y 2026-09-19.
- RECOVERY-I3-HUMAN-LIVE-ACCEPTANCE-20260918.mjs registra 28 modificaciones.
- PATCH-I3-LIVE-FIXTURES-V2-20260919.py registra 9 modificaciones el 2026-09-19.
- Runs 245/246/249/252/257/262/263/267 tuvieron fallos originados en control-plane/patch/composición.
- Run 251 probó provider→password→Firebase→context→membership→cleanup para Shopper.
- Run 264 sí demostró el P0 funcional ADMIN_PLATFORM_ONLY_PROFILES_EXCLUDED_FROM_COMPOSED_SHOPPER_LIST; la corrección está en la candidata 6bcbc1df...
- Run 267 pasó la aceptación exhaustiva y falló después, antes de las 10 fixtures, en un guard legacy de control-only.

## 5. Regla anti-loop reforzada
Queda PROHIBIDO resolver el cierre agregando individualmente filenames a allowlists, nuevos retries por run, otro patcher, otro gzip, otro modo de rerun, otro workflow paralelo, otra candidata o otra autoridad de source.
Un FAIL futuro sólo puede tocar producto si ocurre después de control-plane determinista y demuestra P0_PROVEN reproducible sobre la candidata exacta.

## 6. Corrección estructural obligatoria antes de otro run
Debe ejecutarse en una sola intervención control-plane:
A. mantener source/tree de producto congelados;
B. retirar recomposición runtime .gz + Python del camino ejecutable y usar una suite live plaintext/versionada;
C. unificar el helper/lifecycle Auth-browser entre acceptance y live fixtures;
D. una sola definición canónica de product drift para certify/live-fixtures/Gate21;
E. retirar [i3-live-fixtures-only] y rutas legacy activas;
F. derivar credentialRule.version desde evidencia canónica v2, no hardcodear v1;
G. Gate21 debe verificar y hashear evidencia same-run de live fixtures: decision PASS_I3_LIVE_FIXTURES_V2, 10/10, cleanup.ok=true, buildCountThisRun=0, deployCountThisRun=0, production=false;
H. un FAIL causal único; cleanup siempre, pero uploads/asserts no deben fabricar fallos secundarios;
I. readback estático completo antes de permitir el siguiente run.

## 7. Único carril de salida
Después de la corrección estructural:
certify → exhaustive acceptance → Gate20 → artifact único → live fixtures 10/10 + cleanup → Gate21 same-artifact + live-fixture binding.
Sólo si todo termina PASS, I3 puede pasar a GO. Después Paula revisa DEV y se solicita autorización explícita para I4. Producción final sigue https://tya-plataforma.web.app/ y el deploy I4 debe usar exactamente el artifact certificado, sin rebuild.

## 8. Estado congelado
I3=HOLD.
P0 funcional nuevo=NINGUNO.
Producto=NO CAMBIAR.
Producción=DO_NOT_TOUCH.
Siguiente acción=corrección estructural única del control-plane conforme a §6, luego un solo run canónico.


## 9. Evidencia Run 268 — identidad Auth vs shopperId
Run 268 (35479768269) cerró certify completo en SUCCESS: Steps 1–27, aceptación exhaustiva Step 23, Gate20, artifact y cleanup. Live-fixtures pasó preflight, autenticación Firebase y binding same-run; ejecutó la suite y produjo evidencia con cleanup.ok=true, buildCountThisRun=0, deployCountThisRun=0, production=false.

El primer causal fue MAPPING_FAILURE del helper visible Shopper: exigía firebase.auth().currentUser.uid === shopperId operacional. La candidata congelada demuestra que son namespaces distintos: stableShopperUid(tenantId,shopperId) produce uid cx-sh-<hash>, mientras canonicalClaims conserva shopperId como claim operacional. El diagnóstico de Run 268 mostró Firebase user presente, backend context authenticated=true, role=shopper, tenant=tya, shopperId correcto y HR authority aplicada, pero firebaseUidMatches=false.

Corrección congelada: visible Shopper debe probar credenciales por login real fresco y validar principal mediante Firebase user presente + token claims role/tenant/project/shopperId + backendAuth.context + HR authority. Queda prohibido volver a asumir uid === shopperId. El UID exacto sólo es válido cuando el contrato específico define el principal técnico, como custom-token staff/client.


## 10. Run 269 — P0 HR→durable visit reconciliation

Run 269 (`35482104368`) demuestra que la composición de release NO está desincronizada: source/tree/control/artifact/Hosting/matrix están alineados, full human acceptance PASS y Gate20 PASS. Live fixtures alcanzó 8/10 con cleanup=true, build=0, deploy=0, production=false.

El primer causal restante fue `ENVIRONMENT_FAILURE:ASSIGNMENT_VISIT_NOT_AVAILABLE_AT_READBACK`. La inspección del source certificado demostró un P0 real distinto del control-plane:

**Clasificación:** `PERSISTENCE_FAILURE`  
**Código:** `HR_VISIT_STATE_NOT_RECONCILED_TO_DURABLE_READBACK`  
**Owner:** `backend/runtime/cxorbia-operational-command-provider-v1.mjs`

`reconcileAuthoritativeVisits()` refrescaba el snapshot HR, pero `reconcileVisitDoc()` para visitas ya existentes sólo actualizaba period/revision metadata. No reconciliaba `estado/status/shopperId/assignmentSource/assignmentSyncStatus/canonicalFacets`. Por tanto HR podía declarar una visita elegible/no asignada mientras Firestore durable conservaba un estado operacional anterior.

### Corrección P0 congelada
Nueva product source: `815eecb2b5b01001bd1f6455bae622159f0ca3e5`  
Tree: `32e04ac5e9631d94b42e421b083b6264df2964a9`  
Provider blob: `3c8f0e91a64c9b981d920de69316335ee21dc98c`

La corrección:
1. reconcilia el estado operacional durable con la autoridad HR incluso si el sourceRevision ya coincide;
2. preserva asignaciones platform `pending_hr` mientras HR siga sin asignación;
3. al reflejar HR el mismo shopper, marca la sincronización como `synced`;
4. mantiene conflicto fail-closed si HR refleja otro shopper;
5. bloquea `visit.assign`, aprobación de postulación y cruce de reserva cuando una visita durable no está disponible.

Regresión exacta: `backend/runtime/hr-live-service/test/cxorbia-gate7-operational-assignment.test.mjs` = 9/9 PASS, incluyendo transición HR entre revisiones, reparación stale same-revision, preservación pending_hr y rechazo de asignación stale.

No hubo reimport, reconstrucción de módulo, nueva rama, nuevo Firebase ni cambio de producción.


## 11. Run 270 — fixture availability mapping root cause

Run 270 (`35484041170`) certificó correctamente product source `815eecb2b5b01001bd1f6455bae622159f0ca3e5`, tree `32e04ac5e9631d94b42e421b083b6264df2964a9`: MODULE_TRUTH_MATRIX exhaustiva PASS, contratos P0 PASS, build único PASS, DEV runtime/Hosting exactos PASS, HR fresca PASS, persistencia focal PASS, aceptación exhaustiva Step 23 PASS, Gate20 PASS y artifact único PASS. No existe evidencia de release/candidate/cache desynchronization en este run.

La suite viva volvió a 8/10 con cleanup=true, build=0, deploy=0, production=false y el mismo texto `ASSIGNMENT_VISIT_NOT_AVAILABLE_AT_READBACK`. La inspección del fixture exacto demostró la causa persistente:

**Clasificación:** `MAPPING_FAILURE`  
**Código:** `LIVE_FIXTURE_UNSCOPED_RAW_HR_AVAILABILITY`  
**Owner:** `.github/control/RECOVERY-I3-LIVE-FIXTURES-20260919-V3.mjs.gz`

El fixture seleccionaba `available[0]` y `available[1]` desde todas las visitas HR crudas, sin filtrar por `PERIOD_ID`. La evidencia HR del artifact contenía como primer disponible una visita de `2026-08`, mientras Run 270 certificaba `cinepolis-2026-09`. Además, el harness equiparaba disponibilidad HR cruda con disponibilidad canónica, ignorando la semántica aprobada donde una asignación durable `platform/pending_hr` vuelve la visita canónicamente no disponible aunque HR todavía no la refleje.

### Corrección control-only congelada
- product source permanece `815eecb2b5b01001bd1f6455bae622159f0ca3e5`;
- product tree permanece `32e04ac5e9631d94b42e421b083b6264df2964a9`;
- no se cambia app/backend/Firebase ni se abre otra candidata de producto;
- fixture plaintext SHA-256: `665da6b23bc0ca2b996c4333d05f6a401f6247c0cae2f3c77faaccb39b219a33`;
- fixture gzip SHA-256: `1c360186f162029a6a0be74929e36148539902013e71097d92b0c3f6edce5e95`.

La suite corregida:
1. resuelve el período HR exacto correspondiente a `PERIOD_ID`;
2. selecciona sólo visitas HR elegibles/no asignadas de ese período;
3. exige materialización durable;
4. exige revisión HR compatible;
5. usa disponibilidad durable canónica;
6. excluye únicamente overlays `platform/pending_hr` válidos;
7. cualquier otra divergencia HR↔durable falla como `PERSISTENCE_FAILURE`.

El P0 de reconciliación HR→durable de Run 269 fue un gap real y permanece corregido y probado; Run 270 demuestra que no era la causa suficiente del bloqueo repetido 8/10.


## 12. Run 272 — single pinned HR revision per certification

Run 272 (`35485676769`) mantuvo product source `815eecb2b5b01001bd1f6455bae622159f0ca3e5` / tree `32e04ac5e9631d94b42e421b083b6264df2964a9` y cerró certify completo, Step23, Gate20 y artifact en PASS. Live fixtures llegó a 8/10 y falló con `PERSISTENCE_FAILURE:HR_DURABLE_REVISION_DIVERGENCE`.

La evidencia física demostró múltiples revisiones externas HR dentro del mismo run: Step17 `fd2dfae9cc8255d20c40e66e4e0d3caa07cb43f2fa2f22b3a39123c9d2fdd9bb`; aceptación humana `12647741564672d789f62ed74f9f02aa7c394193958f4d0b49c02b2fa5a7f773`; y live fixtures hacía otro refresh.

**Clasificación:** `RELEASE_COMPOSITION_FAILURE`  
**Código:** `MULTIPLE_HR_REVISIONS_WITHIN_SINGLE_CERTIFICATION_RUN`

Step17 queda como única autoridad `fresh=1`. Human acceptance y live fixtures consumen su `hr-fresh.json` sin refresh. El manifest sella `hrRevision` y `hrEvidenceSha256`; Gate21 verifica la misma revisión/hash en certification, human acceptance y live fixtures. No cambia producto, no reimporta y no toca producción.


## 13. Run 273 — live fixture result scope error

Run 273 (`35488583593`) mantuvo product source `815eecb2b5b01001bd1f6455bae622159f0ca3e5` / tree `32e04ac5e9631d94b42e421b083b6264df2964a9`. Certify completo, Step23, Gate20 y artifact cerraron PASS. La revisión HR pinneada fue `9534505d9b0d6cf422a4a11990633a7b2231d31fda6281bf79e57adce78777fe` y el binding same-run pasó.

El job live-fixtures terminó la ejecución y cleanup, pero no pudo materializar `i3-live-fixtures-result.json`: `ReferenceError: hrRevision is not defined` en la construcción final del resultado. `hrRevision` estaba declarada dentro del bloque `try` y se referenciaba desde `finally`.

**Clasificación:** `RELEASE_COMPOSITION_FAILURE`  
**Código:** `LIVE_FIXTURE_RESULT_SCOPE_ERROR`

Corrección congelada: mover únicamente `hrRevision` al scope exterior del harness V4 y asignarla dentro del `try`. No cambia producto, workflow, HR, Auth, datos ni producción. El siguiente run debe demostrar físicamente 10/10, cleanup, artifact de live fixtures y Gate21.


## 14. Run 274 — runtime HR cache window not pinned

Run 274 (`35489834648`) mantuvo product source `815eecb2b5b01001bd1f6455bae622159f0ca3e5` / tree `32e04ac5e9631d94b42e421b083b6264df2964a9`. Steps 1–20 pasaron. Step21 falló por timeout exactamente en la espera de autoridad/datos HR de la UI, después de que Firebase y `backendAuth.context()` ya estaban autenticados.

El runtime usa `CXORBIA_LIVE_HR_CACHE_MS=55000` por defecto. Step17 terminó ~04:45:46Z y Step21 comenzó ~04:48:05Z (~139 s después), fuera del TTL. El control-plane había pinneado el archivo HR, pero no la ventana del runtime vivo, por lo que el boot podía activar un refresh de fondo y dejar de estar garantizado sobre la misma revisión.

**Observed:** `ENVIRONMENT_FAILURE:HUMAN_LANE_AUTHORITY_SETTLE_TIMEOUT`  
**Structural:** `RELEASE_COMPOSITION_FAILURE:CERTIFICATION_HR_CACHE_WINDOW_NOT_PINNED`

Corrección: en I3 DEV el mismo immutable image usa `CXORBIA_LIVE_HR_CACHE_MS=3600000`; Step17 sigue siendo el único `fresh=1`; Step21 exige `PINNED_HR_REVISION` con retry/diagnóstico acotado; Step23 exige la misma revisión en cada ruta y Admin. Manifest/live fixtures/Gate21 continúan sellando la misma revisión/hash. No cambia producto, no reimporta y no toca producción.


## 15. Run 275 — process-local HR cache / multi-instance divergence

Run 275 (`35490346169`) mantuvo product source `815eecb2b5b01001bd1f6455bae622159f0ca3e5` / tree `32e04ac5e9631d94b42e421b083b6264df2964a9`. Steps 1–20 pasaron. En Step21, Firebase y `backendAuth.context()` estaban autenticados, HR authority aplicada, gate ready/no-blocked, source correcto, proyecto `cinepolis`, periodo `cinepolis-2026-09`, 16 periodos y 704 visitas. El único desacuerdo fue la revisión: pin `ea5eae3b9b53955223c355168bfa2edf4918ebf64841754889419c30a4c86c5f` versus UI `51663e313d2b079ef59787e790df9ec356dd84cea8bade90c864cfbf76888abb`.

El runtime implementa `let cache=null` en memoria de proceso y `loadBootstrap()` carga `build_bootstrap` al arrancar. No se encontró otro consumidor explícito `fresh=1`. El workflow no imponía scaling de una instancia. Ampliar `CACHE_MS` no sincroniza procesos distintos.

**Clasificación:** `RELEASE_COMPOSITION_FAILURE`  
**Código:** `PROCESS_LOCAL_HR_CACHE_MULTI_INSTANCE_DIVERGENCE`

Corrección I3 DEV: mismo immutable image, `min-instances=1`, `max-instances=1`, cache 3.600.000 ms, Step17 único `fresh=1`, cinco readbacks por Hosting y cinco por URL directa exigiendo la misma revisión y `cacheOrigin=runtime_refresh` antes de Step21. Step21/Step23/live fixtures/Gate21 conservan revisión exacta. No cambia producto, no reimporta y no toca producción.
