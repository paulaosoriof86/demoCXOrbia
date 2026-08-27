# CAMBIOS-BACKEND — RC15 F4 G2-B RECOVERY — 2026-08-26

**Bloque:** `F4_G2B_RECOVERY_ONE_SHOT`  
**Estado actual:** `MECHANISM_REPAIR_4_PENDING_EXECUTION`  
**PHASE_A:** `98/100`  
**PRODUCTION_REAL_READINESS:** `76/100`

## Secuencia causal preservada

1. `1f636b79954ab0a5474f7f1ca16a7701c0f64edf`: reactivación focal del mismo workflow bajo autoridad F4. Run `33027014684` terminó `skipped` antes de job por `job if` frágil. Cero provider/lease/build/deploy.
2. `3b4cd772bb36418cfacd6798fdfb25bba2e05175`: eliminación del `job if`. Run `33027275374`: autoridad F4 PASS; source validation falló antes de GCP porque buscaba la ruta G2-B en `server.mjs`, aunque el server delega al runtime específico.
3. Incidente de materialización: commit accidental `39680648d300c2069085fc1ab6443463f64cf161` creó `__noop__`; se restauró inmediatamente por fast-forward `6c770487e89c7fe365b9ae86c840ae1dc1a03a50`. El tree restaurado `6bab6850fec7823916c44cf29ecf13e074aacf22` es idéntico al tree preincidente. Delta neto cero, sin force push y sin provider side effect.
4. `1a5006dc46003517358411c7bd7681951f81e85d`: corrigió ownership de la aserción. Run `33028658553`: autoridad F4 PASS nuevamente, pero source validation falló aún antes de GCP/provider/lease porque la ruta vive dentro de una regex JS y el archivo contiene escapes de slash; el `grep` seguía siendo una validación textual frágil.

## Causa exacta repair-4

`MECHANISM_P0_FRAGILE_TEXT_ASSERTION_ON_REGEX_SOURCE`.

No existe evidencia de fallo de producto/runtime. El source-fix `1d2cfecba0a89b637398d747a628e549d9823c68` conserva:
- provider sintético con prefijo `CXORBIA_E2E_SYNTH_` y firewalls de datos/HR real;
- server con delegación `isG2BSyntheticRuntimePath` + `maybeHandleG2BSyntheticRuntimeRequest`;
- runtime G2-B con gate `PAULA_I5_G2B_SYNTHETIC_CANONICAL_WRITE_PATH` y fail-closed `G2B_SYNTHETIC_AUTHORIZATION_REQUIRED`;
- adapter de comando sintético en Hosting;
- Dockerfile con runtime/provider G2-B;
- rewrite `/api/tenants/**` hacia `cxorbia-live-hr-dev`;
- `.firebaserc` ligado a `cxorbia-backend-dev` y target `cxorbia-dev`.

## Reparación 4

Se sustituye el conjunto de `grep` frágiles por una única validación Node semántica/fail-closed que:
- hace `node --check` de provider/runtime/server/firewall;
- comprueba símbolos y gates exactos con `String.includes` en el archivo dueño de cada responsabilidad;
- parsea `firebase.json` y exige rewrite exacto service/region;
- parsea `.firebaserc` y exige proyecto/target exactos;
- emite `F4_SOURCE_FIX_VALIDATION_PASS` solo si todo el contrato está presente;
- cualquier ausencia futura falla con `MECHANISM_P0:source_contract_missing:<campo>`.

No se cambia source funcional, runtime, adapters, Firebase config, release authorization, provider lease ni execute artifact.

## Seguridad / budget antes de repair-4

- lease `F4-G2B-PROVIDER-LEASE-20260826-01`: `ISSUED_NOT_CONSUMED`;
- provider preflight ejecutado: 0;
- provider writes: 0;
- Cloud Build: 0;
- Cloud Run update: 0;
- Hosting deploy: 0;
- Firestore/Auth/Storage/HR externa/datos reales/credenciales/pagos/Rules/Make/Gemini/merge: 0;
- retry automático: 0.

## Clasificación

- **Reusable CXOrbia:** validación semántica con códigos causales explícitos; evitar grep/regex como autoridad de source; lease permanece fuera del diagnóstico.
- **Exclusivo cliente TyA:** G2-B en `cxorbia-backend-dev`.
- **Claude/prototipo:** sin modificación frontend funcional.
- **Academia:** sin impacto funcional.
- **Sin impacto Claude:** workflow/control-plane/evidence/docs.

## Siguiente exacto

Materializar repair-4 por commit/fast-forward y observar run F4. Si source + identidad/IAM/provider preflight READ_ONLY pasan, el lease se consume una sola vez inmediatamente antes del único Cloud Build. F4 solo cierra con `RECOVERY_PASS_FULL`; entonces readiness=81/100. Si falla antes, STOP/reparación causal sin consumir el intento sensible.
