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
