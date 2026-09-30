# ADDENDUM PREVALENTE — I3 MICRO-ITERATIONS FROZEN

**Fecha:** 2026-09-17  
**ID:** `CXORBIA-I3-MICRO-ITERATIONS-20260917`  
**Estado:** `FROZEN_UNTIL_I3_TERMINAL_LOCK`

## 1. Propósito
Este addendum congela la secuencia incremental para cerrar I3 sin depender de una conversación y sin reabrir I0, I1, I2 ni diagnósticos generales. Complementa el `I3 EXECUTION FAST LANE` y no sustituye las autoridades superiores de Recovery.

## 2. Identidad única de producto
- Repositorio: `paulaosoriof86/demoCXOrbia`
- Rama canónica: `recovery/cxorbia-phase-a-20260831`
- Fuente única I3: `b94911a4748c03c2e604415e8a97ee091da96218`
- Tree de producto: `e3efd4afa9ffcb973e66e40e08798eba4e6c0f34`
- Clasificación del bloqueo que se corrige: `RELEASE_COMPOSITION_FAILURE`
- Regla: una fuente -> un build -> un artefacto -> todos los gates terminales -> promoción exacta a I4.

## 3. Micro-iteraciones congeladas
1. `MI3.1_SOURCE_LOCK` — fijar SHA/tree únicos y demostrar ausencia de drift de producto. No modifica módulos.
2. `MI3.2_CONTROL_PLANE_BINDING` — corregir exclusivamente el carril terminal para que Gate 21 consuma el artefacto producido por la certificación I3. Prohibidos SHAs/runs/artifacts históricos como fuente de release.
3. `MI3.3_SERVER_CERTIFICATION` — GitHub Actions ejecuta sobre la misma fuente: build único, DEV runtime/hosting, HR fresca, persistencia P0 focal, Gate 20 sobre la misma fuente y empaquetado de un único artefacto.
4. `MI3.4_GATE21_INTEGRITY` — Gate 21 descarga ese mismo artefacto, verifica source/tree/hash/Gate20/runtime/hosting y genera el manifest terminal. `rebuilds=0`, `deploys=0`.
5. `MI3.5_I3_TERMINAL_LOCK` — si todo pasa, registrar `I3=GO`; ante FAIL, clasificar únicamente por la taxonomía Recovery y corregir solo el owner probado. No repetir gates PASS sin drift reproducible.
6. `MI4.1_IMMUTABLE_PRODUCTION_REPLACEMENT` — solo con autorización expresa de Paula: publicar exactamente el artefacto certificado, sin rebuild, verificar P0/DOM/fingerprint/no duplicados y crear `PRODUCTION_LOCK`.

## 4. Reglas de continuidad
- El estado durable está en GitHub: HEAD/tree, run_id, jobs, artifacts, manifest y locks.
- Una interrupción de ChatGPT/UI/conector no reinicia ninguna micro-iteración.
- Al cambiar de conversación se reanuda desde el último readback material de GitHub; el chat no es autoridad de estado.
- No se crea otra rama, candidata, Firebase, overlay, materializador, importador, workflow paralelo ni metodología.
- `main` no es autoridad.
- Producción no se toca antes de `I3=GO` y autorización explícita.
- Cinépolis permanece como proyecto P0 prioritario y debe quedar íntegramente operativo antes del cierre I3/I4; la incorporación del siguiente proyecto no autoriza relajar estos contratos.

## 5. Siguiente acción exacta
Aplicar una única corrección focal del control plane: Gate 21 debe ser invocado por la certificación I3 y verificar el mismo artefacto producido por ella, sin rebuild ni deploy. Inmediatamente después: readback del commit/parent/tree/workflows y continuidad por el `run_id` server-side hasta `I3=GO` o FAIL clasificado.
