# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_P0_OPEN__PROTECTED_PROFILE_AUTH_HISTORY_READONLY_PASS__88_USERNAME_DELTA_READY__RUNTIME_FIX_PREPARED__NO_WRITE__NO_DEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Corte1/2A/3 FROZEN.
- R17N FINAL 1,406/1,406; no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS; no reimportar por rutina.
- HR live auto-month PASS.
- último one-shot Cloud Run+Hosting consumido; no reutilizar.

## 2. P0 Shopper — diagnóstico actualizado
El fallo visual `Evaluador (sin identidad)` no se resuelve con selector demo ni `sh1`.

Read-only provider ahora prueba:
- 91 cuentas Shopper tienen claim `shopperId`;
- 91/91 resuelven un perfil Firestore existente;
- 0 claims shopper apuntan a perfil faltante.

La ruta correcta es Auth real → claim shopperId → perfil propio → módulos shopper.

## 3. P0 Admin — datos protegidos
Firestore actual contiene:
- shoppers340;
- identidad visible313;
- teléfono123;
- email39;
- username0;
- documento0;
- datos banco/pago0;
- certs embebidos0.

La ruta `display_name_only` descartaba teléfono/email aunque sí existían. La siguiente visual debe ser protected runtime.

## 4. Username
Dry-run desde bundle cifrado:
- 109 registros shopper;
- 88 exactos por `legacyShopperId` + binding Auth claim;
- delta username `fill-missing-only`:88;
- conflictos0;
- 21 sin perfil exacto: HOLD.

Pendiente: write plan idempotente y autorización Firestore específica. No ejecutar todavía.

## 5. Password
No existe password recuperable desde Firebase Auth. El bundle seguro contiene hashes.

Pendiente de producto:
- username visible a Superadmin;
- estado de credencial;
- contraseña inicial solo si se verifica contra fuente segura;
- reset al patrón solo con autorización Auth específica;
- nunca password en JS/repo/Firestore.

## 6. Histórico/KPI
Read-only canónico:
- 616 visitas;
- 616/616 con shopperId;
- 194 shopperId distintos;
- perfiles194/194;
- submitida545, cuestionario61, agendada4, realizada3, fuera_rango3.

El filtro legacy de `shopperStats` subcontaba `submitida`. Runtime protegido ya tiene bridge preparado para histórico completo/KPI canónico sin rediseñar módulos.

## 7. Fix preparado, no desplegado
- protected lane ya no es sobreescrito por source-safe;
- watcher HR source-safe queda desactivado en protected runtime;
- aliases phone/WhatsApp/email/documento/banco/username solo toman valores reales existentes;
- KPI/histórico usa todos los estados canónicos relevantes;
- password nunca se sintetiza.

Node syntax + marcadores anti-regresión: PASS en gate read-only.

## 8. Datos extra de plataforma vigente
El export vigente debe reconciliarse por export/import cifrado. No conectar RTDB vieja.

Objetivo: traer solo campos reales útiles aún ausentes en Firestore, con exact stable-ID match. Conflictos → review; no overwrite silencioso.

## 9. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 10. Agosto
No ejecutar delta agosto hasta cerrar P0 Shopper/perfil y congelar Corte6.

## 11. Siguiente bloque exacto
`PREPARAR USERNAME88 FIRESTORE WRITE PLAN SIN EJECUTAR → PERFIL EXTRA EXPORT CIFRADO/RECONCILIADO → AUTORIZACIONES EXACTAS → REDEPLOY DEV → VISUAL PROTEGIDA`.

Producción/merge siguen bloqueados.
