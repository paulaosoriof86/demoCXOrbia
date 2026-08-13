# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-13 13:29 -06:00
**Estado:** `P0_HUMAN_SHOPPER_OPEN__READONLY_DIAGNOSTIC_ATTEMPT_CONSUMED_FAILED__STOP_RETRY__CUTOVER_BLOCKED`

## Bloque P0 DEV read-only autorizado — resultado real

Paula autorizó una única lectura focal para diagnosticar el Shopper humano que autenticó pero quedó separado del read model canónico y para recuperar únicamente el usuario visible del Admin canónico B.

Se reutilizó el runner existente `CXOrbia C6 Hold Profiles + Live HR Read-Only`, sin crear rama, PR, deploy ni ruta productiva nueva. Request one-shot: `p0-human-shopper-auth-hr-readonly-20260813-01`, commit `2dd2d693daa21287023d50a03748c1ccd4ae373d`, ligado al HEAD `954eae43cebcf05592f00ea8d43f5405417fca7b`.

### Ejecución

- Run `31735473752`.
- Job `94565926738`.
- Setup, checkout, request gate e instalación transitoria: PASS.
- `Execute targeted read-only inspection`: **FAIL** después de aproximadamente 7 segundos.
- El workflow no publicó artifact privado ni evidencia sanitizada porque esas etapas estaban condicionadas al éxito de la inspección.
- Los logs accesibles por el conector no exponen el error específico; por tanto no se inventa causa raíz.

La autorización se trata conservadoramente como **consumida**: la ejecución alcanzó la etapa que contiene las lecturas de proveedor. No se ejecutó ni se ejecutará un segundo intento con este gate.

### Neutralización y limpieza completadas

- Request deshabilitado/consumido con `STOP_RETRY`: commit `97e8f25a9119e0a67252dd6e568d8afc7c0a533c`.
- Run de verificación de neutralización `31735810704`, job `94567043982`: SUCCESS; setup de proveedor e inspección fueron `SKIPPED`, por lo que no hubo segunda lectura.
- Herramienta histórica `tools/qa/cxorbia-c6-hold-profile-live-hr-readonly.mjs` restaurada exactamente a su blob previo `3c9e229bd10a24fac971562091c6050094d4c8a6`; commit `1db3df5db63c89773e2aaba1866f4bc62be5e0f3`.
- Se eliminaron los dos diagnósticos preliminares no usados.
- Evidencia del fallo: `app/docs/evidence/p0-human-shopper-readonly-run-failure-31735473752.json`.

### Qué NO quedó demostrado

No existe resultado persistido para claims/shopperId/membership del Shopper, crosswalk exacto con HR, causa del bridge ni usuario visible del Admin B. No se adivina ninguno de esos datos.

### Seguridad

Cero cambios sobre Auth, Firestore, HR, Rules o Storage; cero cambios de contraseña; cero deploy; cero Make/Gemini/pagos; cero merge; cero producción. La plataforma real vigente de TyA permanece intacta.

## P0 humano vigente

La aceptación visual sigue rechazada: el Shopper real autenticó, pero `Mi Perfil` mostró `La identidad de esta sesión no está vinculada al read model canónico.` La vista quedó Firestore-only con cero visitas mientras el laboratorio leyó HR viva completa. Evidencia primaria: `app/docs/evidence/p0-human-shopper-canonical-binding-failure-20260813.json`.

M1–M10 continúan como 100% de calificación técnica DEV del build `ecc725866acc3eb8`; no equivalen a aprobación funcional ni a go-live.

## Siguiente bloque exacto

`STOP_RETRY`. Cualquier segunda lectura de proveedor requiere autorización explícita nueva. Antes de solicitarla, el siguiente diseño debe corregir el mecanismo de captura para garantizar evidencia incluso ante fallo y separar el recuperador offline del usuario Admin B de la lectura Shopper, evitando consumir otro gate sin diagnóstico persistente.

## Clasificación

- **Reusable CXOrbia:** runner diagnóstico debe persistir evidencia de fallo y no perder el resultado por un exit no controlado.
- **Exclusivo cliente:** identidad Shopper TyA/Cinépolis y autoridad HR.
- **Claude/prototipo:** ningún parche funcional aplicado; P0 sigue abierto.
- **Academia:** acceso Shopper continúa no aprobado.
- **Sin impacto Claude:** neutralización, restauración del runner y documentación.
