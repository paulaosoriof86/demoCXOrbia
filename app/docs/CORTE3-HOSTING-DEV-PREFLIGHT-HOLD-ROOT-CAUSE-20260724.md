# CXOrbia TyA — Corte 3 Hosting DEV preflight HOLD y causa raíz

**Fecha:** 2026-07-24  
**Estado:** `PREFLIGHT_HOLD_RESOLVED_PENDING_NEW_ISOLATED_REQUEST`  
**Run fallido:** `30098219557`  
**Job:** `89497455866`

## 1. Qué ocurrió

La primera solicitud autorizada llegó correctamente al workflow y pasó:

- checkout de la rama exacta;
- lectura de solicitud;
- autorización explícita de Paula;
- validación de repo, rama, PR, target y source head;
- validación de que el commit disparador modificaba únicamente la solicitud.

El proceso se detuvo en el preflight **antes** de consultar el endpoint, construir el overlay o desplegar Hosting.

Por tanto:

- Hosting DEV no fue modificado por este intento;
- el build anterior quedó preservado;
- no hubo Cloud Run deploy;
- no hubo producción, merge, imports, pagos ni writes reales.

## 2. Causa raíz reproducible

El preflight reutilizaba `tools/release/tya-v174-corte2a-empalme-directo-verify.mjs`.

Ese verificador calcula hash de todos los archivos enumerados por el manifest V174 y falla ante cualquier diferencia. Después del freeze V174 se produjeron cambios autorizados y documentales de Corte 3, entre ellos:

- documentación activa bajo `app/docs/**`;
- `app/index-backend-dev.html`, ya validado por el gate técnico de Corte 3;
- archivos financieros canónicos nuevos bajo `app/data/**` y `app/adapters/**`.

La comparación entre el último source head desplegado de V174 (`6cd66ac22e86c20a0cfc4d6fb84c697e672fab42`) y la solicitud fallida confirmó que no hubo modificaciones de `app/core/**`, `app/modules/**` ni `app/index.html`; las diferencias funcionales visibles se limitan al entry DEV aprobado y a los assets financieros canónicos agregados. La comparación desde el target del PASS técnico (`357cdbc73467344557c0da113262bba4f6a976fc`) hasta la solicitud fallida mostró únicamente documentación, workflow, helper y solicitud; el composite funcional probado no cambió.

La causa raíz es:

`STALE_FULL_APP_HASH_INCLUDED_MUTABLE_DOCS_AND_APPROVED_DEV_ENTRY`

No es una regresión V174 ni un P0 funcional.

## 3. Corrección focalizada

Se creó:

- `tools/qa/tya-corte3-v174-runtime-preservation-r24-gate.mjs`.

El gate nuevo:

1. conserva el manifest V174 como referencia;
2. exige coincidencia exacta de todos los archivos protegidos del runtime;
3. permite drift únicamente en `app/docs/**` y en el entry DEV ya aprobado;
4. falla ante cualquier cambio de módulos, core, `app/index.html` u otro archivo funcional V174;
5. exige que el composite financiero y `app/index-backend-dev.html` no hayan cambiado desde el target del PASS técnico de Corte 3;
6. valida la existencia de todos los assets financieros canónicos;
7. genera evidencia sanitizada antes de cualquier deploy.

El workflow fue actualizado para usar este gate, hacer checkout completo y capturar stdout/stderr en artifact. No se debilitó el control del runtime.

## 4. Método de continuación

No se reintenta el run fallido. Se emite una solicitud nueva, aislada y one-time con:

- nuevo `requestId`;
- `expectedSourceHead` igual al HEAD preparado;
- misma autorización vigente de Paula;
- mismo target Hosting DEV;
- mismo gate técnico PASS y digest;
- todos los flags peligrosos en `false`.

## 5. Clasificación

- **Reusable CXOrbia:** separación entre runtime protegido y documentación mutable en gates de deploy.
- **Exclusivo cliente:** build TyA/Cinépolis y sus conteos.
- **Claude/prototipo:** sin cambios de módulos ni tarea nueva.
- **Academia:** distinguir source lock funcional, documentación viva y preflight de despliegue.
- **Sin impacto Claude:** workflow, gate, diagnóstico y evidencia.

## 6. Estado seguro

Sin Hosting nuevo por el intento fallido, producción, merge, Cloud Run deploy, imports, pagos, Firestore/Auth/Storage/HR writes, Make ni Gemini.
